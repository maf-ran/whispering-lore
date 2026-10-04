#!/usr/bin/env node
/**
 * Expand North American stories where full_text === summary
 * Loads expansion text from JSON files in archive/scripts/expansions/
 */
const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../../data/datasets/stories.json');
const expansionsDir = path.join(__dirname, 'expansions');

const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf-8'));

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
    story.continent === 'North America' &&
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
    }
  }
});

fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2));
console.log(`\nDone! Expanded: ${expanded}, Skipped: ${skipped}`);

const na = stories.filter(s => s.continent === 'North America');
console.log(`\nNorth America: ${na.length} stories, ${na.filter(s => s.full_text !== s.summary).length} expanded`);

const expandedStories = na.filter(s => s.full_text !== s.summary);
if (expandedStories.length > 0) {
  const lengths = expandedStories.map(s => s.full_text.length);
  const avgLen = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
  const minLen = Math.min(...lengths);
  const maxLen = Math.max(...lengths);
  console.log(`Expanded text lengths: min=${minLen}, max=${maxLen}, avg=${avgLen}`);
}

const remaining = na.filter(s => s.full_text === s.summary && s.summary && s.summary.length > 50);
console.log(`Still need expansion: ${remaining.length}`);
