import { accessSync, constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export function resolveMigrationPaths(options = {}) {
  const sourceDir = options.sourceDir
    ? path.resolve(options.sourceDir)
    : path.join(repoRoot, 'migration-source');

  return {
    repoRoot,
    sourceDir,
    wxr: path.join(sourceDir, 'wordpress-export.xml'),
    mediaTar: path.join(sourceDir, 'wordpress-media-export.tar'),
    generatedDir: path.join(repoRoot, 'docs', 'generated'),
    contentDir: path.join(repoRoot, 'site', 'src', 'content', 'posts'),
    pagesDir: path.join(repoRoot, 'site', 'src', 'content', 'pages'),
    uploadsDir: path.join(repoRoot, 'site', 'public', 'wp-content', 'uploads'),
  };
}

export function assertSourceFile(filePath, label) {
  try {
    accessSync(filePath, constants.R_OK);
  } catch {
    throw new Error(
      `${label} not found at ${filePath}. Place WordPress exports in migration-source/ (see README.md).`,
    );
  }
}
