;(function () {
  'use strict'

  function updateProgress() {
    const loreBox = window.__sharedUtils && window.__sharedUtils.LoreBox
    const sh = window.__sharedUtils && window.__sharedUtils.Shimmer
    if (!loreBox || !sh || !sh.manifest) return

    const viewedC = loreBox.get('viewed_creatures') || []
    const viewedS = loreBox.get('viewed_stories') || []
    const totalC = sh.manifest.creatures.total || 0
    const totalS = sh.manifest.stories.total || 0

    const cText = document.getElementById('creature-progress-text')
    const cFill = document.getElementById('creature-progress-fill')
    if (cText) cText.textContent = viewedC.length + ' / ' + totalC
    if (cFill)
      cFill.style.width = Math.min(100, (viewedC.length / totalC) * 100) + '%'

    const sText = document.getElementById('story-progress-text')
    const sFill = document.getElementById('story-progress-fill')
    if (sText) sText.textContent = viewedS.length + ' / ' + totalS
    if (sFill)
      sFill.style.width = Math.min(100, (viewedS.length / totalS) * 100) + '%'
  }

  function renderSavedItems() {
    const loreBox = window.__sharedUtils && window.__sharedUtils.LoreBox
    if (!loreBox) {
      return
    }

    const favCreatures = loreBox.get('creatures')
    const favStories = loreBox.get('stories')

    const cGrid = document.getElementById('fav-creatures')
    const sGrid = document.getElementById('fav-stories')
    const guidance = document.getElementById('mylore-guidance')

    const hasCreatures = favCreatures.length > 0
    const hasStories = favStories.length > 0

    // Show guidance if both are empty
    if (guidance) {
      if (!hasCreatures && !hasStories) {
        guidance.classList.remove('is-hidden')
      } else {
        guidance.classList.add('is-hidden')
      }
    }

    if (cGrid) {
      cGrid.innerHTML = hasCreatures
        ? favCreatures
            .map(function (c) {
              return [
                '<article class="card">',
                '<div class="card-image-placeholder"></div>',
                '<div class="card-body">',
                '<span class="crimson-accent"></span>',
                '<h3>' + window.__sharedUtils.escapeXml(c.name) + '</h3>',
                '<p>' +
                  window.__sharedUtils.escapeXml(
                    c.description || 'No description available.'
                  ) +
                  '</p>',
                '<a href="bestiary.html?creature=' +
                  encodeURIComponent(c.slug) +
                  '" class="card-cta">View Entry</a>',
                '</div></article>',
              ].join('')
            })
            .join('')
        : '<p class="no-results">No favorite creatures yet.</p>'
    }

    if (sGrid) {
      sGrid.innerHTML = hasStories
        ? favStories
            .map(function (s) {
              return [
                '<article class="card">',
                '<div class="card-image-placeholder"></div>',
                '<div class="card-body">',
                '<span class="crimson-accent"></span>',
                '<h3>' + window.__sharedUtils.escapeXml(s.title) + '</h3>',
                '<p>' +
                  window.__sharedUtils.escapeXml(
                    s.summary || 'No summary available.'
                  ) +
                  '</p>',
                '<a href="stories.html?story=' +
                  encodeURIComponent(s.slug) +
                  '" class="card-cta">Read Tale</a>',
                '</div></article>',
              ].join('')
            })
            .join('')
        : '<p class="no-results">No bookmarked stories yet.</p>'
    }

    updateProgress()
  }

  document.addEventListener('DOMContentLoaded', renderSavedItems)
})()
