"""Build the slim stories index consumed by the stories grid.

Reads the canonical master dataset (same source regenerate-shards.py uses)
and emits data/sharded/stories/index.json with only the fields the grid,
facets, search, and recommendations need. Detail pages load full objects via
Shimmer.getItem(slug) on demand.

Usage: python3 archive/scripts/build-stories-index.py
"""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MASTER = os.path.join(BASE, 'data', 'datasets', 'stories.json')
OUT = os.path.join(BASE, 'data', 'sharded', 'stories', 'index.json')
MANIFEST = os.path.join(BASE, 'data', 'sharded', 'manifest.json')

# tribe/themes/lastUpdated are optional (nullable in master)
REQUIRED = ('slug', 'title', 'summary', 'country', 'region', 'type')
FIELDS = REQUIRED + ('tribe', 'themes', 'lastUpdated')


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
        for k in REQUIRED:
            assert entry[k], '%s missing required %s' % (slug, k)
        index.append(entry)

    index.sort(key=lambda c: (c.get('title') or '').lower())

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w') as f:
        json.dump(index, f, indent=2, ensure_ascii=False)
    with open(OUT, 'a') as f:
        f.write('\n')

    with open(MANIFEST) as f:
        manifest = json.load(f)
    expected = manifest['stories']['total']
    assert len(index) == expected, \
        'index count %d != manifest total %d' % (len(index), expected)

    size = os.path.getsize(OUT)
    print('stories index: %d entries, %s bytes, matches manifest total %d' % (
        len(index), size, expected))


if __name__ == '__main__':
    main()