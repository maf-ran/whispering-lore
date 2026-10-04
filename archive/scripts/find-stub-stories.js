const stories = require('../../data/datasets/stories.json');
const stubs = stories.filter(s => s.full_text && s.full_text.length < 100);
stubs.forEach(s => {
  console.log(`[${s.slug}] (${s.full_text ? s.full_text.length : 0} chars) "${s.title}" | ${s.country} | ${s.type}`);
  console.log(`  summary: "${s.summary ? s.summary.substring(0, 80) : 'NONE'}..."`);
  console.log(`  full_text: "${s.full_text ? s.full_text.substring(0, 80) : 'NONE'}..."`);
  console.log();
});
console.log(`Total stubs < 100 chars: ${stubs.length}`);
