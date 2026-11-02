#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import TurndownService from 'turndown';
import { assertSourceFile, resolveMigrationPaths } from './lib/paths.mjs';
import { attachmentMap, rewriteUploadUrls } from './lib/media.mjs';
import {
  datePartsFromPubDate,
  parseWxrFile,
  permalinkPathFromLink,
} from './lib/wxr.mjs';

const paths = resolveMigrationPaths({
  sourceDir: process.env.MIGRATION_SOURCE_DIR,
});

assertSourceFile(paths.wxr, 'WordPress WXR export');

const wxr = parseWxrFile(paths.wxr);
const attachments = attachmentMap(wxr);
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndown.addRule('preserveFigure', {
  filter: ['figure'],
  replacement: (content) => `\n\n${content.trim()}\n\n`,
});
turndown.addRule('figureCaption', {
  filter: ['figcaption'],
  replacement: (content) => `\n\n*${content.trim()}*\n\n`,
});

const importable = wxr.items.filter(
  (item) =>
    item.status === 'publish' && (item.type === 'post' || item.type === 'page'),
);
const publishedPaths = new Set(importable.map((item) => permalinkPathFromLink(item.link, item.slug)));

mkdirSync(paths.contentDir, { recursive: true });
mkdirSync(paths.pagesDir, { recursive: true });
mkdirSync(paths.generatedDir, { recursive: true });

const redirects = [];
const skipped = [];
let written = 0;

for (const item of importable) {
  const dates = datePartsFromPubDate(item.pubDate);
  if (!dates || !item.slug) {
    skipped.push({ id: item.id, title: item.title, reason: 'missing date or slug' });
    continue;
  }

  const legacyPath = permalinkPathFromLink(item.link, item.slug);
  const newPath =
    item.type === 'page'
      ? `/${item.slug}/`
      : `/${dates.year}/${dates.month}/${dates.day}/${item.slug}/`;
  if (legacyPath !== newPath) {
    redirects.push({
      from: legacyPath,
      to: newPath,
      reason: 'date-based path mismatch',
      wpId: item.id,
      title: item.title,
    });
  }

  const html = rewriteInternalLinks(
    rewriteUploadUrls(
      normaliseWordPressContent(item.contentHtml || item.excerptHtml || '', attachments),
      paths.uploadsDir,
    ),
    publishedPaths,
  );
  const body = turndown.turndown(html).replaceAll('&amp;', '&').replace(/^> +$/gm, '>');
  const featured = attachments.get(item.meta.get('_thumbnail_id'));
  const featuredImage = featured
    ? rewriteUploadUrls(featured.attachmentUrl, paths.uploadsDir)
    : '';
  const frontmatter = [
    '---',
    `title: ${yamlString(item.title)}`,
    `description: ${yamlString(stripHtml(item.excerptHtml || item.contentHtml).replace(/\[[^\]]*\]/g, ' ').slice(0, 160))}`,
    `pubDate: ${dates.iso}`,
    `updatedDate: ${item.modified ? new Date(item.modified).toISOString() : dates.iso}`,
    `author: ${yamlString(item.creator || 'InventiveAfrica')}`,
    `slug: ${yamlString(item.slug)}`,
    `wpId: ${yamlString(item.id)}`,
    `legacyUrl: ${yamlString(item.link)}`,
    `legacyPath: ${yamlString(legacyPath)}`,
    `type: ${yamlString(item.type)}`,
    `categories: ${yamlList(item.categories)}`,
    `tags: ${yamlList(item.tags)}`,
    ...(featuredImage ? [
      `featuredImage: ${yamlString(featuredImage)}`,
      `featuredImageAlt: ${yamlString(featured.meta.get('_wp_attachment_image_alt') || '')}`,
    ] : []),
    '---',
    '',
  ].join('\n');

  const targetDir = item.type === 'page' ? paths.pagesDir : paths.contentDir;
  mkdirSync(targetDir, { recursive: true });
  const filename = `${item.type}-${item.id}-${item.slug}.md`;
  writeFileSync(`${targetDir}/${filename}`, `${frontmatter}${body}\n`);
  written += 1;
}

writeFileSync(
  `${paths.generatedDir}/redirects.json`,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), redirects }, null, 2)}\n`,
);
writeFileSync(
  `${paths.generatedDir}/import-skipped.json`,
  `${JSON.stringify({ generatedAt: new Date().toISOString(), skipped }, null, 2)}\n`,
);

console.log(`Imported ${written} published posts/pages into ${paths.contentDir}`);
console.log(`Redirects needing review: ${redirects.length}`);
console.log(`Skipped: ${skipped.length}`);

function yamlString(value) {
  const safe = String(value ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${safe}"`;
}

function yamlList(values) {
  if (!values?.length) return '[]';
  return `[${values.map((v) => yamlString(v)).join(', ')}]`;
}

function stripHtml(html) {
  return String(html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normaliseWordPressContent(html, attachments) {
  return String(html)
    .replace(/\[contact-form[^\]]*\][\s\S]*?\[\/contact-form\]/g, '')
    .replace(/\[contact-field[^\]]*\]/g, '')
    .replace(/\[caption[^\]]*\]([\s\S]*?)\[\/caption\]/g, (_, content) => `<figure>${content}</figure>`)
    .replace(/\[youtube\s+(https?:\/\/[^\]\s]+)[^\]]*\]/g, (_, url) =>
      `<p><a href="${escapeHtml(url)}">Watch video on YouTube</a></p>`)
    .replace(/\[gallery\s+[^\]]*ids=["']([^"']+)["'][^\]]*\]/g, (_, ids) =>
      ids.split(',').map((id) => attachments.get(id.trim())).filter(Boolean)
        .map((image) => `<figure><img src="${escapeHtml(image.attachmentUrl)}" alt="${escapeHtml(image.meta.get('_wp_attachment_image_alt') || '')}"></figure>`)
        .join('\n'));
}

function escapeHtml(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
}

function rewriteInternalLinks(html, publishedPaths) {
  const hosts = new Set([
    'inventiveafrica.com',
    'www.inventiveafrica.com',
    'inventiveafrica.net',
    'www.inventiveafrica.net',
    'inventiveafricadotnet.wordpress.com',
  ]);
  return html.replace(/(<a\b[^>]*\bhref=["'])([^"']+)(["'])/gi, (whole, before, href, after) => {
    try {
      const url = new URL(href.replaceAll('&amp;', '&'));
      if (!hosts.has(url.hostname)) return whole;
      const pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`;
      if (!publishedPaths.has(pathname) && pathname !== '/') return whole;
      return `${before}${pathname}${url.search}${url.hash}${after}`;
    } catch {
      return whole;
    }
  });
}
