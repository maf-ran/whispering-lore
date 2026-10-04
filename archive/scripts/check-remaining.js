const stories = require('../../data/datasets/stories.json');
const identical = stories.filter(s => s.full_text && s.summary && s.full_text.trim() === s.summary.trim());
const types = {};
const regions = {};
identical.forEach(s => { types[s.type] = (types[s.type] || 0) + 1; });
identical.forEach(s => { regions[s.continent || 'Unknown'] = (regions[s.continent || 'Unknown'] || 0) + 1; });
console.log('Remaining identical:', identical.length);
console.log('\nBy continent:');
Object.entries(regions).sort((a,b) => b[1]-a[1]).forEach(([r,c]) => console.log(`  ${r}: ${c}`));
console.log('\nBy type:');
Object.entries(types).sort((a,b) => b[1]-a[1]).forEach(([t,c]) => console.log(`  ${t}: ${c}`));

// Show first slug of each continent for the agents
console.log('\n=== Slugs by continent ===');
const byCont = {};
identical.forEach(s => {
  const c = s.continent || 'Unknown';
  if (!byCont[c]) byCont[c] = [];
  byCont[c].push(s.slug);
});
Object.entries(byCont).forEach(([c, slugs]) => {
  console.log(`\n${c} (${slugs.length}):`);
  console.log(slugs.slice(0, 5).join(', ') + (slugs.length > 5 ? '...' : ''));
});
