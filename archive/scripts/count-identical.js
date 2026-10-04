const stories = require('../../data/datasets/stories.json');

// Find stories where full_text is identical to summary (or very close)
const identical = stories.filter(s => {
  if (!s.full_text || !s.summary) return false;
  const ft = s.full_text.trim();
  const sm = s.summary.trim();
  // Exact match or full_text is just summary with minor formatting differences
  return ft === sm || ft.replace(/\s+/g, ' ') === sm.replace(/\s+/g, ' ');
});

// Find stories where full_text is < 1.5x summary (barely expanded)
const barelyExpanded = stories.filter(s => {
  if (!s.full_text || !s.summary) return false;
  const ft = s.full_text.trim().length;
  const sm = s.summary.trim().length;
  return sm > 80 && ft < sm * 1.5 && ft !== sm;
});

console.log(`Stories where full_text === summary: ${identical.length}`);
console.log(`Stories where full_text < 1.5x summary: ${barelyExpanded.length}`);
console.log(`Total needing expansion: ${identical.length + barelyExpanded.length}`);

// Show distribution by type
const types = {};
identical.forEach(s => { types[s.type] = (types[s.type] || 0) + 1; });
console.log('\nType distribution (identical):');
Object.entries(types).sort((a,b) => b[1]-a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));

// Show distribution by region/continent
const regions = {};
identical.forEach(s => { regions[s.continent || s.region || 'Unknown'] = (regions[s.continent || s.region || 'Unknown'] || 0) + 1; });
console.log('\nRegion distribution (identical):');
Object.entries(regions).sort((a,b) => b[1]-a[1]).forEach(([r, c]) => console.log(`  ${r}: ${c}`));

// Show a few samples
console.log('\n=== Samples ===');
identical.slice(0, 3).forEach(s => {
  console.log(`[${s.slug}] "${s.title}" (${s.type}) | ${s.country}`);
  console.log(`  summary (${s.summary.length}): ${s.summary.substring(0, 100)}...`);
  console.log(`  full_text (${s.full_text.length}): ${s.full_text.substring(0, 100)}...`);
  console.log();
});
