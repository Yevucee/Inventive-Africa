#!/usr/bin/env node
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolveMigrationPaths } from './lib/paths.mjs';

const paths = resolveMigrationPaths({
  sourceDir: process.env.MIGRATION_SOURCE_DIR,
});

const inventoryPath = `${paths.generatedDir}/wxr-inventory.json`;
const contentFiles = existsSync(paths.contentDir)
  ? readdirSync(paths.contentDir).filter((f) => f.endsWith('.md'))
  : [];
const pageFiles = existsSync(paths.pagesDir)
  ? readdirSync(paths.pagesDir).filter((f) => f.endsWith('.md'))
  : [];

let expectedPublished = null;
if (existsSync(inventoryPath)) {
  const inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
  expectedPublished =
    (inventory.summary?.publishedPosts ?? 0) + (inventory.summary?.publishedPages ?? 0);
}

const report = {
  generatedAt: new Date().toISOString(),
  contentMarkdownFiles: contentFiles.length,
  contentPageFiles: pageFiles.length,
  contentMarkdownTotal: contentFiles.length + pageFiles.length,
  expectedPublishedFromInventory: expectedPublished,
  ok:
    expectedPublished == null
      ? contentFiles.length + pageFiles.length > 0
      : contentFiles.length + pageFiles.length === expectedPublished,
  notes: [],
};

if (!existsSync(paths.wxr)) {
  report.ok = false;
  report.notes.push(
    'migration-source/wordpress-export.xml is missing; run inventory and import after adding exports locally.',
  );
}

if (expectedPublished != null && contentFiles.length + pageFiles.length !== expectedPublished) {
  report.notes.push(
    `Markdown file count (${contentFiles.length + pageFiles.length}) does not match WXR published total (${expectedPublished}).`,
  );
}

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
