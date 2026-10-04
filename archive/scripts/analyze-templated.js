const creatures = require('../../data/datasets/creatures.json');

// Find all creatures with templated/generic text
const patterns = [
  /Typical appearance matches its role as/i,
  /It is a supernatural being from/i,
  /This creature is a type of/i,
  /Associated behaviors include/i,
  /It is said to dwell in/i,
];

const templated = creatures.filter(c => {
  if (!c.description) return false;
  return patterns.some(p => p.test(c.description));
});

// Show distribution of patterns
const patternCounts = {};
templated.forEach(c => {
  patterns.forEach((p, i) => {
    if (p.test(c.description)) {
      patternCounts[i] = (patternCounts[i] || 0) + 1;
    }
  });
});

console.log('=== Pattern Distribution ===');
const names = ['Typical appearance matches', 'It is a supernatural being', 'This creature is a type of', 'Associated behaviors include', 'It is said to dwell in'];
Object.entries(patternCounts).forEach(([k, v]) => console.log(`  ${names[k]}: ${v}`));

console.log(`\nTotal templated: ${templated.length}`);

// Show 5 samples
console.log('\n=== Samples ===');
templated.slice(0, 5).forEach(c => {
  console.log(`[${c.slug}] ${c.name} (${c.country})`);
  console.log(`  desc: ${c.description.substring(0, 200)}...`);
  console.log(`  appearance: ${c.appearance ? c.appearance.substring(0, 100) : 'NONE'}...`);
  console.log(`  behavior: ${c.behavior ? c.behavior.substring(0, 100) : 'NONE'}...`);
  console.log();
});

// Check: how many have the SAME templated appearance text?
const appearances = {};
creatures.forEach(c => {
  if (c.appearance && c.appearance.startsWith('Typical appearance matches')) {
    appearances[c.appearance] = (appearances[c.appearance] || 0) + 1;
  }
});
console.log('=== Repeated appearance texts ===');
Object.entries(appearances).sort((a,b) => b[1]-a[1]).forEach(([text, count]) => {
  console.log(`  (${count}x) ${text.substring(0, 100)}`);
});
