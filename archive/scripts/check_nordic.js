const fs = require('fs');
const c = JSON.parse(fs.readFileSync('./data/datasets/creatures.json'));
const targets = ['Finland', 'Iceland', 'Denmark', 'Faroe Islands', 'Greenland'];
targets.forEach(t => {
    console.log(`${t}: ${c.filter(x => x.country === t).length}`);
});
