const fs = require('fs');
const path = require('path');

const STORIES_PATH = path.join(__dirname, '..', '..', 'data', 'datasets', 'stories.json');
const EXPANSION_DIR = path.join(__dirname, 'expansion-data');

// Load stories
const stories = JSON.parse(fs.readFileSync(STORIES_PATH, 'utf8'));

// Find stories needing expansion
const targetContinents = ['Europe', 'Americas', 'North America', 'South America'];
const needsExpansion = stories.filter(s =>
  s.full_text === s.summary &&
  targetContinents.includes(s.continent)
);

console.log(`Found ${needsExpansion.length} stories needing expansion`);

// Load all expansion batches
const expansions = {};
const batchFiles = fs.readdirSync(EXPANSION_DIR).filter(f => f.endsWith('.js')).sort();
console.log(`Loading ${batchFiles.length} expansion batches...`);

for (const file of batchFiles) {
  const batch = require(path.join(EXPANSION_DIR, file));
  const count = Object.keys(batch).length;
  Object.assign(expansions, batch);
  console.log(`  ${file}: ${count} stories`);
}

console.log(`Total expansions loaded: ${Object.keys(expansions).length}`);

// Apply expansions
let expanded = 0;
let missed = [];
for (const story of stories) {
  if (story.full_text === story.summary &&
      targetContinents.includes(story.continent)) {
    if (expansions[story.id]) {
      const oldLen = story.full_text.length;
      story.full_text = expansions[story.id];
      const newLen = story.full_text.length;
      const ratio = (newLen / oldLen).toFixed(1);
      expanded++;
      if (expanded <= 5 || expanded % 50 === 0) {
        console.log(`  Expanded ${story.id} (${story.title}): ${oldLen} -> ${newLen} chars (${ratio}x)`);
      }
    } else {
      missed.push(story.id);
    }
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`Expanded: ${expanded} stories`);
if (missed.length > 0) {
  console.log(`Missing expansions: ${missed.length}`);
  console.log(`  IDs: ${missed.join(', ')}`);
}

// Length distribution
const expandedStories = stories.filter(s =>
  targetContinents.includes(s.continent) && s.full_text !== s.summary
);
const ratios = expandedStories.map(s => s.full_text.length / s.summary.length);
ratios.sort((a, b) => a - b);

console.log(`\n=== LENGTH DISTRIBUTION ===`);
console.log(`Min ratio: ${ratios[0]?.toFixed(2) || 'N/A'}x`);
console.log(`Median ratio: ${ratios[Math.floor(ratios.length / 2)]?.toFixed(2) || 'N/A'}x`);
console.log(`Max ratio: ${ratios[ratios.length - 1]?.toFixed(2) || 'N/A'}x`);
console.log(`Mean ratio: ${(ratios.reduce((a, b) => a + b, 0) / ratios.length)?.toFixed(2) || 'N/A'}x`);

// Stories under 1.5x (check quality)
const underTarget = expandedStories.filter(s => (s.full_text.length / s.summary.length) < 1.5);
if (underTarget.length > 0) {
  console.log(`\nUnder 1.5x expansion: ${underTarget.length} stories`);
  underTarget.forEach(s => {
    console.log(`  ${s.id} (${s.title}): ${(s.full_text.length / s.summary.length).toFixed(2)}x`);
  });
}

// Save
fs.writeFileSync(STORIES_PATH, JSON.stringify(stories, null, 2), 'utf8');
console.log(`\nSaved to ${STORIES_PATH}`);
