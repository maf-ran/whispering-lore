# Bestiary Detail-View Story Load Swap — Design

Date: 2026-09-12
Status: Approved (brainstorming gate); plan follows in `docs/superpowers/plans/`

## Problem

Opening a creature detail view on `bestiary.html` calls `renderCreatureStories()`, which
loads **every story region shard** (`sh.loadAllShards('stories', …)` — up to 139 files
under `data/sharded/stories/by-region/`, ~7.5MB) just to render the "appears in" cards
(max 6). Only 263/3,668 creatures
have `featured_in_stories` populated, so the cross-reference scan is the only general path.
The deferred "bestiary virtualization" item turned out to be already solved — the grid
paginates 24/page via a Load More button (`viewer-base.js`) — so the real remaining perf
hole is this detail-view bulk load.

## Solution

### 1. Data — `archive/scripts/build-search-index.py`

Add the story master's `creatures` refs to index stories entries:

```python
out['creatures'] = [str(c) for c in (item.get('creatures') or [])]
```

Regenerated `data/sharded/search-index.json` grows ~140KB (avg 2.55 refs/story) →
~4.25MB. Slug-parity and <9MB size-budget tests still hold (exact parity already asserted;
ref-presence assertion added, see Tests). Masters are unchanged — no data edits.

### 2. Runtime — `js/creatures-viewer.js`

`renderCreatureStories()` sources its data from a memoized, module-level fetch of
`data/sharded/search-index.json` instead of the shard loader:

- `let searchIndexPromise = null` module-level; on first call, fetch the index once and
  cache the Promise (subsequent calls resolve without a second request).
- Filter `idx.stories` by `s.creatures` refs, matching slug or display-name with the same
  `window.__sharedUtils.normalizeName` logic already used today.
- Render ≤6 cards with the same DOM builder (unchanged markup).
- **Fallback preserved**: if the index fetch throws / `!res.ok`, revert to the existing
  `loadAllShards('stories')` path so behavior regresses gracefully (offline, legacy).

No HTML changes. `window.__FULL_STORIES` / `window.__STORIES_DATA` globals are untouched —
other features (mylore, daily feature) keep their own loaders.

## Tests

- Extend `tests/search-index.test.js`: every stories index entry must carry a `creatures`
  array, and the union of all refs must be non-empty (no accidental drop). Parity test
  unchanged otherwise.
- Existing `tests/shimmer.test.js` fixture-map rule applies only to fixtures; index is a
  real file — no fixture registration needed.
- Gates in the `/tmp/wl-local` harness: re-gen index in the real repo, sync to harness,
  `node node_modules/.bin/jest --silent` (expect 244 + 1), eslint 0 errors.
- Smoke: threaded server on a fresh deploy stage; probe opens `bestiary.html`, clicks a
  creature whose slug appears in story refs, waits, asserts `#creature-stories` is visible
  and that the network log shows `data/sharded/search-index.json` (not `stories-*.json`
  shards) — measured with a Playwright probe script in the repo (untracked, stays).

## Out of Scope

- `stories.html` migration to the same index (Approach B) — follow-up.
- Infinite scroll / auto load-more (Approach C) — YAGNI; pagination already caps DOM.

## Risks

- Index size grows ~140KB — bounded by the <9MB budget test.
- First detail click pays a one-time 4.25MB fetch (vs 139 fetches / ~7.5MB today); browser
  HTTP cache (`data/*` max-age=3600) + module memoization make subsequent loads free.
- normalizeName matching is unchanged from today's logic, so result sets don't drift.