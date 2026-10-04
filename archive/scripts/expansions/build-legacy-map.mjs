import fs from "fs";

const creatures = JSON.parse(fs.readFileSync("data/datasets/creatures.json", "utf8"));
const stories = JSON.parse(fs.readFileSync("data/datasets/stories.json", "utf8"));

const cSlugs = new Set(creatures.map(c => c.slug));

// Build map from name -> slug and alias -> slug
const nameToSlug = new Map();
creatures.forEach(c => {
  nameToSlug.set(c.name.toLowerCase(), c.slug);
  if (c.slug) nameToSlug.set(c.slug.toLowerCase(), c.slug);
  (c.aliases || []).forEach(a => nameToSlug.set(a.toLowerCase(), c.slug));
});

// Map legacy IDs to canonical slugs
const legacyMap = new Map();
let mappedTotal = 0;
let unmappedTotal = 0;

stories.forEach(s => {
  const newCreatures = [];
  (s.creatures || []).forEach(ref => {
    if (cSlugs.has(ref)) {
      legacyMap.set(ref, ref);
      newCreatures.push(ref);
      mappedTotal++;
      return;
    }

    // Try 1: strip numeric suffix like -1819 or -0868
    const noNum = ref.replace(/-\d{4}$/, "");
    if (cSlugs.has(noNum)) {
      legacyMap.set(ref, noNum);
      newCreatures.push(noNum);
      mappedTotal++;
      return;
    }

    // Try 2: strip stub- prefix + numeric suffix
    const noStub = ref.replace(/^stub-/, "").replace(/-\d{4}$/, "");
    if (cSlugs.has(noStub)) {
      legacyMap.set(ref, noStub);
      newCreatures.push(noStub);
      mappedTotal++;
      return;
    }

    // Try 3: nameToSlug lookup on noNum or noStub or ref
    if (nameToSlug.has(ref.toLowerCase())) {
      const slug = nameToSlug.get(ref.toLowerCase());
      legacyMap.set(ref, slug);
      newCreatures.push(slug);
      mappedTotal++;
      return;
    }
    if (nameToSlug.has(noNum.toLowerCase())) {
      const slug = nameToSlug.get(noNum.toLowerCase());
      legacyMap.set(ref, slug);
      newCreatures.push(slug);
      mappedTotal++;
      return;
    }
    if (nameToSlug.has(noStub.toLowerCase())) {
      const slug = nameToSlug.get(noStub.toLowerCase());
      legacyMap.set(ref, slug);
      newCreatures.push(slug);
      mappedTotal++;
      return;
    }

    // Try 4: country-prefix stripping e.g. "norway-troll" or "troll-norway"
    // E.g. "nkk-norway" -> "nokken" or "nkken" -> "nokken"
    // Let's check common ones:
    unmappedTotal++;
  });
});

console.log(`Mapped refs: ${mappedTotal} / ${mappedTotal + unmappedTotal} (${((mappedTotal / (mappedTotal + unmappedTotal)) * 100).toFixed(1)}%)`);
console.log(`Unique mapped legacy refs: ${legacyMap.size}`);

// Print sample mappings
const samples = Array.from(legacyMap.entries()).slice(0, 15);
console.log("\nSample mappings:");
samples.forEach(([k, v]) => console.log(`  "${k}" => "${v}"`));
