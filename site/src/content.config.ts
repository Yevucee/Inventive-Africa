import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const postFields = {
  title: z.string(),
  description: z.string().optional(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  author: z.string(),
  slug: z.string(),
  wpId: z.string().optional(),
  legacyUrl: z.string().url().optional(),
  legacyPath: z.string().optional(),
  type: z.enum(['post', 'page']).default('post'),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
};

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object(postFields),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    ...postFields,
    type: z.literal('page').default('page'),
  }),
});

export const collections = { posts, pages };
