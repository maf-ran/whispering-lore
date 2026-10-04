#!/usr/bin/env python3
"""Comprehensive cross-reference audit for Whispering Lore datasets."""

import json
import sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
DATA = BASE / "data" / "datasets"

pass_count = 0
fail_count = 0


def ok(label, detail=""):
    global pass_count
    pass_count += 1
    if detail:
        print(f"  PASS [{label}] {detail}")
    else:
        print(f"  PASS [{label}]")


def fail(label, detail=""):
    global fail_count
    fail_count += 1
    if detail:
        print(f"  FAIL [{label}] {detail}")
    else:
        print(f"  FAIL [{label}]")


def load_json(path):
    with open(path) as f:
        return json.load(f)


print("=" * 72)
print("LOADING DATASETS")
print("=" * 72)

creatures = load_json(DATA / "creatures.json")
stories = load_json(DATA / "stories.json")
countries = load_json(DATA / "geo-countries.json")
regions = load_json(DATA / "geo-regions.json")
manifest = load_json(BASE / "data" / "sharded" / "manifest.json")

country_set = {c.lower() for c in countries}
region_set = {r.lower() for r in regions}

creature_by_slug = {c["slug"]: c for c in creatures}
story_by_slug = {s["slug"]: s for s in stories}
story_by_id = {s["id"]: s for s in stories}

print(f"  Creatures: {len(creatures)}")
print(f"  Stories:   {len(stories)}")
print(f"  Countries: {len(countries)}")
print(f"  Regions:   {len(regions)}")

print()
print("=" * 72)
print("CHECK 1: Story -> Creature slug resolution")
print("=" * 72)

total_refs = 0
broken_refs = []
for s in stories:
    for slug in s.get("creatures", []):
        total_refs += 1
        if slug not in creature_by_slug:
            broken_refs.append((s["title"], slug))

if not broken_refs:
    ok(f"{total_refs} refs, 0 broken")
else:
    fail(f"{total_refs} refs, {len(broken_refs)} broken")
    for title, slug in broken_refs[:20]:
        print(f"    Story '{title}' -> broken slug '{slug}'")
    if len(broken_refs) > 20:
        print(f"    ... and {len(broken_refs) - 20} more")

print()
print("=" * 72)
print("CHECK 2: Creature -> Story reference resolution")
print("=" * 72)

total_cref_refs = 0
broken_cref = []
for c in creatures:
    for story_ref in c.get("stories", []):
        total_cref_refs += 1
        if story_ref not in story_by_slug and story_ref not in story_by_id:
            broken_cref.append((c["name"], story_ref))

if not broken_cref:
    ok(f"{total_cref_refs} refs, 0 broken")
else:
    fail(f"{total_cref_refs} refs, {len(broken_cref)} broken")
    for name, ref in broken_cref[:20]:
        print(f"    Creature '{name}' -> broken ref '{ref}'")
    if len(broken_cref) > 20:
        print(f"    ... and {len(broken_cref) - 20} more")

print()
print("=" * 72)
print("CHECK 3: Related creature slug resolution")
print("=" * 72)

total_rel = 0
broken_rel = []
for c in creatures:
    for slug in c.get("related", []):
        total_rel += 1
        if slug not in creature_by_slug:
            broken_rel.append((c["name"], slug))

if not broken_rel:
    ok(f"{total_rel} refs, 0 broken")
else:
    fail(f"{total_rel} refs, {len(broken_rel)} broken")
    for name, slug in broken_rel[:20]:
        print(f"    Creature '{name}' -> broken related slug '{slug}'")
    if len(broken_rel) > 20:
        print(f"    ... and {len(broken_rel) - 20} more")

print()
print("=" * 72)
print("CHECK 4: Country validation (all datasets)")
print("=" * 72)

bad_creature_countries = []
for c in creatures:
    co = c.get("country", "")
    if co and co.lower() not in country_set:
        bad_creature_countries.append((c["name"], co, "creature"))

bad_story_countries = []
for s in stories:
    co = s.get("country", "")
    if co and co.lower() not in country_set:
        bad_story_countries.append((s["title"], co, "story"))

total_bad_countries = len(bad_creature_countries) + len(bad_story_countries)
if total_bad_countries == 0:
    ok("0 invalid countries across creatures and stories")
else:
    fail(f"{total_bad_countries} invalid countries")
    for name, co, src in (bad_creature_countries + bad_story_countries)[:20]:
        print(f"    {src.title()} '{name}' -> unknown country '{co}'")
    if total_bad_countries > 20:
        print(f"    ... and {total_bad_countries - 20} more")

print()
print("=" * 72)
print("CHECK 5: Region validation (all datasets)")
print("=" * 72)

bad_creature_regions = []
for c in creatures:
    r = c.get("region", "")
    if r and r.lower() not in region_set:
        bad_creature_regions.append((c["name"], r, "creature"))

bad_story_regions = []
for s in stories:
    r = s.get("region", "")
    if r and r.lower() not in region_set:
        bad_story_regions.append((s["title"], r, "story"))

total_bad_regions = len(bad_creature_regions) + len(bad_story_regions)
if total_bad_regions == 0:
    ok("0 invalid regions across creatures and stories")
else:
    fail(f"{total_bad_regions} invalid regions")
    for name, r, src in (bad_creature_regions + bad_story_regions)[:20]:
        print(f"    {src.title()} '{name}' -> unknown region '{r}'")
    if total_bad_regions > 20:
        print(f"    ... and {total_bad_regions - 20} more")

print()
print("=" * 72)
print("CHECK 6: Slug uniqueness")
print("=" * 72)

creature_slugs = [c["slug"] for c in creatures]
story_slugs = [s["slug"] for s in stories]

from collections import Counter

creature_dupes = {s: n for s, n in Counter(creature_slugs).items() if n > 1}
story_dupes = {s: n for s, n in Counter(story_slugs).items() if n > 1}

# Cross-dataset slug conflict
slug_overlap = set(creature_slugs) & set(story_slugs)

if not creature_dupes:
    ok("No duplicate creature slugs")
else:
    fail(f"{len(creature_dupes)} duplicate creature slugs")
    for s, n in creature_dupes.items():
        print(f"    Slug '{s}' appears {n} times")

if not story_dupes:
    ok("No duplicate story slugs")
else:
    fail(f"{len(story_dupes)} duplicate story slugs")
    for s, n in story_dupes.items():
        print(f"    Slug '{s}' appears {n} times")

if slug_overlap:
    fail(f"{len(slug_overlap)} slug(s) used in both creatures and stories")
    for s in sorted(slug_overlap)[:10]:
        print(f"    Slug '{s}' in both datasets")
    if len(slug_overlap) > 10:
        print(f"    ... and {len(slug_overlap) - 10} more")
else:
    ok("No slug overlap between datasets")

print()
print("=" * 72)
print("CHECK 7: ID uniqueness")
print("=" * 72)

creature_ids = [c["id"] for c in creatures]
story_ids = [s["id"] for s in stories]

creature_id_dupes = {i: n for i, n in Counter(creature_ids).items() if n > 1}
story_id_dupes = {i: n for i, n in Counter(story_ids).items() if n > 1}
id_overlap = set(creature_ids) & set(story_ids)

if not creature_id_dupes:
    ok("No duplicate creature IDs")
else:
    fail(f"{len(creature_id_dupes)} duplicate creature IDs")
    for i, n in creature_id_dupes.items():
        print(f"    ID '{i}' appears {n} times")

if not story_id_dupes:
    ok("No duplicate story IDs")
else:
    fail(f"{len(story_id_dupes)} duplicate story IDs")
    for i, n in story_id_dupes.items():
        print(f"    ID '{i}' appears {n} times")

if id_overlap:
    fail(f"{len(id_overlap)} ID(s) used in both creatures and stories")
    for i in sorted(id_overlap)[:10]:
        print(f"    ID '{i}' in both datasets")
    if len(id_overlap) > 10:
        print(f"    ... and {len(id_overlap) - 10} more")
else:
    ok("No ID overlap between datasets")

print()
print("=" * 72)
print("CHECK 8: Source type validity")
print("=" * 72)

VALID_CREATURE_SOURCE_TYPES = {"oral_tradition", "literary", "archaeological", "syncretic", "unknown"}
VALID_STORY_SOURCE_TYPES = {"oral_tradition", "literary", "unknown"}

bad_creature_st = []
for c in creatures:
    st = c.get("source_type", "")
    if st not in VALID_CREATURE_SOURCE_TYPES:
        bad_creature_st.append((c["name"], st))

bad_story_st = []
for s in stories:
    st = s.get("source_type", "")
    if st not in VALID_STORY_SOURCE_TYPES:
        bad_story_st.append((s["title"], st))

total_bad_st = len(bad_creature_st) + len(bad_story_st)
if total_bad_st == 0:
    ok("All source_type values valid")
else:
    fail(f"{total_bad_st} invalid source_type values")
    for name, st in (bad_creature_st + bad_story_st)[:20]:
        print(f"    '{name}' -> invalid source_type '{st}'")
    if total_bad_st > 20:
        print(f"    ... and {total_bad_st - 20} more")

print()
print("=" * 72)
print("CHECK 9: Source quality validity")
print("=" * 72)

VALID_SOURCE_QUALITY = {"expert", "good", "fair", "poor", "unknown",
                        "verified", "researched", "excellent", "primary", "well-documented"}

bad_sq = []
for c in creatures:
    sq = c.get("source_quality", "")
    if sq not in VALID_SOURCE_QUALITY:
        bad_sq.append((c["name"], sq, "creature"))

for s in stories:
    sq = s.get("source_quality", "")
    if sq not in VALID_SOURCE_QUALITY:
        bad_sq.append((s["title"], sq, "story"))

if not bad_sq:
    ok("All source_quality values valid")
else:
    fail(f"{len(bad_sq)} invalid source_quality values")
    for name, sq, src in bad_sq[:20]:
        print(f"    {src.title()} '{name}' -> invalid source_quality '{sq}'")
    if len(bad_sq) > 20:
        print(f"    ... and {len(bad_sq) - 20} more")

print()
print("=" * 72)
print("CHECK 10: Required field completeness")
print("=" * 72)

CREATURE_REQUIRED = {
    "name", "slug", "description", "region", "country",
    "type", "source_quality", "source_type", "version",
    "lastUpdated", "related", "stories"
}

STORY_REQUIRED = {
    "title", "slug", "summary", "country", "region",
    "source", "source_quality", "source_type", "version",
    "lastUpdated"
}

missing_creature_fields = []
for c in creatures:
    missing = CREATURE_REQUIRED - set(c.keys())
    if missing:
        missing_creature_fields.append((c.get("name", "UNKNOWN"), sorted(missing)))

missing_story_fields = []
for s in stories:
    missing = STORY_REQUIRED - set(s.keys())
    if missing:
        missing_story_fields.append((s.get("title", "UNKNOWN"), sorted(missing)))

total_missing = len(missing_creature_fields) + len(missing_story_fields)
if total_missing == 0:
    ok("All creatures and stories have required fields")
else:
    fail(f"{total_missing} entries missing required fields")
    for name, fields in (missing_creature_fields + missing_story_fields)[:20]:
        print(f"    '{name}' missing: {fields}")
    if total_missing > 20:
        print(f"    ... and {total_missing - 20} more")

print()
print("=" * 72)
print("CHECK 11: living_tradition field check")
print("=" * 72)

missing_lt = [c["name"] for c in creatures if "living_tradition" not in c]
invalid_lt = [(c["name"], c["living_tradition"]) for c in creatures
              if "living_tradition" in c and c["living_tradition"] is not None
              and not isinstance(c["living_tradition"], bool)]

total_lt_issues = len(missing_lt) + len(invalid_lt)
if total_lt_issues == 0:
    ok("All creatures have living_tradition (boolean or null)")
else:
    fail(f"{total_lt_issues} living_tradition issues")
    for name in missing_lt[:10]:
        print(f"    '{name}' -> missing living_tradition")
    for name, val in invalid_lt[:10]:
        print(f"    '{name}' -> invalid living_tradition value: {val}")
    if total_lt_issues > 20:
        print(f"    ... and {total_lt_issues - 20} more")

print()
print("=" * 72)
print("CHECK 12: fun_fact_generated consistency")
print("=" * 72)

ffg_true = [c["name"] for c in creatures if c.get("fun_fact_generated") is True]
if ffg_true:
    fail(f"{len(ffg_true)} creatures still have fun_fact_generated: true")
    for name in ffg_true[:20]:
        print(f"    '{name}'")
    if len(ffg_true) > 20:
        print(f"    ... and {len(ffg_true) - 20} more")
else:
    ok("0 creatures with fun_fact_generated: true")

print()
print("=" * 72)
print("CHECK 13: Manifest validation")
print("=" * 72)

manifest_creatures = manifest.get("creatures", {})
manifest_stories = manifest.get("stories", {})

mc = isinstance(manifest_creatures, dict)
ms = isinstance(manifest_stories, dict)

creature_total_ok = True
story_total_ok = True
creature_region_ok = True
story_region_ok = True

if mc:
    m_creature_count = manifest_creatures.get("total")
    if m_creature_count is not None and m_creature_count != len(creatures):
        creature_total_ok = False
        fail(f"Creature total mismatch: manifest={m_creature_count}, actual={len(creatures)}")
    else:
        ok(f"Creature total matches: {len(creatures)}")

    # Check region counts if present
    m_regions = manifest_creatures.get("regions", {})
    if m_regions:
        actual_region_counts = Counter(c["region"] for c in creatures if c.get("region"))
        mismatches = []
        for r, m_count in m_regions.items():
            a_count = actual_region_counts.get(r, 0)
            if a_count != m_count:
                mismatches.append((r, m_count, a_count))
        if mismatches:
            creature_region_ok = False
            fail(f"{len(mismatches)} creature region count mismatch(es)")
            for r, m, a in mismatches[:10]:
                print(f"    Region '{r}': manifest={m}, actual={a}")
            if len(mismatches) > 10:
                print(f"    ... and {len(mismatches) - 10} more")
        else:
            ok("Creature region counts match")
    else:
        ok("No creature region breakdown in manifest (skipped)")
else:
    fail("Manifest creatures field is not a dict")

if ms:
    m_story_count = manifest_stories.get("total")
    if m_story_count is not None and m_story_count != len(stories):
        story_total_ok = False
        fail(f"Story total mismatch: manifest={m_story_count}, actual={len(stories)}")
    else:
        ok(f"Story total matches: {len(stories)}")

    m_story_regions = manifest_stories.get("regions", {})
    if m_story_regions:
        actual_story_regions = Counter(s["region"] for s in stories if s.get("region"))
        mismatches = []
        for r, m_count in m_story_regions.items():
            a_count = actual_story_regions.get(r, 0)
            if a_count != m_count:
                mismatches.append((r, m_count, a_count))
        if mismatches:
            story_region_ok = False
            fail(f"{len(mismatches)} story region count mismatch(es)")
            for r, m, a in mismatches[:10]:
                print(f"    Region '{r}': manifest={m}, actual={a}")
            if len(mismatches) > 10:
                print(f"    ... and {len(mismatches) - 10} more")
        else:
            ok("Story region counts match")
    else:
        ok("No story region breakdown in manifest (skipped)")
else:
    fail("Manifest stories field is not a dict")

print()
print("=" * 72)
print("CHECK 14: Cross-dataset slug consistency (bidirectional)")
print("=" * 72)

broken_links = []
for s in stories:
    s_slug = s["slug"]
    for c_slug in s.get("creatures", []):
        creature = creature_by_slug.get(c_slug)
        if creature:
            creature_stories = creature.get("stories", [])
            if s_slug not in creature_stories and s["id"] not in creature_stories:
                broken_links.append((s["title"], s_slug, creature["name"], c_slug))

if not broken_links:
    ok(f"All {total_refs} story->creature refs have corresponding creature->story ref")
else:
    fail(f"{len(broken_links)} broken bidirectional links")
    for st_title, st_slug, cr_name, cr_slug in broken_links[:20]:
        print(f"    Story '{st_title}' references '{cr_slug}' but creature '{cr_name}' lacks story ref")
    if len(broken_links) > 20:
        print(f"    ... and {len(broken_links) - 20} more")

print()
print("=" * 72)
print("CHECK 15: Story source_type vs creature source_type consistency")
print("=" * 72)

consistent = 0
inconsistent = 0
story_counts = {}
for s in stories:
    st_type = s.get("source_type", "")
    creature_types = set()
    for c_slug in s.get("creatures", []):
        creature = creature_by_slug.get(c_slug)
        if creature:
            creature_types.add(creature.get("source_type", ""))
    if len(creature_types) == 0:
        continue
    if len(creature_types) == 1 and st_type in creature_types:
        consistent += 1
    else:
        inconsistent += 1
        story_counts[s["title"]] = {"story_type": st_type, "creature_types": sorted(creature_types)}

total_linked = consistent + inconsistent
if total_linked == 0:
    ok("No linked stories to check")
else:
    print(f"  Consistent: {consistent}/{total_linked}")
    print(f"  Inconsistent: {inconsistent}/{total_linked}")
    if inconsistent > 0:
        for title, info in list(story_counts.items())[:10]:
            print(f"    Story '{title}': type={info['story_type']}, creature types={info['creature_types']}")
        if len(story_counts) > 10:
            print(f"    ... and {len(story_counts) - 10} more")
        fail(f"{inconsistent} inconsistent story-creature type pairs (informational)")
    else:
        ok("All linked stories have consistent source_type with their creatures")

print()
print("=" * 72)
print("CHECK 16: Empty field audit")
print("=" * 72)

PLACEHOLDER_DESCS = {"not documented", ""}
PLACEHOLDER_OTHER = {"not documented", ""}

target_fields = [
    "description",
    "appearance",
    "behavior",
    "habitat",
    "cultural_significance",
]

empty_counts = {}
for field in target_fields:
    count = sum(
        1 for c in creatures
        if c.get(field, "").strip().lower() in {"not documented", ""}
    )
    empty_counts[field] = count

fun_fact_empty = sum(
    1 for c in creatures
    if not c.get("fun_fact") or c["fun_fact"].strip().lower() in {"not documented", ""}
)
empty_counts["fun_fact"] = fun_fact_empty

total_empty = sum(empty_counts.values())
if total_empty == 0:
    ok("No empty/placeholder fields")
else:
    fail(f"{total_empty} empty/placeholder fields found")
    for field, count in empty_counts.items():
        print(f"    {field}: {count} empty/placeholder")

print()
print("=" * 72)
print("CHECK 17: Story creature count distribution")
print("=" * 72)

story_distro = Counter()
for s in stories:
    n = len(s.get("creatures", []))
    story_distro[n] += 1

creature_distro = Counter()
for c in creatures:
    n = len(c.get("stories", []))
    creature_distro[n] += 1

print("  Stories by creature count:")
for n in sorted(story_distro):
    print(f"    {n} creatures: {story_distro[n]} stories")

print("  Creatures by story count:")
for n in sorted(creature_distro):
    print(f"    {n} stories: {creature_distro[n]} creatures")

ok("Distribution computed")

print()
print("=" * 72)
print("SUMMARY")
print("=" * 72)
print(f"  PASS: {pass_count}")
print(f"  FAIL: {fail_count}")
print(f"  TOTAL: {pass_count + fail_count}")

if fail_count == 0:
    print("\n  ALL CHECKS PASSED")
    sys.exit(0)
else:
    print(f"\n  {fail_count} CHECK(S) FAILED")
    sys.exit(1)
