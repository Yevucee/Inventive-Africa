# Migration inventory

This file is updated after running the local inventory commands against your WordPress exports. Generated machine-readable reports live in `docs/generated/` (gitignored).

## Source files (local only)

| File | Purpose |
| --- | --- |
| `migration-source/wordpress-export.xml` | Full WXR content export |
| `migration-source/wordpress-media-export.tar` | Media archive from WordPress |

Never commit these files. They stay on your machine per [PROJECT_BRIEF.md](../PROJECT_BRIEF.md).

## Commands

From the repository root (with exports in `migration-source/`):

```bash
npm install
npm run migration:inventory
npm run migration:inventory-media
npm run migration:media
npm run migration:import
npm run migration:check
```

Override the source folder if needed:

```bash
MIGRATION_SOURCE_DIR=/path/to/migration-source npm run migration:inventory
```

## Dashboard snapshot (sanity checks)

The WordPress dashboard reported approximately:

- **231** published posts
- **1** published page
- **~350 MB** media storage used

The inventory scripts compare WXR counts to the post/page figures and record media archive size. Treat mismatches as review items, not blockers for local development.

## Local import result (2026-11-02)

The WordPress export was processed locally after Cursor created the scaffold:

- 231 published posts and 1 published page imported; 17 drafts and 3 menu items were not published.
- 666 media files referenced by published content or its featured images were copied from the 810-file archive.
- Two referenced files were absent from the media archive and returned HTTP 404 at their old URLs: `2018/05/image5.png` and `2018/06/image3.png`. These remain unresolved.
- 144 archive files not referenced by published content were left out of the public repository. Review them separately before any decision to publish them.
- The migration check passed with 232 content files. The static build created 233 pages, including the homepage.
- Every published WordPress post/page URL in the export has a matching built path. The importer proposed zero redirects.

This is a content migration preview. Comments, drafts, forms, and unused media stay out of the public site pending review. Existing WordPress contact form shortcodes are omitted from the preview.

## Live site URL pattern (observed)

Published articles use date-based permalinks:

`https://inventiveafrica.com/{year}/{month}/{day}/{slug}/`

Examples:

- `/2024/06/26/africa-business-day-2024/`
- `/2021/03/31/solar-pump/`

Static pages such as `/about/` use slug-only paths. The Astro router preserves the imported page path.

## Post-import reconciliation

After `migration:import`, verify:

1. Published post/page counts match `docs/generated/wxr-inventory.json`
2. Spot-check dates, authors, categories, and featured images
3. Review `docs/generated/redirects.json` for path mismatches
4. Run `migration:media` before `migration:import` so imported image links point to local files

See [REDIRECTS.md](./REDIRECTS.md) for redirect documentation.
