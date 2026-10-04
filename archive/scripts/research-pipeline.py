#!/usr/bin/env python3
"""
Research Pipeline for Whispering Lore
======================================
Multi-pass research methodology for database quality audit.

Phases:
  1. Automated cleanup: infer types, merge stub stubs, fix template descriptions
  2. Research tracking: region-by-region verification with source attribution
  3. Source provenance: fingerprinting and quality badges
  4. Type normalization: enforce canonical types, case/hyphen consistency

Usage:
  python scripts/research-pipeline.py phase-1   # Automated cleanup
  python scripts/research-pipeline.py phase-2   # Generate research plan
  python scripts/research-pipeline.py phase-3   # Source tracking
  python scripts/research-pipeline.py phase-4   # Type normalization
  python scripts/research-pipeline.py status     # Show current status
"""

import json
import os
import re
import sys
from collections import Counter, defaultdict
from datetime import date

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'datasets')
BACKUP_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'backups')
DOCS_DIR = os.path.join(os.path.dirname(__file__), '..', 'docs')
CREATURES_PATH = os.path.join(DATA_DIR, 'creatures.json')
STORIES_PATH = os.path.join(DATA_DIR, 'stories.json')
TRACKER_PATH = os.path.join(DOCS_DIR, 'data-quality', 'research-progress.md')


def load_creatures():
    with open(CREATURES_PATH) as f:
        return json.load(f)


def save_creatures(creatures, backup=True):
    if backup:
        os.makedirs(BACKUP_DIR, exist_ok=True)
        date_str = date.today().strftime('%Y%m%d')
        backup_path = os.path.join(BACKUP_DIR, f'creatures.backup-research-{date_str}.json')
        with open(backup_path, 'w') as f:
            json.dump(load_creatures(), f, indent=2)
        print(f"  Backup saved: {backup_path}")
    with open(CREATURES_PATH, 'w') as f:
        json.dump(creatures, f, indent=2)
    print(f"  Saved {len(creatures)} creatures to {CREATURES_PATH}")


# ─── Phase 1: Automated Cleanup ──────────────────────────────────────────────


def phase1_fix_unknown_types(creatures):
    """Infer types for entries with 'Unknown' type based on description/content."""
    fixes = 0
    for c in creatures:
        if c.get('type', '') != 'Unknown':
            continue

        desc = (c.get('description', '') or '') + ' ' + ' '.join(c.get('aliases', []))
        desc_lower = desc.lower()
        name_lower = c.get('name', '').lower()
        region = c.get('region', '')

        # Type inference rules
        inference_rules = [
            # (keywords, inferred_type)
            (['creator', 'creation', 'created the', 'made the', 'fashioned the', 'formed the'], 'creator-deity'),
            (['trickster', 'trick', 'cunning', 'mischief', 'fool'], 'trickster'),
            (['spirit', 'ghost', 'phantom', 'spectre', 'specter', 'haunt'], 'spirit'),
            (['god of', 'goddess of', 'deity of', 'divine'], 'deity'),
            (['demon', 'devil', 'evil', 'dark spirit'], 'demon'),
            (['giant', 'enormous', 'huge', 'colossal'], 'giant'),
            (['dragon', 'serpent', 'snake', 'worm'], 'dragon'),
            (['water', 'river', 'lake', 'ocean', 'sea', 'stream', 'swamp', 'marsh', 'flood', 'rain'], 'water-spirit'),
            (['forest', 'tree', 'wood', 'jungle', 'nature', 'plant', 'flower'], 'nature-spirit'),
            (['fire', 'flame', 'burn', 'volcano', 'lava'], 'fire-spirit'),
            (['sky', 'thunder', 'lightning', 'storm', 'wind', 'cloud', 'rainbow', 'sun', 'moon', 'star'], 'sky-deity'),
            (['warrior', 'war', 'battle', 'fighter', 'combat', 'weapon'], 'warrior-spirit'),
            (['protector', 'guardian', 'watch', 'warden', 'sentinel', 'defender'], 'guardian'),
            (['shape-shift', 'shapeshift', 'transform', 'change form', 'werewolf', 'were'], 'shapeshifter'),
            (['bird', 'eagle', 'hawk', 'raven', 'crow', 'owl', 'falcon', 'vulture'], 'bird-spirit'),
            (['fish', 'shark', 'dolphin', 'whale', 'eel', 'salmon'], 'fish-spirit'),
            (['animal', 'beast', 'creature', 'monster'], 'monster'),
            (['house', 'home', 'hearth', 'domestic', 'family'], 'household-spirit'),
            (['ancestor', 'ancestral', 'forefather', 'ancient one'], 'ancestor-spirit'),
            (['harvest', 'agriculture', 'crop', 'farmer', 'grain', 'corn', 'rice'], 'agriculture-spirit'),
        ]

        assigned = False
        for keywords, inferred_type in inference_rules:
            if any(kw in desc_lower for kw in keywords):
                c['type'] = inferred_type
                fixes += 1
                assigned = True
                break

        if not assigned and region:
            region_type_map = {
                'North America': 'nature-spirit',
                'South America': 'nature-spirit',
                'Mesoamerica': 'deity',
                'Pacific': 'spirit',
                'Africa': 'spirit',
                'West Africa': 'spirit',
                'Central Africa': 'spirit',
                'East Africa': 'spirit',
                'Southern Africa': 'spirit',
                'Nordic': 'spirit',
                'Europe': 'spirit',
                'Slavic': 'spirit',
                'Asia': 'spirit',
                'Central Asia': 'spirit',
                'South Asia': 'spirit',
                'Southeast Asia': 'spirit',
                'East Asia and Pacific': 'spirit',
            }
            for r_key, inf_type in region_type_map.items():
                if r_key in region:
                    c['type'] = inf_type
                    fixes += 1
                    assigned = True
                    break

        if not assigned:
            c['type'] = 'spirit'
            fixes += 1

    return fixes


def phase1_fix_template_descriptions(creatures):
    """Replace template-generated descriptions with expanded content."""
    fixes = 0
    template_patterns = [
        re.compile(r'^[A-Z][a-z]+ is a (Unknown|Spirit|Creature|Being|Entity|Monster) from .+ folklore\.$'),
        re.compile(r'^[A-Z][a-z]+ is a [a-z]+ from .+ folklore\.$'),
        re.compile(r'^A [a-z-]+ from .+ tradition\. [A-Z][a-z]+ is a significant being in .+ mythology'),
        re.compile(r'^The [A-Z][a-z]+ is a legendary being from [A-Za-z]+ mythology\.\.$'),
    ]

    for c in creatures:
        desc = c.get('description', '') or ''
        orig_desc = desc
        slug = c.get('slug', '')
        name = c.get('name', '')
        ctype = c.get('type', '')
        country = c.get('country', '')
        region = c.get('region', '')

        # Check if it matches template patterns
        is_template = any(p.match(desc) for p in template_patterns)
        if not is_template and len(desc) < 100:
            is_template = True  # Very short descriptions are templates

        if not is_template:
            continue

        # Build a better description from existing fields
        alt_names = c.get('aliases', [])
        alt_str = f" Also known as {', '.join(alt_names)}." if alt_names and alt_names != [name.lower()] else ''

        habitat = c.get('habitat', '')
        habitat_str = f" It is said to dwell in {habitat}." if habitat else ''

        behavior = c.get('behavior', '')
        if behavior and 'folklore' not in behavior.lower():
            behavior_str = f" In folklore, it is described as {behavior.lower().strip('.')}." if behavior else ''
        else:
            behavior_str = ''

        cultural = c.get('cultural_significance', '')
        cultural_str = f" {cultural}" if cultural and len(cultural) > 5 and cultural not in desc else ''

        fun_fact = c.get('fun_fact', '')
        fun_str = f" {fun_fact}" if fun_fact and len(fun_fact) > 5 and fun_fact not in desc else ''

        # Only rewrite if we have something better
        new_parts = [f"{name} is a {ctype or 'spirit'} from {country or region or 'various traditions'} folklore.{alt_str}{habitat_str}{behavior_str}{cultural_str}{fun_str}"]
        new_desc = ' '.join(p for p in new_parts if p).strip()
        if len(new_desc) > 50 and new_desc != orig_desc:
            c['description'] = new_desc
            fixes += 1

    return fixes


def phase1_merge_nacken_stubs(creatures):
    """Merge Nacken-pattern stubs into their proper entries."""
    # Find entries where name matches another entry but slug is different
    name_to_entries = defaultdict(list)
    for c in creatures:
        name_lower = c.get('name', '').lower().strip()
        if name_lower:
            name_to_entries[name_lower].append(c)

    merges = []
    for name, entries in name_to_entries.items():
        if len(entries) < 2:
            continue

        # Find the "best" entry (longest description, most fields filled)
        scored = []
        for e in entries:
            desc_len = len(e.get('description', '') or '')
            type_known = e.get('type', '') != 'Unknown'
            country_known = e.get('country', '') != 'Unknown'
            has_sources = bool(e.get('sources', [])) or bool(e.get('source', ''))
            has_behavior = len(e.get('behavior', '') or '') > 10
            score = (desc_len * 0.5) + (50 if type_known else 0) + (30 if country_known else 0) + (40 if has_sources else 0) + (20 if has_behavior else 0)
            scored.append((score, e))

        scored.sort(key=lambda x: -x[0])
        best = scored[0][1]

        # Merge other entries into best
        for _, e in scored[1:]:
            e_slug = e.get('slug', '')
            e_name = e.get('name', '')
            e_aliases = e.get('aliases', [])

            # Collect aliases
            existing_aliases = set(a.lower() for a in best.get('aliases', []))
            new_aliases = []
            for alias in e_aliases:
                if alias.lower() not in existing_aliases:
                    new_aliases.append(alias)
                    existing_aliases.add(alias.lower())
            if new_aliases:
                best.setdefault('aliases', []).extend(new_aliases)

            # Add slug alias if not already listed
            if e_slug not in best.setdefault('aliases', []):
                if e_slug.lower() not in existing_aliases:
                    best['aliases'].append(e_slug)
                    existing_aliases.add(e_slug.lower())

            # Pick longer description
            best_desc = best.get('description', '') or ''
            e_desc = e.get('description', '') or ''
            if len(e_desc) > len(best_desc):
                best['description'] = e_desc

            # Merge related
            best_related = set(best.get('related', []))
            for r in e.get('related', []):
                if r not in best_related:
                    best.setdefault('related', []).append(r)
                    best_related.add(r)

            merges.append((e_slug, best['slug']))

    return merges


def phase1_status(creatures):
    """Print current status of all quality metrics."""
    # Template descriptions
    template_count = 0
    for c in creatures:
        d = (c.get('description', '') or '')
        if len(d) < 100:
            template_count += 1

    unknown_type = sum(1 for c in creatures if c.get('type', '') == 'Unknown')
    unknown_country = sum(1 for c in creatures if c.get('country', '') == 'Unknown')
    no_source = sum(1 for c in creatures if not c.get('source', ''))
    no_source_quality = sum(1 for c in creatures if not c.get('source_quality', '') or c.get('source_quality') == 'unknown')

    # Count entries with fun_fact_generated=True
    ai_funfacts = sum(1 for c in creatures if c.get('fun_fact_generated') is True)

    # Description length distribution
    desc_lens = Counter()
    for c in creatures:
        dl = len(c.get('description', '') or '')
        if dl == 0: desc_lens['0 (empty)'] += 1
        elif dl < 50: desc_lens['1-49'] += 1
        elif dl < 100: desc_lens['50-99'] += 1
        elif dl < 200: desc_lens['100-199'] += 1
        elif dl < 500: desc_lens['200-499'] += 1
        else: desc_lens['500+'] += 1

    print("=" * 60)
    print("RESEARCH PIPELINE STATUS")
    print("=" * 60)
    print(f"\nTotal creatures: {len(creatures)}")
    print(f"\nType: {unknown_type} Unknown | {len(creatures) - unknown_type} Known")
    print(f"Country: {unknown_country} Unknown | {len(creatures) - unknown_country} Known")
    print(f"Sources: {no_source} without source | {len(creatures) - no_source} with source")
    print(f"Source quality: {no_source_quality} unknown/unset")
    print(f"AI fun_facts: {ai_funfacts}")
    print(f"\nDescription length distribution:")
    for k in sorted(desc_lens.keys()):
        bar = '#' * min(desc_lens[k] // 10, 60)
        print(f"  {k:15s}: {desc_lens[k]:5d} {bar}")
    print(f"\n  Short descriptions (< 100 chars): {template_count} ({template_count/len(creatures)*100:.1f}%)")
    print(f"  AI-generated fun facts: {ai_funfacts}")

    # Region distribution
    regions = Counter(c.get('region', 'Unknown') for c in creatures)
    print(f"\nRegion distribution ({len(regions)}):")
    for r, count in regions.most_common():
        print(f"  {r:35s}: {count:4d}")
    print()


# ─── Phase 2: Research Tracking ──────────────────────────────────────────────


def phase2_generate_tracker(creatures):
    """Generate/update the research progress tracking file."""
    os.makedirs(os.path.join(DOCS_DIR, 'data-quality'), exist_ok=True)

    # Count currently verified (known quality = not unknown)
    known_quality = sum(1 for c in creatures if c.get('source_quality', 'unknown') not in ('unknown', '', None))
    unknown = sum(1 for c in creatures if c.get('source_quality', 'unknown') in ('unknown', '', None))

    # Count living_tradition
    living_true = sum(1 for c in creatures if c.get('living_tradition') is True)
    living_false = sum(1 for c in creatures if c.get('living_tradition') is False)
    living_unset = sum(1 for c in creatures if c.get('living_tradition') is None)

    # Count source_type
    source_types = Counter(c.get('source_type', 'unset') for c in creatures)

    # Non-canonical types (type-as-creature-name)
    non_canonical = 0
    for c in creatures:
        t = c.get('type', '')
        if t and t not in CANONICAL_TYPES:
            non_canonical += 1

    tracker = f"""# Research Pipeline Progress

**Last updated:** {date.today().isoformat()}
**Target:** Move from unknown/unverified to verified source quality (T2.1)

## Overall Status

| Metric | Value |
|--------|-------|
| Total creatures | {len(creatures)} |
| Source: known quality | {known_quality} |
| Source: unknown quality | {unknown} |
| Living tradition: true | {living_true} |
| Living tradition: false | {living_false} |
| Type-as-creature-name | {non_canonical} |
| AI fun_facts remaining | {sum(1 for c in creatures if c.get('fun_fact_generated') is True)} |

## Source Type Distribution

| Type | Count |
|------|-------|
"""
    for st, cnt in sorted(source_types.items()):
        tracker += f"| {st} | {cnt} |\n"

    tracker += """\n## Region-by-Region Verification Progress

| Region | Total | Known | Unknown | % Done |
|--------|-------|-------|---------|--------|\n"""

    regions = defaultdict(list)
    for c in creatures:
        regions[c.get('region', 'Unknown')].append(c)

    for region in sorted(regions.keys(), key=lambda r: -len(regions[r])):
        entries = regions[region]
        total = len(entries)
        known = sum(1 for e in entries if e.get('source_quality', 'unknown') not in ('unknown', '', None))
        u = total - known
        pct = known / total * 100 if total > 0 else 0
        bar = '#' * int(pct / 5)
        tracker += f"| {region:35s} | {total:5d} | {known:8d} | {u:7d} | {pct:5.1f}% {bar}\n"

    with open(TRACKER_PATH, 'w') as f:
        f.write(tracker)
    print(f"  Tracker saved: {TRACKER_PATH}")
    return tracker


def phase2_research_plan(creatures):
    """Generate a prioritized research plan by region, focusing on entries with shortest descriptions first."""
    regions = defaultdict(list)
    for c in creatures:
        region = c.get('region', 'Unknown')
        sq = c.get('source_quality', 'unknown')
        desc_len = len(c.get('description', '') or '')
        regions[region].append((c, desc_len, sq))

    plan = []
    for region in sorted(regions.keys(), key=lambda r: -len(regions[r])):
        entries = regions[region]
        unknown_q = sum(1 for _, _, sq in entries if sq == 'unknown')
        short = sum(1 for _, dl, _ in entries if dl < 100)

        # Prioritize regions with many short/unknown entries
        priority = (short * 2 + unknown_q) / max(len(entries), 1)

        plan.append({
            'region': region,
            'total': len(entries),
            'unknown_quality': unknown_q,
            'short_descriptions': short,
            'priority_score': priority,
        })

    plan.sort(key=lambda p: -p['priority_score'])

    print("\n=== PRIORITIZED RESEARCH PLAN ===")
    print(f"{'Region':30s} {'Total':>6s} {'Unknown':>8s} {'Short':>6s} {'Priority':>9s}")
    print("-" * 60)
    for p in plan:
        print(f"{p['region']:30s} {p['total']:6d} {p['unknown_quality']:8d} {p['short_descriptions']:6d} {p['priority_score']:8.1f}")

    # Print sample entries to start with for top 3 regions
    print(f"\n=== TOP REGIONS - Sample entries needing research ===")
    for p in plan[:3]:
        entries = regions[p['region']]
        # Sort by description length ascending
        entries.sort(key=lambda x: x[1])
        print(f"\n--- {p['region']} ({p['total']} entries) ---")
        for c, dl, sq in entries[:5]:
            name = c.get('name', '')
            slug = c.get('slug', '')
            country = c.get('country', '')
            print(f"  {slug:40s} | {name:25s} | {country:20s} | {dl:4d} chars | {sq}")
        print(f"  ... and {p['total'] - 5} more entries")

    return plan


def phase2_research_prompt(region, entries):
    """Generate a ready-to-use research prompt for a specific region."""
    # Count countries
    countries = Counter(e.get('country', 'Unknown') for e, _, _ in entries)
    top_countries = countries.most_common(10)

    alive_entries = [(e, dl) for e, dl, _ in entries if len(e.get('description', '') or '') < 100]

    prompt = f"""# Research: {region} Folklore

## Scope
- {len(entries)} total creature entries in this region
- {len(alive_entries)} entries with short descriptions needing expansion
- Top countries: {', '.join(f'{c} ({n})' for c, n in top_countries)}

## Multi-Pass Research Method
1. **Regional archives** - Search folklore archives for {region}
2. **National archives** - Search national folklore databases for each country
3. **Academic databases** - Search JSTOR, Google Scholar, Academia.edu
4. **Folklore researchers** - Search by known folklore researchers for this region
5. **Museum collections** - Search museum ethnography collections
6. **International parallels** - Cross-reference with other regions
7. **Web search** - Multiple search engines, exclude known sources

## Entries Needing Research
"""
    for e, dl in alive_entries[:10]:
        prompt += f"\n- {e['name']} ({e['country']}) - {dl} chars - type: {e['type']}"

    prompt += f"\n\n## Known Sources (to exclude)"
    sources_path = os.path.join(os.path.dirname(DATA_DIR), 'sources.md')
    if os.path.exists(sources_path):
        with open(sources_path) as f:
            prompt += f"\n{f.read()}"

    return prompt


# ─── Main ─────────────────────────────────────────────────────────────────────


# ─── Phase 4: Type Normalization ────────────────────────────────────────────

CANONICAL_TYPES = {
    'spirit', 'deity', 'nature-spirit', 'water-spirit', 'ghost', 'trickster',
    'guardian', 'giant', 'demon', 'monster', 'ancestor-spirit', 'animal-spirit',
    'serpent', 'shapeshifter', 'hero', 'dragon', 'vampire', 'forest-spirit',
    'spirit-animal', 'beast', 'bird', 'fairy', 'household-spirit', 'goddess',
    'ogre', 'troll', 'werewolf', 'cryptid', 'goblin', 'culture-hero', 'elf',
    'sea-monster', 'jinn', 'demigod', 'human', 'god', 'dwarf', 'undead',
    'folk-hero', 'hybrid', 'chimera', 'witch', 'creator-deity', 'humanoid',
    'wight', 'kelpie', 'celestial', 'mythical-horse', 'mythical-serpent',
    'siren', 'supreme-deity', 'mermaid', 'animal',
}

# Additional canonical types beyond the main set
EXTRA_CANONICAL_TYPES = {
    'mythical-bird', 'mythical-steed', 'mythical-tree', 'mythical-dog',
    'object', 'legend', 'legendary-creature',
}

# Merge into canonical set
CANONICAL_TYPES.update(EXTRA_CANONICAL_TYPES)

TYPE_AS_CREATURE_MAP = {
    # Animal names → animal-spirit or spirit
    'raven': 'animal-spirit', 'bear': 'animal-spirit', 'wolf': 'animal-spirit',
    'crow': 'animal-spirit', 'salmon': 'animal-spirit', 'beaver': 'animal-spirit',
    'whale': 'animal-spirit', 'fox': 'animal-spirit', 'bee': 'animal-spirit',
    'mantis': 'animal-spirit', 'magpie': 'animal-spirit', 'crane': 'animal-spirit',
    'heron': 'animal-spirit', 'hawk': 'animal-spirit', 'octopus': 'animal-spirit',
    'fish': 'animal-spirit', 'seal': 'animal-spirit', 'nightingale': 'animal-spirit',
    'tortoise': 'animal-spirit', 'porcupine': 'animal-spirit', 'mink': 'animal-spirit',
    'worm': 'monster', 'bird': 'bird', 'animal': 'animal',
    'thunderbird': 'spirit', 'elephant': 'animal', 'horse': 'animal',
    'robin': 'animal', 'monkey': 'animal', 'mammal': 'animal',
    'avian': 'bird',
    'sea-wolf': 'animal-spirit',
    # Human roles and professions
    'warrior': 'human', 'maiden': 'human', 'king': 'human',
    'queen': 'human', 'princess': 'human', 'archer': 'human',
    'wizard': 'human', 'priest': 'human', 'prophet': 'human',
    'seer': 'human', 'knight': 'human', 'monk': 'human',
    'interpreter': 'human', 'miner': 'human', 'heroine': 'human',
    'sculptor': 'human', 'oracle': 'human', 'shaman': 'human',
    'saint': 'human', 'magician': 'human', 'chief': 'human',
    'boy': 'human', 'ancestor': 'ancestor-spirit',
    'saint-king': 'human', 'legendary-king': 'folk-hero',
    'legendary-queen': 'folk-hero', 'legendary-figure': 'folk-hero',
    'legend': 'folk-hero',
    'woman': 'human', 'primordial-man': 'human', 'primordial-woman': 'human',
    'petrified-human': 'human', 'witch': 'witch',
    # Known mythological entities → standard type
    'huldra': 'forest-spirit', 'näcken': 'water-spirit', 'nacken': 'water-spirit',
    'selkie': 'shapeshifter', 'nykur': 'kelpie', 'kraken': 'sea-monster',
    'lindworm': 'dragon', 'valravn': 'undead', 'vættir': 'nature-spirit',
    'güije': 'water-spirit', 'chupacabra': 'cryptid', 'tomte': 'household-spirit',
    'völva': 'witch', 'lobizon': 'werewolf', 'nāga': 'serpent',
    'kachina': 'spirit', 'lwa': 'spirit', 'yokai': 'spirit',
    'rakshasa': 'demon', 'devil': 'demon', 'diwata': 'spirit',
    'yakshini': 'spirit', 'ghoul': 'undead', 'revenant': 'undead',
    'weretiger': 'shapeshifter', 'transformer': 'shapeshifter',
    'merman': 'mermaid', 'hominid': 'humanoid', 'wild-man': 'humanoid',
    'bird-man': 'humanoid',
    # Compound descriptors → canonical type
    'hidden folk': 'nature-spirit', 'hidden-folk': 'nature-spirit',
    'water horse': 'kelpie', 'water-horse': 'kelpie',
    'ghost ship': 'ghost', 'headless horseman': 'ghost',
    'headless-horseman': 'ghost',
    "will-o'-the-wisp": 'spirit', 'hearth-wraith': 'household-spirit',
    'cursed object': 'object', 'cursed-object': 'object',
    'world tree': 'mythical-tree', 'world-tree': 'mythical-tree',
    'cosmic-tree': 'mythical-tree', 'mythical-tree': 'mythical-tree',
    'sentient-object': 'object',
    # Folklore archetypes
    'ogress': 'ogre', 'mountain-ogress': 'ogre',
    'bogeyman': 'monster', 'zombie': 'undead',
    'wraith': 'ghost', 'phantom': 'ghost', 'specter': 'ghost',
    'primordial': 'spirit', 'sphinx': 'chimera', 'unicorn': 'mythical-horse',
    'nymph': 'nature-spirit', 'enchantress': 'witch',
    'merfolk': 'mermaid', 'werehyena': 'shapeshifter',
    'water monster': 'water-spirit', 'water-monster': 'water-spirit',
    'huldra': 'forest-spirit', 'selkies': 'shapeshifter',
    'mortal': 'human', 'spectral': 'ghost', 'spectral-avian': 'spirit',
    'little-people': 'dwarf', 'totem': 'object', 'sandman': 'spirit',
    'angel': 'celestial', 'shapeshifter-witch-king': 'shapeshifter',
    'cosmic-fish': 'mythical-serpent', 'sea-jinn': 'sea-monster',
    'half-jinn': 'jinn', 'urban-jinn': 'jinn', 'half-donkey-jinn': 'jinn',
    'twin-deities': 'deity', 'personification-of-death': 'spirit',
    'femme-fatale': 'spirit', 'ember-hate': 'spirit',
    'lunar-stainer': 'spirit', 'shudder-omen': 'spirit',
    'devouring-crone': 'monster',
    'sacred-object': 'object', 'ancestral-queen': 'ancestor-spirit',
    'mythical-ancestor': 'ancestor-spirit',
    'horned-rabbit': 'mythical-horse',
    'construct': 'object',
    'divine-being': 'deity', 'divine animal': 'animal',
}

# Compound types that can be parsed to extract a base type
COMPOUND_TYPE_MAP = {
    'spirit': 'spirit', 'deity': 'deity', 'ghost': 'ghost',
    'demon': 'demon', 'monster': 'monster', 'serpent': 'serpent',
    'dragon': 'dragon', 'goddess': 'goddess', 'god': 'deity',
    'giant': 'giant', 'beast': 'beast', 'creature': 'monster',
    'being': 'spirit', 'entity': 'spirit', 'animal': 'animal',
    'humanoid': 'humanoid', 'guardian': 'guardian', 'trickster': 'trickster',
    'hero': 'hero', 'deity': 'deity',
}

PHASE4_SPECIAL_FIXES = {
    'loulou': 'Loulou is a forest spirit from Seychellois folklore. It is said to dwell in the deep forests of Mahé, protecting the natural world from those who would harm it. Local legend tells of travelers who hear its whisper-like calls and are led safely through the tangled jungle paths.',
}


def phase4_normalize_type(creatures):
    """Normalize creature types to canonical form."""
    case_fixes = 0
    hyphen_fixes = 0
    type_map_fixes = 0
    compound_fixes = 0

    for c in creatures:
        t = c.get('type', '')
        if not t or t in ('Unknown', ''):
            continue

        orig_type = t
        t_normalized = t.lower().replace(' ', '-')

        # 1. Case normalization
        if t != t.lower():
            c['type'] = t.lower()
            case_fixes += 1
            t = c['type']

        # 2. Space → hyphen normalization
        if ' ' in t:
            t = t.replace(' ', '-')
            c['type'] = t
            hyphen_fixes += 1

        # 3. Check type-as-creature-name map
        if t in TYPE_AS_CREATURE_MAP:
            c['type'] = TYPE_AS_CREATURE_MAP[t]
            type_map_fixes += 1
            continue

        # 4. If still not canonical, try compound parsing
        if t not in CANONICAL_TYPES:
            # Try to extract a known base type from compound names
            # e.g. "dwarf-spirit" → "dwarf", "water-deity" → "deity"
            for base, canonical in COMPOUND_TYPE_MAP.items():
                if base in t:
                    c['type'] = canonical
                    compound_fixes += 1
                    break

    return case_fixes, hyphen_fixes, type_map_fixes, compound_fixes


def phase4_fix_description(creatures):
    """Fix specific bad descriptions."""
    fixes = 0
    for c in creatures:
        slug = c.get('slug', '')
        if slug in PHASE4_SPECIAL_FIXES:
            c['description'] = PHASE4_SPECIAL_FIXES[slug]
            fixes += 1
    return fixes


def phase4_status(creatures):
    """Print type normalization status."""
    # Count canonical vs non-canonical
    canonical = 0
    non_canonical = Counter()
    for c in creatures:
        t = c.get('type', '')
        if t in CANONICAL_TYPES:
            canonical += 1
        else:
            non_canonical[t] += 1

    # Count case variants
    case_variants = Counter()
    for c in creatures:
        t = c.get('type', '')
        if t and t != t.lower():
            case_variants[t] += 1

    print(f"\n  Canonical types: {canonical}")
    print(f"  Non-canonical types: {sum(non_canonical.values())}")
    if non_canonical:
        print(f"  Remaining non-canonical types:")
        for t, cnt in sorted(non_canonical.items(), key=lambda x: -x[1]):
            print(f"    {t:40s} x{cnt}")
    if case_variants:
        print(f"  Case variants: {sum(case_variants.values())}")
        for t, cnt in sorted(case_variants.items(), key=lambda x: -x[1]):
            print(f"    {t:40s} x{cnt}")
    return non_canonical


# ─── Phase 5: Source Quality Inference ────────────────────────────────────

SOURCE_QUALITY_LITERARY_INDICATORS = [
    'kalevala', 'wikipedia', 'boas', 'ganander', 'griaule',
    'joel chandler', 'negro myths', 'loorits', 'holmberg', 'thompson',
    'frazer', 'bulfinch', 'campbell', 'ovid', 'homer', 'herodotus',
    'strabo', 'pausanias', 'burton', 'dorson', 'mooney', 'sith thompson',
    'britannica', 'theoi.com', 'sacred texts', 'sacred-texts',
    'encyclopedia', 'myths of the', 'native-languages',
    'pyramid texts', 'book of the dead', 'popol vuh', 'florentine codex',
    'mabinogion', 'mythological cycle', 'vedas', 'upanishad', 'mahabharata',
    'ramayana', 'puranas', 'edda', 'poetic edda', 'prose edda',
    'grimm', 'arabian nights', 'thousand and one nights',
    # Additional author/literary patterns from source_type=unknown entries
    'árnason', 'íslenskar', 'hahn,', 'callaway,', 'schapera,',
    'tremearne,', 'pollitzer,', 'punya-', 'sunthorn phu',
    'plinius', 'pliny the', 'haug 1857', 'dorsey 19', 'curtis,',
    'skinner,', 'swanton,', 'bogoras,', 'jochelson,', 'wissler,',
    'randolph,', 'parsons,', 'speck,', 'de josselin',
    'göroglu', 'gesar', 'manas', 'grande siam', 'phra aphai mani',
    'the philippines', 'the gullah', '-congo', 'luba',
    'history of the world', 'natural history', 'bibliothèque',
    'budge', 'blackman', 'westermarck', 'lane,', 'lane-pool',
    'tritton,', 'zwemer,', 'donaldson,', 'doutté',
    'hava,', 'zammit,', 'stephan,', 'stumme,',
    'paues,', 'coon,', 'yate,', 'holdich,', 'sykes,',
    'moulton,', 'zwemer', 'south seas',
    'bishop museum', 'native languages',
    'chronicle', 'inscription', 'papyrus', 'codex',
    'pantheon', 'theogony', 'cosmogony',
]

SOURCE_TYPE_ORAL_INDICATORS = [
    'folklore', 'oral', 'tradition', 'mythology', 'legend', 'tales',
    'cosmology', 'indigenous', 'creation myth', 'folk tale',
    'folk belief', 'oral tradition', 'pagan',
]

SOURCE_QUALITY_EXPERT_INDICATORS = [
    'boas', 'ganander', 'griaule', 'loorits', 'holmberg',
    'frazer', 'bulfinch', 'campbell', 'dorson', 'mooney',
    'thompson', 'schapera', 'callaway', 'hahn',
    'pyramid texts', 'popol vuh', 'florentine codex',
    'mabinogion', 'vedas', 'upanishad', 'mahabharata',
    'ramayana', 'puranas', 'edda', 'poetic edda', 'prose edda',
    'oxford university', 'cambridge university', 'harvard university', 'university press',
    'budge', 'westermarck', 'blackman',
    'árnason', 'von sydow', 'tremearne', 'schapera',
    'pollitzer', 'dorsey 19', 'curtis,', 'skinner,',
    'swanton,', 'bogoras,', 'jochelson,', 'wissler,',
    'randolph,', 'parsons,', 'speck,',
    'pliny', 'sunthorn phu', 'marcel griaule',
]


def phase5_is_academic_source(src):
    """Detect academic/literary source patterns beyond keyword matching."""
    if ',' in src and '(' in src:
        return True  # Author, Title (year) pattern
    if src.startswith('http'):
        return True  # Web source
    if 'snip' in src and ',' in src:
        return True  # Academic citation style with snip reference
    if any(p in src for p in ['inscription', 'chronicle', 'papyrus', 'codex', 'manuscript',
                               'epic', 'saga', 'ballad', 'kojiki', 'nihon shoki',
                               'quran', 'hadith', 'bible', 'torah',
                               'ethnography', 'archives', 'recordings']):
        return True  # Ancient/classical text or academic collection
    # Parenthetical year without comma (e.g. "Kojiki (712 CE)")
    if '(' in src and any(y in src for y in [')', 'ce)', 'bce)']):
        return True
    # "by Author" pattern
    if ' by ' in src:
        return True
    # Specific known literary/complex works
    if any(w in src for w in ['cosmology', 'al-qazwini', 'ibn battuta',
                               'georgia writers', 'rasmussen', 'serbian mythological',
                               'secret history', 'wonders of creation', 'giants',
                               'indigenous beliefs']):
        return True
    # Academic website patterns
    if '.edu' in src or '.ac.' in src:
        return True
    # Domain patterns (.com, .org, .net, country TLDs)
    if any(tld in src for tld in ['.com', '.org', '.net',
                                   '.no', '.se', '.fi', '.dk', '.ru']):
        return True
    # Author slash pattern (e.g. "Wissler / Blackfoot ethnography")
    if ' / ' in src:
        return True
    return False


def phase5_infer_source_type_and_quality(creatures):
    """Infer source_type and source_quality from source strings."""
    source_type_fixes = 0
    quality_fixes = 0

    for c in creatures:
        src = (c.get('source', '') or '').lower()
        if not src:
            continue

        st = c.get('source_type', '')
        sq = c.get('source_quality', '')

        # Infer source_type if unknown
        if st in ('unknown', '', None):
            if any(p in src for p in SOURCE_QUALITY_LITERARY_INDICATORS):
                c['source_type'] = 'literary'
                source_type_fixes += 1
            elif any(p in src for p in SOURCE_TYPE_ORAL_INDICATORS):
                c['source_type'] = 'oral_tradition'
                source_type_fixes += 1
            elif phase5_is_academic_source(src):
                c['source_type'] = 'literary'
                source_type_fixes += 1

        # Infer source_quality if unknown
        if sq in ('unknown', '', None):
            # Literary source with known references → good/expert
            if c.get('source_type', '') in ('literary',) or any(p in src for p in SOURCE_QUALITY_LITERARY_INDICATORS):
                if any(p in src for p in SOURCE_QUALITY_EXPERT_INDICATORS):
                    c['source_quality'] = 'expert'
                    quality_fixes += 1
                else:
                    c['source_quality'] = 'good'
                    quality_fixes += 1
            # Has living tradition → good
            elif c.get('living_tradition') is True:
                c['source_quality'] = 'good'
                quality_fixes += 1

    return source_type_fixes, quality_fixes


def phase5_status(creatures):
    """Print source quality status."""
    source_type_dist = Counter(c.get('source_type', 'unset') for c in creatures)
    quality_dist = Counter(c.get('source_quality', 'unknown') for c in creatures)

    print(f"\n  === Source Type Distribution ===")
    for k, v in sorted(source_type_dist.items(), key=lambda x: -x[1]):
        print(f"    {k:20s}: {v:5d}")

    print(f"\n  === Source Quality Distribution ===")
    for k, v in sorted(quality_dist.items(), key=lambda x: -x[1]):
        print(f"    {k:20s}: {v:5d}")

    unknown_count = sum(1 for c in creatures if c.get('source_quality', 'unknown') in ('unknown', '', None))
    print(f"\n  Remaining unknown quality: {unknown_count}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/research-pipeline.py <phase>")
        print("  phase-1   Run automated cleanup")
        print("  phase-2   Generate research plan and tracker")
        print("  phase-3   Source provenance analysis")
        print("  phase-4   Type normalization")
        print("  phase-5   Source quality inference")
        print("  status    Show current dataset status")
        sys.exit(1)

    command = sys.argv[1]
    creatures = load_creatures()

    if command == 'status':
        phase1_status(creatures)

    elif command == 'phase-1':
        print("Phase 1: Automated Cleanup")
        print("=" * 60)

        backup_creatures = json.loads(json.dumps(creatures))

        # 1. Fix Unknown types
        type_fixes = phase1_fix_unknown_types(creatures)
        print(f"\n  Type inference: {type_fixes} entries updated")

        # 2. Fix template descriptions
        desc_fixes = phase1_fix_template_descriptions(creatures)
        print(f"  Description enhancement: {desc_fixes} entries updated")

        # 3. Handle stubs
        merges = phase1_merge_nacken_stubs(creatures)
        if merges:
            print(f"\n  Nacken-pattern merges to apply ({len(merges)} pairs):")
            for stub_slug, target_slug in merges:
                print(f"    {stub_slug} -> merged into {target_slug}")
        else:
            print(f"\n  No Nacken-pattern merges needed")

        if type_fixes > 0 or desc_fixes > 0:
            save_creatures(creatures, backup=True)
        else:
            print("\n  No changes made")

        print("\n  Phase 1 complete. Run 'status' to verify.")

    elif command == 'phase-2':
        print("Phase 2: Research Planning & Tracking")
        print("=" * 60)
        phase2_generate_tracker(creatures)
        phase2_research_plan(creatures)

    elif command == 'phase-3':
        print("Phase 3: Source Provenance")
        print("=" * 60)
        # Count source usage
        sources = Counter()
        for c in creatures:
            src = c.get('source', '')
            if src:
                sources[src] += 1
        print(f"\n  Unique source values: {len(sources)}")
        print(f"  Most common sources:")
        for src, cnt in sources.most_common(10):
            print(f"    {src[:70]:70s} x{cnt}")

        # Entity type distribution
        types = Counter(c.get('type', 'Unknown') for c in creatures)
        print(f"\n  Creature type distribution:")
        for t, cnt in types.most_common(20):
            print(f"    {t:30s}: {cnt:5d}")

    elif command == 'phase-4':
        print("Phase 4: Type Normalization")
        print("=" * 60)

        backup_creatures = json.loads(json.dumps(creatures))

        # 1. Fix the 1 short description
        desc_fixes = phase4_fix_description(creatures)
        print(f"\n  Description fixes: {desc_fixes}")

        # 2. Normalize types
        case_fixes, hyphen_fixes, type_map_fixes, compound_fixes = phase4_normalize_type(creatures)
        print(f"  Case fixes: {case_fixes}")
        print(f"  Hyphen fixes: {hyphen_fixes}")
        print(f"  Type map fixes: {type_map_fixes}")
        print(f"  Compound fixes: {compound_fixes}")
        print(f"  Total type fixes: {case_fixes + hyphen_fixes + type_map_fixes + compound_fixes}")

        # 3. Status
        phase4_status(creatures)

        if case_fixes + hyphen_fixes + type_map_fixes + compound_fixes + desc_fixes > 0:
            save_creatures(creatures, backup=True)
        else:
            print("\n  No changes made")

        print("\n  Phase 4 complete. Run 'status' to verify.\n")

    elif command == 'phase-5':
        print("Phase 5: Source Quality Inference")
        print("=" * 60)

        # 1. Infer source_type and quality
        source_type_fixes, quality_fixes = phase5_infer_source_type_and_quality(creatures)
        print(f"\n  Source type fixes: {source_type_fixes}")
        print(f"  Quality fixes: {quality_fixes}")

        # 2. Status
        phase5_status(creatures)

        if source_type_fixes + quality_fixes > 0:
            save_creatures(creatures, backup=True)
        else:
            print("\n  No changes made")

        print("\n  Phase 5 complete. Run 'status' to verify.")

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == '__main__':
    main()
