const ROOT = '/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore';
const fs = require('fs');
const creaturesFile = ROOT + '/data/datasets/creatures.json';
const creatures = JSON.parse(fs.readFileSync(creaturesFile, 'utf8'));
const existing = new Set(creatures.map(c => c.slug));
const files = ['iom', 'mic', 'omn', 'kor', 'sht', 'pol'];
const added = [];
for (const f of files) {
  const arr = JSON.parse(fs.readFileSync(ROOT + '/archive/scripts/gap-creatures/' + f + '.json', 'utf8'));
  for (const e of arr) {
    if (existing.has(e.slug)) { throw new Error('SLUG COLLISION: ' + e.slug); }
    existing.add(e.slug);
    added.push(e);
  }
}
creatures.push(...added);
fs.writeFileSync(creaturesFile, JSON.stringify(creatures, null, 2));
console.log('Added ' + added.length + ' creatures. New total: ' + creatures.length);