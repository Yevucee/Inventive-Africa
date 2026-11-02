const SLUG_OVERRIDES: Record<string, string> = {
  uncategorized: 'uncategorized',
  digitalisation: 'digitalisation',
  projects: 'projects',
  products: 'products',
  events: 'events',
  technology: 'technology',
  innovation: 'innovation',
  inspiration: 'inspiration',
  trends: 'trends',
  manufacture: 'manufacture',
  opinion: 'opinion',
};

export function categorySlug(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, '-');
  return SLUG_OVERRIDES[normalized] ?? normalized.replace(/[^a-z0-9-]/g, '');
}

export function categoryLabelFromSlug(slug: string, knownLabels: string[]): string | null {
  const match = knownLabels.find((label) => categorySlug(label) === slug);
  return match ?? null;
}

export const TOPIC_NAV_LIMIT = 8;
