#!/usr/bin/env python3
"""Validate stories.json for data quality issues.

Checks: period completeness, type normalization, period normalization,
single-source count, field consistency.
"""

import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "datasets" / "stories.json"

stories = json.loads(DATA.read_text())
issues = []

# --- 1. Period completeness ---
no_period = [s for s in stories if not s.get("period")]
period_empty = [s for s in stories if s.get("period") and s["period"].strip() == ""]
issues.append(f"Missing period field: {len(no_period)} stories")
issues.append(f"Empty period string: {len(period_empty)} stories")

# --- 2. Period normalization ---
period_counts = Counter(s.get("period", "") for s in stories)
# Normalize: lowercase for comparison
PERIOD_NORMALIZE = {
    "oral tradition": "oral tradition",
    "oral tradition (ancient)": "oral tradition",
    "ancient oral tradition": "oral tradition",
    "traditional (ancient origins, oral tradition)": "traditional",
    "mythological": "ancient",
    "pre-columbian": "pre-columbian",
    "pre-colonial": "pre-colonial",
    "colonial era": "colonial era",
    "folklore": "oral tradition",
    "unknown": "",
}
# Find period variants that should be normalized
periods_seen = {}
period_normalize_count = 0
for s in stories:
    p = s.get("period", "").strip()
    if not p:
        continue
    pl = p.lower()
    target = PERIOD_NORMALIZE.get(pl)
    if target and p.lower() != p:
        period_normalize_count += 1
    elif target is None and pl not in ("ancient", "medieval", "oral tradition", "traditional",
                                        "19th century", "18th century", "17th century",
                                        "16th century", "15th century", "12th century",
                                         "pre-columbian", "pre-colonial", "colonial era",
                                        "early modern", "modern", "17th century", "20th century",
                                        "1888", "1901", "1812", "1910", "1907", "1843", "1912",
                                        "edo period", "han dynasty", "ancient rome (8 ad)"):
        if pl not in periods_seen:
            periods_seen[pl] = 0
            issues.append(f"  Unrecognized period: '{p}'")

issues.append(f"Period capitalization variants needing normalize: {period_normalize_count}")

# --- 3. Type normalization ---
TYPE_MAP = {
    "fairy-tale": "fairy-tale",
    "fairy tale": "fairy-tale",
    "folk-tale": "folktale",
    "folk tale": "folktale",
    "folktale": "folktale",
    "creation-myth": "creation-myth",
    "creation": "creation-myth",
    "origin-myth": "creation-myth",
    "origin": "creation-myth",
    "mythology": "myth",
    "myth": "myth",
    "legend": "legend",
}
type_counts = Counter(s.get("type", "") for s in stories)
type_normalize_count = 0
for s in stories:
    t = s.get("type", "").strip().lower()
    if t in TYPE_MAP and TYPE_MAP[t] != s.get("type", "").strip():
        type_normalize_count += 1
issues.append(f"Type variants needing normalize: {type_normalize_count}")

# --- 4. Source quality ---
single_source_str = sum(1 for s in stories if isinstance(s.get("source"), str) and len(s["source"]) < 10)
multi_in_string = 0
for s in stories:
    src = s.get("source", "")
    if isinstance(src, str) and (";" in src or ";" in src or "—" in src):
        multi_in_string += 1
issues.append(f"Single source string (no delimiter): {single_source_str - multi_in_string}")
issues.append(f"Multiple sources in one string (; delimiter): {multi_in_string}")

# --- 5. Other field issues ---
no_summary = sum(1 for s in stories if not s.get("summary"))
no_full_text = sum(1 for s in stories if not s.get("full_text"))
no_country = sum(1 for s in stories if not s.get("country"))
no_region = sum(1 for s in stories if not s.get("region"))
no_slug = sum(1 for s in stories if not s.get("slug"))
no_source_quality = sum(1 for s in stories if not s.get("source_quality"))
issues.append(f"Missing summary: {no_summary}")
issues.append(f"Missing full_text: {no_full_text}")
issues.append(f"Missing country: {no_country}")
issues.append(f"Missing region: {no_region}")
issues.append(f"Missing slug: {no_slug}")
issues.append(f"Missing source_quality: {no_source_quality}")

# --- 6. Summary quality ---
short_summaries = [s for s in stories if s.get("summary") and len(s["summary"]) < 30]
issues.append(f"Very short summaries (<30 chars): {len(short_summaries)}")
for s in short_summaries[:10]:
    issues.append(f"  Short: '{s.get('title','?')}' -> '{s['summary']}'")

# --- 7. Check for stories with no creatures linked ---
no_creatures = [s for s in stories if not s.get("creatures")]
issues.append(f"Stories with no creature links: {len(no_creatures)}")

print("=== STORIES DATA QUALITY REPORT ===")
print(f"Total stories: {len(stories)}")
print()
for i in issues:
    print(i)

print()
print("=== PERIOD DISTRIBUTION ===")
for p, c in period_counts.most_common(20):
    label = p if p else "(empty)"
    print(f"  {label}: {c}")

print()
print("=== TYPE DISTRIBUTION ===")
for t, c in type_counts.most_common(20):
    print(f"  {t}: {c}")

# --- Non-zero exit if critical issues found ---
critical = len(no_period) + no_slug + no_country + no_region
if critical > 0:
    print(f"\nCRITICAL: {critical} critical issues (period/slug/country/region missing)")
    sys.exit(1)
else:
    print("\nOK: No critical field issues")
    sys.exit(0)
