const fs = require('fs');
const path = require('path');

const storiesPath = path.join(__dirname, '../data/datasets/stories.json');
const dataPath = path.join(__dirname, 'add_nordic_den_far_gre_stories.js');

const stories = JSON.parse(fs.readFileSync(storiesPath, 'utf8'));

const content = fs.readFileSync(dataPath, 'utf8');
const arrayMatch = content.match(/const newStories = (\[[\s\S]*?\]);/);
if (!arrayMatch) {
    console.error('Could not find newStories array');
    process.exit(1);
}
const newStories = eval(arrayMatch[1]);

let addedCount = 0;
newStories.forEach(ns => {
    if (!stories.find(s => s.slug === ns.slug)) {
        stories.push(ns);
        addedCount++;
    }
});

fs.writeFileSync(storiesPath, JSON.stringify(stories, null, 2));
console.log(`Successfully added ${addedCount} stories`);
