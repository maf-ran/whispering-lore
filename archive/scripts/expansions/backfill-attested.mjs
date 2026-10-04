import fs from "fs";

const dbPath = "data/datasets/creatures.json";
const creatures = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const HIGH_QUALITY = ["good", "expert", "academic", "well-documented", "researched", "verified", "primary", "documented"];

let backfilled = 0;
const updated = creatures.map(c => {
  if (c.attested === undefined && HIGH_QUALITY.includes(c.source_quality)) {
    c.attested = true;
    c.lastUpdated = "2026-08-07";
    backfilled++;
  }
  return c;
});

const tmpPath = `${dbPath}.tmp.${Date.now()}`;
fs.writeFileSync(tmpPath, JSON.stringify(updated, null, 2), "utf8");
fs.renameSync(tmpPath, dbPath);

console.log(`Backfilled attested: true on ${backfilled} high-quality creatures`);

const finalTally = { true: 0, false: 0, none: 0 };
updated.forEach(c => {
  if (c.attested === true) finalTally.true++;
  else if (c.attested === false) finalTally.false++;
  else finalTally.none++;
});
console.log("Attested tally now:", JSON.stringify(finalTally));
