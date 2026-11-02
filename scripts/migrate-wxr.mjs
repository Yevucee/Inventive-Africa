#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import TurndownService from 'turndown';
import { assertSourceFile, resolveMigrationPaths } from './lib/paths.mjs';
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
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

turndown.addRule('preserveFigure', {
  filter: ['figure', 'figcaption'],
  replacement: (content) => content,
});

const importable = wxr.items.filter(
  (item) =>
    item.status === 'publish' && (item.type === 'post' || item.type === 'page'),
);

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

  const body = turndown.turndown(item.contentHtml || item.excerptHtml || '');
  const frontmatter = [
    '---',
    `title: ${yamlString(item.title)}`,
    `description: ${yamlString(stripHtml(item.excerptHtml).slice(0, 300))}`,
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
