# i18n Phase 2 Wave C Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** All 66 Nordic stories get Swedish `title` + `summary`; 10 flagship tales additionally get fully translated `full_text` with `complete: true` (badge drops).

**Architecture:** Pure content wave riding the type-generic overlay layer shipped in Waves A/B — `data/i18n/sv/stories-nordic.json` is picked up by `_loadOverlayFor('stories', …)` and auto-declared by the coverage map after one shard rebuild. Only new js-adjacent work: a jest fixture + test proving the stories path end-to-end.

**Tech Stack:** Vanilla JS IIFE modules (no changes expected), jest+jsdom, Playwright chromium-only e2e, node validators.

**Spec:** `docs/superpowers/specs/2026-08-23-i18n-phase2-wave-c-design.md`

**Verified facts:**
- Real shard `data/sharded/stories/by-region/nordic.json` = 66 entries, fields incl. `slug/title/summary/full_text`; avg full_text 1 915 chars.
- Jest fixture shard `tests/fixtures/stories-nordic.json` = ONE story, slug `three-trolls`.
- Fixture map already serves `data/sharded/stories/by-region/nordic.json`; fixture manifest at `tests/fixtures/manifest.json` currently has `"i18n": {"sv": {"creatures-nordic": true}}`.
- Decoration paths consume any patch key; `complete` is stripped (`k !== 'complete'` guards) and drives `_i18n.partial = !(patch && patch.complete)`.
- Coverage-map runtime check: `(type + '-' + fileKey) in this.manifest.i18n[lang]`, else cached resolved-null.
- jest/e2e MUST run via createBackgroundProcess. snip chokes on `${}` literals — build via chr(36)+'{'. Cyrillic-е typo trap: scan sv JSON for U+0435 after writing.
- No `js/` change planned ⇒ NO sw bump this wave (data/ is not SW-precached).

---

### Task 1: Stories-type merge proof (jest)

**Files:**
- Create: `tests/fixtures/sv-stories-nordic.json`
- Modify: `tests/fixtures/manifest.json`
- Test: `tests/shimmer.test.js`

- [ ] **Step 1: Fixture** — create `tests/fixtures/sv-stories-nordic.json`:

```json
{
  "_meta": { "lang": "sv", "source": "fixture" },
  "entries": {
    "three-trolls": {
      "title": "Tre troll under bron",
      "summary": "Tre bröder möter trollen under en bro och lär sig att mod slår storlek.",
      "full_text": "Det var en gång tre bröder som skulle till marknaden. Under bron bodde trollen.",
      "complete": true
    }
  }
}
```

- [ ] **Step 2: Register in fixture coverage map** — edit `tests/fixtures/manifest.json`, extend the i18n block:

```json
"i18n": {
    "sv": {
      "creatures-nordic": true,
      "stories-nordic": true
    }
  },
```

- [ ] **Step 3: Failing test** — append inside `describe('Shimmer sv overlay merge')` in `tests/shimmer.test.js`:

```js
  it('merges sv patches onto stories shards when native', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    Shimmer.shards.stories = {};
    return new Promise(function (resolve) {
      Shimmer.loadRegionShard('stories', 'Nordic', function (err, data) {
        resolve(data);
      });
    }).then(function (data) {
      var s = data.find(function (x) { return x.slug === 'three-trolls' });
      expect(s.title).toBe('Tre troll under bron');
      expect(s.summary).toContain('mod slår storlek');
      expect(s.full_text).toContain('Det var en gång');
      expect(s._i18n).toEqual({ lang: 'sv', partial: false });
      expect('complete' in s).toBe(false); // internal flag never leaks
    });
  });
```

Note: if the region key slug differs in fixtures (check `fixtureMap` construction lines ~68-72: keys are `'data/sharded/' + parts[0] + '/by-region/' + r + '.json'` from `regionStories` object whose keys are `nordic/celtic/east-asian`) then `'Nordic'` resolves through the same slugify used in production (`_fetchShardFromNetwork` lowercases) — Wave A/B creature tests already use `'Nordic'` successfully, so reuse verbatim.

- [ ] **Step 4: Verify fail**

Run (background): `npx jest tests/shimmer.test.js -t "stories shards" 2>&1 | tail -15`
Expected: FAIL — title still English ('Three Trolls Under the Bridge') because no stories overlay is fetched/applied… actually it WILL be fetched once the fixture map serves it but NOT applied: today's decoration is type-generic, so if this passes immediately, confirm the failure mode first. Expected genuine failure BEFORE Step 1-2 exist was impossible (fixture missing → fetch 404 → null → no merge → English title assertion fails). After Steps 1-2 the test should PASS — so run this step AFTER creating files; if green on first try, the test is still valid proof (it exercises the path). Record outcome either way.

- [ ] **Step 5: Full unit suite**

Run (background): `npx jest 2>&1 | grep -E 'Tests:'`
Expected: all green (212 total = 211 + 1).

- [ ] **Step 6: Commit**

```bash
git add tests/fixtures/sv-stories-nordic.json tests/fixtures/manifest.json tests/shimmer.test.js
git commit -m "test(i18n): stories-type sv overlay merge proof"
```

---

### Task 2: Content batch — 66 summaries + 10 full texts

**Files:**
- Create: `data/i18n/sv/stories-nordic.json`
- Modify: `data/sharded/manifest.json` (regenerated)

- [ ] **Step 1: Extract source**

```bash
python3 - <<'EOF'
import json
d = json.load(open('data/sharded/stories/by-region/nordic.json'))
out = [{'slug': s['slug'], 'title': s['title'],
        'summary': s.get('summary',''), 'full_text': s.get('full_text','')} for s in d]
json.dump(out, open('/tmp/wavec-source.json','w'), ensure_ascii=False, indent=1)
print('saved', len(out))
EOF
```

- [ ] **Step 2: Translate + build overlay**

Controller translates personally (LLM-batch, spec §Translation rules):
- ALL 66: `{ "title", "summary" }`.
- Flagship 10 (provisional, final list recorded in `_meta.fullSlugs`): `king-lindorm`, `the-bird-grip`, `the-boy-and-the-trolls-or-the-adventure`, `the-magpie-with-salt-on-her-tail`, `kpakonan-the-seal-woman-of-mikladalur`, `risin-og-kellingin-the-giant-and-the-witch`, `ljungby-horn-and-pipe`, `leap-the-elk-and-little-princess-cottongrass`, `trllanes-and-the-troll-house-party`, `the-troll-ride`. These also get `{ "full_text", "complete": true }`.
- Build `/tmp/wavec-translations.json` (same shape as `entries`), then merge:

```bash
python3 - <<'EOF'
import json, os
new = json.load(open('/tmp/wavec-translations.json'))
meta = {
  "lang": "sv",
  "source": "wave-c stories pilot",
  "count": len(new),
  "fullEntries": sum(1 for e in new.values() if e.get('complete')),
  "fullSlugs": sorted(k for k, e in new.items() if e.get('complete')),
}
out = {"_meta": meta, "entries": new}
p = 'data/i18n/sv/stories-nordic.json'
tmp = p + '.tmp'
open(tmp,'w',encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
os.replace(tmp, p)
print(meta)
EOF
```

- [ ] **Step 3: Hygiene scan** (Cyrillic-е trap):

```bash
python3 -c "
s=open('data/i18n/sv/stories-nordic.json',encoding='utf-8').read()
bad=[(i,l.strip()[:80]) for i,l in enumerate(s.split(chr(10)),1) if chr(0x430)<=max(l,chr(0x430))<=chr(0x44F)]
print('cyrillic hits:', bad[:10] if bad else 'none')"
```

If hits: replace U+0430–U+044F range chars context-appropriately (е→e, а→a, о→o, etc.), re-run until clean.

- [ ] **Step 4: Validation gate**

```bash
node -e "
const o=require('./data/i18n/sv/stories-nordic.json');
const d=require('./data/sharded/stories/by-region/nordic.json');
const src=Object.fromEntries(d.map(s=>[s.slug,s]));
const ks=Object.keys(o.entries);
if(ks.length!==66) throw new Error('expected 66, got '+ks.length);
let full=[];
ks.forEach(k=>{
  if(!src[k]) throw new Error('unknown slug '+k);
  const e=o.entries[k];
  if(!e.title||!e.summary) throw new Error('missing title/summary '+k);
  if(e.complete===true){
    if(!e.full_text) throw new Error('complete lacks full_text '+k);
    const need=0.6*(src[k].full_text||'').length;
    if(e.full_text.length<need) throw new Error('full_text too short '+k+' '+e.full_text.length+'<'+need);
    full.push(k);
  }
});
if(full.length!==10) throw new Error('expected 10 complete, got '+full.length);
const ms=new Set(o._meta.fullSlugs||[]);
if(ms.size!==10 || !full.every(k=>ms.has(k))) throw new Error('_meta.fullSlugs mismatch');
console.log('wave-c overlay valid:', ks.length, 'entries,', full.length, 'complete');"
```

Expected: `wave-c overlay valid: 66 entries, 10 complete`.

- [ ] **Step 5: Rebuild shards (publishes coverage)**

```bash
node archive/scripts/shard-data.mjs
python3 -c "import json; print(json.load(open('data/sharded/manifest.json'))['i18n'])"
```

Expected includes `'stories-nordic': True`.

- [ ] **Step 6: Browser verification** (kill stray :3000 listeners first)

Throwaway playwright script checks:
1. `/stories.html?lang=sv` grid shows sv titles (e.g. first card ≠ EN).
2. `/stories.html?story=kpakonan-the-seal-woman-of-mikladalur&lang=sv` → Swedish narrative, NO `.i18n-pending`.
3. A non-flagship deep link → `.i18n-pending` present.
4. Zero `/data/i18n/` 404 responses during loads.

- [ ] **Step 7: Commit**

```bash
git add data/i18n/sv/stories-nordic.json data/sharded/
git commit -m "feat(i18n): swedish stories pilot - 66 nordic tales"
```

---

### Task 3: Gates, docs, ship

- [ ] **Step 1: Gates (background processes)**

```bash
npx eslint . --quiet        # 0 errors
npx jest                    # all green
npx playwright test --project=chromium --reporter=dot   # all green
```

No `js/` changes ⇒ keep sw v1_0_23. If any js file did change, bump CACHE_VERSION v1_0_24.

- [ ] **Step 2: todos.md** — replace the Wave C backlog bullet with a `[x]` shipped line (spec/plan paths, SHAs, counts: 66 titles+summaries, 10 full texts, 0 i18n 404s).

- [ ] **Step 3: Ship**

```bash
git ls-files | grep -v -E '^(\.github/|\.opencode/|tests/|docs/|archive/|skills/|marketing/|\.claude/)' \
  | grep -v -E '(^|/)(\.eslintrc|jest\.config|playwright\.config|babel\.config|package(-lock)?\.json)$' > /tmp/deploy-files.txt
rm -f /tmp/whispering-lore-deploy.zip
cat /tmp/deploy-files.txt | zip -@ -q /tmp/whispering-lore-deploy.zip
# smoke: unzip fresh copy, serve :8123, verify ?story=<flagship>&lang=sv sv text + no badge + 0 i18n 404s
git add todos.md && git commit -m "docs(todos): phase 2 wave c shipped"
git push origin main
```

---

## Self-Review (controller)

- Spec §overlay file/schema → T2 Steps 1-3; §infrastructure (coverage publish) → T2 Step 5; §translation rules → T2 Step 2 (rules restated); §validation gate → T2 Steps 3-4; §testing (jest proof + e2e + browser) → T1 + T3 Step 1 + T2 Step 6; §mechanics (no sw bump unless js, docs, zip, smoke, push) → T3. ✓
- Placeholders: none — flagship list pinned (provisional-but-concrete, final truth = `_meta.fullSlugs` enforced by gate); translation volume is execution-time work per approved precedent. ✓
- Type consistency: `entries` shape matches creatures overlay convention; gate field names match schema (`title/summary/full_text/complete`). ✓
