import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));

const unrated = creatures.filter(c => c.attested === undefined);
console.log(`Unrated (attested undefined): ${unrated.length}`);

const byQuality = {};
unrated.forEach(c => {
  byQuality[c.source_quality] = (byQuality[c.source_quality] || 0) + 1;
});
console.log("Quality distribution of unrated:", JSON.stringify(byQuality));

const HIGH_QUALITY = ["good", "expert", "academic", "well-documented", "researched", "verified", "primary", "documented"];
const highQuality = unrated.filter(c => HIGH_QUALITY.includes(c.source_quality));
console.log(`High-quality unrated (eligible for attested: true): ${highQuality.length}`);

const lowQuality = unrated.filter(c => !HIGH_QUALITY.includes(c.source_quality));
console.log(`Poor/fair unrated: ${lowQuality.length}`);
console.log("Low quality dist:", JSON.stringify(Object.fromEntries(Object.entries(byQuality).filter(([k]) => !HIGH_QUALITY.includes(k)))));

// Check the poor/fair unrated descriptions - do they say "Not independently attested"?
const unattestedPrefixed = unrated.filter(c => (c.description || "").startsWith("Not independently attested"));
console.log(`Unrated with "Not independently attested" prefix: ${unattestedPrefixed.length}`);
