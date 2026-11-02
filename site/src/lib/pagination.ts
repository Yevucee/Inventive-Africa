import { hrefPath } from './postPaths';

export const ARCHIVE_PAGE_SIZE = 12;

export function paginate<T>(items: T[], page: number, pageSize = ARCHIVE_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems: items.length,
    pageSize,
  };
}

export function archivePageUrl(page: number) {
  return hrefPath(page <= 1 ? '/articles/' : `/articles/page/${page}/`);
}

export function topicPageUrl(slug: string, page = 1) {
  return hrefPath(page <= 1 ? `/topic/${slug}/` : `/topic/${slug}/page/${page}/`);
}
