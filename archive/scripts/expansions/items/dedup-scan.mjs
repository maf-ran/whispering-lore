import { readFileSync } from 'fs';

const ROOT = process.cwd();
const batch = JSON.parse(readFileSync(`${ROOT}/archive/scripts/expansions/items/draft-17xx-baltic.json`, 'utf8'));
const items = JSON.parse(readFileSync(`${ROOT}/data/items.json`, 'utf8'));

const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

for (const it of batch) {
  const n = norm(it.name);
  const myTerms = [n, ...(it.aliases || []).map(norm)].filter(Boolean);
  const candidates = [];
  for (const ex of items) {
    if (ex.slug === it.slug) continue;
    const exTerms = [norm(ex.name), ...(ex.aliases || []).map(norm)].filter(Boolean);
    for (const t of myTerms) {
      for (const e of exTerms) {
        if (t && t.length > 3 && (t.includes(e) || e.includes(t))) {
          candidates.push(ex.slug);
          break;
        }
      }
      if (candidates.includes(ex.slug)) break;
    }
    // keyword/desc overlap check
    const desc = norm(ex.description);
    const kw = (it.keywords || []).map(norm);
    if (kw.some(k => desc.includes(k)) && (it.country === ex.country || it.region === ex.region)) {
      if (!candidates.includes(ex.slug)) candidates.push(`${ex.slug} (desc/kw overlap)`);
    }
  }
  if (candidates.length) {
    console.log(`\n${it.slug} "${it.name}" (${it.country}) -> potential dupes:`);
    for (const c of candidates) {
      const ex = items.find(x => x.slug === c.split(' ')[0]);
      if (ex) console.log(`    ${c} | "${ex.name}" | ${ex.country} | ${ex.region} | type=${ex.type}`);
    }
  }
}
console.log('\nscan done');
