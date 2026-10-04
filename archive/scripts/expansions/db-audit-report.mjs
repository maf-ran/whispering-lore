import fs from "fs";

const creaturesData = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const creatures = Array.isArray(creaturesData) ? creaturesData : creaturesData.creatures;

const storiesData = JSON.parse(fs.readFileSync("data/datasets/stories.json", "utf8"));
const stories = Array.isArray(storiesData) ? storiesData : storiesData.stories;

const geoData = JSON.parse(fs.readFileSync("data/datasets/geo-regions.json", "utf8"));

console.log("=== CREATURES STATS ===");
console.log("Total Creatures:", creatures.length);

const cQual = {}, cType = {}, cRegion = {}, cCountry = {}, cAttested = {};
let descLenSum = 0, descMin = Infinity, descMax = 0;
let missingAppearance = 0, missingBehavior = 0, missingHabitat = 0, missingCultSig = 0;

creatures.forEach(c => {
  cQual[c.source_quality] = (cQual[c.source_quality] || 0) + 1;
  cType[c.type] = (cType[c.type] || 0) + 1;
  cRegion[c.region] = (cRegion[c.region] || 0) + 1;
  cCountry[c.country] = (cCountry[c.country] || 0) + 1;
  const attKey = String(c.attested);
  cAttested[attKey] = (cAttested[attKey] || 0) + 1;

  const len = (c.description || "").length;
  descLenSum += len;
  if (len < descMin) descMin = len;
  if (len > descMax) descMax = len;

  if (!c.appearance || c.appearance === "Not documented") missingAppearance++;
  if (!c.behavior || c.behavior === "Not documented") missingBehavior++;
  if (!c.habitat || c.habitat === "Not documented") missingHabitat++;
  if (!c.cultural_significance || c.cultural_significance === "Not documented") missingCultSig++;
});

console.log("Source Quality:", JSON.stringify(cQual));
console.log("Attested status:", JSON.stringify(cAttested));
console.log(`Desc Lengths: avg ${Math.round(descLenSum / creatures.length)}, min ${descMin}, max ${descMax}`);
console.log(`Incomplete fields: appearance=${missingAppearance}, behavior=${missingBehavior}, habitat=${missingHabitat}, cultSig=${missingCultSig}`);
console.log("Unique Countries:", Object.keys(cCountry).length);
console.log("Unique Regions:", Object.keys(cRegion).length);

console.log("\n=== STORIES STATS ===");
console.log("Total Stories:", stories.length);

const sQual = {}, sType = {}, sRegion = {}, sCountry = {};
let fullTextSum = 0, fullTextMin = Infinity, fullTextMax = 0, emptyFullText = 0;
let linkedCreaturesCount = 0;

stories.forEach(s => {
  sQual[s.source_quality] = (sQual[s.source_quality] || 0) + 1;
  sType[s.story_type || s.type] = (sType[s.story_type || s.type] || 0) + 1;
  sRegion[s.region] = (sRegion[s.region] || 0) + 1;
  sCountry[s.country] = (sCountry[s.country] || 0) + 1;

  const ftLen = (s.full_text || "").length;
  if (ftLen === 0) emptyFullText++;
  fullTextSum += ftLen;
  if (ftLen < fullTextMin) fullTextMin = ftLen;
  if (ftLen > fullTextMax) fullTextMax = ftLen;

  if (s.related_creatures && s.related_creatures.length > 0) linkedCreaturesCount += s.related_creatures.length;
});

console.log("Story Source Quality:", JSON.stringify(sQual));
console.log(`Full Text Lengths: avg ${Math.round(fullTextSum / stories.length)}, min ${fullTextMin}, max ${fullTextMax}, empty ${emptyFullText}`);
console.log("Linked Creature Refs:", linkedCreaturesCount);
console.log("Unique Story Countries:", Object.keys(sCountry).length);
console.log("Unique Story Regions:", Object.keys(sRegion).length);

console.log("\n=== CROSS-REFERENCING & SHARDS ===");
// Cross refs check
const creatureSlugs = new Set(creatures.map(c => c.slug));
let brokenStoryRefs = 0;
stories.forEach(s => {
  (s.related_creatures || []).forEach(ref => {
    if (!creatureSlugs.has(ref)) brokenStoryRefs++;
  });
});
console.log("Broken creature references in stories:", brokenStoryRefs);

// Check country overlap
const allCountries = new Set([...Object.keys(cCountry), ...Object.keys(sCountry)]);
console.log("Total unique countries across DB:", allCountries.size);
