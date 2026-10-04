const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const filePath = path.join(root, 'data/datasets/creatures.json');
const creatures = require(filePath);

let fixed = 0;

creatures.forEach(c => {
  if (!c.description) return;
  if (!c.description.includes('It is said to dwell in')) return;
  
  // These are corrupted entries. Use summary or clean description
  const desc = c.description;
  
  // Remove "Also known as SLUG." pattern
  let cleaned = desc.replace(/Also known as\s+[\w-]+\.\s*/g, '');
  // Remove "It is said to dwell in." (with empty habitat)
  cleaned = cleaned.replace(/It is said to dwell in\.\s*/g, '');
  // Remove "Found in Not documented." or "Found in X."
  cleaned = cleaned.replace(/Found in\s+[\w\s.-]+\.\s*/g, '');
  // Remove duplicate "Animal-Spirit from Indigenous North American mythology" at end
  cleaned = cleaned.replace(/\s*(?:Animal-Spirit|Nature-Spirit|Spirit|Deity|Ghost|Monster)\s+from\s+[\w\s]+\s+mythology\.?\s*$/, '');
  // Clean trailing whitespace/periods
  cleaned = cleaned.replace(/\.\s*$/, '').trim();
  if (cleaned && !cleaned.endsWith('.')) cleaned += '.';
  
  // If cleaned is too short, use summary instead
  if (cleaned.length < 60 && c.summary && c.summary.length > 60) {
    cleaned = c.summary;
  }
  
  if (cleaned !== desc) {
    c.description = cleaned;
    fixed++;
  }
  
  // Also fix habitat if it's "Not documented."
  if (c.habitat && c.habitat.includes('Not documented')) {
    c.habitat = 'Not documented';
  }
});

fs.writeFileSync(filePath, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Fixed ${fixed} corrupted descriptions`);

// Verify
const remaining = creatures.filter(c => c.description && c.description.includes('It is said to dwell in'));
console.log(`Remaining 'dwell' pattern: ${remaining.length}`);
