const CACHE_NAME = "whisperinglore-v1_0_14"

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/bestiary.html',
  '/items.html',
  '/stories.html',
  '/world.html',
  '/about.html',
   '/css/styles.css',
    '/js/main.js',
    '/js/creatures-viewer.js',
    '/js/stories-viewer.js',
    '/js/items-viewer.js',
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
    '/data/items.json',
    '/og-image.svg',
    '/favicon.svg',
    '/images/placeholder-creature.svg',
    '/vendor/phosphor-icons/dist/phosphor-icons.js',
    '/vendor/topojson/countries-110m.json'
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return Promise.all(
        CORE_ASSETS.map(function (url) {
          return cache.add(url).catch(function () {
            console.warn('SW: failed to cache', url)
          })
        })
      ).then(function () {
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
      const fetchPromise = fetch(event.request).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone()
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