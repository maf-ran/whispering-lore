#!/usr/bin/env python3
"""Apply expanded item descriptions + cross-refs from expand/batch-*-output.json
back into data/items.json (in place, tmp+os.replace), then sync creature/story
back-references for any newly added links."""
import json, os, glob, tempfile

BASE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(BASE, '..', '..', '..', '..'))
ITEMS = os.path.join(ROOT, 'data', 'items.json')
CREATURES = os.path.join(ROOT, 'data', 'datasets', 'creatures.json')
STORIES = os.path.join(ROOT, 'data', 'datasets', 'stories.json')
OUT_DIR = os.path.join(BASE, 'expand')

with open(ITEMS, encoding='utf-8') as f:
    items = json.load(f)
with open(CREATURES, encoding='utf-8') as f:
    creatures = json.load(f)
with open(STORIES, encoding='utf-8') as f:
    stories = json.load(f)

item_by_slug = {i['slug']: i for i in items}
creature_by_slug = {c['slug']: c for c in creatures}
story_by_slug = {s['slug']: s for s in stories}

applied = 0
missing = []
for p in sorted(glob.glob(os.path.join(OUT_DIR, 'batch-*-output.json'))):
    out = json.load(open(p, encoding='utf-8'))
    for e in out:
        slug = e['slug']
        rec = item_by_slug.get(slug)
        if rec is None:
            missing.append(slug)
            continue
        desc = e['description']
        assert isinstance(desc, str) and len(desc) >= 200, (slug, len(desc))
        rec['description'] = desc
        for key in ('aliases', 'material', 'era', 'maker', 'powers',
                    'associated_creature', 'related_creatures',
                    'featured_in_stories', 'keywords', 'search_terms'):
            if key in e and e[key] is not None:
                rec[key] = e[key]
        if 'source' in e:
            rec['source'] = e['source']
        if 'source_quality' in e:
            rec['source_quality'] = e['source_quality']
        rec['lastUpdated'] = '2026-08-11'
        applied += 1

# sync backrefs for any NEW cross-links added by expansion
added_creature_refs = 0
added_story_refs = 0
for rec in items:
    for slug in (rec.get('related_creatures') or []):
        c = creature_by_slug.get(slug)
        if c is None:
            raise SystemExit(f'creature ref does not resolve: {rec["slug"]} -> {slug}')
        lst = c.get('related_items') or []
        if rec['slug'] not in lst:
            lst.append(rec['slug'])
            lst.sort()
            c['related_items'] = lst
            added_creature_refs += 1
    for slug in (rec.get('featured_in_stories') or []):
        s = story_by_slug.get(slug)
        if s is None:
            raise SystemExit(f'story ref does not resolve: {rec["slug"]} -> {slug}')
        lst = s.get('items') or []
        if rec['slug'] not in lst:
            lst.append(rec['slug'])
            lst.sort()
            s['items'] = lst
            added_story_refs += 1

print(f'applied={applied} missing={missing} new_creature_backrefs={added_creature_refs} new_story_backrefs={added_story_refs}')

for path, data in ((ITEMS, items), (CREATURES, creatures), (STORIES, stories)):
    tmp = tempfile.NamedTemporaryFile('w', dir=os.path.dirname(path), delete=False,
                                      encoding='utf-8')
    json.dump(data, tmp, ensure_ascii=False, indent=2)
    tmp.close()
    os.replace(tmp.name, path)
    print('wrote', path, 'via tmp+os.replace')
