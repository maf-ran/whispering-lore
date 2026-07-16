# Whispering Lore — Getting Started

## Prerequisites

- Node.js 18+
- npm

## Setup
 
```bash
# Install dev dependencies (ESLint, Prettier, Jest)
npm ci
 
# Lint & format (optional)
npm run lint
npm run format
 
# Run tests
npm test
```

## Key Features
- **Shimmer Lazy Shard System**: Manifest-driven data loading (~20MB data split into region-based shards, loaded on demand).
- **Dynamic Lore Stats**: Real-time counts for creatures, stories, and regions.
- **User Lore-Box**: Persistent Favorites and Bookmarks using `localStorage`.
- **Personal Archive**: Dedicated `mylore.html` page for saved entries.
- **Story Recommendations**: Automated discovery of similar tales.
- **Dynamic Latest**: Real-time "Latest Additions" feed on the homepage with XHR fallback.
- **Offline-First**: Service Worker caching for full offline access.
- **Daily Feature**: Random creature and story of the day, updated daily.

## Run the site locally

```bash
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

## Project structure
 
| Directory | Purpose |
|-----------|---------|
| `*.html` | Static pages (index, bestiary, stories, world, about, mylore, quiz) |
| `css/styles.css` | Dark Nordic theme |
| `js/` | Vanilla JavaScript (viewers, main, shared-utils, daily-feature, globe, db, mylore, quiz) |
| `data/datasets/` | Creature (3,668) and story (1,719) JSON datasets |
| `data/datasets/by-region/` | Region-split creature JSONs (32 regions, stale — superseded by sharded/) |
| `data/sharded/` | Shimmer shard system — manifest + region-based shards |
| `docs/` | Project documentation |
| `tests/` | Jest test files (106 tests) + Playwright E2E (3 spec, 3 browsers) |
| `sw.js` | Service worker for offline caching |

## Notes
 
- No build step required — the site is pure static HTML/CSS/JS.
- The service worker (`sw.js`) caches 16+ core assets for offline use after first visit.
- Data is loaded via the shimmer shard system (`data/sharded/`), with XHR fallback to `data/datasets/*.json` when shimmer is unavailable.
- All creature and story entries have unique, URL-friendly slugs for direct linking.
- Sort By (A-Z, Newest) available on both bestiary and stories pages.
- Skeleton loaders provide visual feedback while data loads.
