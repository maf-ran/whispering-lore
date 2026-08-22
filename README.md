# Whispering Lore

> A folklore archive: 3,668 creatures, 2,185 stories, 641 legendary items from 212 countries.

**Design system:** see [DESIGN.md](DESIGN.md) — Bone & Ash palette, typography, components, theming rules.

## Prerequisites

- Node.js 18+
- npm

## Setup
 
```bash
# Install dev dependencies (ESLint, Prettier, Jest, Playwright)
npm ci
 
# Lint & format (optional)
npm run lint
npm run format
 
# Run unit tests (175 tests, 14 suites)
npm test

# Run cross-device E2E tests (80 tests, 8 viewports)
npx playwright test tests/e2e/cross-device-audit.spec.js --project=chromium

# Run full E2E suite (462 tests, chromium — includes the axe accessibility gate)
npx playwright test --project=chromium
```

## Key Features
- **Shimmer Lazy Shard System**: Manifest-driven data loading (~20MB data split into region-based shards, loaded on demand).
- **Dynamic Lore Stats**: Real-time counts for creatures, stories, and regions.
- **User Lore-Box**: Persistent Favorites and Bookmarks using `localStorage`.
- **Personal Archive**: Dedicated `mylore.html` page for saved entries, with export/import.
- **Full-Text Search**: `/search.html` searches all three datasets (creatures, stories, items) with deep links into each viewer.
- **Text-to-Speech**: Listen buttons narrate creature/story/item pages via the Web Speech API; narration stops when the overlay closes.
- **Story Recommendations**: Automated discovery of similar tales.
- **Dynamic Latest**: Real-time "Latest Additions" feed on the homepage with XHR fallback.
- **Offline-First**: Service Worker caching for full offline access.
- **Daily Feature**: Random creature and story of the day, updated daily.
- **Examination**: 1,071 quiz questions across 6 difficulty levels with 10 randomised variants.
- **World Map**: Three.js globe with country-level creature and story counts.
- **Cross-Reference Integrity**: 35,457 bidirectional links audited with 0 broken refs.
- **Research Pipeline**: All 3,668 creatures and 2,185 stories classified by source_type and source_quality. Stage 3+ coverage: 99.0% (of classified shard data).

## Run the site locally

```bash
python3 -m http.server 3000 --directory .
# Open http://localhost:3000 in your browser
```

For Playwright e2e runs, use a threaded server instead (the single-threaded
`http.server` times out under the 6-worker test load — see `.github/workflows/ci.yml`).

## Project structure
 
| Directory | Purpose |
|-----------|---------|
| `*.html` | Static pages (index, bestiary, stories, items, search, world, about, mylore, quiz, methodology, 404) |
| `css/styles.css` | Dark Nordic theme (Bone & Ash palette) |
| `js/` | Vanilla JavaScript — 17 modules (see below) |
| `data/datasets/` | Creature (3,668) and story (2,185) JSON datasets |
| `data/datasets/by-region/` | Region-split creature JSONs (32 regions, stale — superseded by sharded/) |
| `data/sharded/` | Shimmer shard system — manifest + region-based shards |
| `data/geo-countries.json` | 242 country geodata for world map |
| `docs/` | Project documentation |
| `tests/` | Jest unit tests (175 tests, 14 suites) + Playwright E2E (10 spec files, incl. axe accessibility gate) |
| `sw.js` | Service worker for offline caching |

### JavaScript modules (`js/`)

| File | Purpose |
|------|---------|
| `main.js` | Shared entry point — nav, scroll, theme, gold particles, daily feature |
| `creatures-viewer.js` | Bestiary page — search, sort, facet filters, lazy shard loading |
| `stories-viewer.js` | Stories page — search, sort, facet filters, lazy shard loading |
| `items-viewer.js` | Items page — legendary object cards, detail overlays with TTS narration |
| `search-viewer.js` | `/search` page — full-text search across all datasets with deep links |
| `seo-entity.js` | JSON-LD structured data injection for entities |
| `viewer-base.js` | Shared viewer logic (sort, filter, pagination) |
| `shared-utils.js` | DOM helpers, slug utilities, debounce, shared state |
| `daily-feature.js` | Daily creature and story selection |
| `globe.js` | Three.js globe visualisation for world map |
| `world-viewer.js` | World page — country list, region highlighting |
| `quiz.js` | Examination engine — 1,071 questions, 6 levels, scoring |
| `mylore.js` | Personal archive — favourites, bookmarks, reading history |
| `citations.js` | Citation export for creature and story references |
| `region-glyphs.js` | Region-themed SVG glyphs |
| `rune-scatter.js` | Hero rune animation (Norse, Celtic, Greek, Egyptian symbols) |
| `theme-toggle.js` | Light/dark theme switcher |

## Data Statistics

| Metric | Count | Stage 3+ |
|--------|-------|----------|
| Creatures | 3,668 | 100% (3,684 upgrade records across 43 batches) |
| Stories | 2,185 | 97.1% (1,669 at Stage 3+; 50 fair/good — oral tradition limit) |
| Artifacts | 641 | 100% (items.json + sharded for the artifacts viewer) |
| Countries | 212 | — |
| Cross-refs | 35,457 | 0 broken |
| Quiz questions | 1,071 | 10 variants each, 6 difficulty levels |

**Zenodo DOI**: [`10.5281/zenodo.21941501`](https://doi.org/10.5281/zenodo.21941501) (v1.2.0 — 3,668 creatures, 2,185 stories, 641 artifacts)

## Testing

### Unit tests (Jest)

```bash
npm test
```

14 suites: creatures viewer, stories viewer, quiz engine, daily feature, shared utils, globe, citations, region glyphs, viewer base, theme toggle, items data, items viewer, shimmer, viewer narration (TTS). **175/175 pass.**

### Cross-device E2E (Playwright)

```bash
npx playwright test tests/e2e/cross-device-audit.spec.js --project=chromium
```

80 tests across 8 viewports (320–1920px) × 7 pages. Validates layout, no horizontal overflow, hero element overlap, nav scrollability, brand visibility on mobile, and zero JS errors. Screenshots saved to `test-screenshots/{device}/{page}.png`.

### Full E2E suite (Playwright)

```bash
npx playwright test --project=chromium
```

**462/462 pass** (~7 min). Covers navigation, skip links, filter dropdowns, detail overlays, quiz flows, world globe, hero stats, rune canvas, daily feature, items viewer, inline-SVG iconography, the `/search` page, and a zero-violation axe accessibility gate (10 pages × 2 viewports + detail overlays + search state, Ko-fi widget mocked hermetically).

## Notes
 
- No build step required — the site is pure static HTML/CSS/JS.
- The service worker (`sw.js`) pre-caches 30+ core assets for offline use after first visit, skips `/data/` (handled by the Shimmer cache), trims the runtime cache to 80 entries, and falls back to `404.html` for failed navigations.
- Data is loaded via the shimmer shard system (`data/sharded/`), with XHR fallback to `data/datasets/*.json` when shimmer is unavailable.
- All creature and story entries have unique, URL-friendly slugs for direct linking.
- Sort By (A-Z, Newest) available on both bestiary and stories pages.
- Skeleton loaders provide visual feedback while data loads.
- Fonts loaded via `<link rel="preconnect">` + `<link>` tags for non-blocking parallel loading (not CSS `@import`).
- Gold particles and grain overlay are disabled on mobile (<768px) for performance.
