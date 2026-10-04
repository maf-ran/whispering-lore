#!/usr/bin/env python3
import json, os, tempfile, glob, re

DB = 'data/datasets/creatures.json'
OUT_DIR = 'archive/scripts/expansions/template-cleanup'
FORBIDDEN = re.compile(
    r'serves as|embodies the|extends beyond simple|traits including|'
    r'This entity demonstrates|represents an important figure in|Behaviorally,|'
    r'represents the mysteries|influencing cultural practices|deeply embedded in the oral traditions'
)
VALID_Q = {'well-documented', 'fair', 'good', 'academic', 'expert', 'researched',
           'verified', 'documented', 'primary', 'poor'}

with open(DB, encoding='utf-8') as f:
    c = json.load(f)
db = c if isinstance(c, list) else c.get('creatures', [])
by_slug = {x['slug']: x for x in db}

applied = 0
missing = []
for p in sorted(glob.glob(os.path.join(OUT_DIR, 'batch-*-output.json'))):
    out = json.load(open(p, encoding='utf-8'))
    for e in out:
        slug = e['slug']
        if slug not in by_slug:
            missing.append(slug)
            continue
        desc = e['description']
        att = bool(e.get('attested'))
        q = e['source_quality']
        if att is False:
            q = 'poor'
        assert 150 <= len(desc) <= 400, (slug, len(desc))
        assert not FORBIDDEN.search(desc), slug
        assert q in VALID_Q, (slug, q)
        rec = by_slug[slug]
        rec['description'] = desc
        rec['source'] = e['source']
        rec['source_quality'] = q
        rec['attested'] = att
        rec['lastUpdated'] = '2026-08-05'
        applied += 1

print('applied:', applied, 'missing:', missing)
assert not missing, missing
assert applied == 282, applied

tmp = tempfile.NamedTemporaryFile('w', dir=os.path.dirname(DB), delete=False,
                                  encoding='utf-8')
json.dump(c, tmp, ensure_ascii=False, indent=2)
tmp.close()
os.replace(tmp.name, DB)
print('wrote', DB, 'via tmp+os.replace')
