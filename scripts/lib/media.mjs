import { existsSync } from 'node:fs';
import path from 'node:path';

const uploadUrlPattern = /(?:https?:)?\/\/[^\s"'<>),\]]+/g;

export function uploadPathFromUrl(rawUrl) {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl.replaceAll('&amp;', '&'));
    const marker = '/wp-content/uploads/';
    const index = url.pathname.indexOf(marker);
    if (index < 0) return null;
    const relativePath = decodeURIComponent(url.pathname.slice(index + marker.length));
    const parts = relativePath.split('/');
    if (parts.length < 3 || !/^\d{4}$/.test(parts[0]) || !/^\d{2}$/.test(parts[1])) return null;
    if (parts.some((part) => !part || part === '.' || part === '..' || part.includes('\\'))) return null;
    return relativePath;
  } catch {
    return null;
  }
}

export function publicUploadUrl(relativePath) {
  return `/wp-content/uploads/${relativePath.split('/').map(encodeURIComponent).join('/')}`;
}

export function attachmentMap(wxr) {
  return new Map(
    wxr.items
      .filter((item) => item.type === 'attachment')
      .map((item) => [item.id, item]),
  );
}

export function referencedUploadPaths(wxr) {
  const attachments = attachmentMap(wxr);
  const paths = new Set();
  const addUrl = (url) => {
    const relativePath = uploadPathFromUrl(url);
    if (relativePath) paths.add(relativePath);
  };

  for (const item of wxr.items) {
    if (item.status !== 'publish' || !['post', 'page'].includes(item.type)) continue;
    for (const match of item.contentHtml.matchAll(uploadUrlPattern)) addUrl(match[0]);
    const thumbnail = attachments.get(item.meta.get('_thumbnail_id'));
    if (thumbnail) addUrl(thumbnail.attachmentUrl);
    for (const match of item.contentHtml.matchAll(/\[gallery\s+[^\]]*ids=["']([^"']+)["'][^\]]*\]/g)) {
      for (const id of match[1].split(',')) addUrl(attachments.get(id.trim())?.attachmentUrl);
    }
  }
  return paths;
}

export function rewriteUploadUrls(html, uploadsDir) {
  return String(html ?? '').replace(uploadUrlPattern, (rawUrl) => {
    const relativePath = uploadPathFromUrl(rawUrl);
    if (!relativePath || !existsSync(path.join(uploadsDir, relativePath))) return rawUrl;
    return publicUploadUrl(relativePath);
  });
}
