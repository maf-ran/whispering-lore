import fs from "fs";
const c = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const db = Array.isArray(c) ? c : c.creatures;
const bySlug = Object.fromEntries(db.map(x => [x.slug, x]));
const slugs = [
  "chupacabra", "quetzalcoatl", "tusse-sweden", "crane-spirit-bhutanese",
  "botamochi-bakemono", "boginka", "boruta", "druk-bhutanese",
  "bolotnik", "alux", "santa-muerte", "bon-bibi",
  "taleju-nepali", "singbonga-munda"
];
const keep = ["id", "slug", "name", "country", "region", "culture", "type", "mythology", "archetype", "element", "aliases", "related", "description", "source", "source_quality", "attested", "lastUpdated"];
const out = slugs.map(s => {
  const x = bySlug[s];
  if (!x) { console.error("MISSING", s); process.exit(1); }
  const o = {};
  for (const k of keep) if (k in x) o[k] = x[k];
  return o;
});
fs.writeFileSync("archive/scripts/expansions/long-desc-review/p2-input.json", JSON.stringify(out, null, 2));
console.log("wrote", out.length, "entries");
for (const x of out) console.log(x.slug, x.description.length);
