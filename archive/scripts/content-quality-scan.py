#!/usr/bin/env python3
"""Comprehensive content quality scan of all creatures and stories."""

import json, re, sys
from collections import Counter, defaultdict

BASE = "/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore"
DATA = f"{BASE}/data/datasets"

creatures = json.load(open(f"{DATA}/creatures.json"))
stories = json.load(open(f"{DATA}/stories.json"))

issues = defaultdict(list)  # category -> [(name, detail)]

# ─── AI-GENERATED CONTENT MARKERS ───────────────────────────────
# Phrases that heavily suggest AI authorship
AI_MARKERS = [
    r"in the heart of", r"deep within the", r"whispered through the ages",
    r"tales speak of", r"woven into the fabric", r"echoes of ancient",
    r"a creature of great", r"a being of immense", r"said to dwell",
    r"shrouded in mystery", r"veiled in", r"captivates the imagination",
    r"stands as a testament", r"serves as a reminder", r"remains one of the most",
    r"fascinating and complex", r"rich tapestry", r"intricate and multifaceted",
    r"depth and complexity", r"beyond the veil", r"across the ages",
    r"from time immemorial", r"since the dawn of time",
    r"plays a significant role", r"holds a special place",
    r"believed to possess", r"legend tells of a",
    r"it is said that this", r"often described as a",
    r"a fascinating figure", r"a mysterious being",
    r"one of the most well-known", r"in folklore and mythology",
    r"revered and feared", r"both feared and respected",
    r"both protector and destroyer", r"both a blessing and a curse",
    r"embodies the", r"represents the", r"symbolizes the",
    r"continues to be", r"continues to inspire",
    r"remains an important", r"remains a significant",
    r"has been a part of", r"has been passed down",
    r"for centuries", r"for generations",
    r"many cultures have", r"across many cultures",
    r"in many traditions", r"in various cultures",
]

# Template/generic opening patterns
GENERIC_OPENINGS = [
    r"^[A-Z][a-z]+ is a", r"^The [A-Z][a-z]+ is a", r"^[A-Z][a-z]+ are",
    r"^[A-Z][a-z]+ is one of", r"^[A-Z][a-z]+ is known",
    r"^[A-Z][a-z]+ is an? ", 
]

AI_EXACT_PHRASES = [
    "rich tapestry of mythology",
    "shrouded in mystery and legend",
    "echoes of ancient beliefs",
    "tales have been passed down through generations",
    "woven into the very fabric",
    "deep within the forests",
    "whispered on the wind",
    "captures the imagination",
    "stands as a testament to",
    "a creature of both light and shadow",
    "a being that defies easy categorization",
    "a figure that transcends simple classification",
    "remains one of the most fascinating",
    "continues to captivate audiences",
    "has captivated the imagination",
    "plays a significant role in",
    "holds a special place in",
    "from the depths of",
    "in the annals of",
    "through the mists of time",
]

def desc_text(c): return ((c.get('description','') or '') + ' ' + (c.get('behavior','') or '') + ' ' + (c.get('appearance','') or ''))
def all_text(c): return ' '.join(str(v) for v in c.values() if isinstance(v, str))

# ── SCAN CREATURES ──────────────────────────────────────────────
print("Scanning 3668 creatures...", file=sys.stderr)

for c in creatures:
    name = c['name']
    desc = c.get('description', '') or ''
    behavior = c.get('behavior', '') or ''
    appearance = c.get('appearance', '') or ''
    cs = c.get('cultural_significance', '') or ''
    ff = c.get('fun_fact', '') or ''
    habitat = c.get('habitat', '') or ''
    full_desc = desc + ' ' + behavior + ' ' + appearance

    # 1. Stub detection
    if len(desc) < 150:
        issues['CREATURE: Very short description'].append((name, f"{len(desc)} chars"))
    if len(desc) < 100:
        issues['CREATURE: CRITICAL stub description'].append((name, f"{len(desc)} chars"))
    if len(behavior) < 50:
        issues['CREATURE: Short behavior'].append((name, f"{len(behavior)} chars"))
    if len(appearance) < 50:
        issues['CREATURE: Short appearance'].append((name, f"{len(appearance)} chars"))
    if len(habitat) < 10 and name != 'Bergsrå':
        issues['CREATURE: Very short habitat'].append((name, habitat or "(empty)"))
    if len(cs) < 30:
        issues['CREATURE: Very short cultural_significance'].append((name, f"{len(cs)} chars"))
    if len(ff) < 30:
        issues['CREATURE: Very short fun_fact'].append((name, f"{len(ff)} chars"))

    # 2. AI marker detection
    combined = full_desc.lower() + ' ' + cs.lower() + ' ' + ff.lower()
    matched = []
    for phrase in AI_MARKERS:
        if re.search(phrase, combined):
            matched.append(phrase)
    if len(matched) >= 5:
        issues['CREATURE: High AI marker count'].append((name, f"{len(matched)} matches: {'; '.join(matched[:5])}"))
    elif len(matched) >= 3:
        issues['CREATURE: Moderate AI marker count'].append((name, f"{len(matched)} matches: {'; '.join(matched[:3])}"))

    # 3. Exact AI phrase matches
    for phrase in AI_EXACT_PHRASES:
        if phrase in combined:
            issues['CREATURE: Exact AI phrase match'].append((name, f'"{phrase[:60]}"'))

    # 4. Generic opening pattern
    for pattern in GENERIC_OPENINGS:
        if re.match(pattern, desc):
            issues['CREATURE: Generic opening'].append((name, desc[:60]))

    # 5. Repeated word patterns (template fill)
    if re.search(r'\b(a creature|a being|a spirit|a figure|a deity|a monster|a legendary)\b.*\b(a creature|a being|a spirit|a figure|a deity|a monster|a legendary)\b', desc.lower()[:200]):
        issues['CREATURE: Repeated framing'].append((name, desc[:80]))

    # 6. "This creature is" / "It is a" patterns
    if re.match(r'^It is a |^This [a-z]+ is a |^The [a-z]+ is a ', desc):
        issues['CREATURE: Starts with "It is a"/"This is a"'].append((name, desc[:60]))

    # 7. Count descriptor words
    all_wc = len(full_desc.split())
    if all_wc < 30:
        issues['CREATURE: Very thin total content'].append((name, f"{all_wc} words across desc+behavior+appearance"))

# ── SCAN STORIES ────────────────────────────────────────────────
print("Scanning 1719 stories...", file=sys.stderr)

for s in stories:
    title = s['title']
    summary = s.get('summary', '') or ''
    full_text = s.get('full_text', '') or ''
    ft = full_text.lower() + ' ' + summary.lower()

    if len(summary) < 80:
        issues['STORY: Very short summary'].append((title, f"{len(summary)} chars: \"{summary[:60]}\""))
    if len(summary) < 50:
        issues['STORY: CRITICAL stub summary'].append((title, f"{len(summary)} chars"))

    # AI markers in stories
    matched = []
    for phrase in AI_MARKERS:
        if re.search(phrase, ft):
            matched.append(phrase)
    if len(matched) >= 5:
        issues['STORY: High AI marker count'].append((title, f"{len(matched)} matches"))

    for phrase in AI_EXACT_PHRASES:
        if phrase in ft:
            issues['STORY: Exact AI phrase match'].append((title, f'"{phrase[:60]}"'))

    # Generic openings in full_text
    if full_text:
        for pattern in GENERIC_OPENINGS:
            if re.match(pattern, full_text):
                issues['STORY: Generic opening'].append((title, full_text[:60]))

# ── DUPLICATE / NEAR-DUPLICATE CONTENT ─────────────────────────
print("Checking for near-duplicate descriptions...", file=sys.stderr)

# Check first 100 chars of descriptions for duplicates
desc_prefixes = Counter()
for c in creatures:
    prefix = c.get('description','')[:80].strip().lower()
    desc_prefixes[prefix] += 1

dup_count = 0
for prefix, count in desc_prefixes.most_common(50):
    if count > 2 and len(prefix) > 40:
        names = [c['name'] for c in creatures if c.get('description','')[:80].strip().lower() == prefix]
        if count > 2:
            issues['CREATURE: Duplicate description opening'].append((f"{count} creatures", f'Same start: "{prefix[:50]}..."'))
            dup_count += 1

if dup_count == 0:
    print("  (no duplicate description openings found)", file=sys.stderr)

# ── REPORT ──────────────────────────────────────────────────────
print("\n" + "=" * 72)
print("CONTENT QUALITY SCAN REPORT")
print("=" * 72)

# Sort by severity
severity_order = [
    'CREATURE: CRITICAL stub description',
    'STORY: CRITICAL stub summary',
    'CREATURE: Exact AI phrase match',
    'STORY: Exact AI phrase match',
    'CREATURE: High AI marker count',
    'STORY: High AI marker count',
    'CREATURE: Moderate AI marker count',
    'CREATURE: Very short description',
    'STORY: Very short summary',
    'CREATURE: Very thin total content',
    'CREATURE: Short behavior',
    'CREATURE: Short appearance',
    'CREATURE: Very short habitat',
    'CREATURE: Very short cultural_significance',
    'CREATURE: Very short fun_fact',
    'CREATURE: Generic opening',
    'STORY: Generic opening',
    'CREATURE: Starts with "It is a"/"This is a"',
    'CREATURE: Repeated framing',
    'CREATURE: Duplicate description opening',
]

total_flagged = 0
for cat in severity_order:
    if cat in issues:
        items = issues[cat]
        print(f"\n{'🔴' if 'CRITICAL' in cat or 'Exact' in cat or 'High' in cat else '🟡'} {cat}: {len(items)}")
        for name, detail in items[:10]:
            print(f"    • {name}: {detail}")
        if len(items) > 10:
            print(f"    ... and {len(items) - 10} more")
        total_flagged += len(items)

# Also print unflagged categories
for cat in sorted(issues.keys()):
    if cat not in severity_order:
        items = issues[cat]
        print(f"\n  {cat}: {len(items)}")
        for name, detail in items[:5]:
            print(f"    • {name}: {detail}")
        total_flagged += len(items)

print(f"\n{'=' * 72}")
print(f"TOTAL FLAGGED ITEMS: {total_flagged}")
print(f"CATEGORIES: {len(issues)}")
print(f"{'=' * 72}")

# Summary stats
print("\n\nQUICK SUMMARY:")
creature_stubs = len(issues.get('CREATURE: CRITICAL stub description', []))
creature_short = len(issues.get('CREATURE: Very short description', []))
story_stubs = len(issues.get('STORY: CRITICAL stub summary', []))
story_short = len(issues.get('STORY: Very short summary', []))
ai_high = len(issues.get('CREATURE: High AI marker count', [])) + len(issues.get('STORY: High AI marker count', []))
ai_exact = len(issues.get('CREATURE: Exact AI phrase match', [])) + len(issues.get('STORY: Exact AI phrase match', []))
generic_open = len(issues.get('CREATURE: Generic opening', [])) + len(issues.get('STORY: Generic opening', []))

print(f"  Stub creatures (<100 char desc):  {creature_stubs}")
print(f"  Short creatures (<150 char desc): {creature_short}")
print(f"  Stub stories (<50 char summary):  {story_stubs}")
print(f"  Short stories (<80 char summary): {story_short}")
print(f"  High AI marker count:             {ai_high}")
print(f"  Exact AI phrase match:            {ai_exact}")
print(f"  Generic openings:                 {generic_open}")
