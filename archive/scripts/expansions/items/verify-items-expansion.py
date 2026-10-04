#!/usr/bin/env python3
"""Verify expand/batch-*-output.json files: slug/id stability vs input,
desc >= 200 (target >= 500), cross-refs resolve against live datasets."""
import json, os, glob, sys

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(BASE, '..', '..', '..', '..'))

creatures = {c['slug'] for c in json.load(open(os.path.join(ROOT, 'data', 'datasets', 'creatures.json')))}
stories = {s['slug'] for s in json.load(open(os.path.join(ROOT, 'data', 'datasets', 'stories.json')))}
items = json.load(open(os.path.join(ROOT, 'data', 'items.json')))
item_slugs = {i['slug'] for i in items}

errors = []
warnings = []
checked = 0

for p in sorted(glob.glob(os.path.join(BASE, 'expand', 'batch-*-output.json'))):
    out = json.load(open(p, encoding='utf-8'))
    inp = json.load(open(p.replace('-output', '-input'), encoding='utf-8'))
    in_slugs = {i['slug']: i['id'] for i in inp}
    out_slugs = [i['slug'] for i in out]
    for i in out:
        slug = i['slug']
        checked += 1
        if slug not in in_slugs:
            errors.append(f'{p}: {slug} not in input batch (added/renamed?)')
            continue
        if i['id'] != in_slugs[slug]:
            errors.append(f'{p}: {slug} id changed {in_slugs[slug]} -> {i["id"]}')
        if slug not in item_slugs:
            errors.append(f'{p}: {slug} not in data/items.json')
        desc = i.get('description', '')
        if len(desc) < 200:
            errors.append(f'{p}: {slug} desc below 200 floor ({len(desc)})')
        elif len(desc) < 500:
            warnings.append(f'{p}: {slug} desc {len(desc)} (target >= 500)')
        for r in i.get('related_creatures') or []:
            if r not in creatures:
                errors.append(f'{p}: {slug} related_creature unresolved: {r}')
        for r in i.get('featured_in_stories') or []:
            if r not in stories:
                errors.append(f'{p}: {slug} featured_in_stories unresolved: {r}')
        if i.get('associated_creature') and i['associated_creature'] not in creatures:
            errors.append(f'{p}: {slug} associated_creature unresolved: {i["associated_creature"]}')

print(f'checked={checked}')
print(f'errors={len(errors)}')
for e in errors:
    print('  ERR', e)
print(f'warnings={len(warnings)} (below 500 target)')
for w in warnings[:40]:
    print('  WARN', w)
if len(warnings) > 40:
    print(f'  ... {len(warnings)-40} more')
sys.exit(1 if errors else 0)
