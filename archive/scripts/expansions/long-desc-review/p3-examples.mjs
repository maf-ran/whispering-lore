import fs from "fs";
const dir = "archive/scripts/expansions/long-desc-review/";
const all = [];
for (let i = 1; i <= 15; i++) {
  const p = `${dir}batch-${String(i).padStart(2, "0")}-output.json`;
  if (!fs.existsSync(p)) continue;
  all.push(...JSON.parse(fs.readFileSync(p, "utf8")));
}
const keep = all.filter(x => x.verdict === "keep");
const by = Object.fromEntries(keep.map(x => [x.slug, x]));
const want = ["chupacabra","quetzalcoatl","troll-norwegian","selma","nix","banshee","yara-ma-yha-who","kumiho","haetae-northkorea","dullahan","lindorm-denmark","la-lechuza","saman-deviyo-sri-lankan","beaivi-spmi","mokelembembe-gabon","anjana","chang","tteryel"];
for (const w of want) {
  const r = by[w];
  if (r) console.log(`--- ${w} ---\n${r.reason}`);
}
