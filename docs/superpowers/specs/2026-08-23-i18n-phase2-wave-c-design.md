# i18n Phase 2 Wave C — Swedish Stories Pilot

**Date:** 2026-08-23
**Status:** Approved design (conversation 2026-08-23)
**Predecessor:** `2026-08-22-i18n-phase2-design.md`; Wave A `d3f2d95..cecc4c3`, Wave B `b38819b..09ec6b5`

## Goal

First Swedish overlays for STORIES: all 66 Nordic stories get `title` + `summary` in Swedish; 10 curator-selected flagship tales additionally get a fully translated `full_text` and are marked `complete: true` (no pending badge).

Out of scope: items overlays, other regions, languages beyond sv.

## Architecture

### Overlay file

`data/i18n/sv/stories-nordic.json`:

```json
{
  "_meta": {
    "lang": "sv",
    "source": "wave-c stories pilot",
    "count": 66,
    "fullEntries": 10,
    "fullSlugs": ["…", "…"]
  },
  "entries": {
    "<slug>": { "title": "…", "summary": "…" },
    "<flagship-slug>": { "title": "…", "summary": "…", "full_text": "…", "complete": true }
  }
}
```

### Infrastructure — no new code paths required

The merge layer is type-generic since Wave A/B:

- `_loadOverlayFor('stories', 'Nordic', 'sv')` resolves `data/i18n/sv/stories-nordic.json`.
- Coverage map: after adding the file, running `node archive/scripts/shard-data.mjs` emits `manifest.i18n.sv["stories-nordic"] = true`; uncovered keys keep short-circuiting to null.
- Decoration (`_deliverShard`, `_deliverSlugBatch`, `_deliverItem`) overwrites any patch key onto copies — `title`, `summary`, `full_text` need no special handling; `complete` is consumed by the existing `partial: !(patch && patch.complete)` logic and stripped before render.
- Stories-viewer cached-detail decoration + `getItem('stories', …)` already route through these paths (Wave A/B).
- SEO runtime injection reads decorated data globals automatically.

### Translation rules

1. Established Swedish titles used where they exist (Ragnarök etc.); otherwise faithful translation. Original-language proper names preserved inside Swedish prose.
2. Natural Swedish, no machine-literal calques; attestation-honest phrasing preserved.
3. Flagship selection: curator-chosen 10 most canonical nordic tales at execution time, recorded in `_meta.fullSlugs`.
4. `full_text` translations must reach ≥60% of the English source length (gate catches truncation); target is literary parity, not word-for-word.

### Validation gate

Script checks, against `data/sharded/stories/by-region/nordic.json`:

- exactly 66 entries, every slug exists in the shard;
- every entry has non-empty `title` + `summary`;
- `complete: true` ⇒ non-empty `title`, `summary`, `full_text`, and `len(full_text) ≥ 0.6 × len(EN full_text)`;
- exactly 10 complete entries; `_meta.fullSlugs` matches them.

## Testing

- **jest**: new fixture overlay `tests/fixtures/sv-stories-nordic.json` + one test in `tests/shimmer.test.js`: `loadRegionShard('stories', 'Nordic')` under `?lang=sv` merges `title`/`summary` patches, tags partial, honors `complete:true` on one fixture entry — proves the stories path end-to-end without touching js.
- **e2e**: full chromium suite green (language-toggle + axe native-scan unchanged).
- **Browser verification**: `/stories.html?lang=sv` grid shows sv titles; flagship detail shows Swedish full text with no badge; partial story shows badge; zero `/data/i18n/` 404s during load.

## Docs & release mechanics

- sw bump only if any `js/` file changes (expected: none — pure content wave).
- todos.md Wave C line with SHAs; backlog shrinks accordingly.
- Deploy zip rebuilt; smoke :8123 incl `?story=<flagship>&lang=sv`; push main.

## Risks / notes

- Volume: 66 summaries (~250 chars each) + 10 long-form texts (~2k chars each) ≈ 36k chars of hand translation — same personal-translation precedent as Waves A/B.
- Story slugs are stable (id/slug schema unchanged since normalization pass); overlay keyed by slug like creatures.
