const path = require('path');
const root = path.resolve(__dirname, '../..');
const creatures = require(path.join(root, 'data/datasets/creatures.json'));
const stories = require(path.join(root, 'data/datasets/stories.json'));

console.log('=== CREATURES ===');
console.log('Total:', creatures.length);
console.log('Sample keys:', Object.keys(creatures[0]).join(', '));
console.log('Sample:', JSON.stringify(creatures[0], null, 2).substring(0, 1000));
console.log();
console.log('=== STORIES ===');
console.log('Total:', stories.length);
console.log('Sample keys:', Object.keys(stories[0]).join(', '));
console.log('Sample:', JSON.stringify(stories[0], null, 2).substring(0, 1000));
