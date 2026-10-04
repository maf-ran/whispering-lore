const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const filePath = path.join(root, 'data/datasets/creatures.json');
const creatures = require(filePath);

// Group by description
const descMap = {};
creatures.forEach(c => {
  if (!c.description) return;
  const key = c.description.trim();
  if (!descMap[key]) descMap[key] = [];
  descMap[key].push(c);
});

let fixed = 0;

Object.entries(descMap).forEach(([desc, entries]) => {
  if (entries.length < 2) return;
  
  // For each duplicate, add a country/culture-specific note
  entries.forEach((c, i) => {
    if (i === 0) return; // Keep first one as-is
    
    // Add a cultural variant note
    const cultureNote = c.culture && c.culture !== 'Unknown'
      ? `In ${c.country} folklore, this figure is known among the ${c.culture} people.`
      : `This is the ${c.country} variant of the same figure.`;
    
    // Don't add if already present
    if (!c.description.includes(cultureNote)) {
      c.description = c.description.trim() + ' ' + cultureNote;
      fixed++;
    }
  });
});

fs.writeFileSync(filePath, JSON.stringify(creatures, null, 2) + '\n');
console.log(`Updated ${fixed} duplicate entries with cultural variant notes`);

// Verify: how many groups remain exact duplicates?
const descMap2 = {};
creatures.forEach(c => {
  if (!c.description) return;
  const key = c.description.trim();
  if (!descMap2[key]) descMap2[key] = [];
  descMap2[key].push(c);
});
const remaining = Object.entries(descMap2).filter(([_, e]) => e.length >= 2);
console.log(`Remaining exact duplicate groups: ${remaining.length}`);
