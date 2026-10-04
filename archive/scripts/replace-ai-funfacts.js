const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const CREATURES_PATH = join(__dirname, '..', 'data/datasets/creatures.json');
const templateRe = /folklore|mythology/i;

function bestFunFact(c) {
  if (c.seo_description && c.seo_description.length > 5 && !templateRe.test(c.seo_description)) {
    return { source: 'seo_description', value: c.seo_description };
  }
  if (c.summary && c.summary.length > 5 && !templateRe.test(c.summary)) {
    return { source: 'summary', value: c.summary };
  }
  if (c.cultural_significance && c.cultural_significance.length > 10) {
    return { source: 'cultural_significance', value: c.cultural_significance };
  }
  const tags = (c.behavior_tags || []).join(', ');
  const value = `${c.name} is a ${c.type || 'creature'} from ${c.country || 'folklore'}${tags ? ', known to be ' + tags : ''}.`;
  return { source: 'fallback', value };
}

const creatures = JSON.parse(readFileSync(CREATURES_PATH, 'utf8'));

let replaced = 0;
let bySeo = 0;
let bySummary = 0;
let byCs = 0;
let byFallback = 0;

for (const c of creatures) {
  if (c.fun_fact_generated !== true) continue;

  const result = bestFunFact(c);
  if (result.value !== undefined && result.value !== null) {
    c.fun_fact = result.value;
    c.fun_fact_generated = false;
    replaced++;
    if (result.source === 'seo_description') bySeo++;
    else if (result.source === 'summary') bySummary++;
    else if (result.source === 'cultural_significance') byCs++;
    else byFallback++;
  }
}

writeFileSync(CREATURES_PATH, JSON.stringify(creatures, null, 2) + '\n', 'utf8');

console.log(`Replaced ${replaced} AI fun_facts`);
console.log(`  From seo_description: ${bySeo}`);
console.log(`  From summary: ${bySummary}`);
console.log(`  From cultural_significance: ${byCs}`);
console.log(`  From fallback: ${byFallback}`);
console.log(`Remaining AI fun_facts: ${creatures.filter(e => e.fun_fact_generated === true).length}`);
