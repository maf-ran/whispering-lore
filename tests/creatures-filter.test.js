var sampleCreatures = [
  { name: 'Troll', type: 'giant', country: 'Norway', region: 'Nordic' },
  { name: 'Kitsune', type: 'spirit', country: 'Japan', region: 'East Asia' },
  { name: 'Banshee', type: 'spirit', country: 'Ireland', region: 'Celtic' },
  { name: 'Dragon', type: 'dragon', country: 'China', region: 'East Asia' },
  { name: 'Jinn', type: 'spirit', country: 'Saudi Arabia', region: 'Middle East' }
]

function filterBySearch(data, query) {
  var q = query.toLowerCase()
  return data.filter(function (c) {
    return (
      (c.name && c.name.toLowerCase().indexOf(q) !== -1) ||
      (c.type && c.type.toLowerCase().indexOf(q) !== -1) ||
      (c.country && c.country.toLowerCase().indexOf(q) !== -1)
    )
  })
}

function filterByType(data, type) {
  if (!type || type === 'all') return data
  return data.filter(function (c) { return c.type === type })
}

function filterByRegion(data, region) {
  if (!region || region === 'all') return data
  return data.filter(function (c) { return c.region === region })
}

function sortAlphabetical(data) {
  return data.slice().sort(function (a, b) {
    return (a.name || '').localeCompare(b.name || '')
  })
}

describe('Creature Filter Logic', function () {
  test('filterBySearch returns matching creatures by name', function () {
    var result = filterBySearch(sampleCreatures, 'Troll')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Troll')
  })

  test('filterBySearch returns matching creatures by type', function () {
    var result = filterBySearch(sampleCreatures, 'giant')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Troll')
  })

  test('filterBySearch returns matching creatures by country', function () {
    var result = filterBySearch(sampleCreatures, 'Japan')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Kitsune')
  })

  test('filterBySearch is case-insensitive', function () {
    var result = filterBySearch(sampleCreatures, 'troll')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Troll')
  })

  test('filterBySearch returns all creatures for empty query', function () {
    var result = filterBySearch(sampleCreatures, '')
    expect(result.length).toBe(sampleCreatures.length)
  })

  test('filterBySearch returns empty array for non-matching query', function () {
    var result = filterBySearch(sampleCreatures, 'zzzzz')
    expect(result.length).toBe(0)
  })

  test('filterByType filters by creature type', function () {
    var result = filterByType(sampleCreatures, 'spirit')
    expect(result.length).toBe(3)
    expect(result.map(function (c) { return c.name })).toEqual(['Kitsune', 'Banshee', 'Jinn'])
  })

  test('filterByType returns all when type is null', function () {
    var result = filterByType(sampleCreatures, null)
    expect(result.length).toBe(sampleCreatures.length)
  })

  test('filterByRegion filters by region', function () {
    var result = filterByRegion(sampleCreatures, 'East Asia')
    expect(result.length).toBe(2)
    expect(result.map(function (c) { return c.name })).toEqual(['Kitsune', 'Dragon'])
  })

  test('sortAlphabetical sorts names A-Z', function () {
    var result = sortAlphabetical(sampleCreatures)
    expect(result[0].name).toBe('Banshee')
    expect(result[result.length - 1].name).toBe('Troll')
  })
})