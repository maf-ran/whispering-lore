const stories = require('../../data/datasets/stories.json');

// Check various truncation patterns
let count = 0;
const issues = [];

stories.forEach(s => {
  if (!s.summary) return;
  const t = s.summary.trim();
  
  // Pattern 1: ends without terminal punctuation (no . ! ? ")
  if (t.length > 50 && /[a-z]$/.test(t)) {
    issues.push({ slug: s.slug, title: s.title, type: 'no-terminal', end: t.slice(-50), len: t.length });
    count++;
  }
});

// Also check: summaries that are suspiciously short (< 80 chars)
const short = stories.filter(s => s.summary && s.summary.trim().length > 0 && s.summary.trim().length < 80);
short.forEach(s => {
  issues.push({ slug: s.slug, title: s.title, type: 'short-summary', summary: s.summary, len: s.summary.length });
  count++;
});

issues.forEach(i => {
  console.log(`[${i.slug}] (${i.len} chars) "${i.title}" [${i.type}]`);
  if (i.end) console.log(`  ends: ...${i.end}`);
  if (i.summary) console.log(`  full: "${i.summary}"`);
  console.log();
});
console.log(`Total issues: ${count}`);
