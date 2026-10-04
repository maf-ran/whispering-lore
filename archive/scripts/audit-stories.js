#!/usr/bin/env node
/**
 * Comprehensive Stories Database Audit
 * Checks 16 categories of data quality issues across 1719 stories.
 * READ-ONLY — does not modify any data files.
 */

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '../..');
const STORIES_PATH = path.join(BASE, 'data/datasets/stories.json');
const CREATURES_PATH = path.join(BASE, 'data/datasets/creatures.json');
const OUTPUT_PATH = path.join(BASE, 'archive/scripts/audit-stories-report.json');

const stories = JSON.parse(fs.readFileSync(STORIES_PATH, 'utf8'));
const creatures = JSON.parse(fs.readFileSync(CREATURES_PATH, 'utf8'));

const creatureSlugs = new Set(creatures.map(c => c.slug));

// Canonical story types
const CANONICAL_TYPES = new Set([
  'fairy-tale', 'myth', 'legend', 'folktale', 'fable', 'saga',
  'epic', 'tale', 'parable', 'origin-story', 'creation-myth',
  'hero-cycle', 'nursery-rhyme', 'lullaby', 'riddle',
  'prophecy', 'ghost-story', 'urban-legend', 'memorate', 'fabliau'
]);

// Helpers
function charLen(s) { return s ? s.length : 0; }
function isBlank(s) { return !s || (typeof s === 'string' && s.trim().length === 0); }
function norm(s) { return (s || '').toLowerCase().trim(); }

// Fast similarity: word-overlap (Jaccard) + trigram overlap for near-duplicates
function tokenize(s) { return (s || '').toLowerCase().split(/\s+/).filter(Boolean); }

function jaccardSimilarity(a, b) {
  const ta = new Set(tokenize(a));
  const tb = new Set(tokenize(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const w of ta) if (tb.has(w)) inter++;
  return inter / (ta.size + tb.size - inter);
}

function trigrams(s) {
  const t = (s || '').toLowerCase();
  const set = new Set();
  for (let i = 0; i <= t.length - 3; i++) set.add(t.slice(i, i + 3));
  return set;
}

function similarity(a, b) {
  if (a === b) return 1;
  if (!a || !b) return 0;
  if (Math.abs(a.length - b.length) / Math.max(a.length, b.length) > 0.3) return 0;
  // Combine word Jaccard (40%) + trigram overlap (60%) for speed
  const jaccard = jaccardSimilarity(a, b);
  const ta = trigrams(a), tb = trigrams(b);
  if (ta.size === 0 || tb.size === 0) return jaccard;
  let inter = 0;
  for (const g of ta) if (tb.has(g)) inter++;
  const trigSim = inter / (ta.size + tb.size - inter);
  return jaccard * 0.4 + trigSim * 0.6;
}

function percentile(sorted, p) {
  const idx = Math.ceil(sorted.length * p / 100) - 1;
  return sorted[Math.max(0, idx)];
}

function median(sorted) {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ═══════════════════════════════════════════════
// 1. TOO-SHORT ENTRIES
// ═══════════════════════════════════════════════
const tooShort = { summary: [], full_text: [], moral: [] };
for (const s of stories) {
  const i = s.id || s.slug || '(unknown)';
  const t = s.title || '(untitled)';
  if (charLen(s.summary) < 100) tooShort.summary.push({ id: i, title: t, len: charLen(s.summary), summary: (s.summary || '').slice(0, 80) });
  if (charLen(s.full_text) < 300) tooShort.full_text.push({ id: i, title: t, len: charLen(s.full_text) });
  if (s.moral && charLen(s.moral) < 20) tooShort.moral.push({ id: i, title: t, len: charLen(s.moral), moral: s.moral });
}

// ═══════════════════════════════════════════════
// 2. GENERIC/TEMPLATED TEXT
// ═══════════════════════════════════════════════
const templatedPatterns = [
  /^This tale from/i,
  /^A legendary tale of/i,
  /^The story of/i,
  /^In the land of/i,
  /^Long ago, in the/i,
  /^Once upon a time/i,
  /^This is the tale of/i,
  /^A story from the/i,
  /^The legend of/i,
  /^In a distant land/i,
  /^From the ancient/i,
  /^According to legend/i,
  /^It is said that in/i,
  /^In times of old/i,
  /^This ancient story/i,
];
const templated = [];
for (const s of stories) {
  const text = s.full_text || '';
  const firstPara = text.split('\n')[0].trim();
  for (const pat of templatedPatterns) {
    if (pat.test(firstPara) || pat.test(s.summary || '')) {
      templated.push({ id: s.id, title: s.title, matched: pat.source, opening: firstPara.slice(0, 120) });
      break;
    }
  }
}

// ═══════════════════════════════════════════════
// 3. DUPLICATE STORIES (title & summary similarity)
// ═══════════════════════════════════════════════
const dupTitles = [];
const dupSummaries = [];

// Title duplicates (exact or very similar)
const titleMap = new Map();
for (const s of stories) {
  const key = norm(s.title);
  if (!titleMap.has(key)) titleMap.set(key, []);
  titleMap.get(key).push(s);
}
for (const [key, group] of titleMap) {
  if (group.length > 1) {
    dupTitles.push({ title: group[0].title, count: group.length, ids: group.map(s => s.id) });
  }
}

// Summary similarity > 85% — only check within same country to limit O(n^2)
const byCountry = new Map();
for (const s of stories) {
  const c = norm(s.country) || '__none';
  if (!byCountry.has(c)) byCountry.set(c, []);
  byCountry.get(c).push(s);
}
const dupSummaryPairs = [];
for (const [country, group] of byCountry) {
  if (group.length < 2) continue;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const sim = similarity(norm(group[i].summary), norm(group[j].summary));
      if (sim > 0.85) {
        dupSummaryPairs.push({
          a: { id: group[i].id, title: group[i].title },
          b: { id: group[j].id, title: group[j].title },
          country,
          similarity: Math.round(sim * 100) + '%'
        });
      }
    }
  }
}

// ═══════════════════════════════════════════════
// 4. MISSING OR PLACEHOLDER DATA
// ═══════════════════════════════════════════════
const requiredFields = ['title', 'country', 'region', 'type', 'summary', 'full_text', 'source'];
const missingData = [];
for (const s of stories) {
  const issues = [];
  for (const f of requiredFields) {
    if (s[f] === null || s[f] === undefined) issues.push({ field: f, value: 'null/undefined' });
    else if (typeof s[f] === 'string' && isBlank(s[f])) issues.push({ field: f, value: 'empty string' });
  }
  if (issues.length) missingData.push({ id: s.id, title: s.title, issues });
}

// ═══════════════════════════════════════════════
// 5. SCHEMA ANOMALIES
// ═══════════════════════════════════════════════
const expectedTypes = {
  id: 'string', title: 'string', country: 'string', continent: 'string',
  region: 'string', type: 'string', summary: 'string', full_text: 'string',
  themes: 'object', moral: 'string', source: 'string', period: 'string',
  keywords: 'object', creatures: 'object', source_quality: 'string',
  slug: 'string', version: 'string', lastUpdated: 'string', source_type: 'string'
};
const schemaAnomalies = [];
for (const s of stories) {
  for (const [field, expectedType] of Object.entries(expectedTypes)) {
    if (s[field] !== undefined && s[field] !== null) {
      if (expectedType === 'object') {
        if (!Array.isArray(s[field])) {
          schemaAnomalies.push({ id: s.id, title: s.title, field, actual: typeof s[field], expected: 'array' });
        }
      } else {
        if (typeof s[field] !== expectedType) {
          schemaAnomalies.push({ id: s.id, title: s.title, field, actual: typeof s[field], expected: expectedType });
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════
// 6. DUPLICATE SLUGS OR IDS
// ═══════════════════════════════════════════════
const slugMap = new Map();
const idMap = new Map();
for (const s of stories) {
  if (s.slug) { if (!slugMap.has(s.slug)) slugMap.set(s.slug, []); slugMap.get(s.slug).push(s); }
  if (s.id) { if (!idMap.has(s.id)) idMap.set(s.id, []); idMap.get(s.id).push(s); }
}
const dupSlugs = [];
for (const [slug, group] of slugMap) {
  if (group.length > 1) dupSlugs.push({ slug, count: group.length, ids: group.map(s => s.id) });
}
const dupIds = [];
for (const [id, group] of idMap) {
  if (group.length > 1) dupIds.push({ id, count: group.length, titles: group.map(s => s.title) });
}

// ═══════════════════════════════════════════════
// 7. CROSS-REFERENCE INTEGRITY
// ═══════════════════════════════════════════════
const brokenRefs = [];
for (const s of stories) {
  if (!Array.isArray(s.creatures)) continue;
  for (const ref of s.creatures) {
    if (!creatureSlugs.has(ref)) {
      brokenRefs.push({ storyId: s.id, storyTitle: s.title, brokenRef: ref });
    }
  }
}

// ═══════════════════════════════════════════════
// 8. SOURCE QUALITY ISSUES
// ═══════════════════════════════════════════════
const sqDistribution = {};
const sqIssues = [];
for (const s of stories) {
  const sq = s.source_quality || '(missing)';
  sqDistribution[sq] = (sqDistribution[sq] || 0) + 1;
  if (!s.source_quality || isBlank(s.source_quality)) {
    sqIssues.push({ id: s.id, title: s.title, source_quality: s.source_quality || null });
  }
}

// ═══════════════════════════════════════════════
// 9. TYPE DISTRIBUTION
// ═══════════════════════════════════════════════
const typeDistribution = {};
const nonCanonicalTypes = [];
for (const s of stories) {
  const t = s.type || '(missing)';
  typeDistribution[t] = (typeDistribution[t] || 0) + 1;
  if (s.type && !CANONICAL_TYPES.has(s.type)) {
    nonCanonicalTypes.push({ id: s.id, title: s.title, type: s.type });
  }
}

// ═══════════════════════════════════════════════
// 10. EMPTY FULL_TEXT
// ═══════════════════════════════════════════════
const emptyFullText = [];
for (const s of stories) {
  if (!s.full_text || isBlank(s.full_text)) {
    emptyFullText.push({ id: s.id, title: s.title, full_text: s.full_text ? '(whitespace only)' : '(empty/null)' });
  }
}

// ═══════════════════════════════════════════════
// 11. FULL_TEXT VS SUMMARY MISMATCH
// ═══════════════════════════════════════════════
const textMismatch = [];
for (const s of stories) {
  if (!s.full_text || !s.summary) continue;
  const ftLen = s.full_text.length;
  const sumLen = s.summary.length;
  if (sumLen > 0 && ftLen / sumLen < 1.5) {
    textMismatch.push({ id: s.id, title: s.title, summaryLen: sumLen, fullTextLen: ftLen, ratio: (ftLen / sumLen).toFixed(2) });
  }
}

// ═══════════════════════════════════════════════
// 12. COUNTRY/REGION CONSISTENCY
// ═══════════════════════════════════════════════
const suspiciousCountry = [];
const suspiciousRegion = [];
for (const s of stories) {
  const c = s.country || '';
  const r = s.region || '';
  if (isBlank(c)) suspiciousCountry.push({ id: s.id, title: s.title, country: c || '(empty)' });
  else if (/^\d+$/.test(c)) suspiciousCountry.push({ id: s.id, title: s.title, country: c, reason: 'numeric' });
  else if (/unknown/i.test(c) && c.length < 10) suspiciousCountry.push({ id: s.id, title: s.title, country: c, reason: 'unknown' });

  if (isBlank(r)) suspiciousRegion.push({ id: s.id, title: s.title, region: r || '(empty)' });
  else if (/^\d+$/.test(r)) suspiciousRegion.push({ id: s.id, title: s.title, region: r, reason: 'numeric' });
}

// ═══════════════════════════════════════════════
// 13. PERIOD FIELD QUALITY
// ═══════════════════════════════════════════════
const periodIssues = [];
const periodDist = {};
for (const s of stories) {
  const p = s.period || '(missing)';
  periodDist[p] = (periodDist[p] || 0) + 1;
  if (!s.period || isBlank(s.period) || /^unknown$/i.test(s.period.trim())) {
    periodIssues.push({ id: s.id, title: s.title, period: s.period || null });
  }
}

// ═══════════════════════════════════════════════
// 14. MORAL FIELD QUALITY
// ═══════════════════════════════════════════════
const moralLengths = [];
const genericMorals = [];
const genericPatterns = [
  /^good always wins/i,
  /^evil never wins/i,
  /^be kind/i,
  /^honesty is the best policy/i,
  /^hard work pays off/i,
  /^never give up/i,
];
for (const s of stories) {
  if (s.moral) {
    moralLengths.push({ id: s.id, title: s.title, len: s.moral.length, moral: s.moral });
    if (s.moral.length < 30) {
      genericMorals.push({ id: s.id, title: s.title, moral: s.moral });
    }
    for (const gp of genericPatterns) {
      if (gp.test(s.moral)) {
        genericMorals.push({ id: s.id, title: s.title, moral: s.moral, pattern: gp.source });
        break;
      }
    }
  }
}
moralLengths.sort((a, b) => a.len - b.len);

// ═══════════════════════════════════════════════
// 15. FULL_TEXT LENGTH STATISTICS
// ═══════════════════════════════════════════════
const ftLengths = stories.map(s => charLen(s.full_text)).sort((a, b) => a - b);
const ftStats = {
  count: ftLengths.length,
  min: ftLengths[0],
  max: ftLengths[ftLengths.length - 1],
  mean: Math.round(ftLengths.reduce((a, b) => a + b, 0) / ftLengths.length),
  median: median(ftLengths),
  p10: percentile(ftLengths, 10),
  p90: percentile(ftLengths, 90),
  zeroCount: ftLengths.filter(l => l === 0).length,
};

// ═══════════════════════════════════════════════
// 16. DUPLICATE FULL_TEXT
// ═══════════════════════════════════════════════
const ftMap = new Map();
for (const s of stories) {
  const key = norm(s.full_text);
  if (!key) continue;
  if (!ftMap.has(key)) ftMap.set(key, []);
  ftMap.get(key).push(s);
}
const dupFullText = [];
for (const [key, group] of ftMap) {
  if (group.length > 1) {
    dupFullText.push({
      fullTextPreview: key.slice(0, 120),
      count: group.length,
      ids: group.map(s => s.id),
      titles: group.map(s => s.title)
    });
  }
}

// ═══════════════════════════════════════════════
// BUILD REPORT
// ═══════════════════════════════════════════════
const report = {
  meta: {
    generated: new Date().toISOString(),
    totalStories: stories.length,
    totalCreatures: creatures.length,
    scriptVersion: '1.0.0'
  },
  summary: {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  },
  findings: {}
};

// Severity classification
function classify(severity, key, data) {
  report.findings[key] = { severity, ...data };
  if (typeof data.count === 'number') {
    report.summary[severity] += data.count;
  } else if (Array.isArray(data.items)) {
    report.summary[severity] += data.items.length;
  } else if (Array.isArray(data.pairs)) {
    report.summary[severity] += data.pairs.length;
  }
}

// Critical: data that breaks functionality
classify('critical', 'cross_reference_integrity', {
  title: 'Broken creature cross-references',
  description: 'Creature slugs referenced in stories that do not exist in creatures.json',
  count: brokenRefs.length,
  items: brokenRefs
});

classify('critical', 'duplicate_ids', {
  title: 'Duplicate story IDs',
  description: 'Multiple stories sharing the same ID value',
  count: dupIds.length,
  items: dupIds
});

classify('critical', 'duplicate_slugs', {
  title: 'Duplicate story slugs',
  description: 'Multiple stories sharing the same slug value',
  count: dupSlugs.length,
  items: dupSlugs
});

classify('critical', 'empty_full_text', {
  title: 'Empty full_text fields',
  description: 'Stories with null, empty, or whitespace-only full_text',
  count: emptyFullText.length,
  items: emptyFullText
});

classify('critical', 'missing_required_data', {
  title: 'Missing required fields',
  description: 'Stories with null/empty required fields (title, country, region, type, summary, full_text, source)',
  count: missingData.length,
  items: missingData.slice(0, 100),
  truncated: missingData.length > 100
});

// High: significant quality issues
classify('high', 'too_short_summary', {
  title: 'Summary too short (< 100 chars)',
  count: tooShort.summary.length,
  items: tooShort.summary.slice(0, 50),
  truncated: tooShort.summary.length > 50
});

classify('high', 'too_short_full_text', {
  title: 'full_text too short (< 300 chars)',
  count: tooShort.full_text.length,
  items: tooShort.full_text
});

classify('high', 'full_text_summary_mismatch', {
  title: 'full_text is essentially just the summary (< 1.5x)',
  count: textMismatch.length,
  items: textMismatch.slice(0, 50),
  truncated: textMismatch.length > 50
});

classify('high', 'duplicate_title_groups', {
  title: 'Stories with identical/similar titles',
  count: dupTitles.length,
  groups: dupTitles
});

classify('high', 'duplicate_summaries', {
  title: 'Near-identical summaries (> 85% similarity) within same country',
  count: dupSummaryPairs.length,
  pairs: dupSummaryPairs.slice(0, 50),
  truncated: dupSummaryPairs.length > 50
});

classify('high', 'duplicate_full_text', {
  title: 'Stories sharing identical full_text content',
  count: dupFullText.length,
  groups: dupFullText
});

classify('high', 'schema_anomalies', {
  title: 'Fields with unexpected types',
  count: schemaAnomalies.length,
  items: schemaAnomalies
});

classify('high', 'source_quality_missing', {
  title: 'Stories with missing source_quality',
  count: sqIssues.length,
  distribution: sqDistribution,
  items: sqIssues.slice(0, 30),
  truncated: sqIssues.length > 30
});

// Medium: content quality concerns
classify('medium', 'templated_text', {
  title: 'Stories with generic/templated openings',
  count: templated.length,
  items: templated.slice(0, 50),
  truncated: templated.length > 50
});

classify('medium', 'too_short_moral', {
  title: 'Moral field too short (< 20 chars)',
  count: tooShort.moral.length,
  items: tooShort.moral
});

classify('medium', 'generic_morals', {
  title: 'Very short or generic morals',
  count: genericMorals.length,
  items: genericMorals.slice(0, 50),
  truncated: genericMorals.length > 50
});

classify('medium', 'suspicious_country', {
  title: 'Suspicious country values (empty, numeric, "Unknown")',
  count: suspiciousCountry.length,
  items: suspiciousCountry
});

classify('medium', 'suspicious_region', {
  title: 'Suspicious region values (empty, numeric)',
  count: suspiciousRegion.length,
  items: suspiciousRegion.slice(0, 30),
  truncated: suspiciousRegion.length > 30
});

classify('medium', 'period_issues', {
  title: 'Empty or "Unknown" period values',
  count: periodIssues.length,
  distribution: periodDist,
  items: periodIssues.slice(0, 30),
  truncated: periodIssues.length > 30
});

classify('medium', 'non_canonical_types', {
  title: 'Story types not in canonical list',
  count: nonCanonicalTypes.length,
  distribution: typeDistribution,
  items: nonCanonicalTypes.slice(0, 50),
  truncated: nonCanonicalTypes.length > 50
});

// Low: informational stats
classify('low', 'full_text_statistics', {
  title: 'Full text length statistics (chars)',
  stats: ftStats
});

classify('low', 'type_distribution', {
  title: 'Story type distribution',
  distribution: typeDistribution
});

classify('low', 'source_quality_distribution', {
  title: 'Source quality value distribution',
  distribution: sqDistribution
});

classify('low', 'period_distribution', {
  title: 'Period value distribution',
  distribution: periodDist
});

classify('low', 'moral_length_stats', {
  title: 'Moral field length stats',
  count: moralLengths.length,
  min: moralLengths.length ? moralLengths[0].len : 0,
  max: moralLengths.length ? moralLengths[moralLengths.length - 1].len : 0,
  median: moralLengths.length ? median(moralLengths.map(m => m.len)) : 0,
  mean: moralLengths.length ? Math.round(moralLengths.reduce((a, m) => a + m.len, 0) / moralLengths.length) : 0
});

// ═══════════════════════════════════════════════
// WRITE REPORT
// ═══════════════════════════════════════════════
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2), 'utf8');

// Console output
console.log('\n' + '═'.repeat(70));
console.log('  STORIES DATABASE AUDIT REPORT');
console.log('═'.repeat(70));
console.log(`  Generated: ${report.meta.generated}`);
console.log(`  Stories: ${report.meta.totalStories} | Creatures: ${report.meta.totalCreatures}`);
console.log('─'.repeat(70));
console.log('  SEVERITY SUMMARY');
console.log('─'.repeat(70));
console.log(`  🔴 Critical : ${report.summary.critical}`);
console.log(`  🟠 High     : ${report.summary.high}`);
console.log(`  🟡 Medium   : ${report.summary.medium}`);
console.log(`  🔵 Low      : ${report.summary.low}`);
console.log('═'.repeat(70));

for (const [key, finding] of Object.entries(report.findings)) {
  const icon = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' }[finding.severity];
  const count = finding.count !== undefined ? finding.count : (finding.items ? finding.items.length : 0);
  console.log(`\n${icon} [${finding.severity.toUpperCase()}] ${finding.title} (${count})`);
  if (finding.description) console.log(`   ${finding.description}`);
  if (finding.stats) console.log(`   ${JSON.stringify(finding.stats)}`);
  if (finding.distribution && !finding.items) console.log(`   Distribution: ${JSON.stringify(finding.distribution)}`);
  if (finding.distribution && finding.items) console.log(`   Distribution: ${JSON.stringify(finding.distribution)}`);
  if (finding.truncated) console.log(`   (showing first 50 of ${count})`);
  if (finding.items && finding.items.length > 0 && finding.items.length <= 20) {
    for (const item of finding.items) {
      const id = item.id || item.storyId || '';
      const title = item.title || item.storyTitle || '';
      console.log(`     - [${id}] ${title} ${item.field ? `(${item.field}: ${item.actual})` : ''}`);
    }
  }
  if (finding.pairs && finding.pairs.length > 0) {
    for (const p of finding.pairs.slice(0, 10)) {
      console.log(`     - [${p.a.id}] "${p.a.title}" ↔ [${p.b.id}] "${p.b.title}" (${p.similarity})`);
    }
  }
  if (finding.groups && finding.groups.length > 0) {
    for (const g of finding.groups.slice(0, 10)) {
      console.log(`     - "${g.title || g.slug || g.firstTitle}": ${g.ids ? g.ids.join(', ') : g.count + ' stories'}`);
    }
  }
}

console.log('\n' + '═'.repeat(70));
console.log(`  Report written to: ${OUTPUT_PATH}`);
console.log('═'.repeat(70) + '\n');
