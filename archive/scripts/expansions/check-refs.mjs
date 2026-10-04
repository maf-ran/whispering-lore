import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const stories = JSON.parse(fs.readFileSync("data/datasets/stories.json", "utf8"));

const cSlugs = new Set(creatures.map(c => c.slug));
const cNames = new Set(creatures.map(c => c.name.toLowerCase()));

let validSlugRefs = 0;
let validNameRefs = 0;
let brokenRefs = 0;
const brokenList = [];

stories.forEach(s => {
  (s.creatures || []).forEach(ref => {
    if (cSlugs.has(ref)) {
      validSlugRefs++;
    } else if (cNames.has(ref.toLowerCase())) {
      validNameRefs++;
    } else {
      brokenRefs++;
      brokenList.push({ story: s.slug, ref });
    }
  });
});

console.log(`Valid Slug Refs: ${validSlugRefs}`);
console.log(`Valid Name Refs: ${validNameRefs}`);
console.log(`Broken Creature Refs: ${brokenRefs}`);
if (brokenRefs > 0) {
  console.log("Sample broken refs:", brokenList.slice(0, 10));
}
