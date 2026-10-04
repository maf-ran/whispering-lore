const fs = require('fs');
const path = require('path');

const STORIES_PATH = path.join(__dirname, '..', '..', 'data', 'datasets', 'stories.json');
const EXPANSION_DIR = path.join(__dirname, 'expansion-data');

const stories = JSON.parse(fs.readFileSync(STORIES_PATH, 'utf8'));

// Check what continent values exist
const continentCounts = {};
stories.forEach(s => { continentCounts[s.continent] = (continentCounts[s.continent]||0)+1; });
console.log('Continent distribution:');
Object.entries(continentCounts).sort((a,b)=>b[1]-a[1]).forEach(([c,n])=>console.log(`  ${c}: ${n}`));

// Target: all stories needing expansion (no continent filter)
const needsExpansion = stories.filter(s => s.full_text === s.summary);
console.log(`\nTotal needing expansion (full_text===summary): ${needsExpansion.length}`);

// Group by continent
const byContinent = {};
needsExpansion.forEach(s => {
  const c = s.continent || 'Unknown';
  if (!byContinent[c]) byContinent[c] = [];
  byContinent[c].push(s.id);
});
Object.entries(byContinent).sort((a,b)=>b[1].length-a[1].length).forEach(([c,ids])=>{
  console.log(`  ${c}: ${ids.length} stories`);
});

// Load all expansion batches
const expansions = {};
const batchFiles = fs.readdirSync(EXPANSION_DIR).filter(f => f.endsWith('.js')).sort();
console.log(`\nLoading ${batchFiles.length} expansion batches...`);
for (const file of batchFiles) {
  const batch = require(path.join(EXPANSION_DIR, file));
  const count = Object.keys(batch).length;
  Object.assign(expansions, batch);
  console.log(`  ${file}: ${count} stories`);
}
console.log(`Total expansions loaded: ${Object.keys(expansions).length}`);

// Dry run: which stories in Europe/Americas scope would be expanded?
const euroAmericas = needsExpansion.filter(s =>
  ['Europe', 'Americas', 'North America', 'South America', 'Unknown'].includes(s.continent)
);
console.log(`\nEurope/Americas/Unknown stories needing expansion: ${euroAmericas.length}`);

let found = 0, missing = [];
for (const s of euroAmericas) {
  if (expansions[s.id]) {
    found++;
  } else {
    missing.push(`${s.id} (${s.country} - ${s.title?.substring(0,40)})`);
  }
}
console.log(`Have expansions: ${found}`);
console.log(`Missing expansions: ${missing.length}`);
if (missing.length > 0 && missing.length <= 50) {
  missing.forEach(m => console.log(`  ${m}`));
} else if (missing.length > 50) {
  console.log('  (showing first 50)');
  missing.slice(0, 50).forEach(m => console.log(`  ${m}`));
}
