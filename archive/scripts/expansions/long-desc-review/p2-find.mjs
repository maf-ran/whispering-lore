import fs from "fs";
const c = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const db = Array.isArray(c) ? c : c.creatures;
const rows = db
  .filter(x => x.description && x.description.length > 1100)
  .map(x => ({ slug: x.slug, name: x.name, len: x.description.length, attested: x.attested, q: x.source_quality }))
  .sort((a, b) => b.len - a.len);
console.log("count >1100:", rows.length);
for (const r of rows) console.log(`${r.len}\t${r.attested}\t${r.q}\t${r.slug} (${r.name})`);
