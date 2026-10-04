import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const stories = JSON.parse(fs.readFileSync("data/datasets/stories.json", "utf8"));

const cSlugs = new Set(creatures.map(c => c.slug));

// Direct alias/variant overrides
const explicitOverrides = {
  "india-airavata-0004": "airavata",
  "nanabozho-ojibwe-3723": "nanabozho",
  "wenebojo-anishinaabe-3721": "nanabozho",
  "brazil-saci-perere-0001": "saci",
  "gluskabe-abenaki-3737": "glooscap",
  "great-turtle-iroquois-3711": "great-turtle",
  "hahgwehdi-yu-iroquois-3712": "hahgwehdiyu",
  "sky-woman-iroquois-3710": "sky-woman",
  "aataentsic-huron-3731": "aataentsic",
  "glooscap-mikmaq-3735": "glooscap",
  "nahual-3839": "nagual",
  "albania-bajlozi-0005": "bajlozi",
  "myanmar-belu-0001": "belu",
  "mongolia-mangadhai-0001": "mangus",
  "peru-jarjacha-0005": "jarjacha",
  "mali-lebe-0004": "lebe",
  "mali-kanaga-0005": "kanaga-mask",
  "nokomis-ojibwe-3729": "nokomis",
  "onatah-corn-spirit-iroquois-3714": "onatah",
  "mongolia-tsagaan-uvgun-0005": "tsagaan-eebgen"
};

function resolveRef(ref) {
  if (cSlugs.has(ref)) return ref;
  if (explicitOverrides[ref] && cSlugs.has(explicitOverrides[ref])) return explicitOverrides[ref];

  const noNum = ref.replace(/-\d{4}$/, "");
  if (cSlugs.has(noNum)) return noNum;

  const noStub = ref.replace(/^stub-/, "").replace(/-\d{4}$/, "");
  if (cSlugs.has(noStub)) return noStub;

  // Try country prefix removal e.g. "peru-jarjacha" -> "jarjacha"
  const parts = noStub.split("-");
  if (parts.length > 1) {
    const withoutCountry = parts.slice(1).join("-");
    if (cSlugs.has(withoutCountry)) return withoutCountry;
  }

  return null; // generic or unmapped
}

let totalOriginalRefs = 0;
let totalResolvedRefs = 0;
let totalStoriesWithRefs = 0;
let totalStoriesWithResolvedRefs = 0;

const updatedStories = stories.map(story => {
  const originalRefs = story.creatures || [];
  totalOriginalRefs += originalRefs.length;
  if (originalRefs.length > 0) totalStoriesWithRefs++;

  const resolved = [];
  const seen = new Set();

  originalRefs.forEach(ref => {
    const s = resolveRef(ref);
    if (s && !seen.has(s)) {
      seen.add(s);
      resolved.push(s);
    }
  });

  totalResolvedRefs += resolved.length;
  if (resolved.length > 0) totalStoriesWithResolvedRefs++;

  return {
    ...story,
    creatures: resolved,
    lastUpdated: "2026-08-07"
  };
});

console.log(`Original total refs: ${totalOriginalRefs}`);
console.log(`Resolved total refs: ${totalResolvedRefs}`);
console.log(`Stories with refs before: ${totalStoriesWithRefs} / ${stories.length}`);
console.log(`Stories with resolved refs after: ${totalStoriesWithResolvedRefs} / ${stories.length}`);
