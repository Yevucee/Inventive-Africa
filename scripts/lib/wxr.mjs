import { readFileSync } from 'node:fs';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  removeNSPrefix: true,
  processEntities: true,
  trimValues: true,
  isArray: (name) =>
    ['item', 'category', 'tag', 'author', 'comment', 'postmeta'].includes(name),
});

function text(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object' && value['#text'] != null) return String(value['#text']).trim();
  return String(value).trim();
}

function metaMap(item) {
  const metas = item.postmeta ?? [];
  const map = new Map();
  for (const meta of metas) {
    const key = text(meta.meta_key);
    const val = text(meta.meta_value);
    if (key) map.set(key, val);
  }
  return map;
}

function categoriesForItem(item) {
  const raw = item.category;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((entry) => {
      if (typeof entry === 'string') return entry.trim();
      if (entry && typeof entry === 'object') {
        const domain = entry['@_domain'] ?? entry['@_n'] ?? '';
        if (domain && domain !== 'category') return null;
        return text(entry['#text'] ?? entry);
      }
      return null;
    })
    .filter(Boolean);
}

function tagsForItem(item) {
  const raw = item.category;
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((entry) => {
      if (typeof entry === 'object' && entry['@_domain'] === 'post_tag') {
        return text(entry['#text'] ?? entry);
      }
      return null;
    })
    .filter(Boolean);
}

function itemContentHtml(item) {
  return (
    text(item.encoded) ||
    text(item['content:encoded']) ||
    text(item.content?.encoded) ||
    text(item.content)
  );
}

function itemExcerptHtml(item) {
  return (
    text(item.excerpt) ||
    text(item['excerpt:encoded']) ||
    text(item.excerpt?.encoded)
  );
}

export function parseWxrFile(filePath) {
  const xml = readFileSync(filePath, 'utf8');
  const doc = parser.parse(xml);
  const channel = doc?.rss?.channel ?? doc?.channel;
  if (!channel) {
    throw new Error('Unrecognised WXR: missing rss/channel root.');
  }

  const items = (channel.item ?? []).map((item) => {
    const meta = metaMap(item);
    const link = text(item.link);
    const slug = text(item.post_name) || slugFromLink(link);
    const pubDate = text(item.pubDate) || text(item.post_date);
    const modified = text(item.post_date_gmt) || text(item.post_modified) || pubDate;

    return {
      id: text(item.post_id) || text(item['post-id']),
      title: text(item.title),
      link,
      slug,
      status: text(item.status) || text(item.post_status),
      type: text(item.post_type) || 'post',
      pubDate,
      modified: text(item.post_modified) || text(item.post_modified_gmt) || modified,
      creator: text(item.creator) || text(item['dc:creator']),
      contentHtml: itemContentHtml(item),
      excerptHtml: itemExcerptHtml(item),
      categories: categoriesForItem(item),
      tags: tagsForItem(item),
      attachmentUrl: text(item.attachment_url),
      meta,
    };
  });

  const authors = (channel.author ?? []).map((author) => ({
    id: text(author.author_id),
    login: text(author.author_login),
    email: text(author.author_email),
    displayName: text(author.author_display_name),
  }));

  return {
    siteTitle: text(channel.title),
    siteUrl: text(channel.link),
    baseSiteUrl: text(channel.base_site_url) || text(channel.link),
    items,
    authors,
  };
}

function slugFromLink(link) {
  try {
    const url = new URL(link);
    const parts = url.pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? '';
  } catch {
    return '';
  }
}

export function permalinkPathFromLink(link, fallbackSlug) {
  try {
    const url = new URL(link);
    let pathname = url.pathname;
    if (!pathname.endsWith('/')) pathname += '/';
    return pathname;
  } catch {
    return fallbackSlug ? `/${fallbackSlug}/` : '/';
  }
}

export function datePartsFromPubDate(pubDate) {
  const d = new Date(pubDate);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return {
    year: String(d.getUTCFullYear()),
    month: String(d.getUTCMonth() + 1).padStart(2, '0'),
    day: String(d.getUTCDate()).padStart(2, '0'),
    iso: d.toISOString(),
  };
}

export function summariseItems(items) {
  const byType = {};
  const byStatus = {};
  const authors = new Set();
  const categories = new Set();
  const tags = new Set();

  for (const item of items) {
    byType[item.type] = (byType[item.type] ?? 0) + 1;
    byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
    if (item.creator) authors.add(item.creator);
    for (const c of item.categories) categories.add(c);
    for (const t of item.tags) tags.add(t);
  }

  const publishedPosts = items.filter(
    (i) => i.type === 'post' && i.status === 'publish',
  ).length;
  const publishedPages = items.filter(
    (i) => i.type === 'page' && i.status === 'publish',
  ).length;

  return {
    totalItems: items.length,
    publishedPosts,
    publishedPages,
    byType,
    byStatus,
    authorCount: authors.size,
    categoryCount: categories.size,
    tagCount: tags.size,
    authors: [...authors].sort(),
    categories: [...categories].sort(),
    tags: [...tags].sort(),
  };
}
