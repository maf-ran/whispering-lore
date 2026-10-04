import fs from "fs";
const c = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const db = Array.isArray(c) ? c : c.creatures;
const counts = {};
for (const x of db) {
  const a = x.attested;
  const k = a === true ? "true" : a === false ? "false" : "none";
  counts[k] = (counts[k] || 0) + 1;
}
console.log("total:", db.length, counts);
const q = {};
for (const x of db) q[x.source_quality] = (q[x.source_quality] || 0) + 1;
console.log("quality:", JSON.stringify(q));
