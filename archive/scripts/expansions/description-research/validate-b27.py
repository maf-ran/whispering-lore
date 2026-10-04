import json, sys, collections

IN = 'batch-27-input.json'
OUT = 'batch-27-output.json'

inp = json.load(open(IN))
out = json.load(open(OUT))
in_slugs = [r['slug'] for r in inp]
out_slugs = [r['slug'] for r in out]

forbidden = ['extends beyond simple folklore','traits including','This entity demonstrates','represents an important figure in','Behaviorally','represents the mysteries and power of','influencing cultural practices and moral teachings','represents the mysteries','is a bird from','folklore. As a']
errors = []

if in_slugs != out_slugs:
    errors.append('SLUG ORDER MISMATCH')
    for i,(a,b) in enumerate(zip(in_slugs,out_slugs)):
        if a!=b: errors.append(f'  pos {i}: input={a} out={b}')
    if len(in_slugs)!=len(out_slugs):
        errors.append(f'  length input={len(in_slugs)} out={len(out_slugs)}')

seen=set()
dups=[]
for s in out_slugs:
    if s in seen: dups.append(s)
    seen.add(s)
if dups: errors.append(f'DUP SLUGS: {dups}')

for r in out:
    n=len(r['description'])
    if not (150<=n<=400):
        errors.append(f'LEN {n} [{r["slug"]}]')

for r in out:
    low=r['description'].lower()
    for f in forbidden:
        if f in low:
            errors.append(f'FORBIDDEN phrase in [{r["slug"]}]: {f!r}')

for r in out:
    for k in ['slug','description','source','source_quality','attested','research_notes']:
        if k not in r: errors.append(f'MISSING key {k} in [{r.get("slug")}]')
    if r['source_quality'] not in ['expert','academic','good','fair','poor']:
        errors.append(f'BAD quality [{r["slug"]}]: {r["source_quality"]}')
    if not isinstance(r['attested'], bool):
        errors.append(f'BAD attested [{r["slug"]}]')
    if len(r['research_notes'])<40:
        errors.append(f'SHORT notes [{r["slug"]}]')

for r in out:
    if not r['attested'] and r['source_quality']!='poor':
        errors.append(f'unattested but quality={r["source_quality"]} [{r["slug"]}]')

if errors:
    print('FAIL:')
    for e in errors: print(' ', e)
    sys.exit(1)
print('ALL CHECKS PASSED')
print('total:', len(out))
print('attested:', sum(1 for r in out if r['attested']))
print('unattested:', sum(1 for r in out if not r['attested']))
print('quality:', dict(collections.Counter(r['source_quality'] for r in out)))
print('desc len range:', min(len(r['description']) for r in out), '-', max(len(r['description']) for r in out))
