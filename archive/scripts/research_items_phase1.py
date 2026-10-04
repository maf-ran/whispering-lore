#!/usr/bin/env python3
"""
Research pipeline for the Whispering Lore items dataset (Phase 1 — Nordics).

Staged, non-destructive workflow: research batches are written to
archive/scripts/expansions/items/<batch>.json as full item objects. This script
validates them against the schema + integrity rules used by tests/items-data.test.js,
then either reports issues, stages a merged candidate, or applies the merge into
data/items.json with genuine bidirectional back-references.

Usage:
  python archive/scripts/research_items_phase1.py validate <batch.json>
      Check a batch file against all schema/integrity rules. Exit 0 if clean.
  python archive/scripts/research_items_phase1.py stage <batch.json>
      Validate, then write data/items.staged.json (current items + batch) for review.
  python archive/scripts/research_items_phase1.py apply <batch.json> [--dry-run]
      Validate, then merge into data/items.json and add back-references to
      creatures.json / stories.json. --dry-run prints what would change.
  python archive/scripts/research_items_phase1.py dedup <batch.json>
      Report slug/name/alias collisions against the current dataset.
"""

import json
import os
import re
import shutil
import sys
from datetime import date

BASE = os.path.dirname(os.path.abspath(__file__))
for _ in range(2):
    BASE = os.path.dirname(BASE)  # climb to project root
ROOT = BASE

ITEMS_PATH = os.path.join(ROOT, 'data', 'items.json')
CREATURES_PATH = os.path.join(ROOT, 'data', 'datasets', 'creatures.json')
STORIES_PATH = os.path.join(ROOT, 'data', 'datasets', 'stories.json')
GEO_REGIONS_PATH = os.path.join(ROOT, 'data', 'datasets', 'geo-regions.json')
GEO_COUNTRIES_PATH = os.path.join(ROOT, 'data', 'datasets', 'geo-countries.json')

SOURCE_TYPES = {'oral_tradition', 'literary', 'archaeological', 'secondary_scholarly'}
SOURCE_QUALITIES = {
    'academic', 'documented', 'expert', 'fair', 'good', 'poor',
    'primary', 'researched', 'verified', 'well-documented',
}
ALLOWED_TYPES = {
    'weapon', 'jewelry', 'ship', 'garment', 'tool',
    'household object', 'ritual object', 'rune stave',
    'musical instrument', 'other',
    'religious object', 'crown', 'cooking vessel', 'container',
}
REQUIRED_FIELDS = [
    'id', 'slug', 'name', 'country', 'region', 'culture', 'type',
    'description', 'source_type', 'source_quality', 'attested',
    'version', 'lastUpdated',
]


def load(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save(path, data):
    tmp = path + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    os.replace(tmp, path)


def backup(path):
    d = os.path.join(ROOT, 'data', 'backups')
    os.makedirs(d, exist_ok=True)
    stamp = date.today().strftime('%Y%m%d')
    name = os.path.basename(path)
    dst = os.path.join(d, f'{name}.research-{stamp}')
    shutil.copy2(path, dst)
    return dst


class Audit:
    def __init__(self):
        self.errors = []
        self.warnings = []

    def err(self, msg):
        self.errors.append(msg)

    def warn(self, msg):
        self.warnings.append(msg)

    @property
    def ok(self):
        return not self.errors

    def report(self):
        for w in self.warnings:
            print(f'  WARN  {w}')
        for e in self.errors:
            print(f'  ERROR {e}')
        print(f'  -> {len(self.errors)} error(s), {len(self.warnings)} warning(s)')


def validate_batch(batch, audit, items, creatures, stories, regions, countries,
                   backref=True):
    item_set = {i['slug'] for i in items}
    creature_set = {c['slug'] for c in creatures}
    story_set = {s['slug'] for s in stories}
    region_set = set(regions)
    country_set = set(countries)

    if not isinstance(batch, list):
        audit.err('batch is not an array')
        return
    if not batch:
        audit.err('batch is empty')
        return

    for idx, it in enumerate(batch):
        tag = f'[{idx}] {it.get("slug", "<no slug>")}'

        if not isinstance(it, dict):
            audit.err(f'{tag}: entry is not an object')
            continue

        for field in REQUIRED_FIELDS:
            if field not in it or it[field] in (None, ''):
                audit.err(f'{tag}: missing/empty required field {field}')

        slug = it.get('slug', '')
        if slug and not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
            audit.err(f'{tag}: slug not kebab-case: {slug}')
        if slug and slug in item_set:
            audit.err(f'{tag}: slug already exists in items.json')
        if slug:
            item_set.add(slug)

        if it.get('id') and any(i.get('id') == it['id'] for i in items):
            audit.err(f'{tag}: id already exists in items.json: {it["id"]}')

        if it.get('country') and it['country'] not in country_set:
            audit.err(f'{tag}: country not in geo-countries: {it["country"]}')
        if it.get('region') and it['region'] not in region_set:
            audit.err(f'{tag}: region not in geo-regions: {it["region"]}')

        if it.get('source_type') and it['source_type'] not in SOURCE_TYPES:
            audit.err(f'{tag}: bad source_type: {it["source_type"]}')
        if it.get('source_quality') and it['source_quality'] not in SOURCE_QUALITIES:
            audit.err(f'{tag}: bad source_quality: {it["source_quality"]}')
        if it.get('type') and it['type'] not in ALLOWED_TYPES:
            audit.err(f'{tag}: bad type: {it["type"]}')

        attested = it.get('attested', 'MISSING')
        if attested not in (True, False, None):
            audit.err(f'{tag}: attested must be true/false/null, got {attested!r}')

        for v in ('version', 'lastUpdated'):
            val = it.get(v)
            if val is not None and not isinstance(val, str):
                audit.err(f'{tag}: {v} not a string')
        lu = it.get('lastUpdated')
        if lu and not re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(lu)):
            audit.err(f'{tag}: lastUpdated not YYYY-MM-DD: {lu}')

        if 'search_terms' in it and not isinstance(it['search_terms'], list):
            audit.err(f'{tag}: search_terms not an array')

        ac = it.get('associated_creature')
        if ac and ac not in creature_set:
            audit.err(f'{tag}: associated_creature does not resolve: {ac}')

        for ref in it.get('related_creatures', []) or []:
            if ref not in creature_set:
                audit.err(f'{tag}: related_creature does not resolve: {ref}')

        for ref in it.get('featured_in_stories', []) or []:
            if ref not in story_set:
                audit.err(f'{tag}: featured_in_story does not resolve: {ref}')

        if 'aliases' in it and not isinstance(it['aliases'], list):
            audit.err(f'{tag}: aliases not an array')
        if 'keywords' in it and not isinstance(it['keywords'], list):
            audit.err(f'{tag}: keywords not an array')

        desc = it.get('description', '')
        if isinstance(desc, str) and len(desc) < 200:
            audit.warn(f'{tag}: description below 200-char hard floor ({len(desc)} chars); target ≥500')

    # Back-reference integrity (only when validating against live datasets)
    if backref:
        item_set = {i['slug'] for i in items} | {i['slug'] for i in batch}
        for c in creatures:
            for ref in c.get('related_items', []) or []:
                if ref not in item_set:
                    audit.err(f'creature {c["slug"]} -> item {ref} does not resolve')
        for s in stories:
            for ref in s.get('items', []) or []:
                if ref not in item_set:
                    audit.err(f'story {s["slug"]} -> item {ref} does not resolve')


def dedup_report(batch, items):
    item_names = {i['name'].lower(): i['slug'] for i in items}
    item_aliases = {}
    for i in items:
        for a in i.get('aliases', []) or []:
            item_aliases.setdefault(a.lower(), i['slug'])
    item_searches = {}
    for i in items:
        for t in i.get('search_terms', []) or []:
            item_searches.setdefault(t.lower(), i['slug'])

    hits = []
    for it in batch:
        name = (it.get('name') or '').lower()
        if name in item_names:
            hits.append((it.get('slug'), 'name', name, item_names[name]))
        for a in it.get('aliases', []) or []:
            if a.lower() in item_aliases:
                hits.append((it.get('slug'), 'alias', a.lower(), item_aliases[a.lower()]))
        for t in it.get('search_terms', []) or []:
            if t.lower() in item_searches:
                hits.append((it.get('slug'), 'search_term', t.lower(), item_searches[t.lower()]))
    return hits


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)

    cmd = sys.argv[1]
    batch_path = sys.argv[2]
    dry = '--dry-run' in sys.argv

    items = load(ITEMS_PATH)
    creatures = load(CREATURES_PATH)
    stories = load(STORIES_PATH)
    regions = load(GEO_REGIONS_PATH)
    countries = load(GEO_COUNTRIES_PATH)

    batch = load(batch_path)
    audit = Audit()

    if cmd == 'dedup':
        hits = dedup_report(batch, items)
        if hits:
            for slug, kind, val, target in hits:
                print(f'  COLLIDE {slug}: {kind} "{val}" -> existing {target}')
        else:
            print('  no dedup collisions')
        sys.exit(1 if hits else 0)

    if cmd == 'validate':
        validate_batch(batch, audit, items, creatures, stories, regions, countries)
        audit.report()
        sys.exit(0 if audit.ok else 1)

    if cmd == 'stage':
        validate_batch(batch, audit, items, creatures, stories, regions, countries)
        if not audit.ok:
            audit.report()
            sys.exit(1)
        staged = list(items) + list(batch)
        save(os.path.join(ROOT, 'data', 'items.staged.json'), staged)
        print(f'  staged {len(batch)} items -> data/items.staged.json (total {len(staged)})')
        sys.exit(0)

    if cmd == 'apply':
        validate_batch(batch, audit, items, creatures, stories, regions, countries)
        if not audit.ok:
            audit.report()
            sys.exit(1)

        print(f'  applying {len(batch)} items')
        if dry:
            print('  [dry-run] no files written')
            for it in batch:
                print(f'    + {it["slug"]} ({it["country"]}, {it["type"]})')
            sys.exit(0)

        backup(ITEMS_PATH)
        merged = list(items) + list(batch)
        save(ITEMS_PATH, merged)

        # Back-references: creature -> related_items
        cmap = {c['slug']: c for c in creatures}
        for it in batch:
            ac = it.get('associated_creature')
            if ac and ac in cmap:
                cmap[ac].setdefault('related_items', [])
                if it['slug'] not in cmap[ac]['related_items']:
                    cmap[ac]['related_items'].append(it['slug'])
            for ref in it.get('related_creatures', []) or []:
                if ref in cmap:
                    cmap[ref].setdefault('related_items', [])
                    if it['slug'] not in cmap[ref]['related_items']:
                        cmap[ref]['related_items'].append(it['slug'])
        backup(CREATURES_PATH)
        save(CREATURES_PATH, creatures)

        # Back-references: story -> items
        smap = {s['slug']: s for s in stories}
        for it in batch:
            for ref in it.get('featured_in_stories', []) or []:
                if ref in smap:
                    smap[ref].setdefault('items', [])
                    if it['slug'] not in smap[ref]['items']:
                        smap[ref]['items'].append(it['slug'])
        backup(STORIES_PATH)
        save(STORIES_PATH, stories)

        print(f'  merged -> data/items.json (total {len(merged)})')
        print('  back-references added to creatures.json / stories.json')
        print('  NOTE: rebuild shards + bump sw cache + rerun jest if applicable')
        sys.exit(0)

    print(f'unknown command: {cmd}')
    sys.exit(2)


if __name__ == '__main__':
    main()
