# i18n Phase 2 Wave B Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overlay coverage map (no more ~180 404s per native load), a `complete:true` flag that drops the pending badge for fully translated entries, and 50 fully Swedish Nordic creatures (name + summary + description).

**Architecture:** Manifest gains an auto-derived `i18n` block (`shard-data.mjs` scans `data/i18n/<lang>/`); `_loadOverlayFor` short-circuits uncovered keys. Decoration paths compute `_i18n.partial` from the patch's `complete` flag. Batch merges into the existing `data/i18n/sv/creatures-nordic.json`.

**Tech Stack:** Vanilla JS IIFE modules, jest+jsdom, Playwright chromium-only e2e, node one-off validators.

**Spec:** `docs/superpowers/specs/2026-08-23-i18n-phase2-wave-b-design.md`

**Verified facts:**
- `archive/scripts/shard-data.mjs` writes the manifest at lines ~49-54 via `writeFileSync(join(DST, 'manifest.json'), JSON.stringify({ creatures: buildManifest(...), stories: ..., items: ... }, null, 2))`. Running it regenerates all shards canonically (memory: regenerate-shards.py is NOT canonical).
- `js/shared-utils.js` `_loadOverlayFor` sits inside the Shimmer object (~line 295) and caches promises in `this._overlayPromises[key]`.
- Three decoration sites set `c._i18n = { lang: lang, partial: true }`: `_deliverShard` (~line 330), `_deliverSlugBatch`, `_deliverItem`.
- Badge helper `i18nBadgeEl` renders only when `entry._i18n.partial === true` — no badge change needed.
- Fixture manifest `tests/fixtures/manifest.json`; fixture overlay `tests/fixtures/sv-creatures-nordic.json` patches slug `troll` (summary only).
- jest/e2e MUST run via createBackgroundProcess (long npx wedges snip-bash pipe). snip wrapper chokes on `${...}` literals — build such strings via `chr(36)+'{'`.
- No semicolons in `js/`. Commit types: feat|fix|docs|style|refactor|perf|test|chore.
- sw.js cache constant: grep `CACHE_VERSION` (currently v1_0_22).

---

### Task 1: Manifest i18n coverage block

**Files:**
- Modify: `archive/scripts/shard-data.mjs` (manifest write block)
- Modify: `tests/fixtures/manifest.json`
- Modify: `js/shared-utils.js` (`_loadOverlayFor`)
- Test: `tests/shimmer.test.js` (add describe)

- [ ] **Step 1: Failing test** — append to `tests/shimmer.test.js`:

```js
describe('Shimmer overlay coverage map', function () {
  afterEach(function () {
    window.history.replaceState({}, '', '/index.html');
    delete window.fetch.calls;
  });

  it('skips network for keys absent from manifest.i18n', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    Shimmer.manifest = fixtureMap['data/sharded/manifest.json'];
    Shimmer._overlayPromises = {};
    var calls = 0;
    var origFetch = global.fetch;
    global.fetch = function (url) {
      calls++;
      return origFetch(url);
    };
    return new Promise(function (resolve) {
      Shimmer._loadOverlayFor('creatures', 'Celtic', 'sv').then(function (ov) {
        resolve({ ov: ov, calls: calls });
      });
    }).then(function (r) {
      global.fetch = origFetch;
      expect(r.ov).toBeNull();
      expect(r.calls).toBe(0);
      delete Shimmer._overlayPromises['sv:creatures:Celtic'];
    });
  });

  it('fetches keys present in manifest.i18n', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    Shimmer.manifest = fixtureMap['data/sharded/manifest.json'];
    Shimmer._overlayPromises = {};
    return new Promise(function (resolve) {
      Shimmer._loadOverlayFor('creatures', 'Nordic', 'sv').then(function (ov) {
        resolve(ov);
      });
    }).then(function (ov) {
      expect(ov).not.toBeNull();
      delete Shimmer._overlayPromises['sv:creatures:Nordic'];
    });
  });
});
```

Note: `Shimmer._loadOverlayFor('creatures','Nordic','sv')` resolves the fixture overlay because the fixture map already serves `data/i18n/sv/creatures-nordic.json`.

- [ ] **Step 2: Verify fail**

Run (background process): `npx jest tests/shimmer.test.js -t "coverage map" 2>&1 | tail -20`
Expected: first test FAILS (`calls` ≥ 1 — today `_loadOverlayFor` always fetches; Celtic 404s → ov null but network used).

- [ ] **Step 3: Emit block in shard-data.mjs** — replace the manifest `writeFileSync` block:

```js
// ── Manifest ──
console.log('Building manifest...');
safeDir(DST);

// Auto-derived overlay coverage map: scan data/i18n/<lang>/ for
// <type>-<regionKey>.json files so runtime can skip missing overlays
// without firing 404s. Rebuild shards after adding overlay files.
const I18N_DIR = join(ROOT, 'data', 'i18n');
const i18nCoverage = {};
if (existsSync(I18N_DIR)) {
  readdirSync(I18N_DIR).forEach((lang) => {
    const dir = join(I18N_DIR, lang);
    if (!statSync(dir).isDirectory()) return;
    i18nCoverage[lang] = {};
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .forEach((f) => {
        i18nCoverage[lang][f.replace(/\.json$/, '')] = true;
      });
  });
}

writeFileSync(join(DST, 'manifest.json'), JSON.stringify({
  i18n: i18nCoverage,
  creatures: buildManifest(creatures, 'creatures'),
  stories: buildManifest(stories, 'stories'),
  items: buildManifest(items, 'items')
}, null, 2));
console.log('  done.');
```

Add `readdirSync, statSync` to the existing `require('fs')` destructure at the top of the file (keep `existsSync, writeFileSync` etc. that are already there). Confirm `ROOT` exists in the script (grep `ROOT` / `join(DST`); if the script uses a different base-path variable name for the repo root, use that instead — DST points into `data/sharded`, so derive as `join(DST, '..', '..', 'data', 'i18n')` if needed.

- [ ] **Step 4: Runtime short-circuit in shared-utils.js** — replace `_loadOverlayFor`:

```js
    _overlayPromises: {},

    _loadOverlayFor: function (type, region, lang) {
      var key = lang + ':' + type + ':' + region
      if (!this._overlayPromises[key]) {
        var fileKey = region
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        // Coverage map: manifest-declared overlays only; everything else
        // short-circuits to null without touching the network.
        var cov =
          this.manifest &&
          this.manifest.i18n &&
          this.manifest.i18n[lang]
        if (cov && !(fileKey in cov)) {
          this._overlayPromises[key] = Promise.resolve(null)
          return this._overlayPromises[key]
        }
        this._overlayPromises[key] = fetchJSON(
          'data/i18n/' + lang + '/' + type + '-' + fileKey + '.json'
        ).catch(function () {
          return null // missing overlay = untranslated region, not an error
        })
      }
      return this._overlayPromises[key]
    },
```

- [ ] **Step 5: Fixture manifest** — add the i18n block to `tests/fixtures/manifest.json` as first key:

```json
"i18n": {
  "sv": {
    "creatures-nordic": true
  }
},
```

- [ ] **Step 6: Verify pass + full unit suite**

Run (background): `npx jest 2>&1 | grep -E 'Tests:'`
Expected: all green (existing sv tests unaffected — Nordic key present; non-sv suites never reach the map).

- [ ] **Step 7: Regenerate real shards + verify manifest**

Run: `node archive/scripts/shard-data.mjs`
Verify: `python3 -c "import json; m=json.load(open('data/sharded/manifest.json')); print(m['i18n'])"` → `{'sv': {'creatures-nordic': True}}`

Commit:

```bash
git add archive/scripts/shard-data.mjs js/shared-utils.js tests/shimmer.test.js tests/fixtures/manifest.json data/sharded/
git commit -m "feat(i18n): manifest overlay coverage map skips missing sv files"
```

---

### Task 2: complete:true decoration

**Files:**
- Modify: `js/shared-utils.js` (three `_i18n` assignment sites)
- Modify: `tests/fixtures/sv-creatures-nordic.json`
- Test: `tests/shimmer.test.js`

- [ ] **Step 1: Fixture** — replace `tests/fixtures/sv-creatures-nordic.json` content:

```json
{
  "_meta": { "lang": "sv", "source": "fixture" },
  "entries": {
    "troll": {
      "name": "Troll",
      "summary": "Skandinaviskt bergstroll som inte tål dagsljus.",
      "description": "Ett skandinaviskt bergstroll som lever i berg och stenblock och som enligt folktron inte tål dagsljus.",
      "complete": true
    }
  }
}
```

- [ ] **Step 2: Failing tests** — append to the `Shimmer sv overlay merge` describe in `tests/shimmer.test.js`:

```js
  it('marks patched entries complete when overlay says so', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    Shimmer.shards.creatures = {};
    return new Promise(function (resolve) {
      Shimmer.loadRegionShard('creatures', 'Nordic', function (err, data) {
        resolve(data);
      });
    }).then(function (data) {
      var troll = data.find(function (c) { return c.slug === 'troll' });
      expect(troll.description).toContain('bergstroll');
      expect(troll._i18n).toEqual({ lang: 'sv', partial: false });
      var other = data.find(function (c) { return c.slug !== 'troll' });
      expect(other._i18n.partial).toBe(true);
    });
  });
```

Also update the existing slug-batch test's assertion (it pins `troll._i18n`):

```js
      expect(troll._i18n).toEqual({ lang: 'sv', partial: false });
```

(replacing `toEqual({ lang: 'sv', partial: true })`). Leave every OTHER existing `_i18n` assertion untouched — unpatched entries stay `partial: true`.

- [ ] **Step 3: Verify fail**

Run (background): `npx jest tests/shimmer.test.js -t "complete" 2>&1 | tail -20`
Expected: new test FAILS (`_i18n` equals `{lang:'sv',partial:true}` — today partial is hardcoded).

- [ ] **Step 4: Implement** — in each of the three decoration sites, move the patch lookup above the tag assignment and compute partial:

`_deliverShard` (replace inner `.then` body):

```js
      this._loadOverlayFor(type, region, lang).then(function (ov) {
        if (!ov || !ov.entries) {
          callback(err, data)
          return
        }
        var out = data.map(function (it) {
          var c = Object.assign({}, it)
          var patch = ov.entries[c.slug]
          c._i18n = { lang: lang, partial: !(patch && patch.complete) }
          if (patch) {
            Object.keys(patch).forEach(function (k) {
              if (k !== 'complete') c[k] = patch[k]
            })
          }
          return c
        })
        callback(err, out)
      }).catch(function () {
        callback(err, data)
      })
```

`_deliverSlugBatch` (replace the `out = data.map(...)` body):

```js
        var out = data.map(function (it) {
          var ov = byRegion[it.region]
          if (!ov) return it
          var c = Object.assign({}, it)
          var patch = ov.entries[c.slug]
          c._i18n = { lang: lang, partial: !(patch && patch.complete) }
          if (patch) {
            Object.keys(patch).forEach(function (k) {
              if (k !== 'complete') c[k] = patch[k]
            })
          }
          return c
        })
```

`_deliverItem` (replace body after the entries guard):

```js
      this._loadOverlayFor(type, item.region, lang).then(function (ov) {
        if (!ov || !ov.entries) { callback(err, item); return }
        var c = Object.assign({}, item)
        var patch = ov.entries[c.slug]
        c._i18n = { lang: lang, partial: !(patch && patch.complete) }
        if (patch) {
          Object.keys(patch).forEach(function (k) {
            if (k !== 'complete') c[k] = patch[k]
          })
        }
        callback(err, c)
      }).catch(function () {
        callback(err, item)
      })
```

(The `k !== 'complete'` guard stops the internal flag leaking onto rendered objects.)

- [ ] **Step 5: Verify pass + full suite**

Run (background): `npx jest 2>&1 | grep -E 'Tests:'`
Expected: green. If the region-merge test asserting `tomte._i18n toEqual {lang:'sv',partial:true}` still passes — correct, tomte has no fixture patch.

Commit:

```bash
git add js/shared-utils.js tests/fixtures/sv-creatures-nordic.json tests/shimmer.test.js
git commit -m "feat(i18n): complete flag drops pending badge for full entries"
```

---

### Task 3: Content batch — 50 full Swedish entries (positions 51–100)

**Files:**
- Modify: `data/i18n/sv/creatures-nordic.json`

- [ ] **Step 1: Extract source entries**

Run:

```bash
python3 - <<'EOF'
import json
d = json.load(open('data/sharded/creatures/by-region/nordic.json'))
for c in d[50:100]:
    print(json.dumps({'slug': c['slug'], 'name': c['name'],
                      'summary': c.get('summary',''),
                      'description': c.get('description','')}, ensure_ascii=False))
EOF
```

Save output mentally / to `/tmp/waveb-source.txt` for translation reference. These are positions 51–100 (starts `landvttir-iceland`).

- [ ] **Step 2: Translate + merge**

Extend `data/i18n/sv/creatures-nordic.json`: keep the existing 50 pilot entries byte-for-byte; add 50 NEW entries keyed by the extracted slugs, each `{ "name", "summary", "description", "complete": true }`. Controller translates personally (LLM-batch, same rules as Wave A):
- Established Swedish forms kept where they exist; natural prose, no literal calques.
- `description` = faithful Swedish rendering of the EN description (target ≥200 chars; match source length roughly).
- Proper nouns/transliterations preserved inside Swedish text.
Update `_meta`: `"count": 100`, add `"fullEntries": 50`.

- [ ] **Step 3: Validation gate**

Run:

```bash
node -e "
const o=require('./data/i18n/sv/creatures-nordic.json');
const d=require('./data/sharded/creatures/by-region/nordic.json');
const slugs=new Set(d.map(c=>c.slug));
const ks=Object.keys(o.entries);
if(ks.length!==100) throw new Error('expected 100 entries, got '+ks.length);
let full=0;
ks.forEach(k=>{
  if(!slugs.has(k)) throw new Error('unknown slug '+k);
  const e=o.entries[k];
  if(!e.name||!e.summary) throw new Error('incomplete '+k);
  if(e.complete===true){
    full++;
    if(!e.description||e.description.length<200) throw new Error('complete entry lacks description>=200: '+k);
  }
});
if(full!==50) throw new Error('expected 50 complete entries, got '+full);
console.log('wave-b overlay valid:', ks.length, 'entries,', full, 'complete');"
```

Expected: `wave-b overlay valid: 100 entries, 50 complete`.

- [ ] **Step 4: Browser verification**

Serve repo on :3000 (single server! kill strays first: `lsof -tiTCP:3000 -sTCP:LISTEN | xargs kill` then restart). Check via throwaway playwright script:
1. `/bestiary.html?creature=landvttir-iceland&lang=sv` → detail-name Swedish, NO `.i18n-pending` badge, description Swedish.
2. `/bestiary.html?creature=huldra&lang=sv` → badge PRESENT (still partial).
3. `/bestiary.html?lang=sv` grid → zero console 404s for `data/i18n/*` (coverage map active).

- [ ] **Step 5: Commit**

```bash
git add data/i18n/sv/creatures-nordic.json
git commit -m "feat(i18n): 50 full swedish nordic creature entries"
```

---

### Task 4: Gates, sw bump, docs, ship

**Files:**
- Modify: `sw.js` (CACHE_VERSION), `todos.md`
- Deploy zip rebuild

- [ ] **Step 1: sw bump** — grep `CACHE_VERSION` in `sw.js`, bump `v1_0_22` → `v1_0_23`.

- [ ] **Step 2: Full gates (each via background process)**

```bash
npx eslint . --quiet   # 0 errors
npx jest               # all green
npx playwright test --project=chromium --reporter=dot   # all green incl language-toggle + axe native scan
```

If the sv e2e or axe native tests fail, fix root cause — do not weaken assertions.

- [ ] **Step 3: Docs** — todos.md: mark Wave B shipped line with SHAs under the Wave A entry's section; remove the Wave B backlog bullet (or rewrite it to remaining items only: stories/items overlays, further languages).

- [ ] **Step 4: Ship**

```bash
git ls-files | grep -v -E '^(\.github/|\.opencode/|tests/|docs/|archive/|skills/|marketing/|\.claude/)' \
  | grep -v -E '(^|/)(\.eslintrc|jest\.config|playwright\.config|babel\.config|package(-lock)?\.json)$' > /tmp/deploy-files.txt
rm -f /tmp/whispering-lore-deploy.zip
cat /tmp/deploy-files.txt | zip -@ -q /tmp/whispering-lore-deploy.zip
# smoke :8123 from fresh unzip (covered entry: no badge; huldra: badge; html lang sv)
git push origin main
```

Commit docs/mechanics:

```bash
git add todos.md sw.js
git commit -m "chore(i18n): wave b shipped, sw v1_0_23"
git push origin main
```

---

## Self-Review (controller)

- Spec §1 map → T1 (emit + short-circuit + fallback when manifest/block absent kept). §2 flag → T2 (all three delivery sites + fixture leak-guard `k !== 'complete'`). §3 batch → T3 (procedural extraction identical to Wave A pattern; validation extended with description floor). Testing matrix → T1/T2 jest + T3 browser checks + T4 gates. Docs/release → T4. ✓
- Placeholders: none — content translation is execution-time work by controller per approved spec (defined procedure + validation gate), same precedent as Wave A. ✓
- Name consistency: `fileKey`, `i18nCoverage`, `partial: !(patch && patch.complete)` uniform across sites. ✓
