# i18n Phase 2 Wave B — Coverage Map, complete:true, Full Swedish Entries

**Date:** 2026-08-23
**Status:** Approved design (conversation 2026-08-23)
**Predecessor:** `2026-08-22-i18n-phase2-design.md` (Phase 2 architecture), Wave A shipped `d3f2d95..5dce9f8`

## Goal

Three items from the Wave B backlog:

1. **Overlay coverage map** — native mode must not fire ~180 overlay 404s per page load for regions that have no sv files.
2. **`complete:true` flag** — an overlay entry that fully covers the rendered surface (name + summary + description) drops the "översättning saknas" badge.
3. **Content batch** — 50 FULLY Swedish Nordic creatures (positions 51–100 of the region-shard array): name + summary + description translated by hand, marked `complete:true`.

Out of scope: stories/items overlays, additional languages, P1 menu leftovers.

## Architecture

### 1. Overlay coverage map

**Problem.** `_loadOverlayFor(type, region, lang)` fetches `data/i18n/sv/{type}-{region}.json` for every region touched during a native-mode load. Only `creatures-nordic.json` exists today, so a full corpus load emits ~180 404 responses (cached as resolved-null after first attempt, but noisy and slow on first paint).

**Design.** The manifest declares which overlay files exist:

```json
"i18n": {
  "sv": { "creatures-nordic": true }
}
```

- `archive/scripts/shard-data.mjs` derives this block at build time by scanning `data/i18n/<lang>/` directory listings (`{type}-{regionKey}.json` stems). No hand-maintenance; adding an overlay file + rebuilding shards publishes its coverage.
- `Shimmer._loadOverlayFor` consults `this.manifest.i18n[lang][fileKey]` before fetching:
  - Key present → fetch as today.
  - Manifest loaded AND key absent → return a cached resolved-null promise (no network).
  - Manifest not yet loaded OR block missing (old IDB-cached manifests) → fall back to current fetch-once behavior.
- Region key slugging stays `region.toLowerCase().replace(/[^a-z0-9]+/g,'-')`, identical to the filename convention.

### 2. `complete:true` flag

**Schema.** Overlay entries gain an optional boolean:

```json
"entries": {
  "tomte": { "name": "Tomte", "summary": "…", "description": "…", "complete": true },
  "troll-norway": { "name": "Troll", "summary": "…" }
}
```

**Decoration.** All three delivery paths (`_deliverShard`, `_deliverSlugBatch`, `_deliverItem`) already copy the patch onto the decorated object. They set:

```js
c._i18n = { lang: lang, partial: !(patch && patch.complete) }
```

Entries with no patch stay `partial: true` (tagged whenever any overlay applies, per Wave A policy).

**Badge.** `i18nBadgeEl` keys off `entry._i18n.partial === true` — no badge-code change required. `complete:true` entries simply render without the badge.

**Validation gate.** The pilot validation script is extended: `complete:true` requires non-empty `name`, `summary`, and `description` in the patch; every slug must exist in the source shard; description patches must be ≥200 chars (matching the dataset's own hard floor).

### 3. Content batch — 50 full entries

- Source: positions 51–100 of `data/sharded/creatures/by-region/nordic.json` array order (Wave A took 1–50). Starts `landvttir-iceland`, includes `lindworm-scandinavia`, `lyktemann`, `lussi`, `lindorm-*`, …
- Target: merge into the existing `data/i18n/sv/creatures-nordic.json` (single overlay file per type-region; Wave A's 50 partial entries remain untouched and keep their badges).
- Translation rules (unchanged from Wave A): established Swedish forms kept (Tomte/Nisse, Troll, Draug…), natural Swedish prose, no machine-literal calques; descriptions preserve factual content of the EN source; proper nouns / transliterations preserved inside Swedish text.
- `_meta.count` updated to reflect total entries in file; add `"fullEntries": 50` marker.

## Testing

- **jest** (`tests/shimmer.test.js`, fixture manifest gains an `i18n` block):
  - covered key → overlay fetched and applied (existing tests keep passing);
  - uncovered key → no fetch issued (spy on global.fetch), callback receives undecorated data;
  - `complete:true` patch → delivered copy has `_i18n.partial === false`;
  - partial patch → `_i18n.partial === true`.
- **e2e**: existing language-toggle suite green; accessibility native-scan test green (badge markup changes only remove nodes — axe-neutral).
- **Validation script**: extended gate run as a commit precondition for the batch.

## Docs & release mechanics

- sw bump v1_0_22 → v1_0_23 (js changed).
- todos.md: Wave B line with SHAs; README bullet unchanged (feature set same, deeper coverage).
- Deploy zip rebuilt + smoke `:8123` incl `?lang=sv` (covered entry shows no badge; uncovered-region deep link loads clean); push main.

## Risks / notes

- Old IDB-cached manifests lack the `i18n` block → fallback path keeps working (one-time 404s until cache refreshes via version bump).
- Description translations are long-form content work (~50 × 500–900 chars); executed personally like Wave A, validated by script, committed as data-only where possible.
