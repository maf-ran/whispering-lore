const fs = require('fs');
const path = require('path');

const mainPath = path.join(__dirname, '../../data/datasets/stories.json');
const batchPath = process.argv[2];

if (!batchPath) {
  console.error('Usage: node merge_stories_batch.js <path-to-batch.json>');
  process.exit(1);
}

const main = JSON.parse(fs.readFileSync(mainPath, 'utf8'));
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

let added = 0;
let skipped = 0;

batch.forEach(s => {
  if (main.find(m => m.slug === s.slug || m.id === s.id)) {
    console.log('Skip dup: ' + s.slug);
    skipped++;
  } else {
    main.push(s);
    added++;
  }
});

fs.writeFileSync(mainPath, JSON.stringify(main, null, 2));
console.log('Added ' + added + ' stories, skipped ' + skipped + '. Total: ' + main.length);
