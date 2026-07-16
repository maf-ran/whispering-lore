;(function () {
  'use strict';

  function escapeLatex(str) {
    if (!str) return '';
    return str.replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$')
              .replace(/#/g, '\\#').replace(/_/g, '\\_').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
  }

  function buildYear(entry) {
    if (entry.lastUpdated) return entry.lastUpdated.split('-')[0];
    return '2026';
  }

  function buildDate(entry) {
    return entry.lastUpdated || '2026-07-05';
  }

  var formats = {};

  formats.bibtex = function(entry, isStory) {
    var id = entry.slug || entry.id || 'unknown';
    var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
    var subtitle = isStory ? 'folktale' : 'mythical creature entry';
    var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
    var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
    var year = buildYear(entry);
    var date = buildDate(entry);

    return '@misc{' + id + ',\n' +
      '  author = {Whispering Lore},\n' +
      '  title = {' + escapeLatex(title) + '},\n' +
      '  howpublished = {\\url{' + url + '}},\n' +
      '  year = {' + year + '},\n' +
      '  note = {Accessed: ' + date + '},\n' +
      '  publisher = {Whispering Lore},\n' +
      '  type = {' + subtitle + '}\n' +
      '}';
  };

  formats.mla = function(entry, isStory) {
    var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
    var subtitle = isStory ? 'Folktale' : 'Mythical Creature Entry';
    var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
    var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
    var date = buildDate(entry);
    return '"' + title + '." ' + subtitle + ', Whispering Lore, ' + date + ', ' + url + '.';
  };

  formats.apa = function(entry, isStory) {
    var title = isStory ? (entry.title || 'Untitled') : (entry.name || 'Unknown Creature');
    var urlBase = isStory ? 'stories.html?story=' : 'bestiary.html?creature=';
    var url = 'https://whisperinglore.com/' + urlBase + encodeURIComponent(entry.slug || '');
    var year = buildYear(entry);
    return 'Whispering Lore. (' + year + '). ' + title + '. Whispering Lore. ' + url;
  };

  function generateAll(entry, isStory) {
    return {
      bibtex: formats.bibtex(entry, isStory),
      mla: formats.mla(entry, isStory),
      apa: formats.apa(entry, isStory)
    };
  }

  if (window.__sharedUtils) {
    window.__sharedUtils.CitationGenerator = {
      generateAll: generateAll,
      formats: formats
    };
  }
})();
