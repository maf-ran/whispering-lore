# i18n Phase 2 Wave E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** +50 fully Swedish creature entries (shard positions 101–150) merged into `data/i18n/sv/creatures-nordic.json` → 150 entries / 100 complete.

**Architecture:** Identical to Wave B Task 3 — chunked personal translation under /tmp, python merge into the existing overlay, validation gate, gates+ship. No code changes; no sw bump.

**Spec:** `docs/superpowers/specs/2026-08-23-i18n-phase2-wave-e-design.md`

---

### Task 1: Extract, translate, merge

- [ ] **Step 1: Extract positions 101–150**

```bash
python3 - <<'EOF'
import json
d = json.load(open('data/sharded/creatures/by-region/nordic.json'))
out = [{'slug': c['slug'], 'name': c['name'], 'summary': c.get('summary',''),
        'description': c.get('description','')} for c in d[100:150]]
json.dump(out, open('/tmp/wavee-source.json','w'), ensure_ascii=False, indent=1)
print('saved', len(out), '| chars:', sum(len(e['description']) for e in out))
EOF
```

- [ ] **Step 2: Translate personally** → `/tmp/we-t*.json` chunks of 3-5 entries (`{ "<slug>": { "name", "summary", "description" } }`). Same rules as Wave B.

- [ ] **Step 3: Merge + flag complete + cyrillic scan**

```bash
python3 - <<'EOF'
import json, os, glob
base = json.load(open('data/i18n/sv/creatures-nordic.json'))
new = {}
for p in sorted(glob.glob('/tmp/we-t*.json')):
    new.update(json.load(open(p)))
overlap = set(new) & set(base['entries'])
assert not overlap, overlap
base['entries'].update(new)
for k, e in base['entries'].items():
    if e.get('description'): e['complete'] = True
base['_meta']['count'] = len(base['entries'])
base['_meta']['fullEntries'] = sum(1 for e in base['entries'].values() if e.get('complete'))
p = 'data/i18n/sv/creatures-nordic.json'
tmp = p + '.tmp'
open(tmp,'w',encoding='utf-8').write(json.dumps(base, ensure_ascii=False, indent=2) + '\n')
os.replace(tmp, p)
print('total:', base['_meta'])
s = open(p, encoding='utf-8').read()
cyr = [c for c in s if 0x0400 <= ord(c) <= 0x04FF]
print('cyrillic:', len(cyr))
if cyr:
    m = {'\u0435':'e','\u0430':'a','\u043e':'o'}
    for c in set(cyr): s = s.replace(c, m.get(c,''))
    open(tmp,'w',encoding='utf-8').write(s); os.replace(tmp, p)
    print('fixed')
EOF
```

- [ ] **Step 4: Validation gate**

```bash
node -e "
const o=require('./data/i18n/sv/creatures-nordic.json');
const d=require('./data/sharded/creatures/by-region/nordic.json');
const slugs=new Set(d.map(c=>c.slug));
const ks=Object.keys(o.entries);
if(ks.length!==150) throw new Error('expected 150, got '+ks.length);
let full=0;
ks.forEach(k=>{ if(!slugs.has(k)) throw new Error('unknown slug '+k);
  const e=o.entries[k]; if(!e.name||!e.summary) throw new Error('incomplete '+k);
  if(e.complete===true){ full++;
    if(!e.description||e.description.length<200) throw new Error('short desc '+k); }});
if(full!==100) throw new Error('expected 100 complete, got '+full);
console.log('wave-e overlay valid:', ks.length, 'entries,', full, 'complete');"
```

- [ ] **Step 5: Browser spot-check** — one NEW entry deep link badge-free with sv description; commit:

```bash
git add data/i18n/sv/creatures-nordic.json
git commit -m "feat(i18n): swedish nordic creatures batch 3 (entries 101-150)"
```

---

### Task 2: Gates, docs, ship

- [ ] **Step 1:** eslint --quiet 0 err; jest green; full chromium green (background processes).
- [ ] **Step 2:** todos.md Wave E shipped line replacing backlog bullet.
- [ ] **Step 3:** zip rebuild; smoke :8123 incl one new-entry check; commit docs; push main.
