#!/usr/bin/env node
/**
 * Cross-Dataset Integrity Audit
 * Checks bidirectional references between creatures.json and stories.json,
 * orphaned entries, schema compliance, slug consistency, and name/slug mismatches.
 *
 * READ-ONLY — produces JSON report, never modifies data files.
 */

const fs = require('fs');
const path = require('path');

const BASE = path.resolve(__dirname, '../../data');
const CREATURES_PATH = path.join(BASE, 'datasets/creatures.json');
const STORIES_PATH = path.join(BASE, 'datasets/stories.json');
const STORY_TYPES_PATH = path.join(BASE, 'config/story-types.json');

const creatures = JSON.parse(fs.readFileSync(CREATURES_PATH, 'utf8'));
const stories = JSON.parse(fs.readFileSync(STORIES_PATH, 'utf8'));
const storyTypesConfig = JSON.parse(fs.readFileSync(STORY_TYPES_PATH, 'utf8'));

// --- Build lookup sets ---
const creatureSlugs = new Set(creatures.map(c => c.slug));
const storySlugs = new Set(stories.map(s => s.slug));
const canonicalTypes = new Set(storyTypesConfig.canonical);
const validMappedTypes = new Set(Object.keys(storyTypesConfig.mapping));
const allValidTypes = new Set([...canonicalTypes, ...validMappedTypes]);

// --- Helpers ---
function slugFormatOk(slug) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

function slugifyName(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// --- Findings accumulator ---
const findings = {
  meta: {
    timestamp: new Date().toISOString(),
    creatures_count: creatures.length,
    stories_count: stories.length,
    creature_slugs: creatureSlugs.size,
    story_slugs: storySlugs.size,
  },
  critical: [],   // broken refs that cause runtime errors
  warning: [],     // structural/consistency issues
  info: [],        // informational
};

function addFinding(severity, category, detail) {
  findings[severity].push({ category, ...detail });
}

// =========================================================================
// 1. Story → Creature refs
// =========================================================================
const brokenStoryToCreature = [];
for (const story of stories) {
  if (!story.creatures) continue;
  for (const crSlug of story.creatures) {
    if (!creatureSlugs.has(crSlug)) {
      brokenStoryToCreature.push({
        story_title: story.title,
        story_slug: story.slug,
        missing_creature_slug: crSlug,
      });
      addFinding('critical', 'story_to_creature_ref', {
        story_title: story.title,
        story_slug: story.slug,
        missing_creature_slug: crSlug,
      });
    }
  }
}

// =========================================================================
// 2. Creature → Story refs
// =========================================================================
const brokenCreatureToStory = [];
for (const creature of creatures) {
  if (!creature.stories) continue;
  for (const sSlug of creature.stories) {
    if (!storySlugs.has(sSlug)) {
      brokenCreatureToStory.push({
        creature_slug: creature.slug,
        creature_name: creature.name,
        missing_story_slug: sSlug,
      });
      addFinding('critical', 'creature_to_story_ref', {
        creature_slug: creature.slug,
        creature_name: creature.name,
        missing_story_slug: sSlug,
      });
    }
  }
}

// =========================================================================
// 3. Bidirectional link check (featured_in_stories ↔ creatures)
// =========================================================================
// Build story→creatures map from stories.json
const storyCreatureMap = new Map();
for (const story of stories) {
  storyCreatureMap.set(story.slug, new Set(story.creatures || []));
}

// Build creature→stories map from creatures.json (stories array)
const creatureStoryMap = new Map();
for (const creature of creatures) {
  creatureStoryMap.set(creature.slug, {
    stories: new Set(creature.stories || []),
    featured_in: new Set(creature.featured_in_stories || []),
  });
}

const bidirectionalAsymmetries = [];

// Check A: creature.featured_in_stories → story.creatures
for (const creature of creatures) {
  const featured = creature.featured_in_stories || [];
  for (const storySlug of featured) {
    const storyCreatures = storyCreatureMap.get(storySlug);
    if (!storyCreatures) {
      // story doesn't exist at all — already caught above
      continue;
    }
    if (!storyCreatures.has(creature.slug)) {
      bidirectionalAsymmetries.push({
        type: 'creature_featured_not_in_story',
        creature_slug: creature.slug,
        creature_name: creature.name,
        story_slug: storySlug,
        detail: `Creature "${creature.slug}" lists story "${storySlug}" in featured_in_stories, but story does not list creature in its creatures array`,
      });
      addFinding('warning', 'bidirectional_asymmetry', {
        creature_slug: creature.slug,
        creature_name: creature.name,
        story_slug: storySlug,
        direction: 'creature→story missing back-ref',
      });
    }
  }
}

// Check B: story.creatures → creature.stories
for (const story of stories) {
  for (const crSlug of (story.creatures || [])) {
    const creatureData = creatureStoryMap.get(crSlug);
    if (!creatureData) continue; // already caught as broken ref
    if (!creatureData.stories.has(story.slug)) {
      bidirectionalAsymmetries.push({
        type: 'story_creature_not_in_stories',
        story_slug: story.slug,
        story_title: story.title,
        creature_slug: crSlug,
        detail: `Story "${story.slug}" lists creature "${crSlug}" in its creatures array, but creature does not list story in its stories array`,
      });
      addFinding('warning', 'bidirectional_asymmetry', {
        story_slug: story.slug,
        story_title: story.title,
        creature_slug: crSlug,
        direction: 'story→creature missing back-ref',
      });
    }
  }
}

// Check C: creature.stories → story.creatures
for (const creature of creatures) {
  for (const sSlug of (creature.stories || [])) {
    const storyCrSet = storyCreatureMap.get(sSlug);
    if (!storyCrSet) continue; // already caught
    if (!storyCrSet.has(creature.slug)) {
      bidirectionalAsymmetries.push({
        type: 'creature_story_not_in_story',
        creature_slug: creature.slug,
        creature_name: creature.name,
        story_slug: sSlug,
        detail: `Creature "${creature.slug}" lists story "${sSlug}" in its stories array, but story does not list creature in its creatures array`,
      });
      addFinding('warning', 'bidirectional_asymmetry', {
        creature_slug: creature.slug,
        creature_name: creature.name,
        story_slug: sSlug,
        direction: 'creature→story missing back-ref',
      });
    }
  }
}

// =========================================================================
// 4. Orphaned stories (0 creatures referenced AND no creature references them)
// =========================================================================
// Stories referencing zero creatures
const storiesRefZeroCreatures = stories.filter(s => !s.creatures || s.creatures.length === 0);

// Creatures that reference a given story slug
const creaturesRefStory = new Map();
for (const creature of creatures) {
  for (const sSlug of (creature.stories || [])) {
    if (!creaturesRefStory.has(sSlug)) creaturesRefStory.set(sSlug, []);
    creaturesRefStory.get(sSlug).push(creature.slug);
  }
}
for (const creature of creatures) {
  for (const sSlug of (creature.featured_in_stories || [])) {
    if (!creaturesRefStory.has(sSlug)) creaturesRefStory.set(sSlug, []);
    creaturesRefStory.get(sSlug).push(creature.slug);
  }
}

const orphanedStories = storiesRefZeroCreatures.filter(s => {
  const refs = creaturesRefStory.get(s.slug);
  return !refs || refs.length === 0;
});

for (const story of orphanedStories) {
  addFinding('warning', 'orphaned_story', {
    story_title: story.title,
    story_slug: story.slug,
    country: story.country,
    type: story.type,
  });
}

// =========================================================================
// 5. Orphaned creatures (0 stories referenced AND reference 0 stories)
// =========================================================================
const orphanedCreatures = creatures.filter(c => {
  const refsStories = (c.stories && c.stories.length > 0);
  const refsFeatured = (c.featured_in_stories && c.featured_in_stories.length > 0);
  return !refsStories && !refsFeatured;
});

for (const creature of orphanedCreatures) {
  addFinding('warning', 'orphaned_creature', {
    creature_slug: creature.slug,
    creature_name: creature.name,
    country: creature.country,
    type: creature.type,
  });
}

// =========================================================================
// 6. Schema cross-check: story types
// =========================================================================
const invalidStoryTypes = [];
for (const story of stories) {
  if (!story.type) {
    invalidStoryTypes.push({
      story_slug: story.slug,
      story_title: story.title,
      type_value: null,
      issue: 'missing type field',
    });
    addFinding('warning', 'schema_type', {
      story_slug: story.slug,
      story_title: story.title,
      type_value: null,
      issue: 'missing',
    });
  } else if (!allValidTypes.has(story.type)) {
    invalidStoryTypes.push({
      story_slug: story.slug,
      story_title: story.title,
      type_value: story.type,
      issue: 'not in canonical list or mapping',
    });
    addFinding('warning', 'schema_type', {
      story_slug: story.slug,
      story_title: story.title,
      type_value: story.type,
      issue: 'unknown',
    });
  }
}

// =========================================================================
// 7. Slug format consistency
// =========================================================================
const badSlugs = [];

for (const creature of creatures) {
  if (!slugFormatOk(creature.slug)) {
    badSlugs.push({ entity: 'creature', slug: creature.slug, name: creature.name, id: creature.id });
    addFinding('warning', 'slug_format', { entity: 'creature', slug: creature.slug, name: creature.name });
  }
}

for (const story of stories) {
  if (!slugFormatOk(story.slug)) {
    badSlugs.push({ entity: 'story', slug: story.slug, name: story.title, id: story.id });
    addFinding('warning', 'slug_format', { entity: 'story', slug: story.slug, name: story.title });
  }
}

// Also check creature.stories and creature.featured_in_stories entries
for (const creature of creatures) {
  for (const s of (creature.stories || [])) {
    if (!slugFormatOk(s)) {
      addFinding('info', 'slug_format_ref', { context: 'creature.stories', slug: s, creature: creature.slug });
    }
  }
  for (const s of (creature.featured_in_stories || [])) {
    if (!slugFormatOk(s)) {
      addFinding('info', 'slug_format_ref', { context: 'creature.featured_in_stories', slug: s, creature: creature.slug });
    }
  }
}

// Also check story.creatures entries
for (const story of stories) {
  for (const c of (story.creatures || [])) {
    if (!slugFormatOk(c)) {
      addFinding('info', 'slug_format_ref', { context: 'story.creatures', slug: c, story: story.slug });
    }
  }
}

// =========================================================================
// 8. Name/slug mismatch
// =========================================================================
const nameSlugMismatches = [];

for (const creature of creatures) {
  const expected = slugifyName(creature.name);
  if (expected && creature.slug !== expected) {
    // Only flag meaningful divergences (ignore minor edge cases like empty expected)
    nameSlugMismatches.push({
      creature_slug: creature.slug,
      creature_name: creature.name,
      expected_slug: expected,
    });
    addFinding('info', 'name_slug_mismatch', {
      creature_slug: creature.slug,
      creature_name: creature.name,
      expected_slug: expected,
    });
  }
}

// Also check stories
for (const story of stories) {
  const expected = slugifyName(story.title);
  if (expected && story.slug !== expected) {
    nameSlugMismatches.push({
      story_slug: story.slug,
      story_title: story.title,
      expected_slug: expected,
    });
    addFinding('info', 'name_slug_mismatch', {
      story_slug: story.slug,
      story_title: story.title,
      expected_slug: expected,
    });
  }
}

// =========================================================================
// Assemble report
// =========================================================================
const report = {
  ...findings.meta,
  summary: {
    critical_count: findings.critical.length,
    warning_count: findings.warning.length,
    info_count: findings.info.length,
    total_findings: findings.critical.length + findings.warning.length + findings.info.length,
    story_to_creature_broken: brokenStoryToCreature.length,
    creature_to_story_broken: brokenCreatureToStory.length,
    bidirectional_asymmetries: bidirectionalAsymmetries.length,
    orphaned_stories: orphanedStories.length,
    orphaned_creatures: orphanedCreatures.length,
    invalid_story_types: invalidStoryTypes.length,
    bad_slugs: badSlugs.length,
    name_slug_mismatches: nameSlugMismatches.length,
  },
  findings: {
    CRITICAL: {
      story_to_creature_broken_refs: brokenStoryToCreature,
      creature_to_story_broken_refs: brokenCreatureToStory,
    },
    WARNING: {
      bidirectional_asymmetries: bidirectionalAsymmetries,
      orphaned_stories: orphanedStories,
      orphaned_creatures: orphanedCreatures.map(c => ({
        creature_slug: c.slug,
        creature_name: c.name,
        country: c.country,
        type: c.type,
      })),
      invalid_story_types: invalidStoryTypes,
      bad_slugs: badSlugs,
    },
    INFO: {
      name_slug_mismatches: nameSlugMismatches,
      slug_format_refs: findings.info.filter(f => f.category === 'slug_format_ref'),
    },
  },
};

const outPath = path.resolve(__dirname, '../../audit-crossref-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.error(`\nReport written to ${outPath}`);
