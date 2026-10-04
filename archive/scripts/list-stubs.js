const { readFileSync } = require('fs');
const { join } = require('path');
const creatures = JSON.parse(readFileSync(join(__dirname, '..', 'data/datasets/creatures.json'), 'utf8'));
const stubs = creatures.filter(c => 
  c.description === 'This creature is mentioned in the archives but its full entry is yet to be documented.'
);
console.log('Total stubs:', stubs.length);
console.log('---');
stubs.forEach(c => console.log(c.slug + '\t' + c.name + '\t' + (c.origin || '')));
