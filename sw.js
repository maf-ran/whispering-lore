var CACHE_NAME = "whisperinglore-v1_0_2"

var CORE_ASSETS = [
  '/',
  '/index.html',
  '/bestiary.html',
  '/stories.html',
  '/world.html',
  '/about.html',
   '/css/styles.css',
    '/js/main.js',
    '/js/creatures-viewer.js',
    '/js/stories-viewer.js',
    '/js/viewer-base.js',
    '/js/shared-utils.js',
    '/quiz.html',
    '/404.html',
    '/mylore.html',
    '/methodology.html',
    '/js/quiz.js',
    '/js/mylore.js',
    '/js/theme-toggle.js',
    '/js/rune-scatter.js',
    '/js/daily-feature.js',
    '/js/world-viewer.js',
    '/js/region-glyphs.js',
    '/js/globe.js',
    '/js/citations.js',
    '/data/sharded/manifest.json',
    '/og-image.svg',
    '/favicon.svg',
    '/images/placeholder-creature.svg'
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(CORE_ASSETS).then(function () {
        self.skipWaiting()
      })
    })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) return caches.delete(key)
        })
      )
    }).then(function () {
      self.clients.claim()
    })
  )
})

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      var fetchPromise = fetch(event.request).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          var cloned = response.clone()
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, cloned).catch(function () {})
          })
        }
        return response
      }).catch(function () {
        return cached || caches.match('/404.html')
      })
      return cached || fetchPromise
    })
  )
})