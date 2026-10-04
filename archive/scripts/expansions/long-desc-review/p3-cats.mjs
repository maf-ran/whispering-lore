import fs from "fs";
const dir = "archive/scripts/expansions/long-desc-review/";
const all = [];
for (let i = 1; i <= 15; i++) {
  const p = `${dir}batch-${String(i).padStart(2, "0")}-output.json`;
  if (!fs.existsSync(p)) continue;
  all.push(...JSON.parse(fs.readFileSync(p, "utf8")));
}
const keep = all.filter(x => x.verdict === "keep");

const cats = {
  duplicate_variant: [],
  artifact: [],
  minor_issue: [],
  header: [],
};
const dupeRe = /duplicate|same |synonym|variant of|counterpart|parallel/;
const artifactRe = /'snip'|snip artifact|CJK|truncated|stray trailing|typo|corruption|artifact sentence|truncation|odd formatting|filler sentence|minor filler|brief closing|mild .*embellish|minor .*embellish|minor .*padding|minor .*tail|template tail|mild moraliz|mild philosophiz|interpretive|minor.*conflation|mislabel|wrong|attribution is wrong|attribution is confused|framing|note.*artifact|should be removed|stray/;
const headerRe = /^Accurate .* account of the attested|^Attested .* accurate|^Well-|^Real |^Genuine |^Faithful|^Detailed, accurate|^Authentic/;
const others = [];
for (const x of keep) {
  const r = (x.reason || "").toLowerCase();
  if (dupeRe.test(r) && !artifactRe.test(r)) { cats.duplicate_variant.push(x.slug); continue; }
  if (artifactRe.test(r)) { cats.artifact.push(x.slug); continue; }
  if (headerRe.test(x.reason || "")) { cats.header.push(x.slug); continue; }
  others.push(`${x.slug}: ${x.reason}`);
}
for (const k of Object.keys(cats)) console.log(k, cats[k].length);
console.log("others:", others.length);
console.log("\n--- artifact list ---");
for (const s of cats.artifact) console.log(s);
console.log("\n--- duplicate-variant list ---");
for (const s of cats.duplicate_variant) console.log(s);
console.log("\n--- others (first 15) ---");
others.slice(0, 15).forEach(o => console.log(o));
