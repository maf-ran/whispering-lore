import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));

const missingAppearance = [];
const missingHabitat = [];

creatures.forEach(c => {
  if (!c.appearance || c.appearance === "Not documented" || c.appearance.trim() === "") {
    missingAppearance.push({ slug: c.slug, name: c.name, country: c.country, region: c.region, description: (c.description || "").slice(0, 80) });
  }
  if (!c.habitat || c.habitat === "Not documented" || c.habitat.trim() === "") {
    missingHabitat.push({ slug: c.slug, name: c.name, country: c.country, region: c.region, description: (c.description || "").slice(0, 80) });
  }
});

console.log(`=== Missing appearance (${missingAppearance.length}) ===`);
missingAppearance.forEach(x => console.log(`- ${x.slug} (${x.name}, ${x.country}/${x.region}): ${x.description}...`));

console.log(`\n=== Missing habitat (${missingHabitat.length}) ===`);
missingHabitat.forEach(x => console.log(`- ${x.slug} (${x.name}, ${x.country}/${x.region}): ${x.description}...`));
