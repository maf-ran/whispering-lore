import os, json, re
from collections import defaultdict

BASE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASETS = os.path.join(BASE, 'data', 'datasets')
SHARDED = os.path.join(BASE, 'data', 'sharded')

def build_region_map(shard_dir):
    mapping = {}
    if not os.path.isdir(shard_dir):
        return mapping
    for fname in os.listdir(shard_dir):
        if not fname.endswith('.json'):
            continue
        fpath = os.path.join(shard_dir, fname)
        try:
            with open(fpath) as f:
                data = json.load(f)
            if data:
                region = data[0].get('region', 'Unknown')
                mapping[region] = fname
        except Exception:
            pass
    return mapping

def regen(master_name, entity_type):
    master_path = os.path.join(DATASETS, master_name)
    base_shard = os.path.join(SHARDED, entity_type)

    with open(master_path) as f:
        items = json.load(f)

    region_shard_dir = os.path.join(base_shard, 'by-region')
    slug_shard_dir = os.path.join(base_shard, 'by-slug')

    region_map = build_region_map(region_shard_dir)

    by_region = defaultdict(list)
    by_slug = defaultdict(list)

    for item in items:
        region = item.get('region', 'Unknown')
        by_region[region].append(item)
        slug = item.get('slug', '')
        if slug:
            stripped = re.sub(r'^(the|a|an)-', '', slug)
            first_char = stripped[0].lower() if stripped else ''
            if 'a' <= first_char <= 'z':
                by_slug[first_char].append(item)

    os.makedirs(region_shard_dir, exist_ok=True)
    for region, entries in by_region.items():
        fname = region_map.get(region)
        if not fname:
            fname = region.lower().replace(' ', '-').replace('/', '-') + '.json'
        fpath = os.path.join(region_shard_dir, fname)
        with open(fpath, 'w') as f:
            json.dump(entries, f, indent=2, ensure_ascii=False)
        # Ensure trailing newline
        with open(fpath, 'a') as f:
            f.write('\n')

    os.makedirs(slug_shard_dir, exist_ok=True)
    for char in 'abcdefghijklmnopqrstuvwxyz':
        entries = by_slug.get(char, [])
        fpath = os.path.join(slug_shard_dir, f'{char}.json')
        with open(fpath, 'w') as f:
            json.dump(entries, f, indent=2, ensure_ascii=False)
        with open(fpath, 'a') as f:
            f.write('\n')

    print(f'{entity_type}: {len(items)} entries, {len(by_region)} region shards, {len(by_slug)} slug shards')
    return items, by_region

def regen_manifest(creatures, creature_regions, stories, story_regions):
    creature_total = len(creatures)
    creature_region_counts = {r: len(items) for r, items in creature_regions.items()}
    creature_countries = defaultdict(int)
    for c in creatures:
        country = c.get('country', 'Unknown')
        creature_countries[country] += 1

    story_total = len(stories)
    story_region_counts = {r: len(items) for r, items in story_regions.items()}
    story_countries = defaultdict(int)
    for s in stories:
        country = s.get('country', 'Unknown')
        story_countries[country] += 1

    manifest = {
        "creatures": {
            "total": creature_total,
            "regions": dict(sorted(creature_region_counts.items())),
            "countries": dict(sorted(creature_countries.items()))
        },
        "stories": {
            "total": story_total,
            "regions": dict(sorted(story_region_counts.items())),
            "countries": dict(sorted(story_countries.items()))
        }
    }

    manifest_path = os.path.join(SHARDED, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    with open(manifest_path, 'a') as f:
        f.write('\n')
    print(f'manifest: creatures={creature_total}, stories={story_total}')
    return manifest

if __name__ == '__main__':
    print('=== Regenerating creature shards ===')
    creatures, creature_regions = regen('creatures.json', 'creatures')

    print('\n=== Regenerating story shards ===')
    stories, story_regions = regen('stories.json', 'stories')

    print('\n=== Regenerating manifest ===')
    regen_manifest(creatures, creature_regions, stories, story_regions)

    print('\n=== Done ===')
