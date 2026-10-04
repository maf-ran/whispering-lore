const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const CREATURES_PATH = join(__dirname, '../..', 'data/datasets/creatures.json');
const creatures = JSON.parse(readFileSync(CREATURES_PATH, 'utf8'));

const stubs = creatures.filter(c => {
  const d = (c.description || '').length;
  const a = (c.appearance || '').length;
  const b = (c.behavior || '').length;
  return d < 100 && a < 100 && b < 100;
});

console.log(`Total creatures: ${creatures.length}`);
console.log(`Stubs (desc<100 AND appear<100 AND behave<100): ${stubs.length}`);

stubs.sort((a, b) => (a.description || '').length - (b.description || '').length);

stubs.forEach((c, i) => {
  console.log(`${i + 1}. ${c.slug} — d=${(c.description||'').length}a=${(c.appearance||'').length}b=${(c.behavior||'').length} "${(c.description||'').slice(0,60)}"`);
});

writeFileSync(join(__dirname, '../..', 'data/reports/stubs.json'), JSON.stringify(stubs, null, 2));
console.log(`\nWritten to data/reports/stubs.json`);
