#!/usr/bin/env python3
"""Infer periods for stories missing them, based on type/region/source signals."""

import json
import shutil
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "datasets" / "stories.json"

stories = json.loads(DATA.read_text())

no_period = [s for s in stories if not s.get("period")]
print(f"Stories missing period: {len(no_period)}")

INFER_RULES = [
    # (condition, period)  — first match wins, ordered from specific→general
    # Source-based rules (strongest signal)
    ("source_contains_grimm", "19th century"),
    ("source_contains_perrault", "17th century"),
    ("source_contains_andersen", "19th century"),
    ("source_contains_jacobs", "19th century"),
    # Type-based rules (medium signal)
    ("type_creation-myth", "ancient"),
    ("type_ritual", "ancient"),
    ("type_deity", "ancient"),
    ("type_deities", "ancient"),
    ("type_hero", "ancient"),
    ("type_afterlife", "ancient"),
    ("type_mythical-being", "ancient"),
    ("type_sacred-place", "ancient"),
    ("type_ballad", "medieval"),
    ("type_romance", "medieval"),
    ("type_miracle", "medieval"),
    ("type_cultural-tradition", "medieval"),
    ("type_vision", "medieval"),
    ("type_maritime-legend", "early modern"),
    ("type_spirit", "traditional"),
    ("type_trickster", "traditional"),
    ("type_supernatural", "traditional"),
    ("type_adventure", "traditional"),
    # Type+region combined rules
    ("type_myth__region_North American", "ancient"),
    ("type_myth__region_African", "ancient"),
    ("type_myth__region_Pacific", "ancient"),
    ("type_myth__source_oral", "oral tradition"),
    ("type_myth__source_myth collection", "ancient"),
    ("type_legend__region_North American", "ancient"),
    ("type_legend__region_Nordic", "medieval"),
    ("type_legend__region_Swedish", "oral tradition"),
    ("type_legend__region_Pacific", "oral tradition"),
    ("type_folktale__region_African", "oral tradition"),
    ("type_folklore__region_African", "traditional"),
    ("type_folklore__region_Swedish", "oral tradition"),
    ("type_fairy-tale__region_Nordic", "modern"),
    ("type_historical-legend__region_Nordic", "medieval"),
    ("type_epic__region_African", "medieval"),
    ("type_legend__region_Middle Eastern", "early modern"),
    # Central Asian (most epics are medieval, folktales are traditional)
    ("type_epic__region_Central Asian", "medieval"),
    ("type_folktale__region_Central Asian", "traditional"),
    ("type_legend__region_Central Asian", "traditional"),
    ("type_historical-legend__region_Central Asian", "medieval"),
    # Middle Eastern (Arabian Nights / Shahnameh are medieval, Persian myths are ancient)
    ("type_epic__region_Middle Eastern", "medieval"),
    ("type_folktale__region_Middle Eastern", "medieval"),
    ("type_myth__region_Middle Eastern", "ancient"),
    ("type_folklore__region_Middle Eastern", "medieval"),
    # African legends with specific historical depth
    ("type_legend__region_African", "traditional"),
    # Pacific remaining folktales
    ("type_folktale__region_Pacific", "oral tradition"),
    # Belarus / Danish remaining
    ("type_legend__region_Belarus", "traditional"),
    ("type_folklore__region_Danish", "traditional"),
    # Region-based rules (weakest signal, general)
    ("region_North American", "ancient"),
]


def evaluate_rule(story, rule_name):
    """Check if a story matches a rule name."""
    t = story.get("type", "").strip()
    r = story.get("region", "").strip()
    src = story.get("source", "").lower()

    # Source contains
    if rule_name == "source_contains_grimm":
        return "grimm" in src
    if rule_name == "source_contains_perrault":
        return "perrault" in src
    if rule_name == "source_contains_andersen":
        return "andersen" in src or "hans christian" in src
    if rule_name == "source_contains_jacobs":
        return "jacobs" in src

    # Simple type match
    if rule_name.startswith("type_"):
        type_val = rule_name[5:]
        if "__" not in type_val:
            return t == type_val

    # Type+region match (format: type_X__region_Y)
    if "__region_" in rule_name:
        parts = rule_name.split("__region_")
        type_cond = parts[0][5:]  # remove "type_" prefix
        region_cond = parts[1]
        if t != type_cond:
            return False
        if "__source_" in region_cond:
            src_parts = region_cond.split("__source_")
            region_cond2 = src_parts[0]
            source_cond = src_parts[1]
            return r == region_cond2 and source_cond in src
        return r == region_cond

    # Region-only match
    if rule_name.startswith("region_"):
        region_val = rule_name[7:]
        return r == region_val

    return False


changed = 0
by_rule = Counter()

for s in no_period:
    for rule_name, period in INFER_RULES:
        if evaluate_rule(s, rule_name):
            s["period"] = period
            changed += 1
            by_rule[rule_name] += 1
            break

print(f"\nPeriods inferred: {changed}")
print("\nBy rule:")
for rule, count in by_rule.most_common():
    p = dict(INFER_RULES).get(rule, "?")
    print(f"  {rule:45s} → {p:15s} ({count})")

# Save backup
backup_path = DATA.with_suffix(".backup2.json")
if not backup_path.exists():
    shutil.copy2(DATA, backup_path)
    print(f"\nBackup saved to {backup_path}")

DATA.write_text(json.dumps(stories, indent=2, ensure_ascii=False))
print(f"Saved {len(stories)} stories to {DATA}")

remaining = [s for s in stories if not s.get("period")]
print(f"\nStill missing period: {len(remaining)}")
if remaining:
    regions = Counter(s.get("region", "?") for s in remaining)
    types = Counter(s.get("type", "?") for s in remaining)
    print("  By region:", dict(regions.most_common(10)))
    print("  By type:", dict(types.most_common(10)))
    print("Sample:")
    for s in remaining[:5]:
        print(f"    [{s.get('region','?')}] {s.get('title','?')} ({s.get('type','?')})")
