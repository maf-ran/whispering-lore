# Research History

Log of research passes and pipeline work for Whispering Lore datasets.

## Items & Artifacts Pipeline (Aug 2026)

**Plan:** `docs/superpowers/plans/2026-08-08-items-artifacts.md`
**Spec:** `docs/superpowers/specs/2026-08-08-items-artifacts.md`
**Schema:** `docs/items-schema.md`

### Phase 1 — Seed dataset (2026-08-08)

- Created `data/items.json` with 20 flagship Nordic artifacts (schema + integrity tests in `tests/items-data.test.js`).
- Added genuine back-references:
  - `creatures.json` `related_items`: `fenrir → gleipnir`, `dwarf-dvergr → mjolnir`, `odin-iceland / odin-norway → gungnir, draupnir, hlidskjalf`.
  - `stories.json` `items`: `ilmarinen-forges-the-sampo → sampo`, `capture-of-the-sampo → sampo`.
- Item → creature/story forward references resolve 100% against the datasets.
- Commits: `c44eac6` (schema+seed+tests), `195833e` (viewer), `f36b845` (page), `320b92f` (citations).

### Phase 2 — Research batches to ~150 items (pending)

Follow the approved research workflow (batches by Nordic country, staged additions, attestation audit, dedup cross-check). See plan Task 6.
