import fs from "fs";
const dir = "archive/scripts/expansions/long-desc-review/";
const all = [];
for (let i = 1; i <= 15; i++) {
  const p = `${dir}batch-${String(i).padStart(2, "0")}-output.json`;
  if (!fs.existsSync(p)) continue;
  all.push(...JSON.parse(fs.readFileSync(p, "utf8")));
}
const keep = all.filter(x => x.verdict === "keep");
const c = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const db = Array.isArray(c) ? c : c.creatures;
const bySlug = Object.fromEntries(db.map(x => [x.slug, x]));

const q = {}, region = {}, country = {};
for (const x of keep) {
  const rec = bySlug[x.slug];
  const sq = rec ? rec.source_quality : "?";
  const reg = rec ? rec.region : "?";
  const ct = rec ? rec.country : "?";
  q[sq] = (q[sq] || 0) + 1;
  region[reg] = (region[reg] || 0) + 1;
  country[ct] = (country[ct] || 0) + 1;
}
console.log("quality:", JSON.stringify(q, null, 0));
console.log("\nregions:");
for (const [k, v] of Object.entries(region).sort((a, b) => b[1] - a[1])) console.log(`  ${v}\t${k}`);
console.log("\ntop countries:");
for (const [k, v] of Object.entries(country).sort((a, b) => b[1] - a[1]).slice(0, 25)) console.log(`  ${v}\t${k}`);

const len = keep.map(x => bySlug[x.slug] ? bySlug[x.slug].description.length : 0);
console.log("\nlength: min", Math.min(...len), "max", Math.max(...len), "avg", Math.round(len.reduce((a, b) => a + b, 0) / len.length));
