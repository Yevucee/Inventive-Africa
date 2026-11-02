import type { CollectionEntry } from 'astro:content';

export function postUrl(entry: CollectionEntry<'posts'>) {
  const d = entry.data.pubDate;
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `/${year}/${month}/${day}/${entry.data.slug}/`;
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
