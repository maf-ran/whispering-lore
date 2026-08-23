# i18n Phase 2 Wave E — Nordic Creatures Batch 3 (positions 101–150)

**Date:** 2026-08-23
**Status:** Approved design (conversation 2026-08-23)
**Predecessor:** Waves A–D shipped through `f21b9e5`

## Goal

Extend `data/i18n/sv/creatures-nordic.json` with 50 more FULLY Swedish creature entries (shard positions 101–150): `name` + `summary` + `description`, each `complete: true`. Totals after wave: 150 entries / 100 complete.

## Architecture

Pure content addition — identical to Wave B Task 3. No code changes; coverage map already declares creatures-nordic. Translation rules unchanged (established Swedish forms, faithful natural prose, no calques, attestation-honest). `_meta.count` → 150, `fullEntries` → 100.

## Validation gate

Against `data/sharded/creatures/by-region/nordic.json`: exactly 150 entries; all slugs valid; non-empty name+summary everywhere; complete ⇒ description ≥200 chars; exactly 100 complete; Cyrillic homoglyph scan clean.

## Testing & mechanics

Data-only: jest suite untouched but re-run as gate; full chromium suite green; browser spot-check one new entry badge-free with sv description; todos.md updated; zip rebuilt; smoke :8123; push main.
