"""Build the slim creatures index consumed by the bestiary grid.

Reads the canonical master dataset (same source regenerate-shards.py uses)
and emits data/sharded/creatures/index.json with only the fields the grid,
facets, search, and related-lists need. Detail pages load full objects via
Shimmer.getItem(slug) on demand.

Usage: python3 archive/scripts/build-creatures-index.py
"""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MASTER = os.path.join(BASE, 'data', 'datasets', 'creatures.json')
OUT = os.path.join(BASE, 'data', 'sharded', 'creatures', 'index.json')
MANIFEST = os.path.join(BASE, 'data', 'sharded', 'manifest.json')

FIELDS = ('slug', 'name', 'type', 'country', 'region', 'description')


def main():
    with open(MASTER) as f:
        items = json.load(f)

    index = []
    seen = set()
    for item in items:
        slug = item.get('slug')
        assert slug, 'entry without slug'
        assert slug not in seen, 'duplicate slug in master: %s' % slug
        seen.add(slug)
        index.append({k: item.get(k) for k in FIELDS})

    index.sort(key=lambda c: (c.get('name') or '').lower())

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    with open(OUT, 'a') as f:
        f.write('\n')

    with open(MANIFEST) as f:
        manifest = json.load(f)
    expected = manifest['creatures']['total']
    assert len(index) == expected, \
        'index count %d != manifest total %d' % (len(index), expected)

    size = os.path.getsize(OUT)
    print('creatures index: %d entries, %s bytes, matches manifest total %d' % (
        len(index), size, expected))


if __name__ == '__main__':
    main()