import { existsSync } from 'node:fs';
import { join } from 'node:path';

export function normalizeUploadSrc(src: string): string {
  if (!src) return src;
  if (src.startsWith('/wp-content/uploads/')) {
    return src.split('?')[0];
  }

  try {
    const url = new URL(src);
    const match = url.pathname.match(/\/wp-content\/uploads\/(.+)/);
    if (match) {
      return `/wp-content/uploads/${match[1]}`;
    }
  } catch {
    // not a URL
  }

  return src;
}

export function uploadFileExists(src: string): boolean {
  const normalized = normalizeUploadSrc(src);
  if (!normalized.startsWith('/wp-content/uploads/')) {
    return true;
  }
  return existsSync(join(process.cwd(), 'public', normalized));
}
