# Project Summary – Whispering Lore (Folklore)

## What the Project Is
A **static, offline‑first web encyclopedia** of global folklore. It ships a curated collection of:
- **1,719 stories** from 209+ countries across 13 story types (myths, legends, fairy-tales, fables, horror, etc.).
- **3,668 mythical creatures** (the actual dataset in `data/datasets/creatures.json`).
- Associated **metadata**: themes, morals, sources, periods, keywords, creature mentions, and regional tags.

## Architecture

```
Whispering Lore/
├─ index.html, bestiary.html, stories.html, world.html, about.html, quiz.html, mylore.html, 404.html
├─ css/styles.css                    — global "Dark Nordic" UI theme
├─ js/
│   ├─ main.js                       — site-wide UI (menu, nav, scroll, stats, particles)
│   ├─ shared-utils.js               — shared helpers (Shimmer shard loader, esc(), toggleVisibility)
│   ├─ daily-feature.js              — deterministic random creature/story per day
│   ├─ creatures-viewer.js           — Bestiary UI – filters, sort, pagination, detail overlay
│   ├─ stories-viewer.js             — Stories UI – filters, sort, pagination, detail overlay
│   ├─ world-viewer.js               — Country data enrichment for globe page
│   ├─ globe.js                      — Three.js interactive globe (ES module)
│   ├─ mylore.js                     — Personal saved archives UI
│   ├─ quiz.js                       — Mythical creature quiz logic
│   ├─ theme-toggle.js               — Dark/light mode toggle
│   └─ rune-scatter.js               — Hero rune animation
├─ data/datasets/creatures.json      — 3,668 creature entries (JSON)
├─ data/datasets/stories.json        — 1,719 story entries (JSON)
├─ data/sharded/                     — Shimmer manifest + region-based shards for lazy loading
├─ sw.js                             — Service Worker – caches 16+ core assets for offline use
├─ sitemap.xml                       — SEO sitemap
├─ _redirects                        — Netlify redirect rules (SPA fallback)
├─ netlify.toml                      — Netlify build & deploy config
├─ archive/scripts/                  — Node scripts for data prep (migration, validation)
├─ docs/                             — internal documentation (arch, SEO, schemas)
├─ tests/                            — 52 Jest tests + 9 Playwright (3 browsers × 3 specs)
├─ package.json
└─ .github/workflows/ci.yml          — GitHub Actions (lint + test on push/PR)
```

## How It Works
1. **Data Loading** — No inline scripts. The shimmer shard system loads data from `data/sharded/` via manifest-driven lazy loading. Viewers call `shimmer.loadAllShards()` on init. XHR fallback to `data/datasets/*.json` when shimmer is unavailable.
2. **Viewer Logic** — Each viewer (`creatures-viewer.js`, `stories-viewer.js`) implements pagination, sorting (A-Z, Newest), filtering (region/country/type/tribe), and a detail overlay. All use shared helpers from `shared-utils.js`.
3. **Daily Feature** — `daily-feature.js` deterministically picks a random creature and story per day using the current date as a seed. Falls back through inline globals → shimmer → XHR.
4. **Service Worker (`sw.js`)** — Caches 16+ core assets on first visit (HTML, CSS, JS, manifest). The site works offline thereafter.
5. **SEO** — `sitemap.xml` lists main pages; Open Graph meta tags in each HTML file; canonical links on all pages.
6. **Sort & Filter** — Both bestiary and stories pages have Sort By (Relevance, A-Z, Newest) alongside facet filters with dynamic counts.

## Tooling & Development Workflow
| Category | Tools / Scripts |
|----------|-----------------|
| **Package Management** | `npm` (dev dependencies: ESLint, Prettier, Jest) |
| **Static Site Generation** | None required – pure static assets |
| **Data Validation** | `node archive/scripts/validate-creatures.js`, `node archive/scripts/deduplicate-creatures.js` |
| **Formatting / Linting** | `npm run lint`, `npm run format` (ESLint + Prettier) |
| **Testing** | Jest — 52 tests (9 suites) + Playwright — 3 tests (3 browsers) |
| **Coverage Tracking** | `archive/scripts/update-coverage.js` updates `COVERAGE.md` |
| **Service Worker** | `sw.js` implements cache-first strategy |
| **Deploy** | Netlify (via `netlify.toml` + `_redirects`) — also `python -m http.server` locally |
| **CI** | GitHub Actions — lint + test on push/PR |

## UI / UX Details
- **Theme** — Dark Nordic palette (`--bg-deep: #0D0D0D`, `--accent: #991B1B`, etc.).
- **Responsive** — Breakpoints at 900px, 768px, 700px, 600px, 480px.
- **Icons** — Phosphor icon set (CDN-loaded).
- **Accessibility** — Semantic HTML, skip-link, focus outlines, ARIA labels, passive scroll listeners.
- **Offline** — Service Worker caches assets; site works without network after first visit.
- **Skeleton Loaders** — 24 shimmer-animated skeleton cards while data loads.
- **Tactile Feedback** — `:active` scale/translate transforms on all interactive elements.

## Current Statistics (as of Jul 2026)
| Metric | Value |
|--------|-------|
| Creatures | 3,668 |
| Stories | 1,719 |
| Countries covered | 210 |
| Regions | 32 |
| Story Types | 13 |
| Creature Types (canonical) | 46 |
| HTML pages | 8 |
| Test suites | 106 total |
| Descriptions ≥30 chars | 100% |
| Zenodo DOI | 10.5281/zenodo.21387109 |

## Running the Project Locally
```bash
npm ci
npm test
python -m http.server 8000
# Open http://localhost:8000
```

## Future Roadmap
- **Data Expansion** — Add more stories for creatures without them, expand under-represented regions.
- **Audio/Narration** — Record story narrations, serve via `<audio>` tags.
- **Illustrations** — Add custom artwork for creatures and stories.
- **Multilingual UI** — Native translations for major languages.
- **Community Contributions** — Submit-form and moderation pipeline for folklore enthusiasts.
- **Performance** — Further optimise Core Web Vitals scores.

## Dependencies (dev only)
```json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^2.8.0",
    "jest": "^29.0.0"
  }
}
```

## Citation
If you use this dataset, please cite:
```
Olsson, Mats. (2026). Whispering Lore: A Comprehensive Digital Compendium of
World Mythology and Folklore. Zenodo. https://doi.org/10.5281/zenodo.21387109
```

## License & Contribution
CC-BY-4.0 licensed. Contributions should follow the existing data model and run `npm test && npm run lint` before opening a PR.
