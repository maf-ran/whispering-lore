# Whispering Lore — Full Project Improvements Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize code quality, fill data quality gaps, fix infrastructure issues, and improve UX across the entire Whispering Lore project.

**Architecture:** Four independent workstreams — Code Quality (JS modernization), Data Quality (dataset cleanup + shard rebuild), Infrastructure (SW, gitignore, CDN self-hosting), and UX (search improvements, filter state, cross-link fixes). Each produces working, testable software on its own.

**Tech Stack:** Vanilla JS (ES2021), Jest, Playwright, Netlify, Service Worker

---

## Workstream 1: Code Quality — JS Modernization

### Task 1.1: Fix `.gitignore` and clean up test artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add missing patterns to .gitignore**

Add these lines to the end of `.gitignore`:
```
# Playwright numbered result dirs
test-results */

# Coverage output
coverage/

# Environment files
.env
.env.*
```

- [ ] **Step 2: Remove numbered test-results directories from git tracking**

Run: `git rm -r --cached "test-results 2/" "test-results 3/" "test-results 4/" "test-results 5/" "test-results 6/" 2>/dev/null; echo "done"`

- [ ] **Step 3: Delete the stale directories from disk**

Run: `rm -rf "test-results 2/" "test-results 3/" "test-results 4/" "test-results 5/" "test-results 6/"`

- [ ] **Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: fix .gitignore for test-results variants and coverage"
```

---

### Task 1.2: Fix `'use strict'` placement and `theme-toggle.js`

**Files:**
- Modify: `js/main.js:6-41`
- Modify: `js/theme-toggle.js`

- [ ] **Step 1: Move `'use strict'` to top of main.js IIFE**

In `js/main.js`, the IIFE starts at line 6. Currently `'use strict'` is at line 41 (dead code). Move it to line 7, right after the opening `;(function () {`:

```js
;(function () {
  'use strict'
```

And remove the `'use strict'` that is currently at line 41.

- [ ] **Step 2: Add `'use strict'` to theme-toggle.js**

At the top of `js/theme-toggle.js`, after the opening line, add:
```js
'use strict'
```

- [ ] **Step 3: Run lint to verify**

Run: `npx eslint js/main.js js/theme-toggle.js`
Expected: No new errors (may reduce warnings).

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: All 141 tests pass.

- [ ] **Step 5: Commit**

```bash
git add js/main.js js/theme-toggle.js
git commit -m "fix: move 'use strict' to top of main.js IIFE, add to theme-toggle.js"
```

---

### Task 1.3: Fix double semicolon and duplicate `animateNumber`

**Files:**
- Modify: `js/world-viewer.js:291`
- Modify: `js/world-viewer.js:443-462` (remove duplicate animateNumber)

- [ ] **Step 1: Fix double semicolon at world-viewer.js line 291**

Change `};;` to `};`

- [ ] **Step 2: Remove duplicate `animateNumber` function from world-viewer.js**

Delete the `animateNumber` function definition in `js/world-viewer.js` (lines ~443-462). Replace all calls to the local `animateNumber` in that file with `window.__sharedUtils.animateNumber`.

Search for `animateNumber(` in `world-viewer.js` and replace each call with `window.__sharedUtils.animateNumber`.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: All pass.

- [ ] **Step 4: Commit**

```bash
git add js/world-viewer.js
git commit -m "fix: remove duplicate animateNumber, fix double semicolon in world-viewer.js"
```

---

### Task 1.4: Convert `var` to `const`/`let` across all JS files

**Files:**
- Modify: `js/shared-utils.js` (87 vars)
- Modify: `js/main.js` (32 vars)
- Modify: `js/world-viewer.js` (58 vars)
- Modify: `js/creatures-viewer.js` (101 vars)
- Modify: `js/stories-viewer.js` (94 vars)
- Modify: `js/viewer-base.js` (53 vars)
- Modify: `js/mylore.js` (18 vars)
- Modify: `js/citations.js` (17 vars)
- Modify: `js/daily-feature.js` (16 vars)
- Modify: `js/rune-scatter.js` (12 vars)
- Modify: `js/theme-toggle.js` (6 vars)
- Modify: `sw.js` (4 vars)

**Rules for conversion:**
- `var` that is never reassigned → `const`
- `var` that is reassigned → `let`
- `var` in a `for` loop → `let`
- `var self = this` → `const self = this`
- Function-scoped `var` at top of function that is later reassigned → `let` at top

Do each file one at a time, run lint after each.

- [ ] **Step 1: Convert sw.js**

Run: `npx eslint --rule '{"no-var":"error","prefer-const":"error"}' sw.js` to see all var locations. Then manually convert each `var` to `const` or `let`. Run `npx eslint sw.js` after to verify.

- [ ] **Step 2: Convert theme-toggle.js** (6 vars, smallest file)

Same approach. Run lint after.

- [ ] **Step 3: Convert rune-scatter.js** (12 vars)

- [ ] **Step 4: Convert daily-feature.js** (16 vars)

- [ ] **Step 5: Convert citations.js** (17 vars)

- [ ] **Step 6: Convert mylore.js** (18 vars)

- [ ] **Step 7: Convert main.js** (32 vars)

- [ ] **Step 8: Convert viewer-base.js** (53 vars)

- [ ] **Step 9: Convert world-viewer.js** (58 vars)

- [ ] **Step 10: Convert shared-utils.js** (87 vars)

- [ ] **Step 11: Convert stories-viewer.js** (94 vars)

- [ ] **Step 12: Convert creatures-viewer.js** (101 vars)

- [ ] **Step 13: Convert quiz.js** (0 vars — already modern, but verify semicolons are consistent)

- [ ] **Step 14: Run full test suite**

Run: `npm test`
Expected: All 141 tests pass.

- [ ] **Step 15: Run full lint**

Run: `npx eslint js/ sw.js`
Expected: Significantly fewer `no-var` and `prefer-const` warnings.

- [ ] **Step 16: Commit**

```bash
git add js/ sw.js
git commit -m "refactor: convert var to const/let across all JS files (619 declarations)"
```

---

### Task 1.5: Normalize semicolon style (remove all semicolons)

**Files:**
- Modify: `js/citations.js`
- Modify: `js/region-glyphs.js`
- Modify: `js/quiz.js`
- Modify: `js/creatures-viewer.js`
- Modify: `js/stories-viewer.js`
- Modify: `js/shared-utils.js` (mixed)
- Modify: `js/world-viewer.js` (mixed)
- Modify: `js/main.js` (mixed)
- Modify: `js/daily-feature.js` (mixed)
- Modify: `js/viewer-base.js` (mixed)
- Modify: `js/theme-toggle.js` (mixed)

ESLint rule is `"semi": ["warn", "never"]` — remove all trailing semicolons.

- [ ] **Step 1: Run prettier to auto-fix**

Run: `npx prettier --write js/`
Prettier will normalize semicolons based on its config. If `.prettierrc` doesn't exist or doesn't set `semi: false`, create one:

```json
{ "semi": false, "singleQuote": true }
```

Then re-run: `npx prettier --write js/`

- [ ] **Step 2: Run lint to verify**

Run: `npx eslint js/`
Expected: No `semi` warnings.

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: All 141 tests pass.

- [ ] **Step 4: Commit**

```bash
git add js/ .prettierrc
git commit -m "style: normalize semicolons via prettier (no-semicolon convention)"
```

---

### Task 1.6: Modernize XHR to `fetch()` API

**Files:**
- Modify: `js/shared-utils.js` (3 XHR calls — Shimmer loader)
- Modify: `js/world-viewer.js` (1 XHR call — fallback)
- Modify: `js/daily-feature.js` (2 XHR calls — fallback)
- Modify: `js/quiz.js` (1 XHR call — question loading)

**Pattern — XHR to Promise-based fetch:**

Replace every `new XMLHttpRequest()` pattern with:
```js
function fetchJSON(url) {
  return fetch(url).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });
}
```

Each file already has a local `fetchJSON` helper OR uses XHR inline. Replace inline XHR with `fetchJSON`.

- [ ] **Step 1: Add fetchJSON helper to shared-utils.js**

Add at the top of the shared-utils IIFE (after `'use strict'`):
```js
function fetchJSON(url) {
  return fetch(url).then(function(res) {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  })
}
```

Export it on `window.__sharedUtils.fetchJSON = fetchJSON`.

- [ ] **Step 2: Convert shared-utils.js Shimmer XHR calls**

The Shimmer loader has 3 XHR calls at lines ~237, ~280, ~301. Each follows this pattern:
```js
var xhr = new XMLHttpRequest();
xhr.open('GET', url, true);
xhr.onload = function() { ... };
xhr.onerror = function() { ... };
xhr.send();
```

Replace each with:
```js
fetchJSON(url).then(function(data) { ... }).catch(function(err) { ... });
```

- [ ] **Step 3: Convert world-viewer.js fallback XHR**

Replace the XHR in world-viewer.js with `window.__sharedUtils.fetchJSON(url).then(...)`.

- [ ] **Step 4: Convert daily-feature.js XHR calls**

Replace both XHR calls with `fetchJSON`.

- [ ] **Step 5: Convert quiz.js XHR calls**

Replace the XHR in quiz.js with `fetchJSON`.

- [ ] **Step 6: Run tests**

Run: `npm test`
Expected: All 141 tests pass.

- [ ] **Step 7: Run E2E smoke test**

Run: `npx serve -l 3000 -s . &` then `npx playwright test --project=chromium` then `kill %1`
Expected: E2E tests pass.

- [ ] **Step 8: Commit**

```bash
git add js/shared-utils.js js/world-viewer.js js/daily-feature.js js/quiz.js
git commit -m "refactor: replace XHR with fetch() API across all data-loading paths"
```

---

## Workstream 2: Data Quality — Dataset Cleanup

### Task 2.1: Consolidate story types (40 → ~12 canonical types)

**Files:**
- Modify: `data/datasets/stories.json`
- Create: `data/config/story-types.json` (canonical type list)
- Modify: `docs/story-schema.md` (add canonical type enum)
- Modify: `docs/DATABASE-GUIDE.md` (fix type count from 14)

**Merge mapping:**
| Current Types | Mapped To |
|---|---|
| `legend`, `historical-legend`, `urban-legend`, `maritime-legend`, `cryptid-legend` | `legend` |
| `myth`, `creation-myth` | `myth` |
| `fairy-tale`, `tale` | `fairy-tale` |
| `folktale`, `folklore`, `folklore-being`, `folklore-rhyme`, `folkloric-figure` | `folktale` |
| `supernatural`, `spirit`, `horror` | `supernatural` |
| `deity`, `deities` | `deity` |
| `trickster` (10 stories) | `folktale` |
| `adventure`, `epic`, `saga` | `epic` |
| `race` | `legend` |
| `afterlife` | `supernatural` |
| `ritual` | `folktale` |
| `romance` | `legend` |
| `cryptid` | `legend` |
| `tall tale` | `folktale` |
| `ballad` | `folktale` |
| `historical` | `legend` |
| `hero` | `epic` |
| `monster` | `legend` |
| `cultural-tradition` | `folktale` |
| Singletons: `mystery`, `vision`, `sacred-place`, `miracle` | `legend` |

**Canonical types (12):** `legend`, `myth`, `fairy-tale`, `folktale`, `epic`, `supernatural`, `deity`, `fable`, `ballad`, `saga`, `romance`, `ritual`

- [ ] **Step 1: Create canonical type list**

Create `data/config/story-types.json`:
```json
{
  "canonical": [
    "legend", "myth", "fairy-tale", "folktale", "epic",
    "supernatural", "deity", "fable", "ballad", "saga",
    "romance", "ritual"
  ],
  "mapping": {
    "historical-legend": "legend",
    "urban-legend": "legend",
    "maritime-legend": "legend",
    "cryptid-legend": "legend",
    "creation-myth": "myth",
    "tale": "fairy-tale",
    "folklore": "folktale",
    "folklore-being": "folktale",
    "folklore-rhyme": "folktale",
    "folkloric-figure": "folktale",
    "spirit": "supernatural",
    "horror": "supernatural",
    "deities": "deity",
    "trickster": "folktale",
    "adventure": "epic",
    "saga": "epic",
    "race": "legend",
    "afterlife": "supernatural",
    "cryptid": "legend",
    "tall tale": "folktale",
    "historical": "legend",
    "hero": "epic",
    "monster": "legend",
    "cultural-tradition": "folktale",
    "mystery": "legend",
    "vision": "legend",
    "sacred-place": "legend",
    "miracle": "legend"
  }
}
```

- [ ] **Step 2: Write a Node.js migration script**

Create `archive/scripts/normalize-story-types.mjs`:
```js
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '../../data/datasets/stories.json');
const configPath = resolve(__dirname, '../../data/config/story-types.json');

const stories = JSON.parse(readFileSync(dataPath, 'utf-8'));
const config = JSON.parse(readFileSync(configPath, 'utf-8'));
const mapping = config.mapping;
const canonical = new Set(config.canonical);

let changed = 0;
stories.forEach(s => {
  if (!canonical.has(s.type) && mapping[s.type]) {
    console.log(`  ${s.slug}: "${s.type}" → "${mapping[s.type]}"`);
    s.type = mapping[s.type];
    changed++;
  }
});

writeFileSync(dataPath, JSON.stringify(stories, null, 2) + '\n');
console.log(`\nDone: ${changed} stories remapped, ${stories.length} total written.`);
```

- [ ] **Step 3: Run the migration**

Run: `node archive/scripts/normalize-story-types.mjs`
Expected: Lists remapped stories and total count.

- [ ] **Step 4: Rebuild shards**

Run: `node archive/scripts/shard-data.mjs`
Expected: Shards regenerated with new types.

- [ ] **Step 5: Run tests**

Run: `npm test`
Expected: All tests pass (quiz-pool test may need updating if it checks story types).

- [ ] **Step 6: Update documentation**

In `docs/story-schema.md`, replace the type line with:
```
| type | string | "myth" | legend, myth, fairy-tale, folktale, epic, supernatural, deity, fable, ballad, saga, romance, ritual |
```

In `docs/DATABASE-GUIDE.md` line 28, change "14 unique types" to "12 canonical types".

- [ ] **Step 7: Commit**

```bash
git add data/datasets/stories.json data/config/ archive/scripts/normalize-story-types.mjs docs/
git commit -m "data: consolidate 40 story types into 12 canonical types"
```

---

### Task 2.2: Fill 268 empty creature archetypes

**Files:**
- Modify: `data/datasets/creatures.json` (245 "Unknown" + 23 missing)

**Strategy:** Use the creature's `type` field to infer archetype:
| Creature Type Pattern | Archetype |
|---|---|
| spirit, nature-spirit, water-spirit, forest-spirit, ancestor-spirit | Spirit |
| deity, god, goddess, creator-deity, supreme-deity | Ruler |
| trickster, shapeshifter | Trickster |
| guardian, protector | Guardian |
| monster, beast, sea-monster | Shadow |
| giant, ogre | Shadow |
| serpent, dragon | Shadow |
| ghost, undead | Threshold |
| animal-spirit, spirit-animal | Mentor |
| healer, sage, wise | Mentor |
| all others | Shadow (default) |

- [ ] **Step 1: Write archetype assignment script**

Create `archive/scripts/fill-archetypes.mjs`:
```js
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, '../../data/datasets/creatures.json');
const creatures = JSON.parse(readFileSync(dataPath, 'utf-8'));

const typeToArchetype = {
  spirit: 'Spirit', 'nature-spirit': 'Spirit', 'water-spirit': 'Spirit',
  'forest-spirit': 'Spirit', 'ancestor-spirit': 'Spirit', 'household-spirit': 'Spirit',
  'animal-spirit': 'Spirit', 'spirit-animal': 'Spirit',
  deity: 'Ruler', god: 'Ruler', goddess: 'Ruler',
  'creator-deity': 'Ruler', 'supreme-deity': 'Ruler',
  trickster: 'Trickster', shapeshifter: 'Trickster',
  guardian: 'Guardian', protector: 'Guardian',
  monster: 'Shadow', beast: 'Shadow', 'sea-monster': 'Shadow',
  giant: 'Shadow', ogre: 'Shadow',
  serpent: 'Shadow', dragon: 'Shadow',
  ghost: 'Threshold', undead: 'Threshold', vampire: 'Threshold', zombie: 'Threshold',
  healer: 'Mentor', sage: 'Mentor', 'wise-being': 'Mentor',
  hero: 'Hero', champion: 'Hero',
  villain: 'Shadow', demon: 'Shadow',
};

let filled = 0;
creatures.forEach(c => {
  const current = (c.archetype || '').toLowerCase();
  if (current === 'unknown' || current === 'none' || current === '' || !c.archetype) {
    const baseType = (c.type || '').split('-')[0];
    c.archetype = typeToArchetype[c.type] || typeToArchetype[baseType] || 'Shadow';
    filled++;
  }
});

writeFileSync(dataPath, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Filled ${filled} archetypes, ${creatures.length} total written.`);
```

- [ ] **Step 2: Run the script**

Run: `node archive/scripts/fill-archetypes.mjs`

- [ ] **Step 3: Rebuild shards**

Run: `node archive/scripts/shard-data.mjs`

- [ ] **Step 4: Run tests**

Run: `npm test`

- [ ] **Step 5: Commit**

```bash
git add data/datasets/creatures.json archive/scripts/fill-archetypes.mjs
git commit -m "data: fill 268 empty creature archetypes from type inference"
```

---

### Task 2.3: Enrich 6 weakest habitat fields

**Files:**
- Modify: `data/datasets/creatures.json` (6 entries with habitat < 10 chars)

Manually fix these 6 entries:
| Creature | Current Habitat | Replacement |
|---|---|---|
| Kalai | `"Fiji"` | `"Oceania, Fiji — forests and coastal waters"` |
| Cagueiro | `"Cuba"` | `"Cuba — rural areas and sugarcane fields"` |
| Thoth | `"Egypt"` | `"Egypt — underworld andscribal chambers"` |
| Tamapua | `"Vanuatu"` | `"Vanuatu — forests and riverbanks"` |
| Lagahoo | `"Grenada"` | `"Grenada — forests and moonlit roads"` |
| Didibri | `"Suriname"` | `"Suriname — deep rivers and jungle"` |

- [ ] **Step 1: Fix each habitat field**

Use the Edit tool to change each creature's `habitat` field in `data/datasets/creatures.json`. Search for each creature by name.

- [ ] **Step 2: Rebuild shards**

Run: `node archive/scripts/shard-data.mjs`

- [ ] **Step 3: Run tests**

Run: `npm test`

- [ ] **Step 4: Commit**

```bash
git add data/datasets/creatures.json
git commit -m "data: enrich 6 weakest habitat descriptions (< 10 chars)"
```

---

## Workstream 3: Infrastructure

### Task 3.1: Self-host Phosphor Icons

**Files:**
- Create: `vendor/phosphor-icons/` (downloaded package)
- Modify: All 9 HTML files (change `<script src="https://unpkg.com/@phosphor-icons/web">` to local path)
- Modify: `sw.js` (add to CORE_ASSETS)
- Modify: `netlify.toml` (remove `unpkg.com` from CSP if no other scripts use it)

- [ ] **Step 1: Install Phosphor Icons locally**

Run: `mkdir -p vendor && cd vendor && npm pack @phosphor-icons/web && tar xzf phosphor-icons-web-*.tgz && mv package phosphor-icons && rm *.tgz`

- [ ] **Step 2: Find the correct entry point**

Run: `ls vendor/phosphor-icons/dist/` — look for the IIFE/UMD bundle. It's typically `dist/phosphor-icons.js` or similar.

- [ ] **Step 3: Update all 9 HTML files**

Replace in each HTML file:
```html
<script src="https://unpkg.com/@phosphor-icons/web"></script>
```
With:
```html
<script src="vendor/phosphor-icons/dist/phosphor-icons.js"></script>
```

Files: `index.html`, `bestiary.html`, `stories.html`, `world.html`, `about.html`, `quiz.html`, `404.html`, `mylore.html`, `methodology.html`

- [ ] **Step 4: Add to service worker CORE_ASSETS**

In `sw.js`, add to the `CORE_ASSETS` array:
```
'/vendor/phosphor-icons/dist/phosphor-icons.js',
```

- [ ] **Step 5: Update CSP in netlify.toml**

In `netlify.toml` line 10, remove `https://unpkg.com` from `script-src` and `connect-src`:
```
Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:;"
```

- [ ] **Step 6: Bump service worker version**

In `sw.js` line 1, change `whisperinglore-v1_0_2` to `whisperinglore-v1_0_3`.

- [ ] **Step 7: Run E2E tests**

Run: `npx serve -l 3000 -s . &` then `npx playwright test --project=chromium` then `kill %1`

- [ ] **Step 8: Commit**

```bash
git add vendor/ sw.js netlify.toml index.html bestiary.html stories.html world.html about.html quiz.html 404.html mylore.html methodology.html
git commit -m "infra: self-host Phosphor Icons, remove unpkg.com dependency, bump SW cache"
```

---

### Task 3.2: Bump Service Worker version and verify cache invalidation

**Files:**
- Modify: `sw.js:1`

- [ ] **Step 1: Bump SW version**

Change line 1 of `sw.js` from:
```js
var CACHE_NAME = "whisperinglore-v1_0_2"
```
To:
```js
var CACHE_NAME = "whisperinglore-v1_0_3"
```

(Note: If Task 3.1 already bumped this, skip this step.)

- [ ] **Step 2: Verify old cache cleanup works**

The SW already has cleanup logic (lines 47-51) that deletes caches not matching `CACHE_NAME`. No changes needed.

- [ ] **Step 3: Commit**

```bash
git add sw.js
git commit -m "chore: bump service worker cache version to v1_0_3"
```

---

## Workstream 4: UX Improvements

### Task 4.1: Add URL state for filters (bookmarkable/filterable URLs)

**Files:**
- Modify: `js/viewer-base.js`

**Strategy:** Read filter state from URL params on load, and update URL params when filters change. This makes filter states bookmarkable and shareable.

- [ ] **Step 1: Add readStateFromURL method to BaseViewer**

In `js/viewer-base.js`, add a new method to the `BaseViewer` class:
```js
readStateFromURL() {
  var params = new URLSearchParams(window.location.search)
  var filterDims = ['search', 'region', 'country', 'type', 'tribe']
  filterDims.forEach(function(dim) {
    var val = params.get(dim)
    if (val) this.state.filters[dim] = val
  }.bind(this))
  var sort = params.get('sort')
  if (sort) this.state.sortBy = sort
  var page = params.get('page')
  if (page) this.state.page = parseInt(page, 10) || 1
}
```

- [ ] **Step 2: Add writeStateToURL method**

```js
writeStateToURL() {
  var params = new URLSearchParams()
  var filterDims = ['search', 'region', 'country', 'type', 'tribe']
  filterDims.forEach(function(dim) {
    var val = this.state.filters[dim]
    if (val && val !== 'all') params.set(dim, val)
  }.bind(this))
  if (this.state.sortBy !== 'relevance') params.set('sort', this.state.sortBy)
  if (this.state.page > 1) params.set('page', this.state.page)
  var qs = params.toString()
  var url = qs ? '?' + qs : window.location.pathname
  window.history.replaceState(null, '', url)
}
```

- [ ] **Step 3: Call readStateFromURL in init**

In the `init()` method of BaseViewer (around line 30), add `this.readStateFromURL()` before `this.applyFilters()`.

- [ ] **Step 4: Call writeStateToURL after applyFilters**

In `applyFilters()` (around line 160), add `this.writeStateToURL()` at the end.

- [ ] **Step 5: Update filter inputs to reflect URL state**

In `init()`, after `readStateFromURL()`, sync the filter UI elements (selects, search input) to match the state:
```js
syncFilterUI() {
  var dimToInput = {
    search: this.type === 'creatures' ? 'bestiary-search' : 'story-search',
    region: this.type === 'creatures' ? 'bestiary-region' : 'story-region-filter',
    country: this.type === 'creatures' ? 'bestiary-country' : 'story-country-filter',
    type: this.type === 'creatures' ? 'bestiary-type' : 'story-type-filter',
  }
  for (var dim in dimToInput) {
    var el = document.getElementById(dimToInput[dim])
    if (el && this.state.filters[dim]) el.value = this.state.filters[dim]
  }
  var sortEl = document.getElementById(this.type === 'creatures' ? 'bestiary-sort' : 'stories-sort')
  if (sortEl) sortEl.value = this.state.sortBy
}
```

Call this in `init()` after `readStateFromURL()`.

- [ ] **Step 6: Run tests**

Run: `npm test`

- [ ] **Step 7: Manual verification**

Start server, navigate to `bestiary.html?region=Nordic&type=dragon`, verify filters are applied and URL persists after filter changes.

- [ ] **Step 8: Commit**

```bash
git add js/viewer-base.js
git commit -m "feat: add URL state for filters — bookmarkable/shareable filter URLs"
```

---

### Task 4.2: Fix cross-reference data loading for creature-story links

**Files:**
- Modify: `bestiary.html` (add story data loading)
- Modify: `stories.html` (add creature data loading)

**Problem:** Creature detail hides "Appears In Stories" because `window.__STORIES_DATA` is empty. Story detail hides "Creatures Within This Tale" because `window.__FULL_CREATURES` is empty.

- [ ] **Step 1: Add story data preloading to bestiary.html**

In `bestiary.html`, after the shared-utils script and before the creatures-viewer module script, add:
```html
<script>
  // Preload stories for cross-referencing in creature detail
  (function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data/sharded/manifest.json', true);
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var manifest = JSON.parse(xhr.responseText);
          var storyManifest = manifest.stories;
          if (storyManifest && storyManifest.shards) {
            var loaded = 0;
            var total = storyManifest.shards.length;
            window.__STORIES_DATA = [];
            storyManifest.shards.forEach(function(shard) {
              var sxhr = new XMLHttpRequest();
              sxhr.open('GET', shard.path, true);
              sxhr.onload = function() {
                if (sxhr.status >= 200) {
                  try {
                    var data = JSON.parse(sxhr.responseText);
                    window.__STORIES_DATA = window.__STORIES_DATA.concat(Array.isArray(data) ? data : data.items || []);
                  } catch(e) {}
                }
                loaded++;
                if (loaded >= total) {
                  // Stories loaded for cross-referencing
                }
              };
              sxhr.send();
            });
          }
        } catch(e) {}
      }
    };
    xhr.send();
  })();
</script>
```

Note: This uses XHR to stay consistent with the existing codebase pattern. If Task 1.6 (XHR→fetch) is done first, use `fetch()` instead.

- [ ] **Step 2: Add creature data preloading to stories.html**

Same pattern — preload all creatures from sharded data into `window.__FULL_CREATURES` for cross-referencing.

- [ ] **Step 3: Run tests**

Run: `npm test`

- [ ] **Step 4: Manual verification**

Open bestiary, click a creature, verify "Appears In Stories" section shows. Open stories, click a story, verify "Creatures Within This Tale" section shows.

- [ ] **Step 5: Commit**

```bash
git add bestiary.html stories.html
git commit -m "feat: preload cross-reference data for creature-story linking"
```

---

### Task 4.3: Add keyboard navigation to detail overlays (prev/next)

**Files:**
- Modify: `js/creatures-viewer.js` (add prev/next to creature detail)
- Modify: `js/stories-viewer.js` (add prev/next to story detail)
- Modify: `css/styles.css` (add prev/next button styles)

- [ ] **Step 1: Add prev/next buttons to creature detail HTML**

In `bestiary.html`, inside the detail overlay section (near the close/back button), add:
```html
<div class="detail-nav-row">
  <button class="detail-nav-btn" id="detail-prev" aria-label="Previous creature">
    <span class="detail-nav-arrow">&larr;</span> Previous
  </button>
  <button class="detail-nav-btn" id="detail-next" aria-label="Next creature">
    Next <span class="detail-nav-arrow">&rarr;</span>
  </button>
</div>
```

- [ ] **Step 2: Add prev/next logic to creatures-viewer.js**

In the `showDetail` method, after rendering, add logic to find the prev/next creature in the current filtered list:
```js
renderDetailNav(slug) {
  var data = this.state.filteredData || this.cache || []
  var idx = data.findIndex(c => c.slug === slug)
  var prevBtn = document.getElementById('detail-prev')
  var nextBtn = document.getElementById('detail-next')
  if (prevBtn) {
    if (idx > 0) {
      prevBtn.classList.remove('is-hidden')
      prevBtn.onclick = () => this.showDetail(data[idx - 1].slug)
    } else {
      prevBtn.classList.add('is-hidden')
    }
  }
  if (nextBtn) {
    if (idx < data.length - 1) {
      nextBtn.classList.remove('is-hidden')
      nextBtn.onclick = () => this.showDetail(data[idx + 1].slug)
    } else {
      nextBtn.classList.add('is-hidden')
    }
  }
}
```

Call `this.renderDetailNav(slug)` at the end of `showDetail`.

- [ ] **Step 3: Add same logic to stories-viewer.js**

Same pattern for story detail.

- [ ] **Step 4: Add keyboard handlers**

In both viewers, add to `showDetail`:
```js
this._keyHandler = (e) => {
  if (e.key === 'ArrowLeft') prevBtn && prevBtn.click()
  if (e.key === 'ArrowRight') nextBtn && nextBtn.click()
}
document.addEventListener('keydown', this._keyHandler)
```

In `closeDetail`, remove the handler:
```js
if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler)
```

- [ ] **Step 5: Add CSS for prev/next buttons**

In `css/styles.css`, add:
```css
.detail-nav-row {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-top: 1px solid var(--border);
  margin-top: 1.5rem;
}
.detail-nav-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-radius: 6px;
  font-family: var(--font-body);
  transition: border-color var(--transition), color var(--transition);
}
.detail-nav-btn:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}
```

- [ ] **Step 6: Run tests**

Run: `npm test`

- [ ] **Step 7: Manual verification**

Open bestiary, click first creature, verify "Next" button works and "Previous" is hidden. Click Next, verify both buttons appear. Use arrow keys.

- [ ] **Step 8: Commit**

```bash
git add js/creatures-viewer.js js/stories-viewer.js css/styles.css bestiary.html stories.html
git commit -m "feat: add prev/next navigation and keyboard arrows to detail overlays"
```

---

## Execution Order

Recommended sequence (each task is independently testable):

1. **Task 1.1** — .gitignore cleanup (quick win, zero risk)
2. **Task 1.2** — 'use strict' fixes (quick, zero risk)
3. **Task 1.3** — Double semicolon + duplicate function (quick, zero risk)
4. **Task 2.3** — Habitat enrichment (6 manual edits, low risk)
5. **Task 2.2** — Archetype fill (script-based, low risk)
6. **Task 2.1** — Story type consolidation (data migration, medium risk)
7. **Task 1.4** — var→const/let (large but mechanical, medium risk)
8. **Task 1.5** — Semicolon normalization (large but mechanical, low risk)
9. **Task 1.6** — XHR→fetch (behavioral change, medium risk)
10. **Task 3.1** — Self-host Phosphor (infra change, medium risk)
11. **Task 3.2** — SW version bump (simple)
12. **Task 4.1** — URL filter state (new feature, medium risk)
13. **Task 4.2** — Cross-ref data loading (new feature, medium risk)
14. **Task 4.3** — Prev/next navigation (new feature, medium risk)

## Testing Checklist

After ALL tasks are complete:
- [ ] `npm test` — all 141 Jest tests pass
- [ ] `npm run lint` — no new errors
- [ ] `npx playwright test --project=chromium` — E2E tests pass
- [ ] Manual: bestiary loads, filters work, detail overlay shows stories
- [ ] Manual: stories load, filters work, detail overlay shows creatures
- [ ] Manual: quiz works with all 6 levels
- [ ] Manual: world globe loads
- [ ] Manual: offline mode works (service worker caches everything)
- [ ] Manual: URL state works — `bestiary.html?region=Nordic` loads filtered
- [ ] Manual: prev/next navigation works in detail overlays
