#!/usr/bin/env node
/**
 * Comprehensive Creatures Database Audit Script
 * Read-only analysis of /data/datasets/creatures.json
 * Checks 14 categories of data quality issues
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.resolve(__dirname, '../../data/datasets/creatures.json');
const creatures = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const TOTAL = creatures.length;
const results = { meta: { total_creatures: TOTAL, file: DATA_PATH, timestamp: new Date().toISOString() } };

// ── Helpers ──────────────────────────────────────────────────────────────────

function len(s) { return s != null ? String(s).length : 0; }
function isEmpty(v) { return v == null || v === '' || (Array.isArray(v) && v.length === 0); }
function isPlaceholder(s) {
  if (!s) return false;
  const lc = String(s).toLowerCase().trim();
  return ['not documented', 'n/a', 'unknown', 'tbd', 'todo', 'placeholder', 'various', 'none'].includes(lc);
}

/** Levenshtein-based similarity 0–1 */
function similarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const la = a.length, lb = b.length;
  if (la === 0 || lb === 0) return 0;
  if (la > 500) a = a.slice(0, 500);
  if (lb > 500) b = b.slice(0, 500);
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  const dist = dp[m][n];
  const maxLen = Math.max(m, n);
  return 1 - dist / maxLen;
}

/** Normalized compression–style similarity using trigram overlap */
function trigramSimilarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  const trigrams = s => {
    const set = new Set();
    const t = '  ' + s.toLowerCase();
    for (let i = 2; i < t.length; i++) set.add(t[i - 2] + t[i - 1] + t[i]);
    return set;
  };
  const sa = trigrams(a), sb = trigrams(b);
  let overlap = 0;
  for (const t of sa) { if (sb.has(t)) overlap++; }
  const union = sa.size + sb.size - overlap;
  return union === 0 ? 0 : overlap / union;
}

// ── 1. Too-Short Entries ─────────────────────────────────────────────────────

results.too_short = {};
const THRESHOLDS = {
  description: 100,
  appearance: 50,
  behavior: 50,
  habitat: 30,
  cultural_significance: 30,
};

for (const [field, minLen] of Object.entries(THRESHOLDS)) {
  const short = creatures
    .filter(c => len(c[field]) < minLen && len(c[field]) > 0)
    .map(c => ({ slug: c.slug, name: c.name, field, length: len(c[field]), value: String(c[field]).slice(0, 120) }));
  results.too_short[field] = { threshold: minLen, count: short.length, entries: short };
}

// Also catch truly empty/missing text fields
const textFields = ['description', 'appearance', 'behavior', 'habitat', 'cultural_significance', 'summary', 'fun_fact', 'source'];
results.empty_fields = {};
for (const f of textFields) {
  const empty = creatures.filter(c => isEmpty(c[f]));
  results.empty_fields[f] = { count: empty.length, slugs: empty.map(c => c.slug) };
}

// ── 2. Generic/Templated Text ────────────────────────────────────────────────

const GENERIC_PATTERNS = [
  /Typical appearance matches its role/i,
  /It is a supernatural being from/i,
  /This creature is a type of/i,
  /is a .+ from .+ folklore/i,  // Very generic descriptions
  /documented traditional stories/i,
  /traditional stories from .+ culture/i,
  /associated with .+ folklore$/i,
  /appear(s)? as a .+ in .+ (mythology|folklore)/i,
  /appears as (a|an) [a-z]+-spirit in .+ (mythology|folklore)/i,
  /is a .+-spirit from .+ folklore/i,
  /The .+ is a .+ from .+ folklore/i,
  /has been part of .+ culture/i,
  /traditional beliefs of .+/i,
];

results.generic_templated = [];
for (const c of creatures) {
  const issues = [];
  // Check appearance for template pattern
  if (c.appearance && /appears? as (a|an) [a-z]+-spirit in/i.test(c.appearance)) {
    issues.push({ field: 'appearance', pattern: 'templated spirit-in-mythology', snippet: c.appearance.slice(0, 120) });
  }
  if (c.appearance && /Typical appearance matches/i.test(c.appearance)) {
    issues.push({ field: 'appearance', pattern: 'typical-appearance-matches', snippet: c.appearance.slice(0, 120) });
  }
  if (c.behavior && /is a .+ from .+ folklore/.test(c.behavior) && c.behavior.length < 80) {
    issues.push({ field: 'behavior', pattern: 'generic-behavior-template', snippet: c.behavior.slice(0, 120) });
  }
  if (c.description && /associated with .+ folklore/i.test(c.description) && c.description.length < 120) {
    issues.push({ field: 'description', pattern: 'short-generic-description', snippet: c.description.slice(0, 120) });
  }
  if (c.fun_fact && /is a .+ from .+ folklore/i.test(c.fun_fact)) {
    issues.push({ field: 'fun_fact', pattern: 'generic-fun-fact', snippet: c.fun_fact.slice(0, 120) });
  }
  if (issues.length > 0) {
    results.generic_templated.push({ slug: c.slug, name: c.name, issues });
  }
}
results.generic_templated_summary = { count: results.generic_templated.length };

// ── 3. Duplicate Descriptions (similarity > 85%) ─────────────────────────────

results.duplicate_descriptions = [];
// First pass: exact duplicates (grouped)
const descMap = new Map();
for (const c of creatures) {
  const d = c.description || '';
  if (!descMap.has(d)) descMap.set(d, []);
  descMap.get(d).push(c.slug);
}
// Exact duplicates with > 1 creature
const exactDupGroups = [...descMap.entries()].filter(([, slugs]) => slugs.length > 1);
results.exact_duplicate_descriptions = {
  count: exactDupGroups.length,
  total_affected: exactDupGroups.reduce((s, [, slugs]) => s + slugs.length, 0),
  groups: exactDupGroups.map(([desc, slugs]) => ({ description: desc.slice(0, 200), slugs })),
};

// Near-duplicate pass using trigram similarity (sample pairs)
// Only check descriptions 60-300 chars to avoid slow comparison on very long ones
const candidates = creatures.filter(c => {
  const l = len(c.description);
  return l >= 60 && l <= 300;
});

// Use a bucketing approach for speed
const NEAR_DUP_THRESHOLD = 0.85;
const seenPairs = new Set();
const nearDups = [];

// For efficiency, compare within same region/culture buckets first, then cross-check
// But for thoroughness, we do a full O(n²) with early exit on trigram
const descCache = candidates.map(c => ({
  slug: c.slug,
  name: c.name,
  desc: c.description,
  trigrams: (() => {
    const set = new Set();
    const t = '  ' + c.description.toLowerCase();
    for (let i = 2; i < t.length; i++) set.add(t[i - 2] + t[i - 1] + t[i]);
    return set;
  })(),
}));

for (let i = 0; i < descCache.length; i++) {
  for (let j = i + 1; j < descCache.length; j++) {
    const a = descCache[i], b = descCache[j];
    // Quick reject: if trigram overlap < threshold, skip
    let overlap = 0;
    for (const t of a.trigrams) { if (b.trigrams.has(t)) overlap++; }
    const union = a.trigrams.size + b.trigrams.size - overlap;
    if (union === 0) continue;
    const sim = overlap / union;
    if (sim >= NEAR_DUP_THRESHOLD) {
      const key = a.slug + '|' + b.slug;
      if (!seenPairs.has(key)) {
        seenPairs.add(key);
        nearDups.push({ slug_a: a.slug, name_a: a.name, slug_b: b.slug, name_b: b.name, similarity: Math.round(sim * 1000) / 1000 });
      }
    }
  }
}

results.near_duplicate_descriptions = {
  threshold: NEAR_DUP_THRESHOLD,
  pairs_found: nearDups.length,
  pairs: nearDups.sort((a, b) => b.similarity - a.similarity).slice(0, 100),
};

// ── 4. Missing or Placeholder Data ───────────────────────────────────────────

const requiredArrays = ['aliases', 'related', 'tags', 'habitat_tags', 'behavior_tags', 'strengths', 'weaknesses', 'keywords', 'search_terms', 'motifs'];
results.missing_data = {};
for (const f of requiredArrays) {
  const issues = creatures.filter(c => isEmpty(c[f])).map(c => c.slug);
  results.missing_data[f] = { count: issues.length, pct: (issues.length / TOTAL * 100).toFixed(1) + '%', slugs: issues.slice(0, 30) };
}

// Placeholder values in text fields
results.placeholder_values = [];
const placeholderFields = ['habitat', 'country', 'culture', 'region', 'element', 'type'];
for (const f of placeholderFields) {
  const placeholders = creatures.filter(c => isPlaceholder(c[f]));
  if (placeholders.length > 0) {
    results.placeholder_values.push({ field: f, count: placeholders.length, entries: placeholders.map(c => ({ slug: c.slug, name: c.name, value: c[f] })).slice(0, 20) });
  }
}

// ── 5. Schema Anomalies ──────────────────────────────────────────────────────

const EXPECTED_SCHEMA = {
  id: 'string', slug: 'string', name: 'string', country: 'string', region: 'string',
  culture: 'string', type: 'string', mythology: 'string', archetype: 'string', element: 'string',
  aliases: 'array', related: 'array', description: 'string', appearance: 'string',
  behavior: 'string', habitat: 'string', habitat_tags: 'array', behavior_tags: 'array',
  strengths: 'array', weaknesses: 'array', cultural_significance: 'string', summary: 'string',
  fun_fact: 'string', fun_fact_generated: 'boolean', keywords: 'array', search_terms: 'array',
  tags: 'array', schema_org_type: 'string', seo_title: 'string', seo_description: 'string',
  motifs: 'array', featured_in_stories: 'array', source: 'string', source_quality: 'string',
  stories: 'array', version: 'string', lastUpdated: 'string', living_tradition: 'boolean',
  source_type: 'string',
};

results.schema_anomalies = [];
const allKeys = new Set(Object.keys(EXPECTED_SCHEMA));
const extraFields = new Set();

for (let i = 0; i < creatures.length; i++) {
  const c = creatures[i];
  const issues = [];
  // Check missing fields
  for (const [field, expectedType] of Object.entries(EXPECTED_SCHEMA)) {
    if (!(field in c)) {
      issues.push({ field, issue: 'missing_field', expected: expectedType });
    } else if (expectedType === 'array' && !Array.isArray(c[field])) {
      issues.push({ field, issue: 'type_mismatch', expected: 'array', actual: typeof c[field] });
    } else if (expectedType === 'string' && typeof c[field] !== 'string') {
      issues.push({ field, issue: 'type_mismatch', expected: 'string', actual: typeof c[field] + (Array.isArray(c[field]) ? '[]' : '') });
    } else if (expectedType === 'boolean' && typeof c[field] !== 'boolean') {
      issues.push({ field, issue: 'type_mismatch', expected: 'boolean', actual: typeof c[field] });
    }
  }
  // Check for unexpected fields
  for (const key of Object.keys(c)) {
    if (!EXPECTED_SCHEMA[key]) extraFields.add(key);
  }
  if (issues.length > 0) {
    results.schema_anomalies.push({ index: i, slug: c.slug, name: c.name, issues });
  }
}
results.schema_anomalies_summary = {
  count: results.schema_anomalies.length,
  extra_fields: [...extraFields],
};

// ── 6. Duplicate Slugs or IDs ────────────────────────────────────────────────

const slugCount = new Map();
const idCount = new Map();
for (const c of creatures) {
  slugCount.set(c.slug, (slugCount.get(c.slug) || 0) + 1);
  idCount.set(c.id, (idCount.get(c.id) || 0) + 1);
}
results.duplicate_slugs = {
  count: [...slugCount.values()].filter(v => v > 1).length,
  duplicates: [...slugCount.entries()].filter(([, v]) => v > 1).map(([slug, count]) => ({ slug, occurrences: count })),
};
results.duplicate_ids = {
  count: [...idCount.values()].filter(v => v > 1).length,
  duplicates: [...idCount.entries()].filter(([, v]) => v > 1).map(([id, count]) => ({ id, occurrences: count })),
};

// ── 7. Cross-Reference Integrity ─────────────────────────────────────────────

const allSlugs = new Set(creatures.map(c => c.slug));
results.broken_cross_refs = [];
for (const c of creatures) {
  if (!Array.isArray(c.related)) continue;
  const broken = c.related.filter(r => !allSlugs.has(r));
  if (broken.length > 0) {
    results.broken_cross_refs.push({ slug: c.slug, name: c.name, broken_refs: broken });
  }
}
results.broken_cross_refs_summary = {
  creatures_with_broken_refs: results.broken_cross_refs.length,
  total_broken_refs: results.broken_cross_refs.reduce((s, c) => s + c.broken_refs.length, 0),
};

// ── 8. Source Quality Issues ─────────────────────────────────────────────────

const sqDistribution = {};
for (const c of creatures) {
  const sq = c.source_quality || '(missing)';
  sqDistribution[sq] = (sqDistribution[sq] || 0) + 1;
}
results.source_quality = {
  distribution: sqDistribution,
  missing: creatures.filter(c => !c.source_quality || c.source_quality === '').map(c => ({ slug: c.slug, name: c.name })),
  low_quality: creatures.filter(c => c.source_quality === 'poor').map(c => ({ slug: c.slug, name: c.name })),
};

// Source type distribution
const stDistribution = {};
for (const c of creatures) {
  const st = c.source_type || '(missing)';
  stDistribution[st] = (stDistribution[st] || 0) + 1;
}
results.source_type_distribution = stDistribution;

// ── 9. Story Linkage ─────────────────────────────────────────────────────────

results.empty_stories = creatures.filter(c => isEmpty(c.stories)).map(c => c.slug);
results.empty_featured_in_stories = creatures.filter(c => isEmpty(c.featured_in_stories)).map(c => c.slug);
results.story_linkage = {
  creatures_with_no_stories: results.empty_stories.length,
  creatures_with_no_featured: results.empty_featured_in_stories.length,
  creatures_with_both_empty: creatures.filter(c => isEmpty(c.stories) && isEmpty(c.featured_in_stories)).length,
};

// ── 10. Name/Culture Mismatches ──────────────────────────────────────────────

const AUTOGEN_CULTURE = ['Unknown', 'Various', 'Multiple', 'Global', 'World', 'Generic', 'Mixed'];
results.name_culture_issues = [];
for (const c of creatures) {
  const issues = [];
  if (AUTOGEN_CULTURE.includes(c.culture)) {
    issues.push({ field: 'culture', value: c.culture, type: 'auto_generated_or_vague' });
  }
  if (AUTOGEN_CULTURE.includes(c.country)) {
    issues.push({ field: 'country', value: c.country, type: 'auto_generated_or_vague' });
  }
  if (AUTOGEN_CULTURE.includes(c.region)) {
    issues.push({ field: 'region', value: c.region, type: 'auto_generated_or_vague' });
  }
  // Check if name looks auto-generated (lowercase, single word creature-name pattern)
  if (c.name && /^[a-z]/.test(c.name)) {
    issues.push({ field: 'name', value: c.name, type: 'starts_lowercase' });
  }
  // Check if name is just the slug title-cased
  const slugTitle = c.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  if (c.name === slugTitle && c.name.split(' ').length <= 2) {
    issues.push({ field: 'name', value: c.name, type: 'likely_slug_derived' });
  }
  if (issues.length > 0) {
    results.name_culture_issues.push({ slug: c.slug, name: c.name, issues });
  }
}

// ── 11. Archetype Distribution ───────────────────────────────────────────────

const archDist = {};
for (const c of creatures) { archDist[c.archetype] = (archDist[c.archetype] || 0) + 1; }
const sortedArch = Object.entries(archDist).sort((a, b) => b[1] - a[1]);
results.archetype_distribution = {
  total_unique: sortedArch.length,
  top_20: sortedArch.slice(0, 20).map(([archetype, count]) => ({ archetype, count, pct: (count / TOTAL * 100).toFixed(1) + '%' })),
  bottom_10: sortedArch.slice(-10).map(([archetype, count]) => ({ archetype, count, pct: (count / TOTAL * 100).toFixed(1) + '%' })),
};

// ── 12. Region/Country Distribution Anomalies ────────────────────────────────

const regionDist = {};
const countryDist = {};
const emptyRegion = [];
const emptyCountry = [];
const suspiciousCountry = [];
const SUSPICIOUS_COUNTRY_VALUES = ['Unknown', 'Various', 'Global', 'World', 'Multiple', 'Mixed', ''];
for (const c of creatures) {
  regionDist[c.region] = (regionDist[c.region] || 0) + 1;
  countryDist[c.country] = (countryDist[c.country] || 0) + 1;
  if (!c.region || c.region.trim() === '') emptyRegion.push(c.slug);
  if (!c.country || c.country.trim() === '') emptyCountry.push(c.slug);
  if (SUSPICIOUS_COUNTRY_VALUES.includes(c.country)) suspiciousCountry.push({ slug: c.slug, country: c.country });
}
results.region_distribution = {
  unique_regions: Object.keys(regionDist).length,
  distribution: Object.entries(regionDist).sort((a, b) => b[1] - a[1]),
};
results.country_anomalies = {
  empty_region: { count: emptyRegion.length, slugs: emptyRegion },
  empty_country: { count: emptyCountry.length, slugs: emptyCountry },
  suspicious_country: { count: suspiciousCountry.length, entries: suspiciousCountry },
};

// ── 13. Description Length Statistics ────────────────────────────────────────

const descLengths = creatures.map(c => len(c.description)).filter(l => l > 0).sort((a, b) => a - b);
const percentile = (arr, p) => arr[Math.floor(arr.length * p / 100)];
results.description_stats = {
  count: descLengths.length,
  min: descLengths[0],
  max: descLengths[descLengths.length - 1],
  mean: (descLengths.reduce((s, v) => s + v, 0) / descLengths.length).toFixed(1),
  median: percentile(descLengths, 50),
  p10: percentile(descLengths, 10),
  p25: percentile(descLengths, 25),
  p75: percentile(descLengths, 75),
  p90: percentile(descLengths, 90),
  under_100: descLengths.filter(l => l < 100).length,
  under_120: descLengths.filter(l => l < 120).length,
};

// Also do appearance, behavior, habitat stats
for (const field of ['appearance', 'behavior', 'habitat']) {
  const lengths = creatures.map(c => len(c[field])).filter(l => l > 0).sort((a, b) => a - b);
  if (lengths.length > 0) {
    results[field + '_stats'] = {
      count: lengths.length,
      min: lengths[0],
      max: lengths[lengths.length - 1],
      mean: (lengths.reduce((s, v) => s + v, 0) / lengths.length).toFixed(1),
      median: percentile(lengths, 50),
      p10: percentile(lengths, 10),
      p90: percentile(lengths, 90),
    };
  }
}

// ── 14. Exact Duplicate Descriptions (word-for-word) ─────────────────────────

// Already captured in #3 as exact_dup_groups, but let's provide a cleaner view
results.exact_duplicate_descriptions_detail = exactDupGroups.map(([desc, slugs]) => ({
  description_preview: desc.slice(0, 200),
  creature_count: slugs.length,
  slugs,
}));

// ── Bonus: Shortest descriptions (for triage) ────────────────────────────────

results.shortest_descriptions = creatures
  .filter(c => len(c.description) > 0)
  .sort((a, b) => len(a.description) - len(b.description))
  .slice(0, 15)
  .map(c => ({ slug: c.slug, name: c.name, length: len(c.description), preview: c.description.slice(0, 150) }));

// ── Bonus: Creatures with empty related + stories (totally isolated) ──────────

results.isolated_creatures = creatures
  .filter(c => isEmpty(c.related) && isEmpty(c.stories) && isEmpty(c.featured_in_stories))
  .map(c => ({ slug: c.slug, name: c.name, culture: c.culture }));

// ── Grand Summary ────────────────────────────────────────────────────────────

results.grand_summary = {
  total_creatures: TOTAL,
  critical: {
    broken_cross_refs: results.broken_cross_refs_summary.total_broken_refs,
    duplicate_slugs: results.duplicate_slugs.count,
    duplicate_ids: results.duplicate_ids.count,
    empty_descriptions: results.empty_fields.description?.count || 0,
    exact_dup_description_groups: results.exact_duplicate_descriptions.count,
    exact_dup_affected_creatures: results.exact_duplicate_descriptions.total_affected,
  },
  high: {
    near_dup_description_pairs: results.near_duplicate_descriptions.pairs_found,
    templated_text: results.generic_templated_summary.count,
    description_under_100_chars: results.too_short.description.count,
    appearance_under_50_chars: results.too_short.appearance.count,
    behavior_under_50_chars: results.too_short.behavior.count,
    poor_source_quality: results.source_quality.low_quality.length,
    creatures_with_no_stories: results.story_linkage.creatures_with_no_stories,
    empty_related_array: results.missing_data.related?.count || 0,
  },
  medium: {
    schema_anomalies: results.schema_anomalies_summary.count,
    suspicious_country: results.country_anomalies.suspicious_country.count,
    name_culture_issues: results.name_culture_issues.length,
    empty_habitat_tags: results.missing_data.habitat_tags?.count || 0,
    empty_behavior_tags: results.missing_data.behavior_tags?.count || 0,
    isolated_creatures: results.isolated_creatures.length,
  },
  low: {
    empty_featured_in_stories: results.empty_featured_in_stories.length,
    empty_aliases: results.missing_data.aliases?.count || 0,
    empty_tags: results.missing_data.tags?.count || 0,
    placeholder_values: results.placeholder_values.reduce((s, p) => s + p.count, 0),
  },
};

// ── Output ───────────────────────────────────────────────────────────────────

const outputPath = path.resolve(__dirname, '../../archive/audit-creatures-report.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
console.log(`\n[OK] Report written to ${outputPath}`);
