# Artifacts: Items & Objects in Folklore — New Page + Dataset

**Date:** 2026-08-08
**Status:** Draft
**Scope:** New `items.html` page, new `data/items.json` dataset, new tailored item schema, items viewer, site integration, and a Scandinavian research phase targeting ~150 items.

## Problem

The site catalogs creatures (3,668) and stories (2,185) across 212 countries, but folklore is also rich in **material objects** — mythic artifacts (Mjölnir, Gungnir, Draupnir), folkloric objects (a troll's gift ring, a bewitched knife, a sank church bell), and material things (ships, tools, rune staves). These are currently absent. This work adds a third content type: **items**, beginning with the Nordics.

## Decisions (from design Q&A)

| Decision | Choice |
|---|---|
| Scope | Everything material: mythic artifacts + folkloric objects + ships/tools/buildings |
| Cross-linking | **Bidirectional** — items carry `related_creatures`/`featured_in_stories`; existing creature/story entries get back-references where genuinely applicable |
| Schema | **New tailored item schema** reusing shared quality/attestation fields (source_type, source_quality, attested, lastUpdated, version) |
| Phase-1 size | **~150 items, full Nordics** (SE, NO, DK, IS, FI, Sami lands) |
| Page architecture | **Single-JSON page, simpler viewer** — `data/items.json` loaded directly (no shards), viewer subclasses BaseViewer |
| Sequencing | **Pipeline first** — seed set (~20 flagship artifacts) validates schema/page/viewer, then research batches grow it to ~150 |
| Page name | `items.html`, nav label "Artifacts", slotted between Bestiary and Stories |
| Hero stats | Add items count **only after** ~150 research completes; sw cache + sitemap updated when page ships |

## Data Model — `docs/items-schema.md`

New tailored schema. Mirrors creature/story conventions for shared fields.

### Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | unique, human-readable (e.g. `mjolnir`) |
| `slug` | string | yes | kebab-case, unique, matches name |
| `name` | string | yes | primary name |
| `aliases` | array | no | regional variants, transliterations, alternate names |
| `country` | string | yes | must match `data/datasets/geo-countries.json` |
| `region` | string | yes | must match `data/datasets/geo-regions.json` |
| `culture` | string | no | e.g. Old Norse, Sami, Finnish |
| `type` | string | yes | taxonomy: weapon, jewelry, ship, garment, tool, household object, ritual object, rune stave, musical instrument, other |
| `material` | string | no | iron, gold, bone, stone, rune-carved wood, etc. |
| `era` | string | no | mythic age / Viking age / saga / medieval / folk era |
| `maker` | string | no | credited smith/god/person |
| `powers` | string | no | what the item does |
| `associated_creature` | string | no | primary creature slug (e.g. thor) |
| `description` | string | yes | rich description, same quality bar as creature descriptions |
| `related_creatures` | array | no | creature slugs |
| `featured_in_stories` | array | no | story slugs |
| `source_type` | string | yes | mirrors creatures (Edda, saga, folktale, ethnography, ...) |
| `source_quality` | string | yes | mirrors creatures (primary / secondary / tertiary / poor) |
| `attested` | boolean\|"none" | yes | mirrors creatures: true / false / "none" |
| `keywords` | array | no | search terms |
| `search_terms` | array | no | aliases + transliterations for search |
| `version` | string | yes | e.g. "1.0" |
| `lastUpdated` | string | yes | `YYYY-MM-DD` |

### Back-references (bidirectional)

For each item, add the item's slug to the matching creature entry's `related_items` field and to matching story entries' `related_items` field — **only** where the item genuinely features in that creature/story. Do not mass-update; touch only genuine matches.

> Note: `related_items` may not exist on creature/story schemas yet; the design introduces it. Creature and story schema docs must be updated to document it.

## Dataset — `data/items.json`

- Flat single-file JSON array (~20 entries to start).
- Grows to ~150 via research batches; no sharding in this phase.
- Loaded directly by `js/items-viewer.js` (no manifest/shards).

## Page — `items.html`

Mirrors `stories.html` structure and the Bone & Ash design system:

- `.page-hero` (55vh) with rune-diamond SVG logo and title "Artifacts"
- `.filter-bar`: search input, region / country / type selects, Sort By (Relevance / A–Z / Newest)
- `.active-filters` chips + reset
- `.quick-filters` chips (type presets)
- Card grid `.card` + `.card-image-placeholder` (RegionGlyphs SVG) + `.card-type-badge`
- Card click → `?item=slug` detail view (hides hero/filters, shows name, IPA, description, powers, maker, associated creature, source, cite/share/favorite)
- Meta line: "Showing X of Y items" via BaseViewer count

## Viewer — `js/items-viewer.js`

Subclass `BaseViewer`. Override the hardcoded `creatures`/`stories` branches:

| BaseViewer method | Override |
|---|---|
| `updateCount()` | "Showing X of Y items" — total from `window.__ITEMS.length` (no manifest) |
| `syncFilterUI()` | `artifact-search`, `artifact-region`, `artifact-country`, `artifact-type`, `artifact-sort` IDs |
| `applyFilters()` data source | `window.__ITEMS` (loaded from `data/items.json`) |
| `cardRenderer` | item card (type badge, material, region glyph placeholder) |

Load flow: fetch `data/items.json` → `window.__ITEMS = data` → render. No shards/manifest dependency.

## Integration

| Surface | Change |
|---|---|
| Nav (all 9 HTML pages: header + footer) | Add "Artifacts" link between Bestiary and Stories |
| `sitemap.xml` | Add `items.html` (weekly, priority 0.8) |
| `sw.js` | Add `/items.html`, `/js/items-viewer.js`, `/data/items.json` to CORE_ASSETS; bump cache to `whisperinglore-v1_0_6` |
| `js/citations.js` | Add items mapping → `items.html?item=` |
| `js/main.js` | Optionally: random-artifact button support (deferred) |
| Hero stats | Untouched now; add items count after ~150 research completes |
| `data/research-history.md` | New items research log section |

## Research Workflow (after seed validates)

Target ~150 items across the Nordics, in 3-6 batch passes reusing the `archive/scripts/` Python research pattern:

1. **Source list first** — authoritative names + sources (Poetic/Prose Edda, sagas, folktale collections, ethnography).
2. **Batch research scripts** — model-assisted drafting with `attested` flagging (true = attested in source, false = uncertain/derived, "none" = no attestation).
3. **Attestation audit** — every entry verified; `source_quality` set; fabricated/uncertain material marked `attested: false` or `"none"` (never presented as fact).
4. **Dedup cross-check** — item names checked against creatures/stories and existing items (project rule: no overwrites, merge-aware).
5. **Reports** to `archive/scratch/reports/`; updates logged in `data/research-history.md`.
6. **Bidirectional back-references** applied for genuine matches.
7. **Hero stats updated** with items count only after this phase.

## Tests

- Extend `tests/sitemap.test.js` file list with `items.html`.
- New `tests/items-data.test.js`:
  - `data/items.json` parses as array
  - ids unique; slugs unique; slugs kebab-case
  - all required fields present and non-empty
  - country/region resolve in geo-countries.json / geo-regions.json
  - `related_creatures` / `featured_in_stories` slugs resolve to real creatures/stories
  - `attested` in {true, false, "none"}; `source_quality` in allowed set
  - type in allowed taxonomy
- Jest suite stays green (currently 144/144).

## Documentation

- `docs/items-schema.md` — schema reference (mirrors `docs/creature-schema.md`)
- `docs/creature-schema.md` / story schema — document new `related_items` field
- `methodology.html` / stats — items count after research phase

## Files Changed (seed phase)

| File | Change |
|---|---|
| `data/items.json` | New — seed dataset (~20 items) |
| `items.html` | New — page |
| `js/items-viewer.js` | New — viewer |
| `js/viewer-base.js` | Possibly extend `updateCount`/`syncFilterUI` for `items` type |
| `js/citations.js` | Add items URL mapping |
| `css/styles.css` | Card/badge styles for items (type badge, material) |
| `sw.js` | CORE_ASSETS + cache bump |
| `sitemap.xml` | Add items.html |
| `index.html`, `bestiary.html`, `stories.html`, `world.html`, `quiz.html`, `about.html`, `mylore.html`, `methodology.html`, `404.html` | Nav + footer link |
| `tests/sitemap.test.js` | Add items.html |
| `tests/items-data.test.js` | New — data validation |
| `docs/items-schema.md` | New — schema reference |
| `docs/creature-schema.md` (+ story schema doc) | Document `related_items` |
| `data/research-history.md` | Items log |

## Verification

1. **Jest** — full suite green (144 + new items-data tests).
2. **Manual/Playwright** — `items.html` renders seed cards at 320/768/1024/1440/1920px; filters, sort, search, chips, detail view, cite/share/favorite all work.
3. **Cross-links** — seed items' `related_creatures`/`featured_in_stories` resolve; back-references present on those creatures/stories.
4. **Offline** — sw cache serves items.html + items.json after cache bump.
5. **Lint** — `npx eslint` on new/changed files clean (existing pre-existing errors unchanged).

## Risks / Notes

- `BaseViewer.updateCount` and `syncFilterUI` have hardcoded `creatures`/`stories` branches — the items subclass must override them; consider a small base-class refactor to read `this.type` generically instead of hardcoding.
- `related_items` is a new field on creatures/stories; adding it must not break existing viewer/test logic that iterates known fields (grep before finalizing field name).
- Back-references must be **genuine only** — no speculative linking.
- The research phase is the long tail; seed phase is the validation gate.
