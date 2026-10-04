const fs = require('fs');
const path = require('path');

const dataDir = '/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/archive/scripts/expansions';
const storiesPath = '/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore/data/datasets/stories.json';

// Load all batch files
const allExpansions = {};
const files = fs.readdirSync(dataDir).filter(f => f.startsWith('europe-batch-') && f.endsWith('.json'));
console.log(`Found ${files.length} batch files`);

for (const file of files) {
  const batch = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  Object.assign(allExpansions, batch);
}

console.log(`Total expansions loaded: ${Object.keys(allExpansions).length}`);

// Load stories
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
console.log(`Total stories: ${stories.length}`);

// Find and update European stories where full_text === summary
let updated = 0;
let notFound = 0;
let forced = 0;

for (const story of stories) {
  if (story.continent !== 'Europe') continue;
  if (!story.full_text || !story.summary) continue;

  if (allExpansions[story.slug]) {
    const wasIdentical = story.full_text.trim() === story.summary.trim();
    story.full_text = allExpansions[story.slug];
    if (wasIdentical) {
      updated++;
    } else {
      forced++;
    }
  }
}

console.log(`Updated (full_text === summary): ${updated}`);
console.log(`Force-updated (full_text ≠ summary): ${forced}`);
console.log(`Not found in batch: ${notFound}`);

console.log(`Updated: ${updated}`);
console.log(`Not found: ${notFound}`);

// Write back
fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2));

// Verify
const verify = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));
const remaining = verify.filter(s =>
  s.continent === 'Europe' &&
  s.full_text && s.summary &&
  s.full_text.trim() === s.summary.trim()
);
console.log(`Verification: ${remaining.length} European stories still identical (should be 0)`);
if (remaining.length > 0) {
  remaining.forEach(s => console.log(`  - ${s.slug}`));
}
