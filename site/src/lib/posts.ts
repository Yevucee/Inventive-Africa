import type { CollectionEntry } from 'astro:content';
import { categorySlug } from './taxonomy';

export type PostEntry = CollectionEntry<'posts'>;

export function sortPostsNewestFirst(posts: PostEntry[]) {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function displayAuthor(author: string) {
  if (author.toLowerCase() === 'inventiveafrica') return 'InventiveAfrica';
  return author;
}

export function hasFeaturedImage(post: PostEntry) {
  return Boolean(post.data.featuredImage);
}

export function featuredImageSrc(post: PostEntry) {
  return post.data.featuredImage ?? null;
}

export function getCategoryIndex(posts: PostEntry[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const category of post.data.categories) {
      const label = category.trim();
      if (!label) continue;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, count]) => ({ label, slug: categorySlug(label), count }));
}

export function postsInCategory(posts: PostEntry[], categoryLabel: string) {
  return sortPostsNewestFirst(
    posts.filter((post) => post.data.categories.some((c) => c === categoryLabel)),
  );
}

export function postsInYearMonth(posts: PostEntry[], year: number, month: number) {
  return sortPostsNewestFirst(
    posts.filter((post) => {
      const d = post.data.pubDate;
      return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month;
    }),
  );
}

export function getYearArchiveIndex(posts: PostEntry[]) {
  const years = new Map<number, number>();
  for (const post of posts) {
    const y = post.data.pubDate.getUTCFullYear();
    years.set(y, (years.get(y) ?? 0) + 1);
  }
  return [...years.entries()].sort((a, b) => b[0] - a[0]);
}

export function getMonthArchiveIndex(posts: PostEntry[], year: number) {
  const months = new Map<number, number>();
  for (const post of posts) {
    const d = post.data.pubDate;
    if (d.getUTCFullYear() !== year) continue;
    const m = d.getUTCMonth() + 1;
    months.set(m, (months.get(m) ?? 0) + 1);
  }
  return [...months.entries()].sort((a, b) => b[0] - a[0]);
}

export function relatedPosts(post: PostEntry, allPosts: PostEntry[], limit = 4) {
  const tagSet = new Set(post.data.tags.map((t) => t.toLowerCase()));
  const categories = new Set(post.data.categories);

  const scored = allPosts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      let score = 0;
      for (const category of candidate.data.categories) {
        if (categories.has(category)) score += 3;
      }
      for (const tag of candidate.data.tags) {
        if (tagSet.has(tag.toLowerCase())) score += 2;
      }
      const daysApart =
        Math.abs(candidate.data.pubDate.getTime() - post.data.pubDate.getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysApart < 120) score += 1;
      return { candidate, score };
    })
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.candidate.data.pubDate.getTime() - a.candidate.data.pubDate.getTime(),
    );

  if (scored.length >= limit) {
    return scored.slice(0, limit).map(({ candidate }) => candidate);
  }

  const fallback = sortPostsNewestFirst(allPosts.filter((p) => p.id !== post.id));
  const merged = [...scored.map((s) => s.candidate)];
  for (const p of fallback) {
    if (merged.length >= limit) break;
    if (!merged.find((m) => m.id === p.id)) merged.push(p);
  }
  return merged.slice(0, limit);
}

export const HOMEPAGE_RECENT_COUNT = 8;
export const HOMEPAGE_SECONDARY_FEATURED = 3;
