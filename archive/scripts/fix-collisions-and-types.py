#!/usr/bin/env python3
"""Fix cross-dataset slug collisions + source_type mismatches."""

import json
from collections import Counter

BASE = "/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore"
DATA = f"{BASE}/data/datasets"

def load(fn):
    with open(f"{DATA}/{fn}") as f:
        return json.load(f)

def save(fn, data):
    with open(f"{DATA}/{fn}", "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

creatures = load("creatures.json")
stories = load("stories.json")
creature_by_slug = {c["slug"]: c for c in creatures}
creature_by_id = {c["id"]: c for c in creatures}

creature_slugs = {c["slug"] for c in creatures}

# ── FIX 1: Cross-dataset slug collisions ───────────────────────
collisions = sorted(creature_slugs & {s["slug"] for s in stories})
slug_rename_map = {}
for slug in collisions:
    new_slug = f"{slug}-story"
    # Safety check: ensure new slug doesn't collide with anything
    assert new_slug not in creature_slugs, f"New slug {new_slug} collides with creature!"
    assert new_slug not in {s["slug"] for s in stories}, f"New slug {new_slug} already exists as story!"
    slug_rename_map[slug] = new_slug

# Rename story slugs
rename_count = 0
for s in stories:
    if s["slug"] in slug_rename_map:
        old = s["slug"]
        s["slug"] = slug_rename_map[old]
        rename_count += 1
        if rename_count <= 5:
            print(f"  Story '{s['title']}' slug: '{old}' -> '{s['slug']}'")

print(f"FIX 1: {rename_count} story slugs renamed to avoid creature collisions")

# Update creature stories arrays that reference renamed slugs
update_count = 0
for c in creatures:
    updated = False
    new_stories = []
    for ref in c.get("stories", []):
        if ref in slug_rename_map:
            new_stories.append(slug_rename_map[ref])
            updated = True
        else:
            new_stories.append(ref)
    if updated:
        c["stories"] = new_stories
        update_count += 1

print(f"FIX 1b: {update_count} creature stories arrays updated with new slugs")

# ── FIX 2: Story source_type alignment with creatures ─────────
TYPE_PRIORITY = ["oral_tradition", "literary", "archaeological", "syncretic", "unknown"]
fix2_count = 0
for s in stories:
    creature_types = []
    for c_slug in s.get("creatures", []):
        creature = creature_by_slug.get(c_slug)
        if creature:
            ct = creature.get("source_type", "unknown")
            if ct:
                creature_types.append(ct)

    if not creature_types:
        continue  # No creatures to compare against

    st_type = s.get("source_type", "")

    # Count types
    type_counts = Counter(creature_types)

    # Determine majority type
    majority_type = type_counts.most_common(1)[0][0]

    # If story type differs from majority creature type, align it
    if st_type != majority_type:
        # Special case: if there's a tie, don't change
        if len(type_counts) > 1 and type_counts.most_common(1)[0][1] == type_counts.most_common(2)[1][1]:
            continue  # tie — skip

        # Only update if majority is clear (>50%)
        total = len(creature_types)
        majority_count = type_counts.most_common(1)[0][1]
        if majority_count > total / 2:
            s["source_type"] = majority_type
            fix2_count += 1
            if fix2_count <= 5:
                print(f"  Story '{s['title']}': '{st_type}' -> '{majority_type}' (creatures: {dict(type_counts)})")

print(f"FIX 2: {fix2_count} story source_type values aligned with creature majority")

# ── Save ────────────────────────────────────────────────────────
save("stories.json", stories)
print("\nAll fixes saved!")
