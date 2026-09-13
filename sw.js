const CACHE_NAME = 'whisperinglore-v1_0_30'

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
  '/js/seo-entity.js',
  '/js/viewer-base.js',
  '/js/shared-utils.js',
  '/quiz.html',
  '/404.html',
  '/mylore.html',
  '/methodology.html',
  '/search.html',
  '/js/search-viewer.js',
  '/manifest.json',
  '/js/quiz.js',
  '/js/mylore.js',
  '/js/theme-toggle.js',
  '/js/language-toggle.js',
  '/js/rune-scatter.js',
  '/js/daily-feature.js',
  '/js/world-viewer.js',
  '/js/region-glyphs.js',
  '/js/globe.js',
  '/js/citations.js',
  '/data/sharded/manifest.json',
  '/og-image.png',
  '/favicon.svg',
  '/images/placeholder-creature.svg',
  '/vendor/topojson/countries-110m.json'
]

const MAX_RUNTIME_CACHE = 80

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
        self.skipWaiting(); self.clients.claim()
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

function trimCache(cache) {
  cache.keys().then(function (keys) {
    const coreSet = new Set(CORE_ASSETS.map(function (u) {
      return new URL(u, self.location.origin).href
    }))
    const runtime = keys.filter(function (req) { return !coreSet.has(req.url) })
    if (runtime.length <= MAX_RUNTIME_CACHE) return
    runtime.slice(0, runtime.length - MAX_RUNTIME_CACHE).forEach(function (req) {
      cache.delete(req)
    })
  }).catch(function () {})
}

self.addEventListener('fetch', function (event) {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== location.origin) return
  event.respondWith(
    caches.match(request).then(function (cached) {
      const fetchPromise = fetch(request).then(function (response) {
        if (response && response.status === 200 && response.type === 'basic') {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, cloned).then(function () {
              trimCache(cache)
            }).catch(function () {})
          })
        }
        return response
      }).catch(function () {
        if (cached) return cached
        if (request.mode === 'navigate') return caches.match('/404.html')
        return Response.error()
      })
      return cached || fetchPromise
    })
  )
})
