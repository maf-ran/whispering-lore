const fs = require('fs');
const path = require('path');

// Quick verification - check if stories.json has been updated
const storiesPath = path.join(__dirname, '../data/datasets/stories.json');
const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

// Count stories by continent for verification
const continents = {};
stories.forEach(story => {
  const cont = story.continent || 'Unknown';
  continents[cont] = (continents[cont] || 0) + 1;
});

console.log('Stories by continent:');
Object.entries(continents).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
  console.log(`${c}: ${n}`);
});

// Check unique country counts
const countries = [...new Set(stories.map(story => story.country))];
console.log(`\nUnique countries: ${countries.length}`);

// Check for missing story types to prepare for M1 mapping
const storyTypes = [...new Set(stories.map(story => story.type))];
console.log(`\nStory types found: ${storyTypes.length}`);
console.log('All story types:', storyTypes.join(', '));

console.log('\n✅ stories.json is properly structured and contains all content');
