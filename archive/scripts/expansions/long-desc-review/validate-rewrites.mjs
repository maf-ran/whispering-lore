import fs from "fs";

const dir = "archive/scripts/expansions/long-desc-review/";
const q = ["well-documented", "fair", "good", "academic", "expert", "researched", "verified", "documented", "primary", "poor"];
const bad = ["serves as", "serving as", "embodies", "represents the mysteries", "known among the", "within the broader", "would be understood", "themes of", "in this context", "symboliz"];
let ok = true;

for (let i = 1; i <= 6; i++) {
  const inp = JSON.parse(fs.readFileSync(dir + `rewrite-0${i}-input.json`, "utf8"));
  const out = JSON.parse(fs.readFileSync(dir + `rewrite-0${i}-output.json`, "utf8"));
  const errs = [];
  if (out.length !== 39) errs.push("len " + out.length);
  const inSlugs = inp.map(x => x.slug);
  out.forEach((x, idx) => {
    if (x.slug !== inSlugs[idx]) errs.push(`slug order @${idx}: ${x.slug} != ${inSlugs[idx]}`);
    if (typeof x.attested !== "boolean") errs.push(`attested not bool ${x.slug}`);
    if (!q.includes(x.source_quality)) errs.push(`quality invalid ${x.slug}: ${x.source_quality}`);
    if (typeof x.description !== "string" || x.description.length < 150 || x.description.length > 400) errs.push(`desc len ${x.slug}: ${x.description ? x.description.length : "missing"}`);
    for (const p of bad) { if (x.description && x.description.toLowerCase().includes(p)) errs.push(`badphrase "${p}" ${x.slug}`); }
    if (x.attested === false && x.description && !x.description.startsWith("Not independently attested")) errs.push(`false must start phrase ${x.slug}`);
  });
  if (errs.length) {
    ok = false;
    console.log(`batch-0${i}: FAIL`);
    errs.forEach(e => console.log("  " + e));
  } else {
    const t = out.filter(x => x.attested === true).length;
    console.log(`batch-0${i}: OK 39/39, attested ${t}, false ${39 - t}`);
  }
}
console.log(ok ? "ALL VALID" : "ERRORS FOUND");
process.exit(ok ? 0 : 1);
