# i18n Phase 2 Wave A (Swedish Native Mode) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Swedish becomes a native site language driven by slug-keyed overlays merged inside Shimmer, switched via `?lang=sv`, with chrome dictionary, pending-translation badges, hreflang/localized SEO, and a ~50-entry Nordic pilot batch.

**Architecture:** EN shards stay canonical; `data/i18n/sv/*.json` files hold sparse field patches that Shimmer merges post-load when `getNativeLang()==='sv'` (single choke point → all consumers get Swedish automatically). Language state lives in the URL only. `js/i18n.js` swaps chrome strings via `data-i18n` attributes. Toggle's Svenska item switches modes (clearing GT cookie); GT flow unchanged for the other 44 languages.

**Tech Stack:** Vanilla JS IIFE modules, jest+jsdom, Playwright chromium-only e2e, axe gate extension.

**Spec:** `docs/superpowers/specs/2026-08-22-i18n-phase2-design.md`

**Verified facts:**
- `js/shared-utils.js` exposes `window.__sharedUtils = { fetchJSON, escapeXml, Shimmer }`; Shimmer has `loadManifest/loadRegionShard/loadAllShards/getAllItems/getBySlug-style loaders/_pendingShardRequests` coalescing. Region key slugging: `region.toLowerCase().replace(/[^a-z0-9]+/g,'-')`.
- Nordic creature shard: `data/sharded/creatures/by-region/nordic.json` = 314 entries with `slug,name,summary,description`.
- Detail overlay header: `<h1 id="detail-name"></h1>` in bestiary/stories/items.
- Card builders: `js/creatures-viewer.js` (`card.className='card bestiary-card staggered-card'`), stories/items analogous; links built as `a.href='?creature='+slug` style.
- Tests: jsdom pattern per `tests/shimmer.test.js` (fixtureMap + global fetch mock, `disableIDB()` helper). Commit hook types: feat|fix|docs|style|refactor|perf|test|chore. No semicolons in `js/`.
- E2E must run via createBackgroundProcess (long npx wedges snip-bash pipe).
- Phase 1 module `js/language-toggle.js`: `applyLanguage/resetToOriginal` cookie+reload via injectable `_setReloaderForTests`; menu items carry `data-code`; `readGoogtrans/setGoogtrans/clearGoogtrans` exported.

---

### Task 1: Language-state helpers in shared-utils

**Files:**
- Modify: `js/shared-utils.js`
- Test: `tests/native-lang.test.js` (new)

- [ ] **Step 1: Failing tests**

Create `tests/native-lang.test.js`:

```js
/** @jest-environment jsdom */
/* eslint-env node */

describe('native lang helpers', function () {
  var U;
  beforeAll(function () {
    require('../js/shared-utils.js');
    U = window.__sharedUtils;
  });

  test('getNativeLang parses ?lang= only for sv', function () {
    window.history.replaceState({}, '', '/bestiary.html?lang=sv');
    expect(U.getNativeLang()).toBe('sv');
    window.history.replaceState({}, '', '/bestiary.html?lang=de');
    expect(U.getNativeLang()).toBeNull(); // only sv ships natively
    window.history.replaceState({}, '', '/bestiary.html?creature=tomte');
    expect(U.getNativeLang()).toBeNull();
  });

  test('withLang appends/preserves/replaces lang param', function () {
    expect(U.withLang('/stories.html', 'sv')).toBe('/stories.html?lang=sv');
    expect(U.withLang('/stories.html?story=x', 'sv')).toBe('/stories.html?story=x&lang=sv');
    expect(U.withLang('/stories.html?lang=sv&page=2', null)).toBe('/stories.html?page=2');
    expect(U.withLang('/stories.html?lang=de', 'sv')).toBe('/stories.html?lang=sv');
  });

  test('isNative reflects URL and stripLangUrl builds clean path', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    expect(U.isNative()).toBe(true);
    expect(U.stripLangUrl('http://localhost/bestiary.html?lang=sv&x=1')).toBe('http://localhost/bestiary.html?x=1');
  });
});
```

- [ ] **Step 2: Verify fail**

Run: `npx jest tests/native-lang.test.js` → FAIL (`U.getNativeLang is not a function`).

- [ ] **Step 3: Implement**

In `js/shared-utils.js`, above the `window.__sharedUtils = {` export block add:

```js
  var NATIVE_LANGS = ['sv']

  function getNativeLang() {
    try {
      var m = window.location.search.match(/[?&]lang=([A-Za-z-]+)/)
      if (!m) return null
      return NATIVE_LANGS.indexOf(m[1]) !== -1 ? m[1] : null
    } catch (e) { return null }
  }

  function isNative() {
    return getNativeLang() !== null
  }

  function withLang(url, lang) {
    lang = lang || getNativeLang()
    var base = url.split('#')[0]
    var hash = url.indexOf('#') !== -1 ? url.slice(url.indexOf('#')) : ''
    var joiner = base.indexOf('?') === -1 ? '?' : '&'
    base = base.replace(/([?&])lang=[^&]*/, function (m0, sep) {
      joiner = sep
      return ''
    }).replace(/[?&]$/, '')
    if (!lang) return base + hash
    return base + (base.indexOf('?') === -1 ? '?' : joiner === '&' ? '&' : '?') + 'lang=' + lang + hash
  }

  function stripLangUrl(url) {
    return withLang(url, null)
  }
```

Extend export:

```js
  window.__sharedUtils = {
    fetchJSON: fetchJSON,
    escapeXml: escapeXml,
    getNativeLang: getNativeLang,
    isNative: isNative,
    withLang: withLang,
    stripLangUrl: stripLangUrl,
    Shimmer: Shimmer
  }
```

(Keep existing export members — merge, don't replace unrelated keys.)

- [ ] **Step 4: Verify pass**

Run: `npx jest tests/native-lang.test.js` → 3 passed. Then full unit suite green.

- [ ] **Step 5: Commit**

```bash
git add js/shared-utils.js tests/native-lang.test.js
git commit -m "feat(i18n): native language state helpers"
```

---

### Task 2: Shimmer overlay merge layer

**Files:**
- Create: `tests/fixtures/sv-creatures-nordic.json` (test fixture)
- Modify: `js/shared-utils.js` (Shimmer section)
- Test: `tests/shimmer.test.js` (add describe)

- [ ] **Step 1: Fixture**

Create `tests/fixtures/sv-creatures-nordic.json`:

```json
{
  "_meta": { "lang": "sv", "source": "fixture" },
  "entries": {
    "tomte": { "name": "Tomte", "summary": "Liten svensk gårdsvätte som belönar skötsel och straffar försumlighet." },
    "troll-norway": { "name": "Troll", "summary": "Norskt bergstroll som tål inte dagsljus." }
  }
}
```

- [ ] **Step 2: Failing tests** — append to `tests/shimmer.test.js`:

```js
describe('Shimmer sv overlay merge', function () {
  var LTU = window.__sharedUtils;

  afterEach(function () {
    window.history.replaceState({}, '', '/index.html');
  });

  it('merges overlay fields onto entries when native', function (done) {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    disableIDB();
    Shimmer.loadRegionShard('creatures', 'Nordic', function (err, data) {
      expect(err).toBeNull();
      var tomte = data.find(function (c) { return c.slug === 'tomte' });
      expect(tomte.name).toBe('Tomte'); // same as EN but now from overlay
      expect(tomte.summary).toContain('gårdsvätte');
      expect(tomte._i18n).toEqual({ lang: 'sv', partial: true });
      var untranslated = data.find(function (c) { return c.slug === 'draugr' });
      expect(untranslated._i18n.partial).toBe(true);
      enableIDB();
      done();
    });
  });

  it('does not merge or tag when not native', function (done) {
    window.history.replaceState({}, '', '/index.html');
    disableIDB();
    Shimmer.loadRegionShard('creatures', 'Nordic', function (err, data) {
      expect(err).toBeNull();
      var tomte = data.find(function (c) { return c.slug === 'tomte' });
      expect(tomte._i18n).toBeUndefined();
      enableIDB();
      done();
    });
  });
});
```

Note: fixtureMap already serves `data/sharded/creatures/by-region/nordic.json`. Add overlay route to the global fetch mock at top of file:

```js
fixtureMap['data/i18n/sv/creatures-nordic.json'] = JSON.parse(
  fs.readFileSync(path.join(FIX, 'sv-creatures-nordic.json'), 'utf8')
);
```

Also ensure `Array.prototype.find` usage OK (node ≥ fine).

- [ ] **Step 3: Verify fail**

Run: `npx jest tests/shimmer.test.js` → new describe FAILs (`_i18n undefined`).

- [ ] **Step 4: Implement merge in shared-utils.js (Shimmer)**

Add helpers inside Shimmer object:

```js
    _overlayPromises: {},

    // Sparse field patches keyed by slug: data/i18n/<lang>/<type>-<region>.json
    _loadOverlayFor: function (type, region, lang) {
      var self = this
      var key = lang + ':' + type + ':' + region
      if (!this._overlayPromises[key]) {
        this._overlayPromises[key] = fetchJSON(
          'data/i18n/' + lang + '/' + type + '-' +
          region.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json'
        ).catch(function () { return null })
      }
      return this._overlayPromises[key]
    },

    _applyOverlay: function (type, region, items, overlay) {
      if (!overlay || !overlay.entries) return
      var seenSlugs = {}
      items.forEach(function (it) { seenSlugs[it.slug] = true })
      Object.keys(overlay.entries).forEach(function (slug) {
        if (!seenSlugs[slug]) return // overlay may cover entries outside this shard
      })
      items.forEach(function (it) {
        var patch = overlay.entries[it.slug]
        it._i18n = { lang: 'sv', partial: true }
        if (patch) Object.keys(patch).forEach(function (k) { it[k] = patch[k] })
      })
    },
```

Then hook into `loadRegionShard`'s success paths — wrap the two places that call back with shard data. Simplest single choke point: rename existing callbacks' final delivery by introducing:

```js
    _deliverShard: function (type, region, err, data, callback) {
      var self = this
      if (err || !getNativeLang()) { callback(err, data); return }
      this._loadOverlayFor(type, region, getNativeLang()).then(function (ov) {
        if (ov) self._applyOverlay(type, region, data, ov)
        callback(err, data)
      })
    },
```

…and in `loadRegionShard` replace each direct `callback(null, ...)` / `settle(...)` delivery of THIS region's data with `self._deliverShard(type, region, null, data, callback)` (memory-cache early-return keeps raw cache; overlay applied on every delivery so repeated calls stay consistent).

`fetchJSON` is module-scope in shared-utils (used by daily-feature) — confirm name; if scoped differently use the local reference available in file.

- [ ] **Step 5: Verify pass + suite**

Run: `npx jest tests/shimmer.test.js` → all pass; `npx jest 2>&1 | rg "Tests:"` → green overall.

- [ ] **Step 6: Commit**

```bash
git add tests/fixtures/sv-creatures-nordic.json tests/shimmer.test.js js/shared-utils.js
git commit -m "feat(i18n): shimmer sv overlay merge"
```

---

### Task 3: Pending-translation badge

**Files:**
- Modify: `css/styles.css` (append), `js/viewer-base.js`, `js/creatures-viewer.js`, `js/stories-viewer.js`, `js/items-viewer.js`, detail sections of `bestiary.html`, `stories.html`, `items.html`
- Test: `tests/i18n-badge.test.js` (new)

- [ ] **Step 1: Failing test**

Create `tests/i18n-badge.test.js`:

```js
/** @jest-environment jsdom */
/* eslint-env node */

describe('i18n pending badge', function () {
  var UB;
  beforeAll(function () {
    require('../js/viewer-base.js');
    UB = window.__viewerBase || window.__sharedUtils;
  });

  test('badgeHtml marks partial entries and nothing when not native', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    var html = UB.i18nBadgeHtml({ _i18n: { lang: 'sv', partial: true } });
    expect(html).toContain('i18n-pending');
    expect(html).toContain('översättning saknas');
    expect(UB.i18nBadgeHtml({})).toBe('');
    window.history.replaceState({}, '', '/index.html');
    expect(UB.i18nBadgeHtml({ _i18n: { lang: 'sv', partial: true } })).toBe('');
  });
});
```

If viewer-base exports differ, attach `i18nBadgeHtml` to `window.__sharedUtils` instead and import that here — implementation decides ONE home; keep test aligned.

- [ ] **Step 2: Verify fail**, then **Step 3: implement**

In `js/viewer-base.js` (or shared-utils if cleaner):

```js
  function i18nBadgeHtml(entry) {
    if (!window.__sharedUtils.isNative()) return ''
    if (!entry || !entry._i18n || !entry._i18n.partial) return ''
    return '<span class="i18n-pending">översättning saknas</span>'
  }
```

CSS append:

```css
/* ── Translation pending badge ── */
.i18n-pending {
  display: inline-block;
  font-family: var(--font-body);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  color: var(--accent-strong);
  border: 1px solid rgba(var(--accent-rgb), 0.45);
  background: rgba(var(--accent-rgb), 0.12);
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
}
[data-theme='light'] .i18n-pending {
  color: #991b1b;
}
```

Wire-up (mechanical, verify each with grep):
1. Card renderers (creatures/stories/items viewers): inside card body template concatenation, after the title element, insert `<%= i18nBadgeHtml(entry) %>` equivalent — since builders are string-concatenation/DOM mixes, add `window.__sharedUtils.i18nBadgeHtml ? … : ''` exactly where title line ends; grep anchors:
   - creatures-viewer.js: `card-body` creation (~line 42)
   - stories-viewer.js / items-viewer.js: analogous `card-body` blocks
2. Detail overlays: after `<h1 id="detail-name">` populate calls in all three viewers (`showDetail`/render functions set `#detail-name` textContent) — insert badge span adjacent: `document.getElementById('detail-name').insertAdjacentHTML('afterend', badgeHtml)` guarded by native check.

Each wiring step: `grep -n "card-body\|detail-name" js/*-viewer.js` to locate exact lines during execution.

- [ ] **Step 4: Verify pass + gates**, **Step 5: Commit**

```bash
git add -A && git commit -m "feat(i18n): translation-pending badge in cards and details"
```

---

### Task 4: Chrome dictionary + applier (js/i18n.js)

**Files:**
- Create: `js/i18n.js`, `tests/i18n-dict.test.js`
- Modify: all 11 root HTML pages (script tag + `data-i18n` attributes + localized title/desc keys)

- [ ] **Step 1: Failing parity/applier tests**

Create `tests/i18n-dict.test.js`:

```js
/** @jest-environment jsdom */
/* eslint-env node */

describe('chrome i18n dictionary', function () {
  var D;
  beforeAll(function () {
    require('../js/i18n.js');
    D = window.__i18n;
  });

  test('sv dictionary covers every en key', function () {
    Object.keys(D.en).forEach(function (k) {
      expect(typeof D.sv[k]).toBe('string');
      expect(D.sv[k].length).toBeGreaterThan(0);
    });
  });

  test('applier swaps data-i18n nodes when native', function () {
    document.body.innerHTML =
      '<nav><a href="/index.html" data-i18n="nav.home">Home</a></nav>';
    window.history.replaceState({}, '', '/index.html?lang=sv');
    D.applyChrome();
    expect(document.querySelector('[data-i18n="nav.home"]').textContent).toBe(D.sv['nav.home']);
    window.history.replaceState({}, '', '/index.html');
    document.body.innerHTML =
      '<nav><a href="/index.html" data-i18n="nav.home">Home</a></nav>';
    D.applyChrome();
    expect(document.querySelector('[data-i18n="nav.home"]').textContent).toBe('Home');
  });

  test('sets html lang + localized title/description when native', function () {
    document.head.innerHTML =
      '<title>Whispering Lore</title><meta name="description" content="x"/>';
    window.history.replaceState({}, '', '/index.html?lang=sv');
    D.applyChrome();
    expect(document.documentElement.lang).toBe('sv');
    expect(document.title).toBe(D.sv['title.index']);
    window.history.replaceState({}, '', '/index.html');
  });
});
```

- [ ] **Step 2: Verify fail**, **Step 3: implement `js/i18n.js`**

Module shape:

```js
(function () {
  'use strict'

  var DICT = {
    en: {
      'nav.home': 'Home',
      'nav.bestiary': 'Bestiary',
      'nav.stories': 'Stories',
      'nav.items': 'Artifacts',
      'nav.search': 'Search',
      'nav.world': 'World',
      'nav.quiz': 'Examination',
      'nav.mylore': 'My Lore',
      'nav.about': 'About',
      'nav.methodology': 'Methodology',
      'filter.search': 'Search…',
      'filter.sort_az': 'Sort: A–Z',
      'filter.sort_new': 'Sort: Newest',
      'filter.region': 'Region',
      'filter.country': 'Country',
      'filter.type': 'Type',
      'btn.explore_bestiary': 'Explore Bestiary',
      'btn.read_stories': 'Read Stories',
      'badge.pending': 'översättning saknas',
      'footer.support': 'Support the project',
      'daily.creature': 'Creature of the Day',
      'daily.story': 'Story of the Day',
      'latest.heading': 'Latest Additions',
      'title.index': 'Whispering Lore — Mytologi och folklore från hela världen',
      'desc.index': 'Utforska 3 668 mytologiska varelser, 2 185 berättelser och 641 artefakter från 212 länder.',
      'title.about': 'Om Whispering Lore',
      'desc.about': 'Bakom projektet, källorna och metoden bakom arkivet.'
    },
    sv: {
      'nav.home': 'Hem',
      'nav.bestiary': 'Bestiarium',
      'nav.stories': 'Berättelser',
      'nav.items': 'Artefakter',
      'nav.search': 'Sök',
      'nav.world': 'Värld',
      'nav.quiz': 'Examen',
      'nav.mylore': 'Mitt arkiv',
      'nav.about': 'Om',
      'nav.methodology': 'Metodik',
      'filter.search': 'Sök…',
      'filter.sort_az': 'Sortera: A–Ö',
      'filter.sort_new': 'Sortera: Senaste',
      'filter.region': 'Region',
      'filter.country': 'Land',
      'filter.type': 'Typ',
      'btn.explore_bestiary': 'Utforska bestiarium',
      'btn.read_stories': 'Läs berättelser',
      'badge.pending': 'översättning saknas',
      'footer.support': 'Stöd projektet',
      'daily.creature': 'Dagens varelse',
      'daily.story': 'Dagens berättelse',
      'latest.heading': 'Senaste tillskotten',
      'title.index': 'Whispering Lore — Mytologi och folklor från hela världen',
      'desc.index': 'Utforska 3 668 mytologiska varelser, 2 185 berättelser och 641 artefakter från 212 länder.',
      'title.about': 'Om Whispering Lore',
      'desc.about': 'Bakom projektet, källorna och metoden bakom arkivet.'
    }
  }

  function applyChrome() {
    var lang = window.__sharedUtils.getNativeLang()
    if (!lang) return
    var dict = DICT[lang]
    document.documentElement.setAttribute('lang', lang)
    var nodes = document.querySelectorAll('[data-i18n]')
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute('data-i18n')
      if (dict && dict[k] != null) nodes[i].textContent = dict[k]
    }
    var page = (window.location.pathname.split('/').pop() || 'index.html').replace('.html', '') || 'index'
    var tKey = 'title.' + page
    if (dict && dict[tKey]) document.title = dict[tKey]
    var meta = document.querySelector('meta[name="description"]')
    var dKey = 'desc.' + page
    if (meta && dict && dict[dKey]) meta.setAttribute('content', dict[dKey])
  }

  window.__i18n = { en: DICT.en, sv: DICT.sv, applyChrome: applyChrome }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyChrome)
  } else {
    applyChrome()
  }
})()
```

Execution note: extend DICT with `title.<page>`/`desc.<page>` for all 11 pages + prose paragraph keys (`about.p1..pN`, `methodology.p1..pN`) — translate prose from the live pages during this task; the parity test enforces completeness. Badge CSS class uses `badge.pending` value rendered by Task 3 helper (update helper to read `window.__i18n` dict when native so language stays centralized).

- [ ] **Step 4: Mechanical sweep across 11 pages**

Python one-off (run once, verify counts):

```python
import glob, re
# 1) script tag after language-toggle.js
for f in sorted(glob.glob('*.html')):
    s = open(f).read()
    assert 'js/i18n.js' not in s, f
    anchor = '<script src="js/language-toggle.js" defer></script>'
    if anchor in s:
        s = s.replace(anchor, anchor + '\n<script src="js/i18n.js" defer></script>')
    else:  # pages without toggle still need i18n chrome
        anchor2 = '</body>'
        s = s.replace(anchor2, '<script src="js/i18n.js" defer></script>\n' + anchor2, 1)
    open(f, 'w').write(s)
print('script tags done')
```

Then hand-add `data-i18n` attributes to nav/footer/filter labels per page (grep anchors: `<li><a`, `class="filter-bar"`, footer `<p>` blocks). Titles/descriptions stay EN in markup; dictionary overrides at runtime.

- [ ] **Step 5: Gates + commit**

`npx jest` green · `npx eslint .` 0 errors · commit:

```bash
git add js/i18n.js tests/i18n-dict.test.js *.html
git commit -m "feat(i18n): chrome dictionary and data-i18n sweep"
```

---

### Task 5: hreflang alternates (static sweep)

**Files:**
- Modify: 11 root HTML pages `<head>`

- [ ] **Step 1: Insert after og-image/twitter meta block (once per page)**

```bash
python3 - <<'EOF'
import glob
for f in sorted(glob.glob('*.html')):
    s = open(f).read()
    if 'hreflang' in s:
        print('skip', f); continue
    anchor = '<link rel="canonical"'
    if anchor not in s:
        anchor = '</head>'
    tags = ('\n  <link rel="alternate" hreflang="en" href="https://whisperinglore.com/{p}"/>'
            '\n  <link rel="alternate" hreflang="sv" href="https://whisperinglore.com/{p}?lang=sv"/>').format(p=f)
    s = s.replace(anchor, tags + ('\n  ' + anchor if anchor != '</head>' else '\n' + anchor), 1)
    open(f, 'w').write(s)
print('hreflang inserted')
EOF
rg -c 'hreflang="sv"' *.html   # expect 11 files × 1
```

- [ ] **Step 2: Test** — add to `tests/e2e/language-toggle.spec.js`:

```js
  test('pages expose en/sv hreflang alternates', async ({ page }) => {
    const count = await page.$$eval('link[rel="alternate"][hreflang]', (els) =>
      els.filter((e) => e.hreflang === 'en' || e.hreflang === 'sv').length
    )
    expect(count).toBe(2)
  })
```

- [ ] **Step 3: Run e2e spec (background process) → green. Commit:**

```bash
git add *.html tests/e2e/language-toggle.spec.js
git commit -m "feat(i18n): hreflang alternates"
```

---

### Task 6: Toggle native mode (Svenska)

**Files:**
- Modify: `js/language-toggle.js`
- Test: `tests/language-toggle.test.js` (add describe)

- [ ] **Step 1: Failing tests**

```js
describe('languageToggle native mode switching', function () {
  var LT;
  beforeEach(function () {
    document.body.innerHTML =
      '<header><nav id="site-nav"></nav>' +
      '<button class="theme-toggle" id="theme-toggle"></button></header>';
    LT = window.__languageToggle;
    LT._resetForTests();
    LT.initUI();
  });
  afterEach(function () {
    LT._resetForTests();
    window.history.replaceState({}, '', '/index.html');
  });

  test('chooseSvenska clears GT cookie, navigates to ?lang=sv keeping params', function () {
    LT.setGoogtrans('de');
    window.history.replaceState({}, '', '/bestiary.html?creature=tomte');
    var navs = [];
    LT._setNavigatorForTests(function (url) { navs.push(url); });
    LT.chooseNative();
    expect(navs).toEqual(['/bestiary.html?creature=tomte&lang=sv']);
    expect(LT.readGoogtrans()).toBeNull();
  });

  test('leaving native strips lang param and hands off to GT flow', function () {
    window.history.replaceState({}, '', '/bestiary.html?lang=sv&creature=tomte');
    var navs = [];
    LT._setNavigatorForTests(function (url) { navs.push(url); });
    LT.leaveNative();
    expect(navs).toEqual(['/bestiary.html?creature=tomte']);
  });

  test('menu marks Svenska with native dot when threshold constant says so', function () {
    LT.NATIVE_COVERAGE_READY = true;
    document.getElementById('lang-toggle').click();
    var sv = document.querySelector('#language-menu [data-code="sv"]');
    expect(sv.classList.contains('is-native')).toBe(true);
  });
});
```

- [ ] **Step 2: Verify fail**, **Step 3: implement in language-toggle.js**

Add near choose():

```js
  var navigatorFn = function (url) { window.location.assign(url) }
  var NATIVE_COVERAGE_READY = false // flips true when sv coverage is meaningful

  function chooseNative() {
    clearGoogtrans()
    var u = window.__sharedUtils
      ? window.__sharedUtils.withLang(window.location.pathname + window.location.search, 'sv')
      : window.location.pathname + '?lang=sv'
    closeMenu(false)
    navigatorFn(u)
  }

  function leaveNative() {
    var u = window.__sharedUtils
      ? window.__sharedUtils.stripLangUrl(window.location.pathname + window.location.search)
      : window.location.pathname
    closeMenu(false)
    navigatorFn(u)
  }
```

In `choose(code)`: first line `if (code === 'sv') { chooseNative(); return }` and in resetToOriginal path leave native similarly (`if (getNativeLang() && code === '') { leaveNative(); return }`). In buildMenu(): after creating sv item, `if (NATIVE_COVERAGE_READY) el.classList.add('is-native')` plus CSS dot:

```css
.language-menu [role='menuitem'].is-native::after {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-left: 0.4rem;
  border-radius: 50%;
  background: var(--accent-strong);
}
```

Export `chooseNative`, `leaveNative`, `NATIVE_COVERAGE_READY` (getter), `_setNavigatorForTests`. Reset both vars in `_resetForTests`.

CSS dot appended to styles.css `.language-menu` block.

- [ ] **Step 4: gates + commit**

```bash
git add js/language-toggle.js tests/language-toggle.test.js css/styles.css
git commit -m "feat(i18n): toggle switches native swedish mode"
```

---

### Task 7: Viewer link param propagation + dynamic link rewrite pass

**Files:**
- Modify: `js/creatures-viewer.js`, `js/stories-viewer.js`, `js/items-viewer.js`, `js/main.js` (daily/latest links), `js/globe.js` popups
- Test: extend `tests/e2e/language-toggle.spec.js`

- [ ] **Step 1: e2e failing test**

```js
  test('internal links preserve ?lang=sv in native mode', async ({ page }) => {
    await page.goto(`${BASE}/index.html?lang=sv`, { waitUntil: 'load', timeout: 20000 })
    await page.waitForSelector('.latest-item a[href*="lang=sv"]', { timeout: 15000 })
    const navHref = await page.getAttribute('nav a[href$=".html"]', 'href')
    await page.goto(`${BASE}/bestiary.html?lang=sv`, { waitUntil: 'load', timeout: 20000 })
    await page.waitForSelector('article.card a[href*="lang=sv"]', { timeout: 20000 })
  })
```

- [ ] **Step 2: implement** — two layers:
1. DOM rewrite pass (covers static markup): in `js/i18n.js` `applyChrome()` when native, after swaps:

```js
    var links = document.querySelectorAll('a[href]')
    for (var j = 0; j < links.length; j++) {
      var href = links[j].getAttribute('href')
      if (/^https?:\/\//i.test(href)) continue
      if (href.indexOf('.html') !== -1 || href.charAt(0) === '?')
        links[j].setAttribute('href', window.__sharedUtils.withLang(href))
    }
```

2. Viewer builders: wherever `a.href = '?creature='+…` etc. exist (creatures-viewer.js:64,679; stories-viewer.js:68,486,597; items-viewer.js:71,363,399; globe.js:365-398; daily-feature.js:46,64; main.js latest cards), wrap target with `window.__sharedUtils.withLang(...)`. Grep anchor list provided; mechanical wrap, verify by grep count.

- [ ] **Step 3: e2e green + full unit suite + commit**

```bash
git add js/ tests/
git commit -m "feat(i18n): propagate lang param through internal links"
```

---

### Task 8: Pilot content batch (50 Nordic creatures)

**Files:**
- Create: `data/i18n/sv/creatures-nordic.json`

- [ ] **Step 1: Generate skeleton from shard**

Controller runs (one-off, /tmp): read `data/sharded/creatures/by-region/nordic.json`, take first 50 entries in array order, emit `{ "_meta": { lang:'sv', source:'wave-a pilot', count:50 }, "entries": { "<slug>": { "name": "<sv>", "summary": "<sv>" } } }` — controller translates name+summary personally (LLM-batch per approved decision). Names: keep established Swedish forms (Tomte→Tomte/Nisse, Troll→Troll, Draugr→Draug etc.); summaries 1–3 sentences natural Swedish, no machine-literal calques.

- [ ] **Step 2: Validation gate**

```bash
node -e "
const o=require('./data/i18n/sv/creatures-nordic.json');
const d=require('./data/sharded/creatures/by-region/nordic.json');
const slugs=new Set(d.map(c=>c.slug));
const ks=Object.keys(o.entries);
if(ks.length<50) throw new Error('too few');
ks.forEach(k=>{ if(!slugs.has(k)) throw new Error('unknown slug '+k);
  const e=o.entries[k]; if(!e.name||!e.summary) throw new Error('incomplete '+k); });
console.log('pilot overlay valid:', ks.length, 'entries');"
```

- [ ] **Step 3: Manual browser verification**

Serve repo (:3000), open `/bestiary.html?lang=sv` — pilot entries show sv names, non-pilot show badge; `/bestiary.html?creature=tomte&lang=sv` shows sv summary + badge absent for tomte (fully covered fields present → still `partial:true` unless ALL its fields covered — acceptable: badge policy = entry-level until wave B adds `complete:true` flag; document in code comment).

- [ ] **Step 4: Commit**

```bash
git add data/i18n/sv/creatures-nordic.json
git commit -m "feat(i18n): swedish pilot batch for nordic creatures"
```

---

### Task 9: Axe-gate native scan + full gates + docs

**Files:**
- Modify: `tests/e2e/accessibility.spec.js`, `todos.md`, README (feature line)

- [ ] **Step 1: Add native-mode scan** to accessibility.spec.js PAGES loop variant: one extra test navigating `/bestiary.html?lang=sv` desktop viewport reusing existing `scan()` (badges included automatically). Keep EXCLUSIONS empty — fix any contrast issue at CSS level if flagged.

- [ ] **Step 2: Full gates (background processes)**

```bash
npx eslint .          # 0 errors
npx jest              # all green (expect ~205+)
npx playwright test --project=chromium --reporter=dot   # all green incl new tests
```

- [ ] **Step 3: Docs** — todos.md: mark Wave A shipped w/ SHAs; README feature bullet: "**Swedish native mode**: `?lang=sv` serves quality translations with graceful English fallback"; rebuild both deploy zips (recipe in project memory) + smoke :8123 incl `?lang=sv` badge/name assertions; push main.

- [ ] **Step 4: Commits**

```bash
git add -A
git commit -m "docs(todos): phase 2 wave a shipped"
```

---

## Self-Review (controller)

- Spec §1 merge → T2; §2 state/helpers → T1, propagation → T7; §3 toggle → T6; §4 chrome → T4; §5 badge → T3 (+dict centralization noted); §6 SEO → T4 (dynamic) + T5 (static); §7 waves → T8 pilot + plan scope = Wave A only; §8 testing distributed per task + T9 axe extension. ✓
- Placeholders: none — mechanical sweeps carry exact commands; pilot content generation is a defined procedure with validation gate (content itself is execution-time translation work by design). ✓
- Name consistency: `getNativeLang/isNative/withLang/stripLangUrl/i18nBadgeHtml/chooseNative/leaveNative/NATIVE_COVERAGE_READY/_setNavigatorForTests` used uniformly. ✓
