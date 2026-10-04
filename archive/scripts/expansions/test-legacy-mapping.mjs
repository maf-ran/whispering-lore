import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const stories = JSON.parse(fs.readFileSync("data/datasets/stories.json", "utf8"));

const cSlugs = new Set(creatures.map(c => c.slug));

// Inspect how legacy IDs look
const legacyRefs = new Set();
stories.forEach(s => {
  (s.creatures || []).forEach(r => legacyRefs.add(r));
});

console.log("Total unique legacy refs in stories:", legacyRefs.size);

// Try mapping by stripping trailing numeric ID (e.g. troll-norway-1819 -> troll-norway, or troll)
let mappedCount = 0;
const unmapped = [];

legacyRefs.forEach(ref => {
  if (cSlugs.has(ref)) {
    mappedCount++;
    return;
  }
  // Try stripping numeric suffix like -1819 or -0868
  const strippedNum = ref.replace(/-\d{4}$/, "");
  if (cSlugs.has(strippedNum)) {
    mappedCount++;
    return;
  }
  // Try stripping prefix like stub-
  const strippedStub = ref.replace(/^stub-/, "").replace(/-\d{4}$/, "");
  if (cSlugs.has(strippedStub)) {
    mappedCount++;
    return;
  }
  unmapped.push(ref);
});

console.log(`Mapped refs: ${mappedCount} / ${legacyRefs.size}`);
console.log(`Unmapped sample (${unmapped.length}):`, unmapped.slice(0, 20));
