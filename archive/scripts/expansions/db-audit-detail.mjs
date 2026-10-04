import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const stories = JSON.parse(fs.readFileSync("data/datasets/stories.json", "utf8"));

let cStoriesCount = 0;
creatures.forEach(c => {
  if (c.related_stories && c.related_stories.length > 0) cStoriesCount += c.related_stories.length;
});

let sCreaturesCount = 0;
stories.forEach(s => {
  if (s.creatures && s.creatures.length > 0) sCreaturesCount += s.creatures.length;
});

console.log("Creatures referencing stories:", cStoriesCount);
console.log("Stories referencing creatures (via creatures field):", sCreaturesCount);

// Sample creature keys
console.log("\nCreature Keys:", Object.keys(creatures[0]));
console.log("\nStory Keys:", Object.keys(stories[0]));
