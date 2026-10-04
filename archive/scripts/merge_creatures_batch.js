const fs = require('fs');
const path = require('path');

const creaturesPath = path.join(__dirname, '../../data/datasets/creatures.json');
const batchPath = process.argv[2];

if (!batchPath) {
  console.error('Usage: node merge_creatures_batch.js <path-to-batch.json>');
  process.exit(1);
}

try {
  const creatures = JSON.parse(fs.readFileSync(creaturesPath, 'utf8'));
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

  let added = 0;
  let skipped = 0;

  batch.forEach(entry => {
    const exists = creatures.find(c => c.slug === entry.slug || c.id === entry.id);
    if (exists) {
      console.log(`Skipping duplicate: ${entry.slug}`);
      skipped++;
    } else {
      creatures.push(entry);
      added++;
    }
  });

  fs.writeFileSync(creaturesPath, JSON.stringify(creatures, null, 2));
  console.log(`Added ${added} creatures, skipped ${skipped} duplicates. Total: ${creatures.length}`);
} catch (error) {
  console.error('Error merging creatures:', error);
}
