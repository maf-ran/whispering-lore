const ROOT = '/Users/mafolsson/Desktop/DEMO-PROJECT 2/Whispering Lore';
const fs = require('fs');
const geo = require(ROOT + '/data/datasets/geo-countries.json');
const creatures = require(ROOT + '/data/datasets/creatures.json');
const stories = require(ROOT + '/data/datasets/stories.json');
const items = require(ROOT + '/data/items.json');
const countries = geo.filter(Boolean);
function norm(s) { return String(s || '').trim().toLowerCase(); }
const cSet = new Set(creatures.map(e => norm(e.country)).filter(Boolean));
const sSet = new Set(stories.map(e => norm(e.country)).filter(Boolean));
const iSet = new Set(items.map(e => norm(e.country)).filter(Boolean));
const zero = [], creaturesOnly = [], storyOnly = [];
for (const c of countries) {
  const ch = cSet.has(norm(c)), sh = sSet.has(norm(c)), ih = iSet.has(norm(c));
  if (!ch && !sh && !ih) zero.push(c);
  else if (ch && !sh && !ih) creaturesOnly.push(c);
  else if (!ch && sh && !ih) storyOnly.push(c);
}
console.log('geo countries:', countries.length, '| creature:', cSet.size, '| story:', sSet.size, '| item:', iSet.size);
console.log('\nZERO CONTENT countries (' + zero.length + '):');
console.log(JSON.stringify(zero));
console.log('\nCreatures-only no-story/no-item (' + creaturesOnly.length + '):');
console.log(JSON.stringify(creaturesOnly));
console.log('\nStory-only no-creature/no-item (' + storyOnly.length + '):');
console.log(JSON.stringify(storyOnly));