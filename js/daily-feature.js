;(function () {
  'use strict'

  function getDailyIndex(data) {
    if (!data || !data.length) return 0;
    var now = new Date();
    var hash = now.getFullYear() * 1000000 + (now.getMonth() + 1) * 10000 + now.getDate();
    return Math.abs(hash) % data.length;
  }

  function truncate(text, max) {
    if (!text || text.length <= max) return text || ''
    return text.slice(0, max).replace(/\s+\S*$/, '') + '...'
  }

  function renderDailyFeature(creatures, stories) {
    if (!creatures || !creatures.length || !stories || !stories.length) return
    var ci = getDailyIndex(creatures)
    var si = getDailyIndex(stories)
    var creature = creatures[ci]
    var story = stories[si]
    if (!creature || !story) return

    var creatureCard = document.getElementById('daily-creature')
    var storyCard = document.getElementById('daily-story')
    if (!creatureCard || !storyCard) return

    creatureCard.innerHTML =
      '<span class="accent-line"></span>' +
      '<span class="feature-badge">Creature of the Day</span>' +
      '<h3 class="feature-name">' + window.__sharedUtils.escapeXml(creature.name) + '</h3>' +
      '<span class="feature-type">' + window.__sharedUtils.escapeXml(creature.type || '') + '</span>' +
      '<span class="feature-country">' + window.__sharedUtils.escapeXml(creature.country || '') + '</span>' +
      '<p class="feature-excerpt">' + window.__sharedUtils.escapeXml(truncate(creature.summary || creature.description, 120)) + '</p>' +
      '<a href="bestiary.html?creature=' + encodeURIComponent(creature.slug) + '" class="feature-link">→ View in Bestiary</a>'

    storyCard.innerHTML =
      '<span class="accent-line"></span>' +
      '<span class="feature-badge">Story of the Day</span>' +
      '<h3 class="feature-name">' + window.__sharedUtils.escapeXml(story.title) + '</h3>' +
      '<span class="feature-country">' + window.__sharedUtils.escapeXml(story.country || '') + ' · ' + window.__sharedUtils.escapeXml(story.region || '') + '</span>' +
      '<p class="feature-excerpt">' + window.__sharedUtils.escapeXml(truncate(story.summary, 120)) + '</p>' +
      '<a href="stories.html?story=' + encodeURIComponent(story.slug || window.__sharedUtils.getSlug(story.title)) + '" class="feature-link">→ Read Full Story</a>'

    var pill = document.getElementById('hero-feature-pill')
    if (pill) {
      pill.style.display = 'block'
      pill.style.cursor = 'pointer'
      pill.onclick = function() {
        document.getElementById('daily-feature').scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  function loadFromDatasets(callback) {
    var cReq = new XMLHttpRequest()
    cReq.open('GET', 'data/datasets/creatures.json', true)
    cReq.onload = function() {
      var sReq = new XMLHttpRequest()
      sReq.open('GET', 'data/datasets/stories.json', true)
      sReq.onload = function() {
        try {
          var creatures = JSON.parse(cReq.responseText)
          var stories = JSON.parse(sReq.responseText)
          callback(creatures, stories)
        } catch(e) { callback([], []) }
      }
      sReq.onerror = function() { callback([], []) }
      sReq.send()
    }
    cReq.onerror = function() { callback([], []) }
    cReq.send()
  }

  function initDailyFeature() {
    var creatures = window.__CREATURES_DATA
    var stories = window.__STORIES_DATA

    if (creatures && creatures.length && stories && stories.length) {
      renderDailyFeature(creatures, stories)
      return
    }

    // Try shimmer (must wait for manifest to load first)
    var sh = window.__sharedUtils && window.__sharedUtils.Shimmer
    if (sh) {
      sh.loadManifest(function(err) {
        if (err) { loadFromDatasets(renderDailyFeature); return }
        sh.loadAllShards('creatures', function(err, c) {
          if (err || !c || !c.length) { loadFromDatasets(renderDailyFeature); return }
          sh.loadAllShards('stories', function(err, s) {
            if (err || !s || !s.length) { loadFromDatasets(renderDailyFeature); return }
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