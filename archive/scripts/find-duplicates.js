const creatures = require('../../data/datasets/creatures.json');

// Group by description
const descMap = {};
creatures.forEach(c => {
  if (!c.description) return;
  const key = c.description.trim();
  if (!descMap[key]) descMap[key] = [];
  descMap[key].push(c);
});

// Filter to groups with 2+ entries (duplicates)
const duplicates = Object.entries(descMap)
  .filter(([_, entries]) => entries.length >= 2)
  .sort((a, b) => b[1].length - a[1].length);

let totalDupes = 0;
console.log(`=== Duplicate Description Groups: ${duplicates.length} groups ===\n`);

duplicates.slice(0, 20).forEach(([desc, entries]) => {
  totalDupes += entries.length;
  console.log(`GROUP (${entries.length} creatures):`);
  entries.forEach(e => {
    console.log(`  [${e.slug}] ${e.name} | ${e.country} | ${e.culture}`);
  });
  console.log(`  DESC: "${desc.substring(0, 120)}..."`);
  console.log();
});

console.log(`Total creatures in duplicate groups: ${totalDupes}`);
console.log(`\nRemaining groups not shown: ${duplicates.length - 20}`);

// Also show: how many groups are USA/Canada pairs?
let usaCanadaPairs = 0;
duplicates.forEach(([desc, entries]) => {
  const countries = entries.map(e => e.country);
  if (countries.includes('United States') && countries.includes('Canada')) {
    usaCanadaPairs++;
  }
});
console.log(`\nUSA/Canada cross-border pairs: ${usaCanadaPairs}`);
