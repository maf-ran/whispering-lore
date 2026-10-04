const s = require('../../data/datasets/stories.json');
const types = {};
s.forEach(st => { types[st.type] = (types[st.type]||0)+1; });
Object.entries(types).sort((a,b)=>b[1]-a[1]).forEach(([t,c]) => console.log(c, t));
console.log('---\nTotal types:', Object.keys(types).length, 'Total stories:', s.length);
