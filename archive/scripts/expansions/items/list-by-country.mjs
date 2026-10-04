import { readFile } from 'node:fs/promises';
const items = JSON.parse(await readFile('data/items.json', 'utf8'));
const countries = ['Poland','Czech Republic','Slovakia','Hungary','Bulgaria','Romania','Serbia','North Macedonia'];
for (const c of countries) {
  const rows = items.filter(i => i.country === c);
  console.log(`== ${c} (${rows.length}) ==`);
  for (const r of rows) console.log(`  ${r.id} | ${r.name} | ${r.type}`);
}
