#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { assertSourceFile, resolveMigrationPaths } from './lib/paths.mjs';
import { referencedUploadPaths } from './lib/media.mjs';
import { parseWxrFile } from './lib/wxr.mjs';

const paths = resolveMigrationPaths({ sourceDir: process.env.MIGRATION_SOURCE_DIR });
assertSourceFile(paths.wxr, 'WordPress WXR export');
assertSourceFile(paths.mediaTar, 'WordPress media archive');

const wxr = parseWxrFile(paths.wxr);
const referenced = [...referencedUploadPaths(wxr)].sort();
const archivePaths = new Set(
  execFileSync('tar', ['-tf', paths.mediaTar], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  }).split('\n').filter(Boolean).map((name) => name.replace(/^\.\//, '')),
);
const found = referenced.filter((name) => archivePaths.has(name));
const missing = referenced.filter((name) => !archivePaths.has(name));

mkdirSync(paths.uploadsDir, { recursive: true });
mkdirSync(paths.generatedDir, { recursive: true });
if (found.length) {
  execFileSync('tar', ['-xf', paths.mediaTar, '-C', paths.uploadsDir, ...found], {
    maxBuffer: 8 * 1024 * 1024,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  referencedFiles: referenced.length,
  importedFiles: found.length,
  importedBytes: found.reduce((sum, name) => sum + statSync(path.join(paths.uploadsDir, name)).size, 0),
  missing,
  unusedArchiveFiles: archivePaths.size - found.length,
};
writeFileSync(path.join(paths.generatedDir, 'media-import.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Imported ${found.length} media files used by published posts/pages (${report.importedBytes} bytes).`);
console.log(`Missing referenced media: ${missing.length}; unused archive files left out: ${report.unusedArchiveFiles}.`);
