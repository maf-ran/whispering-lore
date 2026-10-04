#!/usr/bin/env python3
import json, os, tempfile

DB = 'data/datasets/creatures.json'
DIR = 'archive/scripts/expansions/long-desc-review'
VALID_Q = {'well-documented', 'fair', 'good', 'academic', 'expert', 'researched',
           'verified', 'documented', 'primary', 'poor'}

with open(DB, encoding='utf-8') as f:
    c = json.load(f)
db = c if isinstance(c, list) else c.get('creatures', [])
by_slug = {x['slug']: x for x in db}

applied = 0
missing = []
for p in ['p2-output-01.json', 'p2-output-02.json']:
    out = json.load(open(os.path.join(DIR, p), encoding='utf-8'))
    for e in out:
        slug = e['slug']
        if slug not in by_slug:
            missing.append(slug)
            continue
        desc = e['description']
        assert 280 <= len(desc) <= 400, (slug, len(desc))
        assert e['source_quality'] in VALID_Q, (slug, e['source_quality'])
        assert e['attested'] is True, slug
        rec = by_slug[slug]
        rec['description'] = desc
        rec['source'] = e['source']
        rec['source_quality'] = e['source_quality']
        rec['attested'] = True
        rec['lastUpdated'] = '2026-08-05'
        applied += 1

print('applied:', applied, 'missing:', missing)
assert not missing, missing
assert applied == 14, applied

tmp = tempfile.NamedTemporaryFile('w', dir=os.path.dirname(DB), delete=False,
                                  encoding='utf-8')
json.dump(c, tmp, ensure_ascii=False, indent=2)
tmp.close()
os.replace(tmp.name, DB)
print('wrote', DB, 'via tmp+os.replace')
