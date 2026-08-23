# i18n Phase 2 Wave G — Nordic Creatures Final Batch (positions 201–314)

**Date:** 2026-08-23
**Status:** Approved design (conversation 2026-08-23)
**Predecessor:** Waves A–F shipped through `1526c91`

## Goal

Finish the nordic bestiary: extend `data/i18n/sv/creatures-nordic.json` with shard positions 201–314 (114 entries, `name` + `summary` + `description`, `complete:true`) → totals **314 entries / all complete**. The entire nordic region becomes natively Swedish.

Executed as two committed sub-batches so progress is safe:
- G1: positions 201–250 (50 entries) → commit
- G2: positions 251–314 (64 entries) → commit

## Architecture & rules

Identical to Waves B/E/F: chunked personal translation under /tmp, python merge, validation gate, browser spot-checks, gates, ship. No code changes; no sw bump. Translation rules unchanged.

## Validation gate

Final state: exactly 314 entries (= full shard); every slug valid; non-empty name+summary everywhere; every entry `complete:true` with description ≥200 chars; Cyrillic homoglyph scan clean.

## Mechanics

Gates per sub-batch end: eslint 0, jest green, chromium green (world.html iPad flake passes isolated = acceptable). todos.md updated at ship; zip rebuilt; smoke :8123; push main.
