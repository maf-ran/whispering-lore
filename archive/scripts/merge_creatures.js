const fs = require('fs');
const path = require('path');

const creaturesPath = path.join(__dirname, '../data/datasets/creatures.json');
const dataPath = path.join(__dirname, 'add_swedish_creatures.js');

// Load existing data
const creatures = JSON.parse(fs.readFileSync(creaturesPath, 'utf8'));

// Extract new creatures from the data file
const content = fs.readFileSync(dataPath, 'utf8');
const arrayMatch = content.match(/const newCreatures = (\[[\s\S]*?\]);/);
if (!arrayMatch) {
    console.error('Could not find newCreatures array in add_swedish_creatures.js');
    process.exit(1);
}
const newCreatures = eval(arrayMatch[1]);

let addedCount = 0;
newCreatures.forEach(nc => {
    if (!creatures.find(c => c.slug === nc.slug)) {
        creatures.push(nc);
        addedCount++;
    } else {
        console.log(`Skipping duplicate: ${nc.slug}`);
    }
});

fs.writeFileSync(creaturesPath, JSON.stringify(creatures, null, 2));
console.log(`Successfully added ${addedCount} new creatures to creatures.json`);
