const stories = require('../../data/datasets/stories.json');

// Detect truncated summaries: ends mid-word (no . ! ? after last letter)
const truncated = stories.filter(s => {
  if (!s.summary) return false;
  const trimmed = s.summary.trim();
  if (trimmed.length < 50) return false;
  const last = trimmed.slice(-1);
  // Check if it ends with a letter or comma (not proper sentence ending)
  return /[a-zA-Z,]$/.test(last);
});

truncated.forEach(s => {
  const last30 = s.summary.slice(-40);
  console.log(`[${s.slug}] (${s.summary.length} chars) "${s.title}"`);
  console.log(`  ...${last30}`);
  console.log();
});
console.log(`Total truncated: ${truncated.length}`);
