#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { assertSourceFile, resolveMigrationPaths } from './lib/paths.mjs';
import { parseWxrFile, summariseItems } from './lib/wxr.mjs';

const paths = resolveMigrationPaths({
  sourceDir: process.env.MIGRATION_SOURCE_DIR,
});

assertSourceFile(paths.wxr, 'WordPress WXR export');

const wxr = parseWxrFile(paths.wxr);
const summary = summariseItems(wxr.items);

const samplePublished = wxr.items
  .filter((i) => i.status === 'publish' && (i.type === 'post' || i.type === 'page'))
  .slice(0, 15)
  .map((i) => ({
    id: i.id,
    type: i.type,
    title: i.title,
    link: i.link,
    slug: i.slug,
    pubDate: i.pubDate,
    categories: i.categories,
    tags: i.tags,
  }));

const report = {
  generatedAt: new Date().toISOString(),
  sourceFile: paths.wxr,
  siteTitle: wxr.siteTitle,
  siteUrl: wxr.siteUrl,
  summary,
  samplePublished,
  checks: {
    expectedPublishedPosts: 231,
    expectedPublishedPages: 1,
    publishedPostsDelta: summary.publishedPosts - 231,
    publishedPagesDelta: summary.publishedPages - 1,
  },
};

mkdirSync(paths.generatedDir, { recursive: true });
const outJson = `${paths.generatedDir}/wxr-inventory.json`;
writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);

console.log('WXR inventory written to', outJson);
console.log(JSON.stringify(summary, null, 2));
if (summary.publishedPosts !== 231 || summary.publishedPages !== 1) {
  console.warn(
    'Note: published counts differ from dashboard snapshot (231 posts, 1 page). Review before launch.',
  );
}
