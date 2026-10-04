const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
const creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));
const stories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stories.json'), 'utf-8'));
const today = '2026-07-05';

creatures.forEach(c => {
  if (!c.version) c.version = '1.0.0';
  if (!c.lastUpdated) c.lastUpdated = today;
});

stories.forEach(s => {
  if (!s.version) s.version = '1.0.0';
  if (!s.lastUpdated) s.lastUpdated = today;
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');
fs.writeFileSync(path.join(DATA_DIR, 'stories.json'), JSON.stringify(stories, null, 2), 'utf-8');
console.log('Version dates added to all entries');
