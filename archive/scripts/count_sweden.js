const fs = require('fs');

function countSweden() {
    try {
        const creatures = JSON.parse(fs.readFileSync('data/datasets/creatures.json'));
        const stories = JSON.parse(fs.readFileSync('data/datasets/stories.json'));

        const creatureCount = creatures.filter(c => c.country === 'Sweden').length;
        const storyCount = stories.filter(s => s.country === 'Sweden').length;

        console.log(`Actual Sweden creatures: ${creatureCount}`);
        console.log(`Actual Sweden stories: ${storyCount}`);
    } catch (e) {
        console.error(`Error: ${e.message}`);
    }
}

countSweden();
