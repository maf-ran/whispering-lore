;(function () {
  'use strict'

  function escapeLatex(str) {
    if (!str) return ''
    return str
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/\$/g, '\\$')
      .replace(/#/g, '\\#')
      .replace(/_/g, '\\_')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
  }

  function buildYear(entry) {
    if (entry.lastUpdated) return entry.lastUpdated.split('-')[0]
    return '2026'
  }

  function buildDate(entry) {
    return entry.lastUpdated || '2026-07-05'
  }

  const formats = {}

  formats.bibtex = function (entry, isStory, isItem) {
    const id = entry.slug || entry.id || 'unknown'
    const title = isStory
      ? entry.title || 'Untitled'
      : entry.name || 'Unknown Creature'
    const subtitle = isItem
      ? 'mythical artifact entry'
      : isStory
        ? 'folktale'
        : 'mythical creature entry'
    const urlBase = isItem
      ? 'items.html?item='
      : isStory
        ? 'stories.html?story='
        : 'bestiary.html?creature='
    const url =
      'https://whisperinglore.com/' +
      urlBase +
      encodeURIComponent(entry.slug || '')
    const year = buildYear(entry)
    const date = buildDate(entry)

    return (
      '@misc{' +
      id +
      ',\n' +
      '  author = {Whispering Lore},\n' +
      '  title = {' +
      escapeLatex(title) +
      '},\n' +
      '  howpublished = {\\url{' +
      url +
      '}},\n' +
      '  year = {' +
      year +
      '},\n' +
      '  note = {Accessed: ' +
      date +
      '},\n' +
      '  publisher = {Whispering Lore},\n' +
      '  type = {' +
      subtitle +
      '}\n' +
      '}'
    )
  }

  formats.mla = function (entry, isStory, isItem) {
    const title = isStory
      ? entry.title || 'Untitled'
      : entry.name || 'Unknown Creature'
    const subtitle = isItem
      ? 'Mythical Artifact Entry'
      : isStory
        ? 'Folktale'
        : 'Mythical Creature Entry'
    const urlBase = isItem
      ? 'items.html?item='
      : isStory
        ? 'stories.html?story='
        : 'bestiary.html?creature='
    const url =
      'https://whisperinglore.com/' +
      urlBase +
      encodeURIComponent(entry.slug || '')
    const date = buildDate(entry)
    return (
      '"' +
      title +
      '." ' +
      subtitle +
      ', Whispering Lore, ' +
      date +
      ', ' +
      url +
      '.'
    )
  }

  formats.apa = function (entry, isStory, isItem) {
    const title = isStory
      ? entry.title || 'Untitled'
      : entry.name || 'Unknown Creature'
    const urlBase = isItem
      ? 'items.html?item='
      : isStory
        ? 'stories.html?story='
        : 'bestiary.html?creature='
    const url =
      'https://whisperinglore.com/' +
      urlBase +
      encodeURIComponent(entry.slug || '')
    const year = buildYear(entry)
    return (
      'Whispering Lore. (' + year + '). ' + title + '. Whispering Lore. ' + url
    )
  }

  function generateAll(entry, isStory, isItem) {
    return {
      bibtex: formats.bibtex(entry, isStory, isItem),
      mla: formats.mla(entry, isStory, isItem),
      apa: formats.apa(entry, isStory, isItem),
    }
  }

  if (window.__sharedUtils) {
    window.__sharedUtils.CitationGenerator = {
      generateAll: generateAll,
      formats: formats,
    }
  }
})()
