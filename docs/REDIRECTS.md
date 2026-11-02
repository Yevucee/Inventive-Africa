# URL and redirect map

Permanent redirects are required only when a public URL cannot be preserved exactly. The migration importer writes candidate entries to `docs/generated/redirects.json`.

## Target behaviour

| Content | WordPress pattern | Astro target |
| --- | --- | --- |
| Blog posts | `/{yyyy}/{mm}/{dd}/{slug}/` | Same path (trailing slash) |
| Static pages | `/{slug}/` | TBD per page after import |
| Categories | `/category/{slug}/` | Planned listing routes |
| Authors | `/author/{slug}/` | Planned author pages |
| Feeds | `/feed/` | Out of scope until launch decision |

## Launch checklist

- [ ] `docs/generated/redirects.json` reviewed and empty or implemented at the edge host
- [ ] Internal links in article bodies spot-checked
- [ ] `/about/` and other pages matched or redirected
- [ ] No competing public index while WordPress remains live (preview on non-production host only)

Generated redirect list: run `npm run migration:import` locally, then commit only this documentation — not `docs/generated/`.
