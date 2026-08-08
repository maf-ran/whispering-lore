# Implementation Plan: Items & Artifacts Collection + Artifacts Page

**Date:** 2026-08-08
**Status:** Ready for execution
**Spec:** `docs/superpowers/specs/2026-08-08-items-artifacts.md`
**Approved approach:** Approach A — "Svelte data layer, classic page" (single flat JSON, subclassed viewer, classic page template).

---

## 1. Goal

Add a curated folklore **items & objects** dataset and a new **Artifacts** page (`items.html`) to Whispering Lore, starting with a Scandinavian (Nordic) phase of ~150 items. Phase 1 ships the full pipeline: schema → seed data (~20 flagship items) → page + viewer → integration (nav, sitemap, SW cache, citations) → research batches to reach ~150.

Everything material qualifies: mythic artifacts, folkloric objects, ships, tools, buildings, rune staves, jewelry, weapons, ritual objects.

## 2. Architecture Decisions (from spec)

- **Data:** single flat `data/items.json` (array). No sharding, no manifest. Loaded directly with `fetch` by the page and pre-cached in the SW.
- **Viewer:** new `js/items-viewer.js` subclasses `BaseViewer` (`js/viewer-base.js`). Uses `this.cache` + `window.__ITEMS` instead of `window.__FULL_CREATURES`/`__FULL_STORIES`.
- **Links (bidirectional, genuine only):**
  - Item → creatures: `related_creatures` (array of creature slugs; resolves against creatures.json).
  - Item → stories: `featured_in_stories` (array of story slugs; resolves against stories.json).
  - Creature → items: NEW field `related_items` on creatures.json (array of item slugs).
  - Story → items: NEW field `items` on stories.json (array of item slugs).
- **Page:** `items.html` mirrors `stories.html` structure (page-hero, filter-bar, sidebar controls, facet groups, card grid, full-page detail view) but uses item-specific IDs (`item-*`).
- **Nav:** "ARTIFACTS" link between BESTIARY and STORIES in header + footer on all 9 pages.
- **Hero stats:** `#stat-artifacts` added to `index.html`; `updateGlobalStats()` only updates it after items research completes (count remains hidden/0 until then).
- **Schema reuse:** shared quality/attestation fields (`source_type`, `source_quality`, `attested`, `version`, `lastUpdated`, `keywords`, `search_terms`) follow creature/story conventions exactly.

## 3. File Structure

### New files
| File | Purpose |
|---|---|
| `data/items.json` | Flat item dataset (Phase 1 seed ~20, grown to ~150) |
| `items.html` | Artifacts page (mirror of stories.html) |
| `js/items-viewer.js` | `ItemsViewer extends BaseViewer` |
| `docs/items-schema.md` | Item schema documentation |
| `tests/items-data.test.js` | Data-integrity tests for items.json |

> **ID naming note:** the spec's viewer-override table lists `artifact-*` IDs; this plan uses the internally consistent `item-*` prefix (`item-search`, `item-region`, `item-country`, `item-type`, `items-sort`, `item-grid`, `item-count`) matching `items.html` / `items-viewer.js` / `data/items.json`. Either is fine; pick one and stay consistent across viewer + page + e2e.

### Modified files
| File | Change |
|---|---|
| `data/datasets/creatures.json` | Add `related_items` field (back-references from items) |
| `data/datasets/stories.json` | Add `items` field (back-references from items) |
| `js/citations.js` | Add item branch (`items.html?item=`) |
| `js/viewer-base.js` | Optional small generic refactor of `syncFilterUI` label; otherwise leave intact |
| `js/main.js` | `updateGlobalStats()` reads `#stat-artifacts` |
| `css/styles.css` | `.card-type-badge` and `.item-country` styles if not already generic (reuse `.story-country`, `.card-type-badge` where possible) |
| `sw.js` | Add `/items.html`, `/js/items-viewer.js`, `/data/items.json`; bump cache to `whisperinglore-v1_0_6` |
| `sitemap.xml` | Add `items.html` (weekly, 0.8) |
| `index.html` + 8 other pages | Nav + footer link |
| `tests/sitemap.test.js` | Add `items.html` to files array |
| `tests/citations.test.js` | Item citation tests |
| `docs/data-quality/research-history.md` | Log items research phases |
| `docs/creature-schema.md`, `docs/story-schema.md` (if exist) | Document new `related_items` / `items` fields |

### Optional (only if desired)
- `tests/e2e/site-layout.spec.js`: add items to `DATA_PAGES` + `navLabels`.
- `tests/geo-validation.test.js`: extend to items.

## 4. Item Schema (data/items.json)

```json
{
  "id": "mjolnir-0101",
  "slug": "mjolnir",
  "name": "Mjölnir",
  "aliases": ["Mjöllnir", "Thor's Hammer"],
  "country": "Iceland",
  "region": "Nordic",
  "culture": "Old Norse",
  "type": "weapon",
  "material": "Iron",
  "era": "Viking Age",
  "maker": "Brokkr and Sindri (dwarves)",
  "powers": "Summons thunder and lightning; returns to the thrower's hand; hallows weddings and funerals.",
  "associated_creature": null,
  "description": "The mighty hammer of Thor, forged by the dwarven brothers Brokkr and Sindri as the prize of a wager Loki made on his own head...",
  "related_creatures": ["dwarf-dvergr"],
  "featured_in_stories": [],
  "source": "Prose Edda (Skáldskaparmál)",
  "source_type": "literary",
  "source_quality": "expert",
  "attested": true,
  "keywords": ["hammer", "thor", "thunder", "dwarves", "ragnarok"],
  "search_terms": ["mjolnir", "mjöllnir", "thor hammer", "thunder god", "brokkr", "sindri"],
  "version": "1.0.0",
  "lastUpdated": "2026-08-08"
}
```

### Field notes
- `id` pattern: `<slug>-NNNN` (same convention as creatures, e.g. `fenrir-0700`).
- `attested`: JSON boolean `true` | `false`; for none/unknown, set `null` (creatures.json omits the key for "none" — items use `null`; the test accepts all three).
- `source_type`: `oral_tradition` | `literary` | `archaeological` | `secondary_scholarly`.
- `source_quality`: same vocabulary as creatures (`good`, `poor`, `expert`, `fair`, `well-documented`, `researched`, `academic`, `documented`, `verified`, `primary`).
- `associated_creature`: single creature slug or `null` (primary owner/creator if it exists in the DB; e.g. Gleipnir → `fenrir`).
- `related_creatures` / `featured_in_stories`: only slugs that genuinely exist in creatures.json / stories.json.
- Type taxonomy (Phase 1, extensible): `weapon`, `jewelry`, `ship`, `garment`, `tool`, `household object`, `ritual object`, `rune stave`, `musical instrument`, `other`.

### Seed dataset (Task 1) — 20 flagship Nordic items
| slug | name | country | type | maker/notes |
|---|---|---|---|---|
| mjolnir | Mjölnir | Iceland | weapon | Brokkr & Sindri; related: dwarf-dvergr |
| gungnir | Gungnir | Iceland | weapon | Sons of Ivaldi; related: odin-iceland, odin-norway |
| draupnir | Draupnir | Iceland | jewelry | Brokkr & Sindri; drips 8 rings every 9th night |
| skidbladnir | Skíðblaðnir | Iceland | ship | Sons of Ivaldi; folds like cloth |
| brisingamen | Brísingamen | Iceland | jewelry | Dwarf-made necklace of Freyja |
| gleipnir | Gleipnir | Iceland | ritual object | Fetter binding Fenrir; related: fenrir |
| andvaranaut | Andvaranaut | Iceland | jewelry | Cursed gold ring of Andvari |
| gram | Gram | Iceland | weapon | Sword of Sigurd (reforged by Regin) |
| megingjord | Megingjörð | Iceland | garment | Thor's belt of strength |
| jarngreipr | Járngreipr | Iceland | garment | Thor's iron gloves |
| naglfar | Naglfar | Iceland | ship | Ship of dead men's nails; Ragnarök |
| hlidskjalf | Hliðskjálf | Iceland | household object | Odin's high seat, sees all worlds |
| gjallarhorn | Gjallarhorn | Iceland | musical instrument | Heimdall's horn; Ragnarök |
| hringhorni | Hringhorni | Iceland | ship | Baldr's great ship |
| aegishjalmr | Ægishjálmur | Iceland | rune stave | Helm of Awe stave (Icelandic grimoires) |
| vegvisir | Vegvísir | Iceland | rune stave | Wayfinding stave |
| gallehus-horns | Gallehus Golden Horns | Denmark | ritual object | Archaeological; source_type archaeological |
| sunken-church-bell | The Sunken Church Bell | Sweden | ritual object | Folk legend; sank into lake, rings underwater |
| trolls-gift-ring | Troll's Gift Ring | Norway | jewelry | Ring from troll/hulder; attested false, carefully worded |
| sampo | Sampo | Finland | tool | Kalevala magic mill; featured_in_stories: ilmarinen-forges-the-sampo, capture-of-the-sampo |

**Link verification (already confirmed):** `fenrir`, `dwarf-dvergr`, `dvarg-swedish`, `odin-iceland`, `odin-norway`, `troll-norway`, `troll-sweden`, `huldra` exist in creatures.json. Stories `ilmarinen-forges-the-sampo`, `wainamoinens-sailing`, `capture-of-the-sampo` exist in stories.json. NO Thor/Freya/Freyr/Surtr/Sigurd creature entries exist — do **not** invent `related_creatures` for those; leave empty or use existing creatures only.

**Seed back-references to add (genuine only):**
- creatures.json: `fenrir.related_items = ["gleipnir"]`; `dwarf-dvergr.related_items = ["mjolnir"]`; `odin-iceland.related_items = ["gungnir","draupnir","hlidskjalf"]`; `odin-norway.related_items = ["gungnir","draupnir","hlidskjalf"]`.
- stories.json: `ilmarinen-forges-the-sampo.items = ["sampo"]`; `capture-of-the-sampo.items = ["sampo"]`.

## 5. Tasks (TDD, bite-sized, commit after each)

### Task 1 — Item schema doc + seed dataset + data-integrity tests

**Red:**
1. Create `docs/items-schema.md` documenting the schema above (write tests' requirements into it).
2. Create `tests/items-data.test.js` with these cases (model on `tests/geo-validation.test.js`):
   - items.json exists and parses as an array of ≥1 entries.
   - every id is unique; every slug is unique and kebab-case.
   - required fields present on every entry: `id, slug, name, country, region, culture, type, description, source_type, source_quality, attested, version, lastUpdated`.
   - `country` ∈ geo-countries.json; `region` ∈ geo-regions.json.
   - `source_type` ∈ {oral_tradition, literary, archaeological, secondary_scholarly}.
   - `source_quality` ∈ shared vocabulary set.
   - `attested` ∈ {true, false, null}.
   - `version` is a string (e.g. `"1.0.0"`); `search_terms` is an array of strings.
   - `related_creatures` slugs resolve in creatures.json (every one found).
   - `featured_in_stories` slugs resolve in stories.json (every one found).
   - back-reference integrity: every creature `related_items` slug exists in items.json; every story `items` slug exists in items.json.
3. Run `npm test -- tests/items-data.test.js` → fails (no items.json).

**Green:**
4. Create `data/items.json` with the 20 seed entries above (full descriptions, real folklore).
5. Add back-references to creatures.json and stories.json (verified slugs only).
6. Run `npm test -- tests/items-data.test.js` → all pass.

**Verify:** `npm test` (full suite stays green — currently 144 tests).

**Commit:** `feat(items): add item schema and seed dataset with integrity tests`

### Task 2 — Items viewer (js/items-viewer.js)

Create `js/items-viewer.js` as a subclass of `BaseViewer` following the `StoriesViewer` pattern (`js/stories-viewer.js`). Key differences:
- `type: 'items'`, IDs: `gridId: 'item-grid'`, `emptyId: 'item-empty'`, `loadMoreId: 'item-load-more'`, `countSelector: '.item-count'`.
- `loadData()`: `fetch('data/items.json')` → `this.cache = data` AND `window.__ITEMS = data`. No manifest, no shards.
- `cardRenderer(item, index)`: card with `placeholderSVG(item.name, item.region)`, `.card-type-badge` for `item.type`, `.story-country` for `item.country`, CTA "View Artifact" → `?item=<slug>`.
- `showDetail(slug)`: full-page detail using `#item-detail` section; renders name, country/region, culture, type badge, material, era, maker, powers, description, source_type badge, attribution, `related_creatures` links (to `bestiary.html?creature=<slug>`), `featured_in_stories` links (to `stories.html?story=<slug>`), cite/share, prev/next.
- Override `updateCount()` — base hardcodes label `'creatures'/'stories'`. Either:
  - **(preferred)** Small generic refactor in `viewer-base.js`: replace `(this.type === 'creatures' ? 'creatures' : 'stories')` with a `this.type === 'creatures' ? 'creatures' : this.type === 'stories' ? 'stories' : 'artifacts'` chain, OR add `this.countLabel = options.countLabel`.
  - Override `updateCount()` entirely in the subclass.
- Override `syncFilterUI()` (base hardcodes `bestiary-*`/`story-*` IDs) → map to `item-search`, `item-region`, `item-country`, `item-type`, `items-sort`.
- Quick-filter chips: the base pattern reads `data-region`; items chips use `data-type` and set `state.filters.type`. Implement in `initFacetListeners` (or override the quick-chip branch) so `data-type` chips filter by item type.
- `loadData` + init sequence copied from StoriesViewer.init.
- Expose `window.showItem = (slug) => viewer.showDetail(slug)`.

**Red:** No unit tests for viewer (jsdom viewer test is heavy); instead add a lightweight **structure test** or rely on e2e. To keep TDD discipline:
1. Add to `tests/shared-utils.test.js` nothing; instead create `tests/items-viewer.test.js` (jsdom, mirroring `tests/shimmer.test.js` pattern) asserting:
   - `ItemsViewer` exists, `type === 'items'`, correct grid/empty/loadMore/count ids.
   - `cardRenderer` returns an `<article>` with class `card` and CTA linking to `?item=`.
   - `updateCount` renders "artifacts" label.
2. Run → fails (no js/items-viewer.js).

**Green:** implement `js/items-viewer.js` (+ minimal `viewer-base.js` label tweak if chosen).

**Verify:** `npm test`, `npx eslint js/items-viewer.js js/viewer-base.js`.

**Commit:** `feat(items): add items viewer subclassing BaseViewer`

### Task 3 — Artifacts page (items.html)

Create `items.html` as a near-copy of `stories.html` with:
- Title/meta: "Artifacts — Whispering Lore", description "Explore sacred objects, weapons, tools, ships, and ritual objects from myth and folklore."
- OG/Twitter tags + canonical + JSON-LD (Dataset, WebPage, BreadcrumbList) mirroring stories.html.
- Nav: `BESTIARY → ARTIFACTS (active) → STORIES` order.
- page-hero: h1 "Artifacts", accent-line, subtitle.
- filter-bar: `#item-search`.
- Sidebar: `#item-region`, `#item-country`, `#item-type` selects, `#items-sort`, `.active-filters`, quick-filters chips (type presets: `data-type="weapon"` etc., mirroring stories.html's `data-region` pattern but reading `data-type`), facet groups `region`/`country`/`type`.
- Main: `<p class="item-count" aria-live="polite">Loading artifacts...</p>`, `#item-empty`, `.filter-chips-container`, `#item-grid`, `#item-load-more`.
- Detail section `#item-detail` (mirror story detail: cd-loader, cd-hero with `#detail-back-link` → "Back to Artifacts", `#detail-name`, hero location, actions `#detail-fav`, `#detail-share`, `#detail-cite-btn`; cd-main with `#detail-description`, crossrefs `#detail-creatures-section` + `#detail-stories-section`, sidebar cards Cite / Tradition / Artifact Details (`#detail-material`, `#detail-era`, `#detail-maker`, `#detail-powers`) / Last Updated; `#detail-prev`/`#detail-next`; `#detail-error`).
- Footer link "Artifacts" between Bestiary and Stories.
- Scripts: shared-utils, citations, main, items-viewer (module), rune-scatter, SW register, theme-toggle, scroll-to-top, grain-overlay.
- No creature preload block needed unless cross-ref display wants names — prefer linking directly to `bestiary.html?creature=<slug>` (no name resolution needed).

**Verify:** `npm test` (sitemap test requires `items.html`), `npx eslint items.html` not applicable — run `npm run lint`, manual browser check via `npx serve` + e2e.

**Commit:** `feat(items): add artifacts page`

### Task 4 — Citation support (js/citations.js)

**Red:**
1. Add tests to `tests/citations.test.js` (mirror existing mock pattern):
   - `formats.bibtex(item, false, true)` → contains `items.html?item=`, item name, and `mythical artifact` (or "artifact entry") type.
   - `formats.mla(item, false, true)` → contains `items.html?item=` and "Artifact" subtitle.
   - `formats.apa(item, false, true)` → contains `items.html?item=`.
   - `generateAll(item, false, true)` returns all three with item URL.
2. Run → fails.

**Green:**
3. Modify `js/citations.js`: add `isItem` third param to `bibtex`, `mla`, `apa`, and `generateAll`. Branch:
   - title: `isItem ? entry.name : ...`
   - subtitle: `isItem ? 'mythical artifact entry' / 'Mythical Artifact'`
   - urlBase: `isItem ? 'items.html?item=' : ...`
4. ItemsViewer calls `gen.generateAll(item, false, true)`.

**Verify:** `npm test -- tests/citations.test.js`, full `npm test`.

**Commit:** `feat(items): add artifact citations`

### Task 5 — Integration: nav, sitemap, SW cache, hero stats

1. **Nav + footer:** in all 9 pages (`index.html`, `bestiary.html`, `stories.html`, `world.html`, `quiz.html`, `about.html`, `mylore.html`, `methodology.html`, `404.html`), insert `<a href="items.html">ARTIFACTS</a>` in header nav between BESTIARY and STORIES, and footer `<a href="items.html">Artifacts</a>` between Bestiary and Stories. On `items.html` itself add `class="active"`.
2. **sitemap.xml:** insert after stories line: `<url><loc>https://whisperinglore.com/items.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`.
3. **sitemap.test.js:** add `'items.html'` to the `files` array (line 6).
4. **sw.js:** add `'/items.html'`, `'/js/items-viewer.js'`, `'/data/items.json'` to `CORE_ASSETS`; bump `CACHE_NAME` to `"whisperinglore-v1_0_6"`.
5. **index.html hero stats:** add a 4th stat `#stat-artifacts` (e.g. "0 artifacts" initial). Update `js/main.js` `updateGlobalStats()` to read it (guarded — only updates when > 0). Update `about.html` stats / methodology count if hardcoded.
6. **docs:** update `docs/data-quality/research-history.md` with the items pipeline; update creature/story schema docs to document `related_items` / `items`.

**Verify:** `npm test` (sitemap + data integrity + citations all green), `npm run lint`.

**Commit:** `feat(items): integrate artifacts page (nav, sitemap, service worker, stats)`

### Task 6 — Research batches to ~150 items

Follow the approved research workflow (per spec §Research Workflow):
1. Write `archive/scripts/research_items_phase1.py` modeling `archive/scripts/research_creatures*.py` patterns: batching by Nordic country, output staged additions (not overwrites), attestation audit fields, dedup cross-check against `related_items` and item `aliases`/`search_terms`.
2. Batch 1 (e.g. 5 × 10 items): Norse mythic artifacts + Icelandic rune staves (15 existing seed + 35 new → 50).
3. Batch 2: Swedish folk objects (church bells, möbius... craft objects, ritual items) → ~50.
4. Batch 3: Norwegian + Danish (troll gifts, burial/ritual items, Gallehus-adjacent archaeology) → ~50.
5. Each batch: rerun `tests/items-data.test.js`; fix false slugs; update `research-history.md`; commit `feat(items): add N items — <country/theme>`.
6. Final: `npm test`, lint, verify counts ≈150, hero stat enabled.

**Commit:** per batch.

### Task 7 — Optional E2E + final verification

- (Optional) Add `items.html` to `tests/e2e/site-layout.spec.js` `DATA_PAGES` + `navLabels` (`'items': 'ARTIFACTS'`) and add an "Artifacts layout" describe block mirroring Stories. Update nav link count expectation if it asserts exact counts (it uses ≥7, fine).
- Run `npm run test:e2e` with `npx serve .` (port 3000).
- Full gate: `npm test`, `npm run lint`, `npx prettier --check .` (or `npm run format` then re-verify).

**Commit:** `test(items): add artifacts e2e layout coverage` (optional) + `chore: final verification`.

## 6. Verification Gate

| Command | Expect |
|---|---|
| `npm test` | all suites green (144 + new items/citation tests) |
| `npm run lint` | no errors |
| `npx serve .` + manual | items.html renders cards, filters work, `?item=mjolnir` deep-links, offline via SW, nav active state |
| `npm run test:e2e` | optional; green if run |

## 7. Risks / Mitigations

- **BaseViewer hardcoded branches** (`updateCount`, `syncFilterUI`): mitigated by minimal label tweak + subclass overrides. Do **not** rewrite the base class wholesale.
- **`related_items` new field on 3668 creatures:** default value `[]`; only set on genuinely linked creatures (≤ a few dozen). Update creature schema docs + tests that iterate creature keys (none assert exact key sets — verified).
- **Invented cross-links:** policy — never link an item to a creature/story that doesn't exist; if the owner (Thor, Freya) is absent from the DB, leave the link empty and note it in the item description.
- **SW caching stale data:** bump cache name on every items data change during research phase.
- **Story `items` field:** add to only 2 stories in Phase 1; keep it additive.

## 8. Definition of Done

- [ ] `data/items.json` exists with 20 seed + ~130 researched = ~150 items, all tests green.
- [ ] `items.html` live, linked in nav/footer on all 9 pages + sitemap + SW cache.
- [ ] Bidirectional links verified: item→creature/story and creature/story→item resolve 100%.
- [ ] `docs/items-schema.md` published; research history logged.
- [ ] Full test suite + lint pass.
