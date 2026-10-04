const creatures = require('../../data/datasets/creatures.json');
const stubs = creatures.filter(c => c.description && c.description.length < 100);
stubs.forEach(c => {
  console.log(`[${c.slug}] (${c.description.length} chars) ${c.name} | ${c.country} | ${c.culture} | ${c.type}`);
  console.log(`  desc: "${c.description}"`);
  console.log();
});
console.log(`Total: ${stubs.length}`);
