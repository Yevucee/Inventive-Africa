#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import { assertSourceFile, resolveMigrationPaths } from './lib/paths.mjs';

const paths = resolveMigrationPaths({
  sourceDir: process.env.MIGRATION_SOURCE_DIR,
});

assertSourceFile(paths.mediaTar, 'WordPress media archive');

const listing = execFileSync('tar', ['-tf', paths.mediaTar], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

const lines = listing.split('\n').filter(Boolean);
const extensions = {};
let uploadPathCount = 0;

for (const line of lines) {
  const ext = line.includes('.') ? line.split('.').pop().toLowerCase() : '(none)';
  extensions[ext] = (extensions[ext] ?? 0) + 1;
  if (line.includes('wp-content/uploads')) uploadPathCount += 1;
}

const archiveStat = statSync(paths.mediaTar);
const report = {
  generatedAt: new Date().toISOString(),
  sourceFile: paths.mediaTar,
  archiveBytes: archiveStat.size,
  archiveMegabytes: Number((archiveStat.size / (1024 * 1024)).toFixed(2)),
  totalEntries: lines.length,
  uploadPathEntries: uploadPathCount,
  extensionCounts: extensions,
  samplePaths: lines.slice(0, 25),
  checks: {
    expectedUsedStorageMb: 350,
  },
};

mkdirSync(paths.generatedDir, { recursive: true });
const outJson = `${paths.generatedDir}/media-inventory.json`;
writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`);

console.log('Media inventory written to', outJson);
console.log(
  `Entries: ${lines.length}, archive size: ${report.archiveMegabytes} MB, upload paths: ${uploadPathCount}`,
);
