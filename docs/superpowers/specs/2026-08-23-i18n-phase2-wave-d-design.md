# i18n Phase 2 Wave D — Swedish Items Pilot

**Date:** 2026-08-23
**Status:** Approved design (conversation 2026-08-23)
**Predecessor:** `2026-08-22-i18n-phase2-design.md`; Waves A/B/C shipped through `7a5d61e`

## Goal

All 82 Nordic artifacts get Swedish `name` + `description` with `complete: true` — the items surface becomes fully native (items detail renders only name + description, so full coverage is achievable for every entry).

Out of scope: remaining creature descriptions, other regions, languages beyond sv.

## Architecture

### Overlay file

`data/i18n/sv/items-nordic.json`:

```json
{
  "_meta": {
    "lang": "sv",
    "source": "wave-d items pilot",
    "count": 82,
    "fullEntries": 82,
    "fullSlugs": ["…"]
  },
  "entries": {
    "<slug>": { "name": "…", "description": "…", "complete": true }
  }
}
```

### Infrastructure — no new code paths

Same as Wave C: `_loadOverlayFor('items', 'Nordic', 'sv')`, coverage-map entry auto-emitted by shard rebuild (`manifest.i18n.sv["items-nordic"] = true`), decoration via existing `_deliverShard` / `_deliverSlugBatch` / `_deliverItem` paths, items-viewer cached-detail decoration already live.

### Translation rules

1. Established Old Norse/Swedish item names kept where they exist (Mjölnir, Gungnir, Skíðblaðnir…); descriptive name parts translated naturally.
2. Descriptions faithful to EN content; target literary parity, gate floor at ≥50% of EN length.
3. Attestation-honest phrasing preserved.

### Validation gate

Against `data/sharded/items/by-region/nordic.json`:

- exactly 82 entries; every slug exists in the shard;
- non-empty `name` + `description` on every entry;
- every entry `complete: true` with `len(description) ≥ 0.5 × len(EN description)`;
- exactly 82 full entries; `_meta.fullSlugs` matches.

## Testing

- **jest**: fixture overlay `tests/fixtures/sv-items-nordic.json` (patches one fixture item with complete:true) registered in the shimmer test fixtureMap + fixture manifest gains `"items-nordic": true`; one test proving `loadRegionShard('items')` merge end-to-end. No js changes.
- **e2e**: full chromium suite green.
- **Browser verification**: `/items.html?lang=sv` grid shows sv names; a deep link shows Swedish description badge-free; zero `/data/i18n/` 404s.

## Docs & release mechanics

- No sw bump expected (no js changes).
- todos.md Wave D line updated (backlog shrinks); zip rebuilt; smoke :8123 incl `?item=<x>&lang=sv`; push main.
