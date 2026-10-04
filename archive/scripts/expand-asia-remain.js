const fs = require('fs');
const path = require('path');

const expansionsPath = path.join(__dirname, 'asia-remain-expansions.json');
const storiesPath = path.join(__dirname, '../data/datasets/stories.json');

const EXPANSIONS = JSON.parse(fs.readFileSync(expansionsPath, 'utf8'));
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

let updated = 0;
let skipped = 0;

stories.forEach(story => {
  if (
    story.continent === 'Asia' &&
    story.full_text &&
    story.summary &&
    story.full_text.trim() === story.summary.trim() &&
    EXPANSIONS[story.slug]
  ) {
    story.full_text = EXPANSIONS[story.slug];
    story.version = (story.version || 1) + 1;
    story.lastUpdated = new Date().toISOString();
    updated++;
  } else if (
    story.continent === 'Asia' &&
    story.full_text &&
    story.summary &&
    story.full_text.trim() === story.summary.trim()
  ) {
    skipped++;
  }
});

fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2));

console.log(`Updated: ${updated} stories`);
if (skipped > 0) console.log(`Skipped (no expansion): ${skipped} stories`);
console.log('Done.');
