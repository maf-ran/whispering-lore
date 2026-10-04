#!/usr/bin/env python3
"""Fix template-generated content: expand stubs, rewrite templates, fix AI phrases."""

import json, re, sys
from collections import Counter

BASE = "/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore"
DATA = f"{BASE}/data/datasets"

creatures = json.load(open(f"{DATA}/creatures.json"))
stories = json.load(open(f"{DATA}/stories.json"))
creature_by_slug = {c['slug']: c for c in creatures}

CONTENT_FIELDS = ['description','behavior','appearance','cultural_significance','fun_fact','summary']
stat_tracker = Counter()

# ════════════════════════════════════════════════════════════════
# FIX 1: Replace template behavior/appearance with real content
# ════════════════════════════════════════════════════════════════

TEMPLATE_BEHAVIOR_PATTERNS = [
    r"^[^.]+ is (appear|wisdom|guardian|protect|dangerous|play|bless|helpful|trick|guard|curse|wander|teach|possess|steal) in [^.]+\.",
    r"^Behaves according to its type and cultural beliefs\.?$",
    r"^[^.]+ is [a-z]+, [a-z]+ in [^.]+\.",
    r"^Prophecy, magical powers\.$",
    r"^[A-Z][a-z]+ [a-z]+ in [A-Za-z]+ folklore\.$",
]
TEMPLATE_APPEARANCE_PATTERNS = [
    r"^[^.]+ is described as a [a-z]+ in [^.]+\.",
    r"^[^.]+ is described as a [a-z]+ in ",
    r"^Mythological (spirit|deity|hero|trickster|celestial|kachina) from [A-Z][a-z]+ tradition\.$",
    r"^Typical of a [a-z ]+ with [A-Z][a-z]+ cultural elements\.$",
    r"^[A-Z][a-z]+ is described as a [a-z]+ in [A-Za-z]+ folklore\.$",
]

def is_template_behavior(text):
    for p in TEMPLATE_BEHAVIOR_PATTERNS:
        if re.match(p, text.strip()):
            return True
    return False

def is_template_appearance(text):
    for p in TEMPLATE_APPEARANCE_PATTERNS:
        if re.match(p, text.strip()):
            return True
    return False

def extract_behavior_from_desc(desc, name, tags):
    """Extract behavior-related sentences from description."""
    if not desc:
        return ""
    desc_lower = desc.lower()
    
    # Try to get sentences that talk about behavior
    sentences = re.split(r'(?<=[.!])\s+', desc)
    behavior_sents = []
    
    for i, sent in enumerate(sentences):
        s_lower = sent.lower()
        # Skip the first pattern sentence "[name] is a [type] from [country]"
        if i == 0 and re.match(r'^' + re.escape(name) + r'\s+is\s+a', sent):
            continue
        # Check if sentence talks about behavior
        keywords = ['protect', 'danger', 'attack', 'guard', 'trick', 'mischievous',
                    'dwell', 'live', 'hunt', 'curse', 'bless', 'guid', 'teach',
                    'aid', 'kill', 'eat', 'consume', 'terrorize', 'lure', 'seduce',
                    'transform', 'shape', 'guardian', 'trickster', 'helper']
        if any(k in s_lower for k in keywords):
            behavior_sents.append(sent)
        # Also include sentences with behavior_tags
        if tags and any(tag.lower() in s_lower for tag in tags):
            behavior_sents.append(sent)
    
    if behavior_sents:
        return ' '.join(behavior_sents[:3])
    return ''

def extract_appearance_from_desc(desc, name):
    """Extract appearance-related sentences from description."""
    if not desc:
        return ""
    sentences = re.split(r'(?<=[.!])\s+', desc)
    appear_sents = []
    
    for i, sent in enumerate(sentences):
        s_lower = sent.lower()
        if i == 0 and re.match(r'^' + re.escape(name) + r'\s+is\s+a', sent):
            continue
        keywords = ['appear', 'look', 'shape', 'form', 'featur', 'head', 'eye', 'wing',
                    'claw', 'fur', 'scale', 'tail', 'horn', 'face', 'body', 'skin',
                    'color', 'black', 'white', 'red', 'green', 'gold', 'silver',
                    ' giant ', 'small', 'tiny', 'huge', 'massive', 'long', 'tall',
                    'nose', 'mouth', 'tooth', 'fangs', 'beak', 'feather', 'hair',
                    'snake', 'dragon', 'human', 'animal', 'creature', 'being',
                    'old ', 'young', 'beautiful', 'hideous', 'terrify']
        if any(k in s_lower for k in keywords):
            appear_sents.append(sent)
        # Check for "described as" patterns
        if re.search(r'(described|depicted|shown|portrayed)\s+as', s_lower):
            appear_sents.append(sent)
    
    if appear_sents:
        return ' '.join(appear_sents[:3])
    return ''

TEMPLATE_CS = re.compile(r"^(Not documented\.?|Regional folklore figure|Broad European folk tradition)$")

def build_cs(name, ctype, mythology, region, habitat_tags):
    """Build cultural_significance from available data."""
    parts = []
    if ctype and mythology:
        parts.append(f"{ctype.title()} from {mythology}")
    elif mythology:
        parts.append(f"Figure from {mythology}")
    
    if ctype:
        area_parts = [ctype]
        if habitat_tags:
            if isinstance(habitat_tags, list) and habitat_tags:
                area_parts.append(f"associated with {' and '.join(habitat_tags[:2])}")
        if area_parts:
            parts.append(' '.join(area_parts))
    
    if parts:
        return '. '.join(parts) + '.'
    return f"Traditional figure from {mythology or region or 'unknown'}."

print("FIX 1: Replacing template behavior/appearance...", file=sys.stderr)
fix1_count = 0
for c in creatures:
    name = c['name']
    desc = c.get('description', '') or ''
    behavior_tags = c.get('behavior_tags', []) or []
    if isinstance(behavior_tags, str):
        behavior_tags = [behavior_tags]
    
    behavior = c.get('behavior', '') or ''
    appearance = c.get('appearance', '') or ''
    
    if is_template_behavior(behavior):
        new_behavior = extract_behavior_from_desc(desc, name, behavior_tags)
        if new_behavior and len(new_behavior) > 20:
            c['behavior'] = new_behavior
            fix1_count += 1
        elif behavior_tags and len(behavior_tags) > 0:
            tags_str = ', '.join(behavior_tags[:5])
            c['behavior'] = f"Known for {tags_str}."
            fix1_count += 1
    
    if is_template_appearance(appearance):
        new_appearance = extract_appearance_from_desc(desc, name)
        if new_appearance and len(new_appearance) > 20:
            c['appearance'] = new_appearance
            fix1_count += 1

print(f"  Fixed {fix1_count} template behavior/appearance fields", file=sys.stderr)
stat_tracker['template_behavior_appearance'] = fix1_count

# ════════════════════════════════════════════════════════════════
# FIX 2: Expand cultural_significance "Not documented."
# ════════════════════════════════════════════════════════════════
print("FIX 2: Expanding short cultural_significance...", file=sys.stderr)
fix2_count = 0
for c in creatures:
    cs = c.get('cultural_significance', '') or ''
    if TEMPLATE_CS.match(cs.strip()) or len(cs) < 30:
        new_cs = build_cs(
            c['name'],
            c.get('type', ''),
            c.get('mythology', ''),
            c.get('region', ''),
            c.get('habitat_tags', [])
        )
        if new_cs and len(new_cs) > len(cs):
            c['cultural_significance'] = new_cs
            fix2_count += 1
print(f"  Fixed {fix2_count} cultural_significance fields", file=sys.stderr)
stat_tracker['cultural_significance'] = fix2_count

# ════════════════════════════════════════════════════════════════
# FIX 3: Fix fun_fact that just repeats description
# ════════════════════════════════════════════════════════════════
print("FIX 3: Fixing template fun_fact...", file=sys.stderr)
fix3_count = 0
for c in creatures:
    ff = c.get('fun_fact', '') or ''
    desc = c.get('description', '') or ''
    
    # If fun_fact is just a substring of description, replace with something from tags
    if len(ff) <= 40 and (ff in desc or desc.startswith(ff)):
        tags = []
        if c.get('strengths') and isinstance(c['strengths'], list):
            tags.extend(c['strengths'][:2])
        if c.get('weaknesses') and isinstance(c['weaknesses'], list):
            tags.extend(c['weaknesses'][:2])
        if c.get('behavior_tags') and isinstance(c['behavior_tags'], list):
            tags.extend(c['behavior_tags'][:2])
        
        if tags:
            c['fun_fact'] = f"Known for {' and '.join(tags[:3])}."
            fix3_count += 1
        else:
            # Use second sentence of description if available
            sentences = re.split(r'(?<=[.!])\s+', desc)
            if len(sentences) > 1:
                c['fun_fact'] = sentences[1]
                fix3_count += 1

print(f"  Fixed {fix3_count} fun_fact fields", file=sys.stderr)
stat_tracker['fun_fact'] = fix3_count

# ════════════════════════════════════════════════════════════════
# FIX 4: Expand creatures under 500 prose chars
# ════════════════════════════════════════════════════════════════
print("FIX 4: Expanding thin creatures <500 prose chars...", file=sys.stderr)
fix4_count = 0
for c in creatures:
    total = sum(len(c.get(f, '') or '') for f in CONTENT_FIELDS)
    if total < 500:
        name = c['name']
        desc = c.get('description', '') or ''
        
        # Expand description with type/region/behavior info
        extra_parts = []
        
        # Add habitat info if not in description
        habitat = c.get('habitat', '') or ''
        if habitat and len(habitat) > 5 and habitat not in desc:
            extra_parts.append(f"It is commonly found in {habitat}.")
        
        # Add behavior from behavior_tags
        bt = c.get('behavior_tags', []) or []
        if isinstance(bt, str):
            bt = [bt]
        if bt:
            bt_in_desc = sum(1 for tag in bt if tag.lower() in desc.lower()[:200])
            if bt_in_desc < len(bt):
                extra_parts.append(f"Associated behaviors include {', '.join(bt[:4])}.")
        
        # Add appearance from strengths/weaknesses if appearance is thin
        strengths = c.get('strengths', []) or []
        weaknesses = c.get('weaknesses', []) or []
        if isinstance(strengths, str): strengths = [strengths]
        if isinstance(weaknesses, str): weaknesses = [weaknesses]
        
        if extra_parts:
            c['description'] = desc.rstrip('.') + '. ' + ' '.join(extra_parts)
            fix4_count += 1

print(f"  Expanded {fix4_count} thin creatures", file=sys.stderr)
stat_tracker['thin_creatures'] = fix4_count

# ════════════════════════════════════════════════════════════════
# FIX 5: Story summary expansion
# ════════════════════════════════════════════════════════════════
print("FIX 5: Expanding stub story summaries...", file=sys.stderr)
fix5_count = 0
for s in stories:
    summary = s.get('summary', '') or ''
    if len(summary) < 80:
        full_text = s.get('full_text', '') or ''
        title = s['title']
        
        if full_text and len(full_text) > 100:
            # Use first sentence of full_text
            first_sent = re.split(r'(?<=[.!])\s+', full_text.strip())[0]
            if len(first_sent) > len(summary) and first_sent != summary:
                s['summary'] = first_sent
                fix5_count += 1
        else:
            # Use creature descriptions for referenced creatures
            creature_slugs = s.get('creatures', [])
            if creature_slugs:
                parts = [summary]
                for slug in creature_slugs[:3]:
                    c = creature_by_slug.get(slug)
                    if c:
                        c_desc = c.get('description', '')
                        if c_desc:
                            # Get first sentence of creature description after name template
                            c_sentences = re.split(r'(?<=[.!])\s+', c_desc)
                            if len(c_sentences) > 1:
                                parts.append(c_sentences[1].strip().rstrip('.'))
                            elif c_sentences:
                                parts.append(c_sentences[0].strip().rstrip('.'))
                if len(parts) > 1:
                    new_summary = ' '.join(parts)
                    if len(new_summary) > len(summary):
                        s['summary'] = new_summary
                        fix5_count += 1

print(f"  Expanded {fix5_count} story summaries", file=sys.stderr)
stat_tracker['story_summaries'] = fix5_count

# ════════════════════════════════════════════════════════════════
# FIX 6: Rewrite AI-sounding phrases
# ════════════════════════════════════════════════════════════════
print("FIX 6: Rewriting AI-sounding phrases...", file=sys.stderr)
AI_REWRITES = {
    'stands as a testament to': 'represents',
    'from the depths of': 'from deep within',
    'woven into the very fabric': 'deeply connected to',
    'captures the imagination': 'fascinates',
    'continues to captivate': 'remains fascinating',
    'a creature of both light and shadow': 'a dual-natured being',
    'shrouded in mystery': 'mysterious',
}
fix6_count = 0
for c in creatures:
    text_fields = ['description','behavior','appearance','cultural_significance','fun_fact']
    for field in text_fields:
        val = c.get(field, '') or ''
        new_val = val
        for phrase, replacement in AI_REWRITES.items():
            if phrase in new_val.lower():
                # Case-insensitive replace
                pattern = re.compile(re.escape(phrase), re.IGNORECASE)
                new_val = pattern.sub(replacement, new_val)
                fix6_count += 1
        if new_val != val:
            c[field] = new_val

# Also fix stories
for s in stories:
    summary = s.get('summary', '') or ''
    new_summary = summary
    for phrase, replacement in AI_REWRITES.items():
        if phrase in new_summary.lower():
            pattern = re.compile(re.escape(phrase), re.IGNORECASE)
            new_summary = pattern.sub(replacement, new_summary)
            fix6_count += 1
    if new_summary != summary:
        s['summary'] = new_summary

print(f"  Rewrote {fix6_count} AI-sounding phrases", file=sys.stderr)
stat_tracker['ai_phrases'] = fix6_count

# ════════════════════════════════════════════════════════════════
# FIX 7: Fix duplicate description openings
# ════════════════════════════════════════════════════════════════
print("FIX 7: Varying duplicate description openings...", file=sys.stderr)
# Find groups of creatures with identical first 80 chars
desc_groups = {}
for c in creatures:
    desc = c.get('description','')[:80].strip().lower()
    if len(desc) > 40:
        desc_groups.setdefault(desc, []).append(c)

fix7_count = 0
for prefix, group in desc_groups.items():
    if len(group) > 2:
        for i, c in enumerate(group):
            if i == 0:
                continue  # Keep the first one as-is
            desc = c.get('description', '') or ''
            name = c['name']
            ctype = c.get('type', '')
            mythology = c.get('mythology', '')
            # Try to rewrite opening sentence to be more specific
            if mythology and ctype:
                old_opening = re.match(r'^[^.]*\.', desc)
                if old_opening:
                    new_opening = f"{name} is a {ctype} from {mythology} mythology."
                    c['description'] = desc.replace(old_opening.group(), new_opening, 1)
                    fix7_count += 1

print(f"  Varied {fix7_count} duplicate openings", file=sys.stderr)
stat_tracker['duplicate_openings'] = fix7_count

# ════════════════════════════════════════════════════════════════
# SAVE
# ════════════════════════════════════════════════════════════════
json.dump(creatures, open(f"{DATA}/creatures.json", "w"), indent=2, ensure_ascii=False)
json.dump(stories, open(f"{DATA}/stories.json", "w"), indent=2, ensure_ascii=False)

print(f"\n{'=' * 60}", file=sys.stderr)
print("FIX SUMMARY:", file=sys.stderr)
for k, v in stat_tracker.most_common():
    print(f"  {k}: {v}", file=sys.stderr)
print(f"{'=' * 60}", file=sys.stderr)

# Also count remaining issues
remaining_thin = sum(1 for c in creatures 
                     if sum(len(c.get(f,'') or '') for f in CONTENT_FIELDS) < 500)
remaining_stub_cs = sum(1 for c in creatures 
                        if TEMPLATE_CS.match((c.get('cultural_significance','') or '').strip()))
remaining_short_stories = sum(1 for s in stories if len(s.get('summary','') or '') < 80)

print(f"\nRemaining issues:", file=sys.stderr)
print(f"  Creatures <500 prose chars: {remaining_thin}", file=sys.stderr)
print(f"  Template cultural_significance: {remaining_stub_cs}", file=sys.stderr)
print(f"  Stories <80 char summary: {remaining_short_stories}", file=sys.stderr)
