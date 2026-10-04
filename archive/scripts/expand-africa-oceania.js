#!/usr/bin/env node
/**
 * Expand Africa & Oceania stories where full_text === summary
 * Loads expansion text from JSON files in archive/scripts/expansions/
 */
const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../../data/datasets/stories.json');
const expansionsDir = path.join(__dirname, 'expansions');

const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf-8'));

// Load all expansion files from the expansions directory
const expansions = {};
if (fs.existsSync(expansionsDir)) {
  const files = fs.readdirSync(expansionsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(expansionsDir, file), 'utf-8'));
    Object.assign(expansions, data);
  }
  console.log(`Loaded ${Object.keys(expansions).length} expansions from ${files.length} files`);
} else {
  console.error('No expansions directory found at', expansionsDir);
  process.exit(1);
}

let expanded = 0;
let skipped = 0;

stories.forEach(story => {
  if (
    (story.continent === 'Africa' || story.continent === 'Oceania') &&
    story.full_text === story.summary &&
    story.summary &&
    story.summary.length > 50
  ) {
    if (expansions[story.id]) {
      story.full_text = expansions[story.id];
      story.lastUpdated = new Date().toISOString().split('T')[0];
      expanded++;
    } else {
      skipped++;
      console.log(`  SKIP (no expansion): ${story.id} - ${story.title}`);
    }
  }
});

fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2));
console.log(`\nDone! Expanded: ${expanded}, Skipped: ${skipped}`);

// Stats
const afr = stories.filter(s => s.continent === 'Africa');
const oce = stories.filter(s => s.continent === 'Oceania');
console.log(`\nAfrica: ${afr.length} stories, ${afr.filter(s => s.full_text !== s.summary).length} expanded`);
console.log(`Oceania: ${oce.length} stories, ${oce.filter(s => s.full_text !== s.summary).length} expanded`);

const expandedStories = stories.filter(s =>
  (s.continent === 'Africa' || s.continent === 'Oceania') &&
  s.full_text !== s.summary
);
const lengths = expandedStories.map(s => s.full_text.length);
const avgLen = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
const minLen = Math.min(...lengths);
const maxLen = Math.max(...lengths);
console.log(`\nExpanded text lengths: min=${minLen}, max=${maxLen}, avg=${avgLen}`);
