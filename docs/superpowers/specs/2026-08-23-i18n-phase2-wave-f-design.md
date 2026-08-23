# i18n Phase 2 Wave F — Nordic Creatures Batch 4 (positions 151–200)

**Date:** 2026-08-23
**Status:** Approved design (conversation 2026-08-23)
**Predecessor:** Waves A–E shipped through `66d426d`

## Goal

Extend `data/i18n/sv/creatures-nordic.json` with shard positions 151–200 (`name` + `summary` + `description`, `complete:true`) → totals 200 entries / 200... correction: 150+50 = **200 entries / 100→150 complete**? No — prior state is 150 entries / 100 complete; after adding 50 more complete entries the file holds **200 entries / 150 complete**.

Identical procedure to Waves B/E: chunked personal translation under /tmp, python merge, validation gate, browser spot-check, gates, ship. No code changes; no sw bump.

## Validation gate

Exactly 200 entries; slugs valid vs 314-entry shard; non-empty name+summary everywhere; complete ⇒ description ≥200 chars; exactly 150 complete; Cyrillic homoglyph scan clean.
