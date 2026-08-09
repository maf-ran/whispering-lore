# Items Dataset Expansion — Gap Regions + Fill-In

**Date:** 2026-08-10
**Status:** Approved
**Scope:** Grow `data/items.json` from 319 → ~670 items (~350 new) across the Americas, sub-Saharan Africa, South Asia, Oceania, and Eastern Europe/Baltic/Arctic, extend the type taxonomy, then release v1.2.0.

## Problem

The items dataset (319 entries, 44 countries) is heavily European: Nordic 82, Swedish 41, Mediterranean 38, Celtic 25, Egyptian 19, Middle East 11, Japanese 10, Chinese 9, Persian 8, Korean 5, Southeast Asia 8. Major folklore regions have **zero** items — the Americas, sub-Saharan Africa, South Asia, and Oceania — and Eastern Europe/Baltic/Arctic coverage is thin. Folklore objects from these regions (Mesoamerican ritual regalia, West African fertility charms, Aboriginal song-sticks, Slavic amulets) are absent, so the catalog underrepresents the world's material folklore.

## Decisions (from design Q&A)

| Decision | Choice |
|---|---|
| Focus | **Gap regions** + fill-in (Americas, Africa, South Asia, Oceania, Eastern Europe/Baltic/Arctic) |
| Size | **~350 new items** (ambitious) → total ~670 |
| Distribution | Americas ~80, Africa ~70, South Asia ~50, Oceania ~40, Eastern Europe/Baltic/Arctic ~110 |
| Taxonomy | **Extend** — add `religious object`, `crown`, `cooking vessel`, `container` to the existing 10 types |
| Pipeline | Reuse `archive/scripts/research_items_phase1.py` staged batches |
| ID scheme | Continue `<slug>-NNNN`; new batch ranges `13xx`–`17xx` |
| Attestation bar | **Maintain current bar** — `true` only with a named primary source; `false`/`null` for legend-only or oral-thin cases; honest wording in descriptions |
| Cross-links | **Verify + link** genuine creature/story slugs; empty when no match |
| Chunking | **Per-region phases**, each commitable and testable before moving on |
| Release | End with sw bump, updated README counts, tag **v1.2.0**, fresh Zenodo DOI (per established per-tag deposition pattern) |

## Target Size & Phase Plan

Five phases, each a research batch following the existing staged-apply flow:

| Phase | Region | Batch file | ID range | Est. size | Countries |
|---|---|---|---|---|---|
| 1 | Americas | `batch-13xx-americas.json` | `13xx` | ~80 | Mexico, Peru, Brazil, US, Canada, Guatemala, Haiti, Cuba, Chile, Argentina, Bolivia, Colombia, Venezuela, Ecuador, Greenland/Inuit… |
| 2 | Africa | `batch-14xx-africa.json` | `14xx` | ~70 | Nigeria, Ghana, Kenya, South Africa, Zimbabwe, Ethiopia, Senegal, Mali, Benin, Congo, Tanzania, Uganda, Rwanda, Madagascar… |
| 3 | South Asia | `batch-15xx-south-asia.json` | `15xx` | ~50 | India, Sri Lanka, Pakistan, Nepal, Bangladesh, Bhutan, Afghanistan… |
| 4 | Oceania | `batch-16xx-oceania.json` | `16xx` | ~40 | Australia, New Zealand, Fiji, Papua New Guinea, Samoa, Tonga, Hawaii, Solomon Islands, Vanuatu… |
| 5 | Eastern Europe / Baltic / Arctic | `batch-17xx-eastern-europe.json` | `17xx` | ~110 | Russia, Ukraine, Belarus, Lithuania, Latvia, Estonia, Poland, Romania, Bulgaria, Hungary, Czech Republic, Georgia, Armenia, Azerbaijan, Tatarstan, Sakha, Yamalo-Nenets, Buryatia… |

Total ~350 new → ~670. Per-phase commits keep each change reviewable.

## Data Model Changes

### Taxonomy extension (`docs/items-schema.md`)

New types added to the `type` enum alongside the existing 10:

```
existing: weapon, jewelry, ship, garment, tool, household object, ritual object,
          rune stave, musical instrument, other
added:    religious object, crown, cooking vessel, container
```

Rationale: many gap-region items (Catholic relics, royal headdresses, ancestral pots, calabash/container forms) don't fit the existing enum cleanly; forcing them into `other` or `household object` loses queryability. `charm` is deliberately **not** added — it overlaps `ritual object`; existing `ritual object` entries already cover charm-like objects.

Impact:
- `docs/items-schema.md` Type section lists the 14 types.
- `archive/scripts/research_items_phase1.py` `ALLOWED_TYPES` gains the 4 new values.
- `tests/items-data.test.js` type enum assertion updates.
- Viewer type dropdown + filter chips are **data-driven** (`populateSelect('item-type','type')`) — new types appear automatically; no viewer change needed.

### Region/country values

New entries use the existing `data/datasets/geo-regions.json` (151 regions) and `geo-countries.json` (242 countries) — verified present, e.g. `South Asia`, `Oceania`, `Pacific`, `Aboriginal`, `Sub-Saharan Africa`, `West Africa`, `East Africa`, `Central Africa`, `Southern Africa`, `Mesoamerica`, `South America`, `North America`, `Caribbean`, `Amazonian`, `Arctic`, `Baltic`, `Slavic`, `Caucasus`, `Sami`. No geo-data changes required.

### ID scheme

Continue `<slug>-NNNN` (4-digit suffix). New batches: `13xx` Americas, `14xx` Africa, `15xx` South Asia, `16xx` Oceania, `17xx` Eastern Europe/Baltic/Arctic. The `guide.md` batch-number table is extended with the Phase 3 ranges.

## Research Workflow (per phase)

Reuse the proven pipeline (`archive/scripts/research_items_phase1.py`):

1. **Source list first** — authoritative names + sources per region (ethnographic collections, myth/folktale anthologies, museum catalogs, regional folklore journals). Create `ref-<area>.txt` alongside the guide with verified creature/story slugs available for cross-links.
2. **Draft batch** → `archive/scripts/expansions/items/batch-{N}-{region}.json` as a JSON array of full item objects, following `guide.md` field rules (description 150–400 chars, concrete and specific, no boilerplate).
3. **Dedup** → `research_items_phase1.py dedup <batch>` (slug/name/alias collisions vs dataset).
4. **Validate** → `validate <batch>` (schema + integrity rules).
5. **Stage + review** → `stage <batch>` produces `data/items.staged.json`; review before apply.
6. **Apply** → `apply <batch>` merges into `data/items.json` with bidirectional back-references.
7. **Rebuild shards** → `node archive/scripts/shard-data.mjs` (by-slug 24+ batches, by-region 29+ files, manifest `items` key, totals).
8. **Tests** → `npx jest` full suite; chromium e2e `npx playwright test --project=chromium` (item counts are data-driven and self-adapt).
9. **Commit** per phase; tick `todos.md`.

### Attestation policy (unchanged, applied honestly)

- `attested: true` — backed by a named primary source (text, artifact, ethnography).
- `attested: false` — uncertain, fabricated, or only modern/derived mention; never present legend claims as fact in descriptions ("is sometimes said to…").
- `attested: null` — no attestation possible (e.g. oral-only with no recorded source).
- `source_type` ∈ {oral_tradition, literary, archaeological, secondary_scholarly}; `source_quality` from the existing allowed set.

### Cross-links (genuine only)

- `associated_creature` / `related_creatures` — creature slugs verified against `data/datasets/creatures.json` (via per-area `ref-*.txt`).
- `featured_in_stories` — story slugs verified against `data/datasets/stories.json`.
- Empty arrays when nothing fits. Back-references applied only for genuine matches.

## Test Strategy

| Test | Change |
|---|---|
| `tests/items-data.test.js` | Extend type enum assertion with 4 new types; counts/regions assertions updated if present |
| `tests/items-viewer.test.js` | Self-adapts (data-driven); verify still green |
| `tests/e2e/items-viewer.spec.js` | `ITEM_COUNT` read from items.json — self-adapts |
| Full jest + chromium | Green gate per phase |

No new test files expected — existing items tests are data-driven and validate schema/integrity generically.

## Documentation / Release

- `docs/items-schema.md` — Type enum update.
- `archive/scripts/expansions/items/guide.md` — batch-number table + Phase 3 regions.
- `README.md` — Artifacts count row (319 → ~670).
- `sw.js` — bump cache after final phase (e.g. `whisperinglore-v1_0_16`).
- `data/research-history.md` — items expansion log.
- `.zenodo.json` — refresh counts for v1.2.0.
- **Release:** tag `v1.2.0`, push; workflow mints a fresh Zenodo deposition (new DOI, per established pattern; not a version chain).

## Files Changed

| File | Change |
|---|---|
| `data/items.json` | ~350 new items across 5 batch applies |
| `data/datasets/creatures.json`, `stories.json` | Back-references for genuine matches only |
| `data/sharded/**` | Regenerated (by-slug, by-region, manifest) |
| `archive/scripts/expansions/items/batch-{13xx..17xx}*.json` | New research batches |
| `archive/scripts/expansions/items/ref-<area>.txt` | New cross-link ref files |
| `archive/scripts/expansions/items/guide.md` | Batch table + region reference |
| `archive/scripts/research_items_phase1.py` | `ALLOWED_TYPES` + new types |
| `docs/items-schema.md` | Type enum |
| `tests/items-data.test.js` | Type enum assertion |
| `sw.js` | Cache bump (final phase) |
| `README.md` | Counts |
| `.zenodo.json` | Counts (at release) |
| `data/research-history.md` | Log |
| `todos.md` | Phase tracking |

## Verification

1. **Jest** — full suite green after every phase.
2. **Chromium e2e** — full suite green after every phase; items-viewer specs self-adapt to new counts.
3. **Shards/manifest** — regenerate and verify manifest totals, slugIndex, allSlugs lengths equal items.json length.
4. **Cross-links** — all new `related_creatures`/`featured_in_stories` resolve; back-references verified; no broken refs.
5. **Taxonomy** — new types appear in items.html type dropdown + facet chips without code changes.
6. **Offline** — sw cache serves items page + shards after bump.
7. **Lint** — `npx eslint` clean on changed files (no new errors).

## Risks / Notes

- **Research effort is the long tail** — ~350 entries at the established quality bar. Per-phase commits let work pause cleanly between regions.
- **Oral-thin regions** (parts of Africa/Oceania/First Nations) — the attestation bar stays strict: `attested: false`/`null` + honest wording rather than presenting legend as fact. This means some famous-but-unverifiable items may be excluded or marked uncertain; that is correct per project rules.
- **Culture labels** — new regions introduce many cultures (Maya, Quechua, Yoruba, Maori, Haida, Yakut, Tatar…); `culture` is free-text so no schema change, but values must be consistent (check existing entries before inventing variants).
- **Type taxonomy change touches validation** — updating `ALLOWED_TYPES` + items-data test is required before the first batch apply, else `validate`/`apply` rejects new types.
- **Zenodo fresh-deposition behavior** — each release tag mints a new DOI (established v1.1.0 pattern); v1.2.0 will get a new DOI, not a v1.1.0 chain.
