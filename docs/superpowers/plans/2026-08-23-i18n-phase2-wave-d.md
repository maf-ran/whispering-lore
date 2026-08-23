# i18n Phase 2 Wave D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** All 82 Nordic artifacts fully Swedish (`name` + `description`, `complete:true`) via the existing type-generic overlay layer.

**Architecture:** Pure content wave — `data/i18n/sv/items-nordic.json` + coverage-map auto-publish. Only js-adjacent work: jest fixture + items-type merge test.

**Tech Stack:** Vanilla JS (no changes), jest+jsdom, Playwright chromium, node validators.

**Spec:** `docs/superpowers/specs/2026-08-23-i18n-phase2-wave-d-design.md`

**Verified facts:**
- Real shard `data/sharded/items/by-region/nordic.json` = 82 entries.
- Fixture shard `tests/fixtures/items-nordic.json` = mjolnir + dromund; fixtureMap serves it at `data/sharded/items/by-region/nordic.json`.
- Fixture manifest i18n block currently: `"sv": { "creatures-nordic": true, "stories-nordic": true }`.
- GOTCHA from Wave C: fixture overlays must be registered in shimmer.test.js fixtureMap (`fixtureMap['data/i18n/sv/<file>.json'] = JSON.parse(fs.readFileSync(...))`) or the fetch 404s → null → silent no-merge.
- Cyrillic-е trap: scan sv JSON for U+0400–U+04FF after writing; write tool truncates ~9-10k chars → chunk translation files (3-5 entries each) under /tmp and merge with python.
- No `js/` change planned ⇒ NO sw bump. jest/e2e via createBackgroundProcess.

---

### Task 1: Items-type merge proof (jest)

**Files:**
- Create: `tests/fixtures/sv-items-nordic.json`
- Modify: `tests/fixtures/manifest.json`
- Test: `tests/shimmer.test.js`

- [ ] **Step 1: Fixture** — create `tests/fixtures/sv-items-nordic.json`:

```json
{
  "_meta": { "lang": "sv", "source": "fixture" },
  "entries": {
    "mjolnir": {
      "name": "Mjölnir",
      "description": "Tors mäktiga stridshammer, smidd av dvärgarna Sindri och Brokkr. Kastad återvänder den alltid till sin ägares hand.",
      "complete": true
    }
  }
}
```

- [ ] **Step 2: Fixture coverage map** — extend `tests/fixtures/manifest.json`:

```json
"i18n": {
    "sv": {
      "creatures-nordic": true,
      "stories-nordic": true,
      "items-nordic": true
    }
  },
```

- [ ] **Step 3: Register overlay in fixtureMap** — in `tests/shimmer.test.js`, directly after the sv-stories-nordic registration:

```js
fixtureMap['data/i18n/sv/items-nordic.json'] = JSON.parse(
  fs.readFileSync(path.join(FIX, 'sv-items-nordic.json'), 'utf8')
);
```

- [ ] **Step 4: Failing/green test** — append inside `describe('Shimmer sv overlay merge')`:

```js
  it('merges sv patches onto items shards when native', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    Shimmer.shards.items = {};
    return new Promise(function (resolve) {
      Shimmer.loadRegionShard('items', 'Nordic', function (err, data) {
        resolve(data);
      });
    }).then(function (data) {
      var s = data.find(function (x) { return x.slug === 'mjolnir' });
      expect(s.name).toBe('Mjölnir');
      expect(s.description).toContain('stridshammer');
      expect(s._i18n).toEqual({ lang: 'sv', partial: false });
      expect('complete' in s).toBe(false);
    });
  });
```

Run (background): `npx jest tests/shimmer.test.js -t "items shards" 2>&1 | tail -12`
Expected: PASS (path already generic — this is proof-of-path like Wave C T1). If FAIL, debug before proceeding.

- [ ] **Step 5: Full suite + commit**

```bash
npx jest 2>&1 | grep -E 'Tests:'    # expect 213 passed
git add tests/fixtures/sv-items-nordic.json tests/fixtures/manifest.json tests/shimmer.test.js
git commit -m "test(i18n): items-type sv overlay merge proof"
```

---

### Task 2: Content batch — 82 full item translations

**Files:**
- Create: `data/i18n/sv/items-nordic.json`
- Modify: `data/sharded/manifest.json` (regenerated)

- [ ] **Step 1: Extract source**

```bash
python3 - <<'EOF'
import json
d = json.load(open('data/sharded/items/by-region/nordic.json'))
out = [{'slug': i['slug'], 'name': i.get('name',''),
        'description': i.get('description','')} for i in d]
json.dump(out, open('/tmp/waved-source.json','w'), ensure_ascii=False, indent=1)
print('saved', len(out), '| chars:', sum(len(e['description']) for e in out))
for n, e in enumerate(out):
    print(n, '|', e['slug'], '|', e['name'])
EOF
```

- [ ] **Step 2: Translate** — controller translates all 82 personally into `/tmp/waved-t*.json` chunks (4-6 entries per chunk, `{ "<slug>": { "name", "description", "complete": true } }`). Rules per spec: established Norse/Swedish names kept; descriptions faithful; target ≥50% of EN length (most will land near parity).

- [ ] **Step 3: Merge + hygiene**

```bash
python3 - <<'EOF'
import json, os, glob
entries = {}
dups = 0
for p in sorted(glob.glob('/tmp/waved-t*.json')):
    d = json.load(open(p))
    for k, v in d.items():
        if k in entries:
            entries[k].update(v); dups += 1
        else:
            entries[k] = v
print('total:', len(entries), '| merged:', dups)
src = json.load(open('/tmp/waved-source.json'))
slugs = {s['slug'] for s in src}
print('missing:', sorted(slugs - set(entries)) or 'none')
print('unknown:', sorted(set(entries) - slugs) or 'none')
meta = {"lang": "sv", "source": "wave-d items pilot", "count": len(entries),
        "fullEntries": sum(1 for e in entries.values() if e.get('complete')),
        "fullSlugs": sorted(k for k, e in entries.items() if e.get('complete'))}
p = 'data/i18n/sv/items-nordic.json'
tmp = p + '.tmp'
open(tmp,'w',encoding='utf-8').write(json.dumps({"_meta": meta, "entries": entries}, ensure_ascii=False, indent=2) + '\n')
os.replace(tmp, p)
print(meta['fullEntries'], 'complete')
EOF
python3 -c "
s=open('data/i18n/sv/items-nordic.json',encoding='utf-8').read()
cyr=[(i,l.strip()[:70]) for i,l in enumerate(s.split(chr(10)),1) if any(chr(0x400)<=ord(c)<=chr(0x4FF) for c in l)]
print('cyrillic hits:', cyr if cyr else 'none')"
```

If cyrillic hits: replace homoglyphs (е→e, а→a, о→o…) and re-scan until clean.

- [ ] **Step 4: Validation gate**

```bash
node -e "
const o=require('./data/i18n/sv/items-nordic.json');
const d=require('./data/sharded/items/by-region/nordic.json');
const src=Object.fromEntries(d.map(i=>[i.slug,i]));
const ks=Object.keys(o.entries);
if(ks.length!==82) throw new Error('expected 82, got '+ks.length);
let full=[];
ks.forEach(k=>{
  if(!src[k]) throw new Error('unknown slug '+k);
  const e=o.entries[k];
  if(!e.name||!e.description) throw new Error('missing name/description '+k);
  if(e.complete!==true) throw new Error('not complete '+k);
  const need=0.5*(src[k].description||'').length;
  if(e.description.length<need) throw new Error('description too short '+k+' '+e.description.length+'<'+need);
  full.push(k);
});
if(full.length!==82) throw new Error('expected 82 complete, got '+full.length);
if((o._meta.fullSlugs||[]).length!==82) throw new Error('_meta.fullSlugs wrong');
console.log('wave-d overlay valid:', ks.length, 'entries, all complete');"
```

Expected: `wave-d overlay valid: 82 entries, all complete`.

- [ ] **Step 5: Rebuild shards**

```bash
node archive/scripts/shard-data.mjs
python3 -c "import json; print(json.load(open('data/sharded/manifest.json'))['i18n'])"
# expect creatures-nordic, stories-nordic, items-nordic
```

- [ ] **Step 6: Browser verification** (single :3000 server)

Playwright script checks:
1. `/items.html?item=mjolnir&lang=sv` → Swedish description, NO `.i18n-pending`.
2. `/items.html?lang=sv` grid shows sv names.
3. Zero `/data/i18n/` 404 responses.

- [ ] **Step 7: Commit**

```bash
git add data/i18n/sv/items-nordic.json data/sharded/
git commit -m "feat(i18n): swedish items pilot - 82 nordic artifacts"
```

---

### Task 3: Gates, docs, ship

- [ ] **Step 1: Gates (background)** — eslint --quiet (0 err); jest (213 expected); full chromium suite green. No js changes ⇒ keep sw v1_0_23.

- [ ] **Step 2: todos.md** — replace Wave D backlog bullet with shipped line (SHAs, 82/82 complete).

- [ ] **Step 3: Ship**

```bash
git ls-files | grep -v -E '^(\.github/|\.opencode/|tests/|docs/|archive/|skills/|marketing/|\.claude/)' \
  | grep -v -E '(^|/)(\.eslintrc|jest\.config|playwright\.config|babel\.config|package(-lock)?\.json)$' > /tmp/deploy-files.txt
rm -f /tmp/whispering-lore-deploy.zip
cat /tmp/deploy-files.txt | zip -@ -q /tmp/whispering-lore-deploy.zip
# smoke :8123 fresh unzip: ?item=mjolnir&lang=sv sv desc badge-free, 0 i18n 404s
git add todos.md && git commit -m "docs(todos): phase 2 wave d shipped"
git push origin main
```

---

## Self-Review (controller)

- Spec §overlay/schema → T2 Steps 1-3; §infrastructure → T2 Step 5; §translation rules → T2 Step 2; §validation gate → T2 Step 4; §testing → T1 + T2 Step 6 + T3 Step 1; §mechanics → T3. ✓
- Placeholders: none — translation is controller execution work per precedent; chunking procedure explicit. ✓
- Consistency: entry schema matches Waves A-C; fixture naming follows sv-stories pattern; gate thresholds from spec (≥50%). ✓
