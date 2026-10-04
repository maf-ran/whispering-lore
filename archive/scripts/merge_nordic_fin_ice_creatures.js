const fs = require('fs');
const path = require('path');

const creaturesPath = path.join(__dirname, '../data/datasets/creatures.json');
const dataPath = path.join(__dirname, 'add_nordic_fin_ice_creatures.js');

const creatures = JSON.parse(fs.readFileSync(creaturesPath, 'utf8'));

const content = fs.readFileSync(dataPath, 'utf8');
const arrayMatch = content.match(/const newCreatures = (\[[\s\S]*?\]);/);
if (!arrayMatch) {
    console.error('Could not find newCreatures array');
    process.exit(1);
}
const newCreatures = eval(arrayMatch[1]);

let addedCount = 0;
newCreatures.forEach(nc => {
    if (!creatures.find(c => c.slug === nc.slug)) {
        creatures.push(nc);
        addedCount++;
    }
});

fs.writeFileSync(creaturesPath, JSON.stringify(creatures, null, 2));
console.log(`Successfully added ${addedCount} creatures`);
