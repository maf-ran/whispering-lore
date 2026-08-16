/* eslint-env browser */
/**
 * Lightweight client-side JSON-LD injector for Whispering Lore entity pages.
 * Detects a deep-linked entity (?creature=, ?story=, ?item=) and, once the
 * corresponding global data array is populated by the async viewer, injects a
 * CreativeWork schema block into <head>. This gives search engines rich
 * snippets without a build-time generation step.
 */
(function () {
  const PAGE_TYPE = {
    'bestiary.html': 'creatures',
    'stories.html': 'stories',
    'items.html': 'items',
  }
  const PARAM = { creatures: 'creature', stories: 'story', items: 'item' }
  const GLOBAL = { creatures: '__FULL_CREATURES', stories: '__FULL_STORIES', items: '__ITEMS' }

  const page = location.pathname.split('/').pop()
  const type = PAGE_TYPE[page]
  if (!type) return

  const slug = new URLSearchParams(location.search).get(PARAM[type])
  if (!slug) return

  const dataGlobal = GLOBAL[type]
  let attempts = 0
  const maxAttempts = 100 // ~5s at 50ms, then give up
  const timer = setInterval(() => {
    const data = window[dataGlobal] || (type === 'stories' ? window.__STORIES_DATA : null)
    if (data && data.length) {
      clearInterval(timer)
      inject(data, slug)
    } else if (++attempts >= maxAttempts) {
      clearInterval(timer)
    }
  }, 50)

  function inject(data, slug) {
    const entity = data.find((e) => e.slug === slug)
    if (!entity) return

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: entity.name || entity.title || '',
      description: entity.description || entity.summary || entity.desc || '',
      url: location.href,
      dateModified: entity.lastUpdated || entity.updated || null,
      image: entity.image || null,
      keywords: Array.isArray(entity.keywords) && entity.keywords.length
        ? entity.keywords.join(', ')
        : null,
    }
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(jsonLd)
    document.head.appendChild(script)
  }
})()
