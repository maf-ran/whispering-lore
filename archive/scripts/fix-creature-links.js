const fs = require('fs');
const path = require('path');

const creaturesPath = path.join(__dirname, '../data/datasets/creatures.json');
const storiesPath = path.join(__dirname, '../data/datasets/stories.json');

try {
    const creatures = JSON.parse(fs.readFileSync(creaturesPath, 'utf8'));
    const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

    const nameToSlug = {};
    creatures.forEach(c => {
        nameToSlug[c.name.toLowerCase()] = c.slug;
    });

    let fixedCount = 0;
    const updatedStories = stories.map(story => {
        if (!story.creatures || !Array.isArray(story.creatures)) return story;

        const originalCreatures = [...story.creatures];
        const updatedCreatures = story.creatures.map(cName => {
            const slug = nameToSlug[cName.toLowerCase()];
            return slug || cName;
        });

        if (JSON.stringify(originalCreatures) !== JSON.stringify(updatedCreatures)) {
            fixedCount++;
            return { ...story, creatures: updatedCreatures };
        }
        return story;
    });

    fs.writeFileSync(storiesPath, JSON.stringify(updatedStories, null, 2));
    console.log(`Successfully updated ${fixedCount} stories with creature slugs.`);
} catch (error) {
    console.error('Error processing database:', error);
    process.exit(1);
}
