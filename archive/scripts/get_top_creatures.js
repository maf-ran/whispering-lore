const fs = require('fs');
const creatures = JSON.parse(fs.readFileSync('data/datasets/creatures.json', 'utf8'));
const stories = JSON.parse(fs.readFileSync('data/datasets/stories.json', 'utf8'));
const counts = {};
stories.forEach(s => {
  if(s.creature_slug) counts[s.creature_slug] = (counts[s.creature_slug] || 0) + 1;
});
const sorted = creatures.sort((a, b) => (counts[b.slug] || 0) - (counts[a.slug] || 0)).slice(0, 20);
console.log(JSON.stringify(sorted.map(c => ({slug: c.slug, name: c.name, quality: c.source_quality})), null, 2));
