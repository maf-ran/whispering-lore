const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./data/datasets/stories.json', 'utf8'));

let remaining = data.filter(st => st.full_text && st.summary && st.full_text.trim() === st.summary.trim());
console.log('Total identical:', remaining.length);

let counts = {};
remaining.forEach(st => {
  const cont = st.continent || 'Unknown';
  counts[cont] = (counts[cont] || 0) + 1;
});
console.log('\nRemaining by continent:');
Object.entries(counts).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => console.log(c + ': ' + n));

if (remaining.length > 0) {
  console.log('\nSample identical stories:');
  remaining.slice(0, 5).forEach(st => console.log(st.title + ' | ' + (st.continent || 'Unknown') + ' | ' + st.country));
}
