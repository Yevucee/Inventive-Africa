# URL and redirect map

Permanent redirects are required only when a public URL cannot be preserved exactly. The migration importer writes candidate entries to `docs/generated/redirects.json`.

## Target behaviour

| Content | WordPress pattern | Astro target |
| --- | --- | --- |
| Blog posts | `/{yyyy}/{mm}/{dd}/{slug}/` | Same path (trailing slash) |
| Static pages | `/{slug}/` | Same path (trailing slash) |
| Categories | `/category/{slug}/` | Planned listing routes |
| Authors | `/author/{slug}/` | Planned author pages |
| Feeds | `/feed/` | Out of scope until launch decision |

## Launch checklist

- [ ] `docs/generated/redirects.json` reviewed and empty or implemented at the edge host
- [ ] Internal links in article bodies spot-checked
- [ ] `/about/` and other pages matched or redirected
- [ ] No competing public index while WordPress remains live (preview on non-production host only)

The local import of the 2026-11-02 export proposed zero redirects for the 231 posts and 1 page. Generated redirect list: run `npm run migration:import` locally, then commit only this documentation — not `docs/generated/`.
