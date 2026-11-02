import type { CollectionEntry } from 'astro:content';

/** Prefix a root-relative path with Astro `BASE_URL` (GitHub Pages subpath). */
export function hrefPath(path: string) {
  const base = import.meta.env.BASE_URL ?? '/';
  if (!path.startsWith('/')) {
    return `${base}${path}`;
  }
  if (base === '/' || base === '') {
    return path;
  }
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalizedBase}${path}`;
}

export function postUrl(entry: CollectionEntry<'posts'>) {
  const d = entry.data.pubDate;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `/${year}/${month}/${day}/${entry.data.slug}/`;
}

/** Path including Astro `base` (for JSON feeds, canonical URLs on GitHub Pages). */
export function postUrlWithBase(entry: CollectionEntry<'posts'>, baseUrl: string) {
  return hrefPath(postUrl(entry));
}

export function pageUrl(entry: CollectionEntry<'pages'>) {
  return `/${entry.data.slug}/`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function absolutePostUrl(site: URL | string, entry: CollectionEntry<'posts'>, _baseUrl = '/') {
  const origin = typeof site === 'string' ? site : site.origin;
  return new URL(hrefPath(postUrl(entry)), origin).href;
}
