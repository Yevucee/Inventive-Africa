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

## Cloud agent note (2026-11-02)

This Cursor cloud workspace did **not** include `migration-source/` or the large export archives. Tooling and the Astro site were set up on the `development` branch; run the commands above on a machine that has the exports to produce the real inventory and imported Markdown.

## Live site URL pattern (observed)

Published articles use date-based permalinks:

`https://inventiveafrica.com/{year}/{month}/{day}/{slug}/`

Examples:

- `/2024/06/26/africa-business-day-2024/`
- `/2021/03/31/solar-pump/`

Static pages such as `/about/` use slug-only paths. The Astro router preserves date-based post URLs; pages will need explicit routes or a redirect map after import.

## Post-import reconciliation

After `migration:import`, verify:

1. Published post/page counts match `docs/generated/wxr-inventory.json`
2. Spot-check dates, authors, categories, and featured images
3. Review `docs/generated/redirects.json` for path mismatches
4. Extract or link media under `site/public/wp-content/uploads/` from the media tar

See [REDIRECTS.md](./REDIRECTS.md) for redirect documentation.
