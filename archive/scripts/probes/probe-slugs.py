import json, re
d = json.load(open('data/datasets/stories.json'))
bad = [s['slug'] for s in d if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', s['slug'])]
print('bad count', len(bad))
print(bad[:40])
cr = json.load(open('data/datasets/creatures.json'))
badc = [s['slug'] for s in cr if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', s['slug'])]
print('creatures bad count', len(badc), badc[:20])