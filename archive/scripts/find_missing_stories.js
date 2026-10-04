const fs = require('fs');
const path = require('path');

const CREATURES_PATH = path.join(__dirname, '../data/datasets/creatures.json');
const STORIES_PATH = path.join(__dirname, '../data/datasets/stories.json');

function findMissingStories() {
  try {
    const creatures = JSON.parse(fs.readFileSync(CREATURES_PATH, 'utf8'));
    const stories = JSON.parse(fs.readFileSync(STORIES_PATH, 'utf8'));

    // Get all creature names/ids mentioned in stories
    // The stories.json uses the "creatures" array which contains names of creatures
    const mentionedCreatures = new Set();
    stories.forEach(story => {
      if (story.creatures && Array.isArray(story.creatures)) {
        story.creatures.forEach(c => mentionedCreatures.add(c.toLowerCase()));
      }
    });

    const missing = [];
    const stats = {
      totalCreatures: creatures.length,
      totalStories: stories.length,
      missingCount: 0,
      byRegion: {},
      byCulture: {}
    };

    creatures.forEach(c => {
      const nameLower = c.name.toLowerCase();
      // Check if the creature name or any of its aliases are mentioned
      const isMentioned = mentionedCreatures.has(nameLower) || 
                         (c.aliases && c.aliases.some(a => mentionedCreatures.has(a.toLowerCase())));

      if (!isMentioned) {
        missing.push({
          id: c.id,
          name: c.name,
          country: c.country,
          region: c.region,
          culture: c.culture
        });

        stats.missingCount++;
        stats.byRegion[c.region] = (stats.byRegion[c.region] || 0) + 1;
        stats.byCulture[c.culture] = (stats.byCulture[c.culture] || 0) + 1;
      }
    });

    console.log('--- Gap Analysis Report ---');
    console.log(`Total Creatures: ${stats.totalCreatures}`);
    console.log(`Total Stories: ${stats.totalStories}`);
    console.log(`Creatures without stories: ${stats.missingCount}`);
    console.log(`Coverage: ${(((stats.totalCreatures - stats.missingCount) / stats.totalCreatures) * 100).toFixed(2)}%`);
    
    console.log('\n--- Missing by Region ---');
    console.table(stats.byRegion);
    
    console.log('\n--- Missing by Culture ---');
    console.table(stats.byCulture);

    // Save the missing list to a file for batching
    const outputPath = path.join(__dirname, '../data/missing_stories_gap.json');
    fs.writeFileSync(outputPath, JSON.stringify({ stats, missing }, null, 2));
    console.log(`\nDetailed missing list saved to: ${outputPath}`);

  } catch (error) {
    console.error('Error running gap analysis:', error);
  }
}

findMissingStories();
