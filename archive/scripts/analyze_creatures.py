#!/usr/bin/env python3
"""
Deep analysis of creatures.json — field lengths, distributions, worst entries, gold standards.
Outputs a comprehensive JSON report.
"""
import json, sys, os, collections
from statistics import median, mean

CREATURES_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'datasets', 'creatures.json')

# ---------------------------------------------------------------------------
# 1. Load data
# ---------------------------------------------------------------------------
with open(CREATURES_PATH, 'r') as f:
    creatures = json.load(f)
sys.stderr.write(f"Loaded {len(creatures)} creatures\n")

# ---------------------------------------------------------------------------
# 2. Text field analysis
# ---------------------------------------------------------------------------
TEXT_FIELDS = ['description', 'appearance', 'behavior', 'cultural_significance', 'summary', 'fun_fact']
field_lengths = {f: [] for f in TEXT_FIELDS}
field_empty   = {f: 0  for f in TEXT_FIELDS}
field_stats   = {}

for c in creatures:
    for f in TEXT_FIELDS:
        val = c.get(f, '')
        if val is None:
            val = ''
        ln = len(val)
        field_lengths[f].append(ln)
        if ln == 0:
            field_empty[f] += 1

for f in TEXT_FIELDS:
    vals = field_lengths[f]
    field_stats[f] = {
        'total': len(creatures),
        'empty': field_empty[f],
        'non_empty': len(creatures) - field_empty[f],
        'min': min(vals),
        'max': max(vals),
        'mean': round(mean(vals), 1),
        'median': round(median(vals), 1),
        'p25': sorted(vals)[len(vals)//4] if vals else 0,
        'p75': sorted(vals)[3*len(vals)//4] if vals else 0,
        'p10': sorted(vals)[len(vals)//10] if vals else 0,
        'p90': sorted(vals)[9*len(vals)//10] if vals else 0,
    }

# ---------------------------------------------------------------------------
# 3. Distribution by region (continent) — short entries
# ---------------------------------------------------------------------------
region_field = 'region' if 'region' in creatures[0] else 'continent'

THRESHOLDS = [100, 300, 500]
region_counts = collections.Counter()
region_details = {}

for c in creatures:
    region = c.get(region_field, c.get('country', 'Unknown')) or 'Unknown'
    region_counts[region] += 1
    if region not in region_details:
        region_details[region] = {f: {'total': 0, 'lt100': 0, 'lt300': 0, 'lt500': 0, 'all_lens': []} for f in TEXT_FIELDS}
    for f in TEXT_FIELDS:
        ln = len(c.get(f, '') or '')
        rd = region_details[region][f]
        rd['total'] += 1
        rd['all_lens'].append(ln)
        if ln < 100:  rd['lt100'] += 1
        if ln < 300:  rd['lt300'] += 1
        if ln < 500:  rd['lt500'] += 1

region_summary = {}
for region, rd in sorted(region_details.items()):
    region_summary[region] = {'total_creatures': region_counts[region]}
    for f in TEXT_FIELDS:
        d = rd[f]
        region_summary[region][f] = {
            'total': d['total'],
            'lt_100': d['lt100'],
            'lt_300': d['lt300'],
            'lt_500': d['lt500'],
            'pct_lt500': round(100.0 * d['lt500'] / max(d['total'], 1), 1),
        }

# ---------------------------------------------------------------------------
# 4. Worst-20 per field
# ---------------------------------------------------------------------------
def worst_20(creatures, field):
    scored = []
    for c in creatures:
        val = c.get(field, '') or ''
        ln = len(val)
        scored.append({
            'slug': c.get('slug', '?'),
            'name': c.get('name', '?'),
            'region': c.get('region', c.get('country', '?')),
            'type': c.get('type', '?'),
            'archetype': c.get('archetype', '?'),
            'length': ln,
            'text_preview': val[:200],
        })
    scored.sort(key=lambda x: x['length'])
    return scored[:20]

worst_fields = {}
for f in TEXT_FIELDS:
    worst_fields[f] = worst_20(creatures, f)

# ---------------------------------------------------------------------------
# 5. Metadata check for very-short entries (< 100 chars description)
# ---------------------------------------------------------------------------
very_short_desc = [c for c in creatures if len(c.get('description','') or '') < 100]
very_short_slugs = [c['slug'] for c in very_short_desc]
sys.stderr.write(f"Very short descriptions (<100 chars): {len(very_short_desc)}\n")

META_FIELDS = ['type', 'archetype', 'element', 'habitat', 'culture', 'region', 'country',
               'mythology', 'source_type', 'source_quality', 'stories', 'behavior',
               'appearance', 'tags', 'keywords', 'strengths', 'weaknesses', 'fun_fact',
               'living_tradition', 'schema_org_type']

metadata_report = {}
for c in very_short_desc:
    slug = c['slug']
    populated = {}
    for mf in META_FIELDS:
        val = c.get(mf)
        if isinstance(val, str) and val.strip():
            populated[mf] = val[:120]
        elif isinstance(val, (list, dict)) and len(val) > 0:
            populated[mf] = f"({type(val).__name__}, len={len(val)})"
        elif val is not None and val:
            populated[mf] = str(val)[:120]
        else:
            populated[mf] = None
    metadata_report[slug] = populated

meta_field_counts = {}
for mf in META_FIELDS:
    cnt = sum(1 for v in metadata_report.values() if v.get(mf) is not None)
    meta_field_counts[mf] = {'populated': cnt, 'total': len(very_short_desc), 'pct': round(100.0*cnt/max(len(very_short_desc),1), 1)}

# ---------------------------------------------------------------------------
# 6. Stub assessment
# ---------------------------------------------------------------------------
stub_count = 0
stubs = []
for c in creatures:
    d_len = len(c.get('description','') or '')
    a_len = len(c.get('appearance','') or '')
    b_len = len(c.get('behavior','') or '')
    if d_len < 100 and a_len < 100 and b_len < 100:
        stub_count += 1
        stubs.append({
            'slug': c['slug'],
            'name': c['name'],
            'region': c.get('region', c.get('country', '?')),
            'culture': c.get('culture', '?'),
            'type': c.get('type', '?'),
            'archetype': c.get('archetype', '?'),
            'desc_len': d_len,
            'appearance_len': a_len,
            'behavior_len': b_len,
        })

# ---------------------------------------------------------------------------
# 7. Gold standard examples (longest descriptions)
# ---------------------------------------------------------------------------
scored_desc = [(c, len(c.get('description','') or '')) for c in creatures]
scored_desc.sort(key=lambda x: x[1], reverse=True)
longest_examples = []
for c, ln in scored_desc[:10]:
    total_text = sum(len(c.get(f,'') or '') for f in TEXT_FIELDS)
    longest_examples.append({
        'slug': c['slug'],
        'name': c['name'],
        'region': c.get('region', '?'),
        'culture': c.get('culture', '?'),
        'type': c.get('type', '?'),
        'description_length': ln,
        'description': (c.get('description','') or '')[:800],
        'appearance_length': len(c.get('appearance','') or ''),
        'behavior_length': len(c.get('behavior','') or ''),
        'cultural_significance_length': len(c.get('cultural_significance','') or ''),
        'total_text_length': total_text,
    })

gold_standard = []
seen_regions = set()
for c, ln in scored_desc:
    region = c.get('region', c.get('country', '?'))
    if len(gold_standard) < 3 and region not in seen_regions:
        seen_regions.add(region)
        total_text = sum(len(c.get(f,'') or '') for f in TEXT_FIELDS)
        gold_standard.append({
            'slug': c['slug'],
            'name': c['name'],
            'region': region,
            'culture': c.get('culture', '?'),
            'type': c.get('type', '?'),
            'description_length': ln,
            'description': (c.get('description','') or '')[:1000],
            'appearance': (c.get('appearance','') or '')[:500],
            'behavior': (c.get('behavior','') or '')[:500],
            'cultural_significance': (c.get('cultural_significance','') or '')[:500],
        })

# ---------------------------------------------------------------------------
# 8. Distribution buckets
# ---------------------------------------------------------------------------
buckets = {'0': 0, '1-99': 0, '100-299': 0, '300-499': 0, '500-999': 0, '1000-1999': 0, '2000+': 0}
for ln in field_lengths['description']:
    if ln == 0:            buckets['0'] += 1
    elif ln < 100:         buckets['1-99'] += 1
    elif ln < 300:         buckets['100-299'] += 1
    elif ln < 500:         buckets['300-499'] += 1
    elif ln < 1000:        buckets['500-999'] += 1
    elif ln < 2000:        buckets['1000-1999'] += 1
    else:                  buckets['2000+'] += 1

# ---------------------------------------------------------------------------
# ASSEMBLE REPORT
# ---------------------------------------------------------------------------
report = {
    'metadata': {
        'total_creatures': len(creatures),
        'text_fields_analyzed': TEXT_FIELDS,
        'file': 'data/datasets/creatures.json',
    },
    'field_length_stats': field_stats,
    'description_length_buckets': buckets,
    'region_distribution_short_entries': region_summary,
    'worst_20_per_field': worst_fields,
    'very_short_descriptions_metadata_check': {
        'total_very_short': len(very_short_desc),
        'very_short_slugs': sorted(very_short_slugs),
        'field_population_counts': meta_field_counts,
        'per_creature_metadata': metadata_report,
    },
    'stub_assessment': {
        'total_stubs_all_fields_under_100': stub_count,
        'stub_details': stubs[:60],
    },
    'gold_standard_examples': gold_standard,
    'longest_descriptions_top10': longest_examples,
}

outpath = '/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/data/reports/creatures_analysis.json'
os.makedirs(os.path.dirname(outpath), exist_ok=True)
with open(outpath, 'w') as f:
    json.dump(report, f, indent=2, ensure_ascii=False)
sys.stderr.write(f"Report written to {outpath}\n")

# ---------------------------------------------------------------------------
# Print quick summary
# ---------------------------------------------------------------------------
print("=" * 70)
print("QUICK SUMMARY")
print("=" * 70)
for f in TEXT_FIELDS:
    s = field_stats[f]
    print(f"  {f}: mean={s['mean']}, median={s['median']}, min={s['min']}, max={s['max']}, empty={s['empty']}")
print(f"\n  Description buckets: {json.dumps(buckets)}")
print(f"  Total stubs (all 3 fields <100): {stub_count}")
print(f"  Very short descriptions (<100): {len(very_short_desc)}")
print(f"\n  Regions with highest % short descriptions (<500 chars):")
region_pcts = [(r, rd['description']['pct_lt500'], rd['description']['lt500'], rd['description']['total']) 
               for r, rd in region_summary.items()]
region_pcts.sort(key=lambda x: x[1], reverse=True)
for r, pct, n, tot in region_pcts[:10]:
    print(f"    {r}: {pct}% ({n}/{tot} under 500)")
