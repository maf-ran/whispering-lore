const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const CREATURES_PATH = join(__dirname, '../..', 'data/datasets/creatures.json');
const creatures = JSON.parse(readFileSync(CREATURES_PATH, 'utf8'));

const expansions = JSON.parse(readFileSync(join(__dirname, '../..', 'data/reports/stub-expansions.json'), 'utf8'));

let applied = 0;
expansions.forEach(exp => {
  const idx = creatures.findIndex(c => c.slug === exp.slug);
  if (idx === -1) {
    console.warn(`NOT FOUND: ${exp.slug}`);
    return;
  }
  ['description', 'appearance', 'behavior', 'cultural_significance'].forEach(field => {
    if (exp[field] && exp[field].length > 80) {
      creatures[idx][field] = exp[field];
      applied++;
    }
  });
});

writeFileSync(CREATURES_PATH, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Applied expansions to ${applied} fields across ${expansions.length} creatures`);
