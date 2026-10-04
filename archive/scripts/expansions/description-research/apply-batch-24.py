import json
import os

BASE = '/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore'
CREATURES = os.path.join(BASE, 'data/datasets/creatures.json')
OUTPUT = os.path.join(BASE, 'archive/scripts/expansions/description-research/batch-24-output.json')

with open(OUTPUT, 'r') as f:
    entries = json.load(f)
with open(CREATURES, 'r') as f:
    creatures = json.load(f)

cmap = {c['slug']: c for c in creatures}

updated = 0
missing = []
for e in entries:
    c = cmap.get(e['slug'])
    if c is None:
        missing.append(e['slug'])
        continue
    c['description'] = e['description']
    c['source'] = e['source']
    c['source_quality'] = e['source_quality']
    updated += 1

tmp = CREATURES + '.tmp'
with open(tmp, 'w') as f:
    json.dump(creatures, f, indent=2, ensure_ascii=False)
os.replace(tmp, CREATURES)

print(f'updated={updated}, missing={missing}')
