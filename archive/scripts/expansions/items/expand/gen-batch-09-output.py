#!/usr/bin/env python3
"""Generate batch-09-output.json from batch-09-input.json using the
per-slug changes in gen-batch-09-data-{a,b,c}.py.

For each item: replace description, and (optionally) related_creatures,
associated_creature, featured_in_stories. Preserve every other field exactly.
Then self-verify per the batch rules.
"""
import json
import sys
import os
import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)


def _load(name):
    path = os.path.join(HERE, name + '.py')
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


CHANGES = {}
for part, attr in (('gen-batch-09-data-a', 'CHANGES_A'),
                   ('gen-batch-09-data-b', 'CHANGES_B'),
                   ('gen-batch-09-data-c', 'CHANGES_C')):
    CHANGES.update(getattr(_load(part), attr))

IN = os.path.join(HERE, 'batch-09-input.json')
OUT = os.path.join(HERE, 'batch-09-output.json')
CREATURES = os.path.abspath(os.path.join(HERE, '../../../../../data/datasets/creatures.json'))
STORIES = os.path.abspath(os.path.join(HERE, '../../../../../data/datasets/stories.json'))


def main():
    with open(IN, encoding='utf-8') as f:
        data = json.load(f)

    out = []
    for item in data:
        slug = item['slug']
        new_item = dict(item)
        if slug in CHANGES:
            ch = CHANGES[slug]
            if 'description' in ch:
                new_item['description'] = ch['description']
            for field in ('related_creatures', 'associated_creature', 'featured_in_stories'):
                if field in ch:
                    new_item[field] = ch[field]
        out.append(new_item)

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write('\n')

    # ---- self-verify ----
    with open(CREATURES, encoding='utf-8') as f:
        creature_slugs = {x['slug'] for x in json.load(f)}
    with open(STORIES, encoding='utf-8') as f:
        story_slugs = {x['slug'] for x in json.load(f)}
    with open(IN, encoding='utf-8') as f:
        inp = json.load(f)

    ok = True

    def err(m):
        nonlocal ok
        ok = False
        print('ERROR:', m)

    if len(out) != 40:
        err('expected 40 items, got %d' % len(out))
    if [i['slug'] for i in out] != [i['slug'] for i in inp]:
        err('slug order mismatch')
    for o, i in zip(out, inp):
        if o['id'] != i['id']:
            err('id changed for %s' % o['slug'])
        if len(o['description']) < 200:
            err('desc too short for %s (%d)' % (o['slug'], len(o['description'])))
        for ref in o.get('related_creatures', []) or []:
            if ref not in creature_slugs:
                err('bad related_creature %s in %s' % (ref, o['slug']))
        if o.get('associated_creature') and o.get('associated_creature') not in creature_slugs:
            err('bad associated_creature %s in %s' % (o['associated_creature'], o['slug']))
        for ref in o.get('featured_in_stories', []) or []:
            if ref not in story_slugs:
                err('bad featured_in_stories %s in %s' % (ref, o['slug']))
        editable = {'description', 'related_creatures', 'associated_creature', 'featured_in_stories'}
        for k, v in i.items():
            if k not in editable and o.get(k) != v:
                err('field %s changed for %s' % (k, o['slug']))

    lens = [x['description'] for x in out]
    print('items:', len(out))
    print('desc min/max:', min(map(len, lens)), max(map(len, lens)))
    print('creature refs:', sum(len(x.get('related_creatures', []) or []) for x in out))
    print('story refs:', sum(len(x.get('featured_in_stories', []) or []) for x in out))
    print('assoc creatures:', sum(1 for x in out if x.get('associated_creature')))
    print('VERIFY:', 'PASS' if ok else 'FAIL')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
