# Monitoring baseline — 16 September 2026

Recorded before any monitoring or performance work, so future runs have
something honest to compare against.

## Stack (Phase 0 discovery)

| | |
|---|---|
| Framework | none — hand-written static HTML |
| Build step | none (`netlify.toml`: `publish = "."`, no build command) |
| Hosting | Netlify. `me-kitchen.com` is served by a Netlify project **not** on the account we can see; it auto-deploys from `master` |
| CI | **none existed** — no `.github/`, no `package.json`, no CI config of any kind |
| Analytics / error tracking | **none** — no GA, GTM, Plausible, Sentry, LogRocket, or any other snippet |
| Search Console verification | **none found** — no verification file or meta tag in the repo |
| `sitemap.xml` | **did not exist** — returned 404 live (one of the audit's 4xx errors) |

## Lighthouse — live site, before any fixes

`https://me-kitchen.com/`, Lighthouse 12, mobile emulation.

| Category | Score |
|---|---|
| Performance | **87** |
| Accessibility | **95** |
| Best Practices | **100** |
| SEO | **69** |

| Metric | Value | Google "good" |
|---|---|---|
| Largest Contentful Paint | 2.8 s | ≤ 2.5 s |
| Cumulative Layout Shift | 0.115 | ≤ 0.1 |
| Total Blocking Time | 0 ms | ≤ 200 ms |
| First Contentful Paint | 2.8 s | — |
| Total page weight | 237 KiB | — |

### Why SEO scored 69

One failing audit only: **"Page is blocked from indexing."** That is
`robots.txt`'s deliberate pre-launch `Disallow: /`. It is not a defect, and the
score should jump to roughly 100 the day that line comes off. Recorded here so
nobody later mistakes it for a regression.

### What the baseline flagged as fixable

- **Render-blocking resources — est. 1,560 ms.** The Google Fonts stylesheet.
- **Properly size images — est. 130 KiB.** `logo-main.png` was 635×472 / 125 KB
  but never displays larger than 80 px tall.
- **Images without explicit width/height**, contributing to the 0.115 CLS
  (3 layout shifts recorded).
- Accessibility: one contrast-ratio failure and one non-sequential heading
  order. **Not fixed in this pass** — see the final report.

## After the Phase 3 fixes

Measured locally (`http://127.0.0.1:8081/`) after making fonts
non-render-blocking, resizing `logo-main.png`, and adding intrinsic
`width`/`height` to every image.

| Metric | Before (live) | After (local) |
|---|---|---|
| Performance | 87 | **98** |
| LCP | 2.8 s | **1.5 s** |
| CLS | 0.115 | **0.091** — now under Google's 0.1 threshold |
| TBT | 0 ms | 0 ms |
| Render-blocking savings | 1,560 ms | **none** |

**Read this comparison carefully.** "Before" is the live site over the network;
"after" is a local server with no network latency, so the two are not a clean
A/B. The two numbers that *are* directly attributable to the fixes are the
render-blocking savings (1,560 ms → none) and CLS (0.115 → 0.091). A fresh live
run after deploy is the honest follow-up measurement.

## Budgets now enforced

Set from the measured local baseline, with headroom so normal variance does not
turn CI red. See `scripts/perf-check.mjs`.

| Metric | Current | Enforced budget | Long-term target |
|---|---|---|---|
| Performance | 98 | ≥ 90 | ≥ 90 |
| LCP | 1.5 s | ≤ 2.0 s | ≤ 2.5 s |
| CLS | 0.091 | ≤ 0.12 | ≤ 0.10 |
| TBT | 0 ms | ≤ 200 ms | ≤ 200 ms |
| Page weight | 214 KiB | tracked, not enforced | — |

INP is not in this table: it cannot be measured in a lab run, only from real
user data. It needs field data (Search Console's Core Web Vitals report or an
RUM script) — see NEEDS INPUT in the final report.

## Content counts at baseline

| | |
|---|---|
| Indexable pages | 4 — `/`, `/menu`, `/story`, `/location` |
| Non-indexable | 3 — `careers.html` (noindex filler), `soon.html` (reserve), `404.html` |
| Sitemap URLs | 4 (generated; none existed before) |
| JSON-LD blocks | 5 — Restaurant ×4, FAQPage ×1 |
| Menu items in schema | 16 across 4 sections |
