import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const stories = JSON.parse(fs.readFileSync("data/datasets/stories.json", "utf8"));

const cSlugs = new Set(creatures.map(c => c.slug));

const unmappedCounts = new Map();

stories.forEach(s => {
  (s.creatures || []).forEach(ref => {
    if (cSlugs.has(ref)) return;
    const noNum = ref.replace(/-\d{4}$/, "");
    if (cSlugs.has(noNum)) return;
    const noStub = ref.replace(/^stub-/, "").replace(/-\d{4}$/, "");
    if (cSlugs.has(noStub)) return;

    unmappedCounts.set(ref, (unmappedCounts.get(ref) || 0) + 1);
  });
});

console.log("Unique unmapped refs count:", unmappedCounts.size);
const sorted = Array.from(unmappedCounts.entries()).sort((a, b) => b[1] - a[1]);
console.log("Top unmapped refs:");
sorted.slice(0, 30).forEach(([k, v]) => console.log(`  ${v}\t${k}`));
