# Inventive Africa

Rebuild of [inventiveafrica.com](https://inventiveafrica.com) as a content-first blog. The existing WordPress site remains live during development.

## Start here

Read [PROJECT_BRIEF.md](PROJECT_BRIEF.md) before implementation. Work on the `development` branch, review changes, and migrate content only after the WordPress export is verified.

## Repository layout

| Path | Purpose |
| --- | --- |
| `site/` | Astro blog (preview and future production build) |
| `scripts/` | WXR/media inventory and import tooling |
| `docs/` | Migration inventory notes and redirect documentation |
| `migration-source/` | **Local only** — WordPress XML + media tar (not in git) |

## Local setup

```bash
npm install
npm run dev          # Astro dev server (site/)
```

Place exports on your machine:

```
migration-source/wordpress-export.xml
migration-source/wordpress-media-export.tar
```

Then run:

```bash
npm run migration:inventory
npm run migration:inventory-media
npm run migration:media
npm run migration:import
npm run migration:check
npm run build
```

See [docs/MIGRATION_INVENTORY.md](docs/MIGRATION_INVENTORY.md) for reconciliation steps.
The raw export and media archive remain local. The repository contains only published posts, the published About page, and media referenced by those pages.

## Preservation rules

- Preserve published articles, pages, titles, dates, authors, categories, tags, images, and useful metadata.
- Keep existing public URLs where possible. Document and test redirects for any changed URL.
- Keep WordPress content, settings, DNS, and the live site untouched until a separate launch decision.
- Keep raw WordPress exports and media archives local. Never commit them to this repository.
