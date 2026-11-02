import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { hrefPath, postUrl } from '../lib/postPaths';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  const index = posts.map((post) => {
    let body = '';
    if (post.body) {
      body = post.body;
    } else if (post.filePath) {
      const raw = readFileSync(join(process.cwd(), post.filePath), 'utf8');
      body = raw.split('---').slice(2).join('---');
    }
    return {
      id: post.id,
      title: post.data.title,
      description: post.data.description ?? '',
      url: hrefPath(postUrl(post)),
      pubDate: post.data.pubDate.toISOString(),
      categories: post.data.categories,
      tags: post.data.tags,
      body: body.replace(/\s+/g, ' ').slice(0, 8000),
    };
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
