// js/search-viewer.js
// Site-wide search across creatures, stories, and items.
class SearchViewer {
  constructor() {
    this.input = document.getElementById('site-search')
    this.status = document.getElementById('search-status')
    this.results = document.getElementById('search-results')
    this.data = { creatures: [], stories: [], items: [] }
    this.loaded = false
    this._timer = null
    this._lastQuery = ''
  }

  getParam(name) {
    const params = new URLSearchParams(window.location.search)
    return params.get(name)
  }

  async loadAll() {
    const sh =
      window.__sharedUtils && window.__sharedUtils.Shimmer
    if (!sh) {
      this.loaded = true
      this.status.textContent =
        'The archive could not be loaded. Please refresh the page.'
      return
    }
    const types = ['creatures', 'stories', 'items']
    await Promise.all(
      types.map((type) =>
        Promise.race([
          new Promise((resolve) => sh.loadAllShards(type, resolve)),
          new Promise((resolve) => setTimeout(resolve, 8000)),
        ])
      )
    )
    types.forEach((type) => {
      this.data[type] = sh.getAllItems(type) || []
    })
    window.__FULL_CREATURES = this.data.creatures
    window.__FULL_STORIES = this.data.stories
    window.__ITEMS = this.data.items
    this.loaded = true
  }

  score(item, type, q) {
    const ql = q.toLowerCase()
    const name = ((type === 'stories' ? item.title : item.name) || '').toLowerCase()
    const aliases = (item.aliases || [])
      .concat(item.search_terms || [])
      .map((a) => String(a).toLowerCase())
    const country = (item.country || '').toLowerCase()
    const region = (item.region || '').toLowerCase()
    const typeName = (item.type || '').toLowerCase()
    const rawKeywords = item.keywords || []
    const keywords =
      typeof rawKeywords === 'string'
        ? [rawKeywords]
        : rawKeywords.map((k) => String(k).toLowerCase())
    const body = (type === 'stories' ? item.summary : item.description || '')
      .toLowerCase()

    let score = 0
    if (name === ql) score += 100
    if (name.indexOf(ql) !== -1) score += 50
    for (const a of aliases) {
      if (a === ql) score += 40
      else if (a.indexOf(ql) !== -1) score += 20
    }
    if (country.indexOf(ql) !== -1) score += 12
    if (region.indexOf(ql) !== -1) score += 10
    if (typeName.indexOf(ql) !== -1) score += 8
    for (const k of keywords) {
      if (k === ql) score += 8
      else if (k.indexOf(ql) !== -1) score += 4
    }
    if (body.indexOf(ql) !== -1) score += 3
    return score
  }

  search(q) {
    if (!q) {
      return { creatures: [], stories: [], items: [] }
    }
    const results = { creatures: [], stories: [], items: [] }
    for (const type of ['creatures', 'stories', 'items']) {
      results[type] = this.data[type]
        .map((item) => ({ item, score: this.score(item, type, q) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.item)
    }
    return results
  }

  excerpt(text, q, max = 180) {
    if (!text) return ''
    const clean = text.replace(/\s+/g, ' ').trim()
    const lower = clean.toLowerCase()
    const idx = lower.indexOf(q.toLowerCase())
    let start = 0
    if (idx !== -1) start = Math.max(0, idx - 60)
    let slice = clean.slice(start, start + max)
    if (start > 0) slice = '…' + slice
    if (start + max < clean.length) slice = slice + '…'
    return slice
  }

  card(item, type, q) {
    const isStory = type === 'stories'
    const name = isStory ? item.title : item.name
    const slug = item.slug
    const target =
      type === 'creatures'
        ? 'bestiary.html?creature=' + encodeURIComponent(slug)
        : type === 'stories'
          ? 'stories.html?story=' + encodeURIComponent(slug)
          : 'items.html?item=' + encodeURIComponent(slug)
    const label =
      type === 'creatures' ? 'View Creature' : isStory ? 'Read Story' : 'View Artifact'
    const body = isStory ? item.summary : item.description || ''
    const meta = [item.type, item.country, item.region].filter(Boolean).join(' · ')

    const article = document.createElement('article')
    article.className = 'card search-result-card'
    article.setAttribute('data-slug', slug)

    const ph = document.createElement('div')
    ph.className = 'card-image-placeholder'
    const svgHTML =
      window.__sharedUtils && window.__sharedUtils.placeholderSVG
        ? window.__sharedUtils.placeholderSVG(name, item.region)
        : ''
    ph.innerHTML = svgHTML
    article.appendChild(ph)

    const bodyEl = document.createElement('div')
    bodyEl.className = 'card-body'
    const accent = document.createElement('span')
    accent.className = 'crimson-accent'
    bodyEl.appendChild(accent)

    const h3 = document.createElement('h3')
    h3.textContent = name
    bodyEl.appendChild(h3)

    if (meta) {
      const metaEl = document.createElement('span')
      metaEl.className = 'story-country'
      metaEl.textContent = meta
      bodyEl.appendChild(metaEl)
    }

    const p = document.createElement('p')
    p.textContent = this.excerpt(body, q)
    bodyEl.appendChild(p)

    const a = document.createElement('a')
    a.href = target
    a.className = 'card-cta'
    a.setAttribute('data-slug', slug)
    a.textContent = label
    bodyEl.appendChild(a)

    article.appendChild(bodyEl)
    return article
  }

  renderGroup(type, label, items, q) {
    if (items.length === 0) return ''
    const heading = document.createElement('h2')
    heading.className = 'search-group-title'
    heading.textContent = label + ' (' + items.length + ')'

    const grid = document.createElement('div')
    grid.className = 'content-grid search-grid'

    const shown = items.slice(0, 24)
    shown.forEach((item) => grid.appendChild(this.card(item, type, q)))

    const wrap = document.createElement('div')
    wrap.className = 'search-group'
    wrap.appendChild(heading)
    wrap.appendChild(grid)
    if (items.length > shown.length) {
      const more = document.createElement('p')
      more.className = 'search-more text-small text-muted'
      more.textContent =
        items.length - shown.length +
        ' more not shown — refine your search for precise results.'
      wrap.appendChild(more)
    }
    return wrap
  }

  render(results, q) {
    const total =
      results.creatures.length + results.stories.length + results.items.length
    this.results.innerHTML = ''

    if (total === 0) {
      this.status.textContent =
        'No results found for "' + q + '". Try a different term.'
      const empty = document.createElement('div')
      empty.className = 'no-results'
      empty.innerHTML =
        '<p role="alert">The archives are silent. No matches found.</p>'
      this.results.appendChild(empty)
      return
    }

    this.status.textContent =
      total + ' result' + (total === 1 ? '' : 's') + ' for "' + q + '"'
    const groups = [
      ['creatures', 'Creatures', results.creatures],
      ['stories', 'Stories', results.stories],
      ['items', 'Artifacts', results.items],
    ]
    groups.forEach(([type, label, items]) => {
      const el = this.renderGroup(type, label, items, q)
      if (el) this.results.appendChild(el)
    })
  }

  run(q) {
    if (q === this._lastQuery) return
    this._lastQuery = q
    if (!q) {
      this.status.textContent = 'Enter a search term to explore the archive.'
      this.results.innerHTML = ''
      return
    }
    if (!this.loaded) {
      this.status.textContent = 'Loading the archive…'
      if (!this._loadPromise) this._loadPromise = this.loadAll()
      const self = this
      this._loadPromise.then(() => {
        if (self._lastQuery !== q) return
        self.render(self.search(q), q)
      })
      return
    }
    this.render(this.search(q), q)
  }

  init() {
    if (!this.input) return
    const self = this
    this.input.addEventListener('input', (e) => {
      if (self._timer) clearTimeout(self._timer)
      const q = e.target.value.trim()
      self._timer = setTimeout(() => {
        if (q) {
          history.replaceState(null, '', '?q=' + encodeURIComponent(q))
        } else {
          history.replaceState(null, '', window.location.pathname)
        }
        self.run(q)
      }, 250)
    })

    const qParam = this.getParam('q')
    if (qParam) {
      this.input.value = qParam
      this.run(qParam)
    }
  }
}

const searchViewer = new SearchViewer()
searchViewer.init()
window.searchViewer = searchViewer
