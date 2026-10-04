"""Build the slim items index consumed by the items grid.

Reads the canonical master dataset (data/items.json) and emits
data/sharded/items/index.json with only the fields the grid, facets, search,
and sort need. Detail views load full objects via Shimmer.getItem(slug).

Usage: python3 archive/scripts/build-items-index.py
"""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MASTER = os.path.join(BASE, 'data', 'items.json')
OUT = os.path.join(BASE, 'data', 'sharded', 'items', 'index.json')
MANIFEST = os.path.join(BASE, 'data', 'sharded', 'manifest.json')

# lastUpdated/description are optional-ish (lastUpdated nullable in master)
REQUIRED = ('slug', 'name', 'type', 'country', 'region')
FIELDS = REQUIRED + ('lastUpdated', 'description')


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
        entry = {k: item.get(k, '') for k in FIELDS}
        entry['lastUpdated'] = str(item.get('lastUpdated', '') or '')
        for k in REQUIRED:
            assert entry[k], '%s missing required %s' % (slug, k)
        index.append(entry)

    index.sort(key=lambda c: (c.get('name') or '').lower())

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    with open(OUT, 'a') as f:
        f.write('\n')

    with open(MANIFEST) as f:
        manifest = json.load(f)
    expected = manifest['items']['total']
    assert len(index) == expected, \
        'index count %d != manifest total %d' % (len(index), expected)

    size = os.path.getsize(OUT)
    print('items index: %d entries, %s bytes, matches manifest total %d' % (
        len(index), size, expected))


if __name__ == '__main__':
    main()