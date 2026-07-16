function escapeLatex(str) {
  if (!str) return '';
  return str.replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$')
            .replace(/#/g, '\\#').replace(/_/g, '\\_').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

function generateBibtex(entry, isStory) {
  var id = entry.slug || entry.id || 'unknown';
  var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
  var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
  var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
  var year = (entry.lastUpdated || '2026-07-05').split('-')[0];
  var date = entry.lastUpdated || '2026-07-05';
  return '@misc{' + id + ',\n  author = {Whispering Lore},\n  title = {' + escapeLatex(title) + '},\n  howpublished = {\\url{' + url + '}},\n  year = {' + year + '},\n  note = {Accessed: ' + date + '},\n  publisher = {Whispering Lore},\n  type = {' + (isStory ? 'folktale' : 'mythical creature entry') + '}\n}';
}

function generateMla(entry, isStory) {
  var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
  var subtitle = isStory ? 'Folktale' : 'Mythical Creature Entry';
  var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
  var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
  var date = entry.lastUpdated || '2026-07-05';
  return '"' + title + '." ' + subtitle + ', Whispering Lore, ' + date + ', ' + url + '.';
}

function generateApa(entry, isStory) {
  var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
  var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
  var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
  var year = (entry.lastUpdated || '2026-07-05').split('-')[0];
  return 'Whispering Lore. (' + year + '). ' + title + '. Whispering Lore. ' + url;
}

var mockCreature = {
  slug: 'nuckelavee',
  name: 'Nuckelavee',
  lastUpdated: '2026-07-05'
};

var mockStory = {
  slug: 'three-billy-goats-gruff',
  title: 'Three Billy Goats Gruff',
  lastUpdated: '2026-07-05'
};

test('BibTeX creature citation starts with @misc', function() {
  var result = generateBibtex(mockCreature, false);
  expect(result.startsWith('@misc{nuckelavee,')).toBe(true);
});

test('BibTeX story citation contains title', function() {
  var result = generateBibtex(mockStory, true);
  expect(result.indexOf('Three Billy Goats Gruff') !== -1).toBe(true);
});

test('MLA creature citation ends with URL and period', function() {
  var result = generateMla(mockCreature, false);
  expect(result.indexOf('nuckelavee') !== -1).toBe(true);
  expect(result.endsWith('.')).toBe(true);
});

test('APA citation starts with Whispering Lore', function() {
  var result = generateApa(mockCreature, false);
  expect(result.startsWith('Whispering Lore.')).toBe(true);
});

test('MLA story citation contains folktale subtitle', function() {
  var result = generateMla(mockStory, true);
  expect(result.indexOf('Folktale') !== -1).toBe(true);
});

test('BibTeX escapes special LaTeX characters', function() {
  var entry = { slug: 'test', name: 'Test & % $ # _ Species', lastUpdated: '2026-07-05' };
  var result = generateBibtex(entry, false);
  expect(result.indexOf('\\&') !== -1).toBe(true);
  expect(result.indexOf('\\%') !== -1).toBe(true);
  expect(result.indexOf('\\$') !== -1).toBe(true);
  expect(result.indexOf('\\#') !== -1).toBe(true);
  expect(result.indexOf('\\_') !== -1).toBe(true);
});

test('All three formats include the URL', function() {
  var bib = generateBibtex(mockCreature, false);
  var mla = generateMla(mockCreature, false);
  var apa = generateApa(mockCreature, false);
  expect(bib.indexOf('whisperinglore.com') !== -1).toBe(true);
  expect(mla.indexOf('whisperinglore.com') !== -1).toBe(true);
  expect(apa.indexOf('whisperinglore.com') !== -1).toBe(true);
});
