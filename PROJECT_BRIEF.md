# Inventive Africa rebuild and preservation brief

## Goal
Rebuild inventiveafrica.com as a clear, fast, accessible blog for its existing articles and future publishing. Use Astro as the intended starting framework for Cursor, subject to checking the content and deployment needs. The current WordPress site is the source of truth and remains live throughout development.

## Source and inventory
- Use the full WordPress WXR/XML export and separate media archive obtained from the Inventive Africa WordPress dashboard. Keep both outside Git; use a local `migration-source/` folder when working in a clone.
- Inspect the export before making assumptions about post types, URL structure, authors, categories, tags, comments, embedded media, menus, and metadata.
- At setup, the dashboard showed 231 published posts, 1 published page, and about 350 MB of used media storage. Treat these as rough inventory checks, not migration totals.
- Record a reproducible source inventory and a mapping from each existing public URL to its new URL.

## Content preservation
- Carry over each published post and page with its title, body, original publication date, author attribution, slug, categories, tags, featured image, inline media, alt text, captions, and internal links where present.
- Keep drafts, testimonials, custom post types, forms, comments, and subscriber data out of public output until their handling is reviewed. Inventory them separately.
- Preserve the editorial voice and historical content. Do not silently rewrite or discard articles during migration.
- Keep original media files and their attribution where available; identify missing or broken assets for review.

## Design and behaviour
- Make the blog easy to browse by date and topic, with readable article pages, search or an equivalent finding method, responsive layout, and accessible navigation.
- Use semantic HTML, clear headings, keyboard access, meaningful image text, and good performance on mobile.
- Keep branding choices reviewable against the existing site before implementing major changes.

## SEO and URL protection
- Preserve existing article URLs whenever feasible. For unavoidable changes, create explicit permanent redirects and test them.
- Carry over page titles, descriptions, canonical intent, and structured data where supported by the source. Generate an XML sitemap and verify robots directives before launch.
- Check internal links, image links, pagination, and category/tag routes. Do not set up a competing public index of migrated content while WordPress remains live.

## Workflow for Cursor
1. Work on `development`; do not modify production settings, WordPress content, or DNS.
2. Inspect the WXR and media archive locally; document the actual content schema and URL patterns. Never commit source exports, credentials, personal data, or media archives.
3. Build the initial Astro project and migration tooling in small, reviewable changes. Keep transformed content and assets traceable to the source.
4. Compare imported counts and spot-check old and new articles, dates, taxonomies, media, and URLs. Produce a redirect map and a list of unresolved gaps.
5. Preview and test the site on a non-production address. Ask for a separate launch decision before any DNS, domain, or live-site change.

## Acceptance before launch
- Content and media inventory is reconciled with the source export; exceptions are documented.
- Representative articles and all URL patterns have been checked for content, links, images, accessibility, and mobile layout.
- Redirects and SEO metadata are tested; there is a rollback plan and a verified independent backup.
- Samuel has reviewed the preview and explicitly approved launch.
