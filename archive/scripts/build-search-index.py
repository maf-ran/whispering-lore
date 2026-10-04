"""Build the lightweight all-types search index consumed by search.html.

Same pattern as build-creatures-index.py: reads the canonical masters and
emits data/sharded/search-index.json with just the fields SearchViewer scores
on (name/title, aliases, search_terms, country, region, type, keywords) plus a
short excerpt of the body text for scoring and display.

Usage: python3 archive/scripts/build-search-index.py
"""
import json
import os

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(BASE, 'data', 'sharded', 'search-index.json')
EXCERPT = 320

MASTERS = {
    'creatures': ('data', 'datasets', 'creatures.json'),
    'stories': ('data', 'datasets', 'stories.json'),
    'items': ('data', 'items.json'),
}
NAME_KEYS = {'creatures': 'name', 'stories': 'title', 'items': 'name'}
BODY_KEYS = {'creatures': 'description', 'stories': 'summary', 'items': 'description'}


def entry_out(kind, item):
    slug = item.get('slug')
    assert slug, 'entry without slug'
    name = item.get(NAME_KEYS[kind])
    assert name, '%s missing name/title for %s' % (kind, slug)
    keywords = item.get('keywords') or []
    if not isinstance(keywords, list):
        keywords = [keywords]
    body = item.get(BODY_KEYS[kind]) or ''
    out = {
        'slug': slug,
        'name': name,
        'aliases': [str(a) for a in (item.get('aliases') or [])],
        'search_terms': [str(s).lower() for s in (item.get('search_terms') or [])],
        'keywords': [str(k).lower() for k in keywords],
        'country': item.get('country') or '',
        'region': item.get('region') or '',
        'type': item.get('type') or '',
        'excerpt': ' '.join(body.split())[:EXCERPT],
    }
    if kind == 'stories':
        out['title'] = name
        out['creatures'] = [str(c) for c in (item.get('creatures') or [])]
    return out


def load(path):
    with open(path) as f:
        return json.load(f)


def main():
    result = {}
    counts = {}
    for kind, rel in MASTERS.items():
        items = load(os.path.join(BASE, *rel))
        seen = set()
        out = []
        for item in items:
            e = entry_out(kind, item)
            assert e['slug'] not in seen, 'duplicate slug in %s: %s' % (kind, e['slug'])
            seen.add(e['slug'])
            out.append(e)
        out.sort(key=lambda e: (e['name'] or e['title'] or '').lower())
        result[kind] = out
        counts[kind] = len(out)

    payload = {
        'meta': {'counts': counts, 'excerpt': EXCERPT},
        'creatures': result['creatures'],
        'stories': result['stories'],
        'items': result['items'],
    }
    with open(OUT, 'w') as f:
        json.dump(payload, f, indent=1, ensure_ascii=False)
        f.write('\n')
    print('search index written: %d creatures, %d stories, %d items -> %s'
          % (counts['creatures'], counts['stories'], counts['items'], OUT))


if __name__ == '__main__':
    main()