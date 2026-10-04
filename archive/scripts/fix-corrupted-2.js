const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const filePath = path.join(root, 'data/datasets/creatures.json');
const creatures = require(filePath);

const slugs = [
  'weeget-txamsem-giant-raven-tsimshian',
  'gwaxwgwakwalanuksiwe-kwakwaka-wakw',
  'bukwus-wild-man-of-the-woods-kwakwaka-wakw',
  'ho-ho-e-ap-bess-two-men-who-changed-things-coast-salish',
  'kushtaka-land-otter-man-tlingit',
  'sgaana-supernatural-killer-whale-haida'
];

let fixed = 0;
creatures.forEach(c => {
  if (slugs.includes(c.slug) && c.summary && c.summary.length > 40) {
    c.description = c.summary;
    fixed++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Fixed ${fixed} remaining`);

const remaining = creatures.filter(c => c.description && c.description.includes('It is said to dwell in'));
console.log(`Remaining 'dwell': ${remaining.length}`);
