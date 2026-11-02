import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { absolutePostUrl } from '../lib/postPaths';

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  return rss({
    title: 'Inventive Africa',
    description: 'Change is happening now — African innovation, technology, and inspiration.',
    site: context.site?.href ?? 'https://inventiveafrica.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: absolutePostUrl(context.site ?? 'https://inventiveafrica.com', post),
    })),
  });
};
