const fs = require('fs');
const path = require('path');
const dir = 'data/sharded/creatures/by-slug';
const files = fs.readdirSync(dir);
let entries = [];
files.forEach(f => {
  const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  data.forEach(e => {
    if (e.appearance === 'Not documented.' &&
        e.behavior === 'Not documented.' &&
        e.cultural_significance === 'Not documented.') {
      entries.push({
        slug: e.slug,
        name: e.name,
        type: e.type,
        region: e.region,
        country: e.country,
        description: (e.description || '').substring(0, 120),
        source_quality: e.source_quality,
        source: (e.source || '').substring(0, 80),
        fun_fact: (e.fun_fact || '').substring(0, 120)
      });
    }
  });
});
console.log('Total entries with all 3 fields Not documented:', entries.length);
entries.forEach(e => console.log(e.slug + '|' + e.name + '|' + e.type + '|' + e.region + '|' + e.country + '|' + e.description));
