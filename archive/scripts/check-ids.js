const stories = require('../../data/datasets/stories.json');

// Check Åland 815-830
console.log('=== ÅLAND 815-830 ===');
stories.filter(s => {
  const n = parseInt(s.id.replace('story',''));
  return n >= 815 && n <= 830;
}).forEach(s => console.log(s.id, s.country, s.title?.substring(0,50)));

// Check Caribbean 1634-1670
console.log('\n=== CARIBBEAN/AMERICAS 1634-1670 ===');
stories.filter(s => {
  const n = parseInt(s.id.replace('story',''));
  return n >= 1634 && n <= 1670;
}).forEach(s => console.log(s.id, s.country, s.title?.substring(0,50)));

// Check North America groups
console.log('\n=== NAVAJO 831-860 ===');
stories.filter(s => {
  const n = parseInt(s.id.replace('story',''));
  return n >= 831 && n <= 860;
}).forEach(s => console.log(s.id, s.country, s.title?.substring(0,50)));

console.log('\n=== HOPI 861-890 ===');
stories.filter(s => {
  const n = parseInt(s.id.replace('story',''));
  return n >= 861 && n <= 890;
}).forEach(s => console.log(s.id, s.country, s.title?.substring(0,50)));

console.log('\n=== PUEBLO/ZUNI/APACHE 891-920 ===');
stories.filter(s => {
  const n = parseInt(s.id.replace('story',''));
  return n >= 891 && n <= 920;
}).forEach(s => console.log(s.id, s.country, s.title?.substring(0,50)));

console.log('\n=== PLAINS 921-970 ===');
stories.filter(s => {
  const n = parseInt(s.id.replace('story',''));
  return n >= 921 && n <= 970;
}).forEach(s => console.log(s.id, s.country, s.title?.substring(0,50)));

console.log('\n=== EASTERN WOODLANDS 971-1100 ===');
stories.filter(s => {
  const n = parseInt(s.id.replace('story',''));
  return n >= 971 && n <= 1100;
}).forEach(s => console.log(s.id, s.country, s.title?.substring(0,50)));

// Show all needing expansion (full_text === summary) grouped by country
console.log('\n=== ALL REMAINING NEEDING EXPANSION (not yet batched) ===');
const done = new Set([
  ...Array.from({length:24}, (_,i) => 'story'+(438+i)),  // Sweden 438-461
  ...Array.from({length:23}, (_,i) => 'story'+(790+i)),  // Faroe 790-812
  ...Array.from({length:9}, (_,i) => 'story'+(815+i)),   // Åland 815-823
]);

const needExpansion = stories.filter(s => s.full_text === s.summary && !done.has(s.id));
const byContinent = {};
needExpansion.forEach(s => {
  const c = s.continent || 'Unknown';
  if (!byContinent[c]) byContinent[c] = [];
  byContinent[c].push(s.id);
});
Object.entries(byContinent).forEach(([c, ids]) => {
  console.log(`${c}: ${ids.length} stories`);
  ids.forEach(id => {
    const s = stories.find(st => st.id === id);
    console.log(`  ${id} - ${s.country} - ${s.title?.substring(0,50)}`);
  });
});
