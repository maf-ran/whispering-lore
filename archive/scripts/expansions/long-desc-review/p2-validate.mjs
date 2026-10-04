import fs from "fs";
const dir = "archive/scripts/expansions/long-desc-review/";
const inp = JSON.parse(fs.readFileSync(dir + "p2-input.json", "utf8"));
const bad = ["serves as", "serving as", "embodies", "represents the mysteries", "known among the", "within the broader", "would be understood", "themes of", "in this context", "symboliz"];
let ok = true;
for (const [fi, range] of [["p2-output-01.json", [0, 7]], ["p2-output-02.json", [7, 14]]]) {
  const out = JSON.parse(fs.readFileSync(dir + fi, "utf8"));
  const errs = [];
  for (let j = 0; j < out.length; j++) {
    const idx = range[0] + j;
    const x = out[j], src = inp[idx];
    if (x.slug !== src.slug) errs.push(`slug ${fi}@${j}: ${x.slug} != ${src.slug}`);
    if (typeof x.description !== "string" || x.description.length < 280 || x.description.length > 400) errs.push(`len ${fi} ${x.slug}: ${x.description ? x.description.length : "missing"}`);
    if (x.source_quality !== src.source_quality) errs.push(`quality ${fi} ${x.slug}: ${x.source_quality} != ${src.source_quality}`);
    if (x.attested !== true) errs.push(`attested ${fi} ${x.slug}`);
    for (const p of bad) if (x.description && x.description.toLowerCase().includes(p)) errs.push(`badphrase "${p}" ${x.slug}`);
  }
  if (errs.length) { ok = false; console.log(fi, "FAIL"); errs.forEach(e => console.log("  " + e)); }
  else console.log(fi, "OK", out.length, "entries");
}
console.log(ok ? "ALL VALID" : "ERRORS FOUND");
process.exit(ok ? 0 : 1);
