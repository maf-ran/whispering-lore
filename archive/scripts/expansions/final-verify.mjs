import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const stories = JSON.parse(fs.readFileSync("data/datasets/stories.json", "utf8"));

const cSlugs = new Set(creatures.map(c => c.slug));

let totalRefs = 0, validRefs = 0, storiesWithValid = 0;
stories.forEach(s => {
  const refs = s.creatures || [];
  totalRefs += refs.length;
  const valid = refs.filter(r => cSlugs.has(r));
  validRefs += valid.length;
  if (valid.length > 0) storiesWithValid++;
});
console.log(`1. STORY CREATURE REFS: ${validRefs}/${totalRefs} valid (${((validRefs/totalRefs)*100).toFixed(1)}%) across ${storiesWithValid} stories`);

const missingAppearance = creatures.filter(c => !c.appearance || c.appearance === "Not documented" || c.appearance.trim() === "").length;
const missingHabitat = creatures.filter(c => !c.habitat || c.habitat === "Not documented" || c.habitat.trim() === "").length;
console.log(`2. FIELD COMPLETION: missing appearance=${missingAppearance}, missing habitat=${missingHabitat}`);

const tally = { true: 0, false: 0, none: 0 };
creatures.forEach(c => {
  if (c.attested === true) tally.true++;
  else if (c.attested === false) tally.false++;
  else tally.none++;
});
console.log(`3. ATTESTED TALLY: ${JSON.stringify(tally)}`);

let uniqueSlugsInStories = new Set();
stories.forEach(s => (s.creatures || []).forEach(r => uniqueSlugsInStories.add(r)));
console.log(`   Unique creature slugs now linked from stories: ${uniqueSlugsInStories.size}`);
