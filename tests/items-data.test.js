/* eslint-env node */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf-8'));
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

describe('Items data integrity', () => {
  const items = loadJSON('data/items.json');
  const regions = loadJSON('data/datasets/geo-regions.json');
  const countries = loadJSON('data/datasets/geo-countries.json');
  const creatures = loadJSON('data/datasets/creatures.json');
  const stories = loadJSON('data/datasets/stories.json');

  const SOURCE_TYPES = ['oral_tradition', 'literary', 'archaeological', 'secondary_scholarly'];
  const SOURCE_QUALITIES = ['academic', 'documented', 'expert', 'fair', 'good', 'poor', 'primary', 'researched', 'verified', 'well-documented'];
  const ALLOWED_TYPES = ['weapon', 'jewelry', 'ship', 'garment', 'tool', 'household object', 'ritual object', 'rune stave', 'musical instrument', 'other', 'religious object', 'crown', 'cooking vessel', 'container'];
  const REQUIRED = ['id', 'slug', 'name', 'country', 'region', 'culture', 'type', 'description', 'source_type', 'source_quality', 'attested', 'version', 'lastUpdated'];

  it('items.json parses as a non-empty array', () => {
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBeGreaterThan(0);
  });

  it('every id is unique', () => {
    const ids = items.map(i => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every slug is unique and kebab-case', () => {
    const slugs = items.map(i => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    slugs.forEach(s => {
      assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s), `slug not kebab-case: ${s}`);
    });
  });

  it('required fields present and non-empty on every entry', () => {
    items.forEach(item => {
      REQUIRED.forEach(field => {
        const val = item[field];
        assert(val !== undefined, `${item.id} missing ${field}`);
        assert(val !== '', `${item.id} empty ${field}`);
      });
    });
  });

  it('version is a string and lastUpdated is YYYY-MM-DD', () => {
    items.forEach(item => {
      assert(typeof item.version === 'string', `${item.id} version not a string`);
      assert(/^\d{4}-\d{2}-\d{2}$/.test(item.lastUpdated), `${item.id} lastUpdated invalid: ${item.lastUpdated}`);
      if (item.search_terms) {
        assert(Array.isArray(item.search_terms), `${item.id} search_terms not an array`);
        item.search_terms.forEach(t => assert(typeof t === 'string', `${item.id} search_terms has non-string`));
      }
    });
  });

  it('every country exists in geo-countries', () => {
    const countrySet = new Set(countries);
    const bad = items.map(i => i.country).filter(c => !countrySet.has(c));
    expect([...new Set(bad)]).toEqual([]);
  });

  it('every region exists in geo-regions', () => {
    const regionSet = new Set(regions);
    const bad = items.map(i => i.region).filter(r => !regionSet.has(r));
    expect([...new Set(bad)]).toEqual([]);
  });

  it('source_type is in the allowed set', () => {
    items.forEach(item => {
      assert(SOURCE_TYPES.includes(item.source_type), `${item.id} source_type ${item.source_type}`);
    });
  });

  it('source_quality is in the allowed set', () => {
    items.forEach(item => {
      assert(SOURCE_QUALITIES.includes(item.source_quality), `${item.id} source_quality ${item.source_quality}`);
    });
  });

  it('attested is true, false, or null', () => {
    items.forEach(item => {
      assert(item.attested === true || item.attested === false || item.attested === null,
        `${item.id} attested=${item.attested}`);
    });
  });

  it('type is in the allowed taxonomy', () => {
    items.forEach(item => {
      assert(ALLOWED_TYPES.includes(item.type), `${item.id} type ${item.type}`);
    });
  });

  it('associated_creature, if present, resolves in creatures', () => {
    const creatureSet = new Set(creatures.map(c => c.slug));
    items.forEach(item => {
      if (item.associated_creature) {
        assert(creatureSet.has(item.associated_creature), `${item.id} associated_creature ${item.associated_creature}`);
      }
    });
  });

  it('every related_creatures slug resolves in creatures', () => {
    const creatureSet = new Set(creatures.map(c => c.slug));
    items.forEach(item => {
      (item.related_creatures || []).forEach(ref => {
        assert(creatureSet.has(ref), `${item.id} -> creature ${ref}`);
      });
    });
  });

  it('every featured_in_stories slug resolves in stories', () => {
    const storySet = new Set(stories.map(s => s.slug));
    items.forEach(item => {
      (item.featured_in_stories || []).forEach(ref => {
        assert(storySet.has(ref), `${item.id} -> story ${ref}`);
      });
    });
  });

  it('back-references: creature related_items resolve in items', () => {
    const itemSet = new Set(items.map(i => i.slug));
    creatures.forEach(creature => {
      (creature.related_items || []).forEach(ref => {
        assert(itemSet.has(ref), `${creature.slug} -> item ${ref}`);
      });
    });
  });

  it('back-references: story items resolve in items', () => {
    const itemSet = new Set(items.map(i => i.slug));
    stories.forEach(story => {
      (story.items || []).forEach(ref => {
        assert(itemSet.has(ref), `${story.slug} -> item ${ref}`);
      });
    });
  });
});
