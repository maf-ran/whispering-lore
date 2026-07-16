/**
 * @jest-environment jsdom
 */

window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener: function () {}, removeEventListener: function () {} }
}

require('../js/shared-utils.js')
require('../js/citations.js')

var CitationGenerator = window.__sharedUtils.CitationGenerator

var mockCreature = {
  slug: 'nuckelavee',
  name: 'Nuckelavee',
  lastUpdated: '2026-07-05'
}

var mockStory = {
  slug: 'three-billy-goats-gruff',
  title: 'Three Billy Goats Gruff',
  lastUpdated: '2026-07-05'
}

test('BibTeX creature citation starts with @misc', function () {
  var result = CitationGenerator.formats.bibtex(mockCreature, false)
  expect(result.startsWith('@misc{nuckelavee,')).toBe(true)
})

test('BibTeX story citation contains title', function () {
  var result = CitationGenerator.formats.bibtex(mockStory, true)
  expect(result.indexOf('Three Billy Goats Gruff') !== -1).toBe(true)
})

test('MLA creature citation ends with URL and period', function () {
  var result = CitationGenerator.formats.mla(mockCreature, false)
  expect(result.indexOf('nuckelavee') !== -1).toBe(true)
  expect(result.endsWith('.')).toBe(true)
})

test('APA citation starts with Whispering Lore', function () {
  var result = CitationGenerator.formats.apa(mockCreature, false)
  expect(result.startsWith('Whispering Lore.')).toBe(true)
})

test('MLA story citation contains folktale subtitle', function () {
  var result = CitationGenerator.formats.mla(mockStory, true)
  expect(result.indexOf('Folktale') !== -1).toBe(true)
})

test('BibTeX escapes special LaTeX characters', function () {
  var entry = { slug: 'test', name: 'Test & % $ # _ Species', lastUpdated: '2026-07-05' }
  var result = CitationGenerator.formats.bibtex(entry, false)
  expect(result.indexOf('\\&') !== -1).toBe(true)
  expect(result.indexOf('\\%') !== -1).toBe(true)
  expect(result.indexOf('\\$') !== -1).toBe(true)
  expect(result.indexOf('\\#') !== -1).toBe(true)
  expect(result.indexOf('\\_') !== -1).toBe(true)
})

test('All three formats include the URL', function () {
  var bib = CitationGenerator.formats.bibtex(mockCreature, false)
  var mla = CitationGenerator.formats.mla(mockCreature, false)
  var apa = CitationGenerator.formats.apa(mockCreature, false)
  expect(bib.indexOf('whisperinglore.com') !== -1).toBe(true)
  expect(mla.indexOf('whisperinglore.com') !== -1).toBe(true)
  expect(apa.indexOf('whisperinglore.com') !== -1).toBe(true)
})

test('generateAll returns all three formats', function () {
  var all = CitationGenerator.generateAll(mockCreature, false)
  expect(all.bibtex).toBeDefined()
  expect(all.mla).toBeDefined()
  expect(all.apa).toBeDefined()
  expect(typeof all.bibtex).toBe('string')
  expect(typeof all.mla).toBe('string')
  expect(typeof all.apa).toBe('string')
})
