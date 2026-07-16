const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function loadJSON(relPath) {
  return JSON.parse(fs.readFileSync(path.join(root, relPath), 'utf-8'));
}

describe('Geo data integrity', () => {
  const regions = loadJSON('data/datasets/geo-regions.json');
  const countries = loadJSON('data/datasets/geo-countries.json');
  const creatures = loadJSON('data/datasets/creatures.json');
  const stories = loadJSON('data/datasets/stories.json');

  it('no duplicates in regions', () => {
    expect(regions.length).toBe(new Set(regions).size);
  });

  it('no duplicates in countries', () => {
    expect(countries.length).toBe(new Set(countries).size);
  });

  it('overlap between regions and countries is limited to items used as both', () => {
    const overlap = regions.filter(r => countries.includes(r) && r !== 'Unknown');
    expect(overlap.length).toBeLessThanOrEqual(5);
  });

  it('no USA remains — merged into United States', () => {
    expect(countries).not.toContain('USA');
    creatures.forEach(cr => {
      if (cr.country === 'USA') throw new Error(`Creature ${cr.id} still has USA`);
    });
    stories.forEach(st => {
      if (st.country === 'USA') throw new Error(`Story ${st.id} still has USA`);
    });
  });

  it('every creature country exists in geo-countries', () => {
    const countrySet = new Set(countries);
    const bad = creatures
      .map(cr => cr.country)
      .filter(Boolean)
      .filter(c => !countrySet.has(c));
    const unique = [...new Set(bad)];
    expect(unique).toEqual([]);
  });

  it('every creature region exists in geo-regions', () => {
    const regionSet = new Set(regions);
    const bad = creatures
      .map(cr => cr.region)
      .filter(Boolean)
      .filter(r => !regionSet.has(r));
    const unique = [...new Set(bad)];
    expect(unique).toEqual([]);
  });

  it('every story country exists in geo-countries', () => {
    const countrySet = new Set(countries);
    const bad = stories
      .map(st => st.country)
      .filter(Boolean)
      .filter(c => !countrySet.has(c));
    const unique = [...new Set(bad)];
    expect(unique).toEqual([]);
  });

  it('every story region exists in geo-regions', () => {
    const regionSet = new Set(regions);
    const bad = stories
      .map(st => st.region)
      .filter(Boolean)
      .filter(r => !regionSet.has(r));
    const unique = [...new Set(bad)];
    expect(unique).toEqual([]);
  });
});
