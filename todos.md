# Project Todos

## Completed
- [x] UI/UX Improvements (Jun 13)
- [x] Tier 1: Foundation (AI-template replacements, bidirectional index, etc.)
- [x] Tier 2: Transformation (Auto-linked related creatures, citation export, etc.)
- [x] Tier 3: Distinction (Region-themed SVG glyphs, DOI/Zenodo workflow, etc.)
- [x] Tier 4: Polish (JS modularization, dynamic SW cache, etc.)
- [x] Comprehensive cross-reference audit & fixes (Phase 7)
- [x] Data quality overhaul (Deduplication, slug conversion, etc.)
- [x] Quiz pool expansion (1071 questions)
- [x] Mobile navigation redesign
- [x] T2.1: Manual Source Quality Verification (Heuristic batch + spot-check completed. 589 flags corrected. ~700 entries processed.)
- [x] T2.2: Stub enrichment - all 245 "Not documented" entries filled with real folklore research (93 full research + 121 name-classified + 11 web-researched: Arwe, Chuhayster, Heitsi-eibib, Sinti Lapitta, Jacky My Lantern, Gewi, Cogaz, etc.)
- [x] Final end-to-end audit of all 4 tiers for 10/10 compliance (Jul 9)
- [x] Deep cross-reference audit: 24 checks → 23 pass, 1 informational (Jul 9)
- [x] Source quality batch upgrades (Jul 18): 43 batches, 2910 creatures → Stage 3+; 68.4% combined coverage; 100% creatures Stage 3+
- [x] Story batch 45 (Jul 18): 50/50 stories upgraded fair/good → researched, 21 shards, 15 regions, 0 errors
- [x] Story batch 52 (Jul 18): 50/50 stories upgraded fair/good → researched, 3 shards (g/h/i), North American, 0 errors
- [x] Story batch 64 (Jul 18): 50/50 stories upgraded fair/good → researched, 14 shards (a/b/c/k/l/m/o/p/r/s/t/u/v/y), South Asian + Southeast Asian, 0 errors
- [x] Story source quality upgrade (Jul 20): ALL 67 batches complete — 1,669/1,719 stories at Stage 3+ (97.1%). 50 remaining are fair/good (dataset limit).
- [x] S1 COMPLETE: Combined Stage 3+ = 5,331/5,387 = 99.0%. methodology.html updated. 106/106 Jest pass.

---

## CRITICAL

### S1: Story Source Quality — ✅ COMPLETE (Jul 20)
- 1,669/1,719 stories now Stage 3+ (97.1%). 50 remaining are fair/good (dataset limit — oral tradition stories with no known academic publication).
- Combined Stage 3+ = 5,331/5,387 = 99.0%.

### C1: stories.json — ✅ COMPLETE (Jul 20)
- All 1,719 stories now have full_text (0 empty remaining). 928 stories enriched across 14 batches.
- Avg full_text length: ~1,800 chars. All narratives expanded from summaries in literary folklore style.

### C2: t.json shard — ✅ COMPLETE (Jul 20)
- Re-shard script strips `the-`/`a-`/`an-` prefix before bucketing. 735 stories moved to correct shards.
- t.json: 134 stories (down from 868). Distribution now balanced across 25 shards.

---

## HIGH

### H1: main.js loaded as type="module" on bestiary/stories, classic on 7 other pages
- **Scope:** bestiary.html line 321 and stories.html line 305 use `<script type="module" src="js/main.js">`. All other pages use plain `<script>`.
- **main.js is a plain IIFE** (no import/export). Module loading adds deferred execution + strict mode (both harmless here).
- **No functional bug today** — `window.__sharedUtils` is set by classic scripts before modules execute.
- **Risk:** Confusing for contributors. If someone adds a global that main.js sets and another classic script reads, it breaks.
- [ ] Remove `type="module"` from bestiary.html line 321
- [ ] Remove `type="module"` from stories.html line 305
- [ ] Leave creatures-viewer.js and stories-viewer.js as `type="module"` (they are real ES modules)

### H2: 404.html has 5 inconsistencies with all other pages
- **Scope:** 404.html has multiple deviations from the standard page template.
- **Issues found:**
  1. Header nav order swapped: METHODOLOGY then MY LORE (all others: MY LORE then METHODOLOGY) — lines 54-55
  2. Phosphor loaded as `<link rel="stylesheet">` instead of `<script>` — line 109
  3. Phosphor pinned to `@2.1.1` instead of unpinned — line 109
  4. Phosphor placed after `</footer>` instead of in `<head>` — line 109
  5. No `.active` class on any nav link (known acceptable — E2E test skips this check)
- [ ] Swap header nav links so MY LORE comes before METHODOLOGY (match all other pages)
- [ ] Replace `<link rel="stylesheet" href="https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css" />` after `</footer>` with `<script src="https://unpkg.com/@phosphor-icons/web"></script>` in `<head>`

### H3: index.html missing header-brand span
- **Scope:** index.html is the ONLY page without `<span class="header-brand">Whispering <span class="hero-accent">LORE</span></span>` in its header.
- **All 8 other pages** have it (between `.header-nav-group` and `.theme-toggle`).
- **CSS already exists** at styles.css lines 231-246 — absolute centering, Cinzel font, crimson accent.
- **No JS references it** — pure static HTML.
- [ ] Add `<span class="header-brand">Whispering <span class="hero-accent">LORE</span></span>` to index.html between the closing `</div>` of `.header-nav-group` and the `<button class="theme-toggle">`

### H4: Dead `creatures` field on creature records
- **Scope:** 180 of 3,668 creatures have `"creatures": null` — the other 3,488 don't have the key at all. **Zero** records have a non-null value.
- **No JS code reads `creature.creatures`** — all `.creatures` access is on story objects.
- **Redundant** with `related` (creature→creature slugs, 100% populated), `stories` (creature→story slugs, 100% populated), and `featured_in_stories` (90.1% populated).
- **Bytes saved:** ~3.4 KB (negligible, but schema cleanliness matters).
- [ ] Remove `"creatures": null` from the 180 records that have it
- [ ] Regenerate creature shards
- [ ] Verify no code breakage

### H5: Zero unit tests for Shimmer loader (350 lines, 13 public methods)
- **Scope:** `Shimmer` in shared-utils.js lines 91-460 — manifest loading, region/slug shard loading, IDB caching, background refresh, deduplication. **Untested.**
- **Prerequisites needed:** Install `fake-indexeddb` (jsdom 30+ has no built-in IDB). Create test fixtures (manifest + 2-3 shard JSON files). Create XHR mock.
- **Critical methods:** `loadManifest`, `loadRegionShard`, `loadAllShards`, `getItem`, `getAllItems`.
- [ ] Install `fake-indexeddb` as dev dependency
- [ ] Create test fixtures: `tests/fixtures/manifest.json`, `tests/fixtures/creatures-sample.json`, `tests/fixtures/stories-sample.json`
- [ ] Create XHR mock helper
- [ ] Write tests for `loadManifest` (IDB-first, network fallback, background refresh)
- [ ] Write tests for `loadRegionShard` (3-tier: memory → IDB → network)
- [ ] Write tests for `loadAllShards` (IDB bulk + network partial)
- [ ] Write tests for `getItem` (shard search → slug batch → network load)
- [ ] Write tests for `getAllItems` (deduplication by name/title)
- [ ] Write tests for `getTotals` (null manifest, populated manifest)
- [ ] Write tests for error paths (XHR error, non-200, JSON parse failure)

---

## MEDIUM

### M1: Hardcoded badge colors — 10 unique hex values across 3 badge families
- **Scope:** styles.css source badges (lines 1443-1467), source-type badges (lines 2994-3007), live badge (lines 2973-2974).
- **Duplication:** `#22c55e` (green) appears 4 times, `#3b82f6` (blue) 4 times, `#f59e0b` (amber) 4 times.
- **Also:** Gold particle at line 1802 uses `#E82A2A` instead of `var(--accent)`.
- [ ] Define CSS variables: `--badge-verified`, `--badge-literary`, `--badge-quality-good`, `--badge-quality-researched`, `--badge-oral`, `--badge-archaeological`, `--badge-syncretic`
- [ ] Replace all hardcoded badge hex values with variables
- [ ] Replace gold particle `#E82A2A` with `var(--accent)`

### M2: `--text-muted` defined but never used
- **Scope:** styles.css line 13 defines `--text-muted: #78716C`. Zero usages anywhere.
- [ ] Either use it (replace appropriate `--text-secondary` usages that should be more muted) or remove it

### M3: Light theme — 44 hardcoded hex values redundant with CSS variables
- **Scope:** styles.css lines 2479-2601. Many use literal `#f5f2eb` (already `--bg-deep`), `#1c1917` (already `--text-primary`), `#d4cfc4` (could be `--border`).
- **New variables needed:** `--bg-card-light` (#f0ece3), `--border-light` (#d4cfc4), `--bg-hover-light` (#e8e3d8), `--bg-globe-light` (#F0EBE2).
- [ ] Define new light-theme variables in the `[data-theme="light"] :root` block
- [ ] Replace redundant hardcoded hex values with variable references
- [ ] Verify light theme renders identically after swap

### M4: Quiz correct/incorrect colors not variabled
- **Scope:** styles.css lines 2307-2315. 4 hardcoded hex values: `#2d8a4e`, `#7ddf9e`, `#8a2d2d`, `#df7d7d`.
- [ ] Define variables: `--quiz-correct-border`, `--quiz-correct-text`, `--quiz-incorrect-border`, `--quiz-incorrect-text`
- [ ] Replace hardcoded values

### M5: 8 Swedish creatures use schema_org_type "Thing" instead of "MythicalCreature"
- **Scope:** 8 records: Svartalv, Jerff, Jatte, Irrbloss, Drake (Swedish), Dvarg (Swedish), Diser, De underjordiska.
- [ ] Update all 8 to `"MythicalCreature"`
- [ ] Regenerate creature shards

### M6: 22 African creatures have `consort: ""` instead of field absent/null
- **Scope:** 22 records (Tsui-//Goab, Amma, Mamlambo, etc.) have `consort: ""`. 3,642 omit the field entirely.
- [ ] Remove the `consort` key from these 22 records (match the 3,642 that omit it)
- [ ] Regenerate creature shards

### M7: 8 stories have multi-country values, 62 have sub-national regions
- **Scope:** 8 stories use comma-separated countries (e.g. "Morocco, Algeria, Tunisia, Libya"). 62 stories use sub-national regions (e.g. "China (Tibet)", "Russia (Sakha Republic)").
- **These match geo-countries.json**, so no broken refs — but inflate the "210 countries" claim.
- [ ] Decide: normalize multi-country stories to single primary country, or accept as-is
- [ ] Decide: keep sub-national entries in geo-countries.json or collapse to parent country

### M8: Twitter Card meta tags missing on all 9 pages
- **Scope:** All 9 pages have only `<meta name="twitter:card" content="summary_large_image" />`. Missing: `twitter:title`, `twitter:description`, `twitter:image`.
- **OG tags are complete** — Twitter falls back to them, but explicit tags ensure consistent rendering.
- [ ] Add `twitter:title` (copy from `og:title`) to all 9 pages
- [ ] Add `twitter:description` (copy from `og:description`) to all 9 pages
- [ ] Add `twitter:image` (copy from `og:image`) to all 9 pages

---

## LOW

### L1: `data/quiz-templates/` — 6 dead placeholder files, never referenced
- **Scope:** `data/quiz-templates/level{1-6}.json` contain "Template question for level N" dummies. No JS references them. Quiz uses `data/quiz-pool/` instead.
- [ ] Delete `data/quiz-templates/` directory

### L2: `data/aliases-dictionary.md` — stub with 3 entries, never completed
- **Scope:** 3 sample entries (Troll, Naecken, Mara). Blank metadata fields. Not used programmatically.
- [ ] Delete or move to `archive/`

### L3: `data/motifs-index.md` — stub with 40 entries, never completed
- **Scope:** 16 ATU + 24 ML entries. Blank metadata fields. Not used programmatically.
- [ ] Delete or move to `archive/`

### L4: Google Fonts loaded 9 times (once per page head)
- **Scope:** All 9 pages have identical `<link>` tags for Cinzel + Lora. Browser caches after first page, but still 18 redundant `<link>` tags.
- [ ] Option A: Move to `@import` in styles.css (single declaration)
- [ ] Option B: Leave as-is (browser cache handles it)

### L5: `--bg-deep` === `--bg-dark` in dark mode (both #111111)
- **Scope:** Both variables are `#111111` in dark mode. They diverge in light mode (#F5F2EB vs #EDE8DF).
- **Semantic difference:** `--bg-deep` = page background, `--bg-dark` = section/panel background.
- [ ] Leave as-is if light-mode differentiation is intentional, or consolidate if not

### L6: 247 creatures (6.7%) have `culture: "Unknown"` — ✅ COMPLETE (Jul 20)
- All 247 culture values filled from country/region/description context. 0 Unknown remaining.

### L7: `relatedNames` vs `aliases` — 102 creatures have both (different data, working as designed)
- **Scope:** `aliases` = alternate names for same creature (3,637 creatures). `relatedNames` = names of other related creatures (102 creatures). They are distinct.
- [ ] No action needed — document the distinction in a schema comment or README section

---

## REMAINING (for true 10/10)

### T3.2: Publish dataset to Zenodo
- Needs `ZENODO_TOKEN` GitHub secret + tag push
