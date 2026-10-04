const creatures = require('../../data/datasets/creatures.json');

// Analyze what unique content exists BEFORE the template suffix
const samples = creatures.filter(c => c.description && c.description.includes('It is said to dwell in')).slice(0, 20);

console.log('=== Description Structure Analysis ===\n');
samples.forEach(c => {
  const parts = c.description.split('. It is said to dwell in');
  const before = parts[0] || c.description.split(' It is said to dwell in')[0];
  const after = parts[1] ? 'It is said to dwell in' + parts[1] : '';
  console.log(`[${c.slug}] ${c.name}`);
  console.log(`  BEFORE: "${before}"`);
  console.log(`  AFTER:  "${after ? after.substring(0, 100) : 'none'}"`);
  console.log(`  BEHAVIOR: "${c.behavior ? c.behavior.substring(0, 120) : 'NONE'}"`);
  console.log(`  APPEARANCE: "${c.appearance ? c.appearance.substring(0, 120) : 'NONE'}"`);
  console.log();
});

// Check: how many descriptions have unique content before the template?
let hasContent = 0;
let noContent = 0;
creatures.forEach(c => {
  if (!c.description) return;
  if (!c.description.includes('It is said to dwell in')) return;
  const before = c.description.split('. It is said to dwell in')[0];
  if (before.length > 80) hasContent++;
  else noContent++;
});
console.log(`Descriptions with useful content before template: ${hasContent}`);
console.log(`Descriptions that are mostly template: ${noContent}`);

// Check: are there creatures where description = just the template?
const pureTemplate = creatures.filter(c => c.description && c.description.match(/^[\w\s'-]+ is a \w+ from \w+ folklore\. It is said to dwell in/));
console.log(`\nPure template descriptions (no unique content): ${pureTemplate.length}`);
if (pureTemplate.length > 0) {
  pureTemplate.slice(0, 5).forEach(c => console.log(`  [${c.slug}] "${c.description}"`));
}

// Check behavior patterns
const templatedBehavior = creatures.filter(c => c.behavior && c.behavior.match(/is \w+ and \w+/));
console.log(`\nTemplated behaviors: ${templatedBehavior.length}`);
templatedBehavior.slice(0, 5).forEach(c => console.log(`  [${c.slug}] "${c.behavior}"`));
