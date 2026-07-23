;(function () {
  'use strict'

  function getDailyIndex(data) {
    if (!data || !data.length) return 0
    const now = new Date()
    const hash =
      now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate()
    return Math.abs(hash) % data.length
  }

  function truncate(text, max) {
    if (!text || text.length <= max) return text || ''
    return text.slice(0, max).replace(/\s+\S*$/, '') + '...'
  }

  function renderDailyFeature(creatures, stories) {
    if (!creatures || !creatures.length || !stories || !stories.length) return
    const ci = getDailyIndex(creatures)
    const si = getDailyIndex(stories)
    const creature = creatures[ci]
    const story = stories[si]
    if (!creature || !story) return

    const creatureCard = document.getElementById('daily-creature')
    const storyCard = document.getElementById('daily-story')
    if (!creatureCard || !storyCard) return

    creatureCard.innerHTML =
      '<span class="accent-line"></span>' +
      '<span class="feature-badge">Creature of the Day</span>' +
      '<h3 class="feature-name">' +
      window.__sharedUtils.escapeXml(creature.name) +
      '</h3>' +
      '<span class="feature-type">' +
      window.__sharedUtils.escapeXml(creature.type || '') +
      '</span>' +
      '<span class="feature-country">' +
      window.__sharedUtils.escapeXml(creature.country || '') +
      '</span>' +
      '<p class="feature-excerpt">' +
      window.__sharedUtils.escapeXml(
        truncate(creature.summary || creature.description, 120)
      ) +
      '</p>' +
      '<a href="bestiary.html?creature=' +
      encodeURIComponent(creature.slug) +
      '" class="feature-link">→ View in Bestiary</a>'

    storyCard.innerHTML =
      '<span class="accent-line"></span>' +
      '<span class="feature-badge">Story of the Day</span>' +
      '<h3 class="feature-name">' +
      window.__sharedUtils.escapeXml(story.title) +
      '</h3>' +
      '<span class="feature-country">' +
      window.__sharedUtils.escapeXml(story.country || '') +
      ' · ' +
      window.__sharedUtils.escapeXml(story.region || '') +
      '</span>' +
      '<p class="feature-excerpt">' +
      window.__sharedUtils.escapeXml(truncate(story.summary, 120)) +
      '</p>' +
      '<a href="stories.html?story=' +
      encodeURIComponent(
        story.slug || window.__sharedUtils.getSlug(story.title)
      ) +
      '" class="feature-link">→ Read Full Story</a>'

    const pill = document.getElementById('hero-feature-pill')
    if (pill) {
      pill.style.display = 'block'
      pill.style.cursor = 'pointer'
      pill.onclick = function () {
        document
          .getElementById('daily-feature')
          .scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  function loadFromDatasets(callback) {
    const fetchJSON =
      window.__sharedUtils && window.__sharedUtils.fetchJSON
    if (!fetchJSON) {
      callback([], [])
      return
    }
    fetchJSON('data/datasets/creatures.json')
      .then(function (creatures) {
        return fetchJSON('data/datasets/stories.json').then(function (stories) {
          callback(creatures, stories)
        })
      })
      .catch(function () {
        callback([], [])
      })
  }

  function initDailyFeature() {
    const creatures = window.__CREATURES_DATA
    const stories = window.__STORIES_DATA

    if (creatures && creatures.length && stories && stories.length) {
      renderDailyFeature(creatures, stories)
      return
    }

    // Try shimmer (must wait for manifest to load first)
    const sh = window.__sharedUtils && window.__sharedUtils.Shimmer
    if (sh) {
      sh.loadManifest(function (err) {
        if (err) {
          loadFromDatasets(renderDailyFeature)
          return
        }
        sh.loadAllShards('creatures', function (err, c) {
          if (err || !c || !c.length) {
            loadFromDatasets(renderDailyFeature)
            return
          }
          sh.loadAllShards('stories', function (err, s) {
            if (err || !s || !s.length) {
              loadFromDatasets(renderDailyFeature)
              return
            }
            renderDailyFeature(c, s)
          })
        })
      })
      return
    }

    // XHR fallback (works on file:// protocol where fetch is blocked)
    loadFromDatasets(renderDailyFeature)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDailyFeature)
  } else {
    initDailyFeature()
  }
})()
