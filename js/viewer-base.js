// js/viewer-base.js
export class BaseViewer {
  constructor(options) {
    this.type = options.type
    this.perPage = options.perPage || 24
    this.gridId = options.gridId
    this.emptyId = options.emptyId
    this.loadMoreId = options.loadMoreId
    this.countSelector = options.countSelector
    this.countLabel = options.countLabel

    this.state = {
      filters: {},
      sortBy: 'relevance',
      page: 1,
      filteredData: [],
      rafId: null,
    }

    this.cache = null
  }

  safeEl(id) {
    return document.getElementById(id)
  }

  getName(item) {
    return item.name || item.title || ''
  }

  updateCount() {
    const countEl = document.querySelector(this.countSelector)
    if (!countEl) return
    if (this.state.rafId) cancelAnimationFrame(this.state.rafId)

    const currentText = countEl.textContent
    const numMatch = currentText.match(/\d+/)
    const startVal = numMatch ? parseInt(numMatch[0]) : 0

    let total = 0
    const man =
      window.__sharedUtils &&
      window.__sharedUtils.Shimmer &&
      window.__sharedUtils.Shimmer.manifest
    if (man && man[this.type] && man[this.type].total) {
      total = man[this.type].total
    } else if (this.cache) {
      total = this.cache.length
    }

    const endVal = this.state.filteredData ? this.state.filteredData.length : 0
    const duration = 300
    let startTime = null

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const current = Math.floor(progress * (endVal - startVal) + startVal)
      countEl.textContent =
        'Showing ' +
        current +
        ' of ' +
        total +
        ' ' +
        (this.countLabel ||
          (this.type === 'creatures' ? 'creatures' : 'stories'))
      if (progress < 1) {
        this.state.rafId = window.requestAnimationFrame(animate)
      } else {
        this.state.rafId = null
      }
    }
    this.state.rafId = window.requestAnimationFrame(animate)
  }

  sortData() {
    if (!this.state.filteredData || this.state.filteredData.length === 0) return
    const data = this.state.filteredData.slice()

    if (this.state.sortBy === 'alphabetical') {
      data.sort((a, b) => this.getName(a).localeCompare(this.getName(b)))
    } else if (this.state.sortBy === 'newest') {
      data.sort((a, b) => {
        const aDate = a.lastUpdated || ''
        const bDate = b.lastUpdated || ''
        return bDate.localeCompare(aDate)
      })
    }
    this.state.filteredData = data
  }

  renderGrid(append, cardRenderer) {
    const grid = this.safeEl(this.gridId)
    const emptyState = this.safeEl(this.emptyId)
    const loadMoreBtn = this.safeEl(this.loadMoreId)
    if (!grid) return

    if (this.state.filteredData.length === 0) {
      grid.innerHTML = ''
      grid.classList.add('is-hidden')
      if (emptyState) emptyState.classList.remove('is-hidden')
      if (loadMoreBtn) loadMoreBtn.classList.add('is-hidden')
      return
    }

    grid.classList.remove('is-hidden')
    if (emptyState) emptyState.classList.add('is-hidden')
    if (!append) grid.innerHTML = ''

    const start = (this.state.page - 1) * this.perPage
    const end = this.state.page * this.perPage
    const slice = this.state.filteredData.slice(start, end)

    slice.forEach((item, index) => {
      // CRITICAL: Ensure correct this context for the renderer
      const card = cardRenderer.call(this, item, index)
      grid.appendChild(card)
    })

    if (loadMoreBtn) {
      loadMoreBtn.classList.toggle(
        'is-hidden',
        this.state.filteredData.length <= this.state.page * this.perPage
      )
      const self = this
      if (!loadMoreBtn._listener) {
        loadMoreBtn.addEventListener('click', function () {
          self.state.page++
          self.renderGrid(true, self.cardRenderer)
        })
        loadMoreBtn._listener = true
      }
    }
  }

  applyFilters() {
    const data =
      this.cache ||
      (this.type === 'creatures'
        ? window.__FULL_CREATURES
        : window.__FULL_STORIES) ||
      []

    const filters = this.state.filters
    let hasActive = false
    for (const k in filters) {
      const v = filters[k]
      if (v !== null && v !== undefined && v !== '' && v !== 'all') {
        hasActive = true
        break
      }
    }

    if (!hasActive) {
      this.state.filteredData = data.slice()
    } else {
      this.state.filteredData = data.filter(function (item) {
        for (const dim in filters) {
          const val = filters[dim]
          if (val === null || val === undefined || val === '' || val === 'all')
            continue

          if (dim === 'search') {
            const q = val.toLowerCase()
            const name = (item.name || item.title || '').toLowerCase()
            const type = (item.type || '').toLowerCase()
            const country = (item.country || '').toLowerCase()
            if (
              name.indexOf(q) === -1 &&
              type.indexOf(q) === -1 &&
              country.indexOf(q) === -1
            )
              return false
            continue
          }

          const itemVal = item[dim]
          if (!itemVal || itemVal.toLowerCase() !== val.toLowerCase())
            return false
        }
        return true
      })
    }

    this.updateCount()
    this.sortData()
    this.state.page = 1
    this.renderGrid(false, this.cardRenderer)
    this.calculateFacets()
    this.updateFilterChips()
    this.writeStateToURL()
  }

  calculateFacets() {
    const groups = document.querySelectorAll('.facet-group')
    const self = this
    groups.forEach(function (group) {
      const dim = group.getAttribute('data-dimension')
      if (!dim) return
      const counts = {}
      self.state.filteredData.forEach(function (item) {
        const val = item[dim]
        if (val) counts[val] = (counts[val] || 0) + 1
      })
      const container = group.querySelector('.facet-options')
      if (!container) return
      const sorted = Object.keys(counts).sort()
      let html = ''
      sorted.forEach(function (val) {
        const activeClass = self.state.filters[dim] === val ? 'active' : ''
        html +=
          '<div class="facet-option ' +
          activeClass +
          '" role="button" tabindex="0" aria-pressed="' +
          (self.state.filters[dim] === val ? 'true' : 'false') +
          '" data-dimension="' +
          window.__sharedUtils.escapeXml(dim) +
          '" data-value="' +
          window.__sharedUtils.escapeXml(val) +
          '">' +
          window.__sharedUtils.escapeXml(val) +
          ' <span class="facet-count">(' +
          counts[val] +
          ')</span></div>'
      })
      container.innerHTML = html
    })
  }

  populateSelect(selectId, field) {
    const select = document.getElementById(selectId)
    if (!select || !this.cache) return
    const values = {}
    this.cache.forEach(function (item) {
      const v = item[field]
      if (v && typeof v === 'string') {
        values[v] = true
      }
    })
    const sorted = Object.keys(values).sort()
    if (sorted.length === 0) return
    sorted.forEach(function (v) {
      const opt = document.createElement('option')
      opt.value = v
      opt.textContent = v
      select.appendChild(opt)
    })
  }

  updateFilterChips() {
    const containers = document.querySelectorAll(
      '.filter-chips-container, .active-filters'
    )
    if (containers.length === 0) return
    let html = ''
    for (const dim in this.state.filters) {
      const val = this.state.filters[dim]
      if (val && val !== 'all') {
        html +=
          '<div class="filter-chip" role="button" tabindex="0" data-dimension="' +
          window.__sharedUtils.escapeXml(dim) +
          '" data-value="' +
          window.__sharedUtils.escapeXml(val) +
          '">' +
          window.__sharedUtils.escapeXml(val) +
          ' <span class="chip-remove">&times;</span>' +
          '</div>'
      }
    }
    containers.forEach((container) => {
      container.innerHTML = html
    })
  }

  getParam(name) {
    const params = new URLSearchParams(window.location.search)
    return params.get(name)
  }

  readStateFromURL() {
    const params = new URLSearchParams(window.location.search)
    const filterDims = ['search', 'region', 'country', 'type', 'tribe']
    filterDims.forEach((dim) => {
      const val = params.get(dim)
      if (val) this.state.filters[dim] = val
    })
    const sort = params.get('sort')
    if (sort) this.state.sortBy = sort
    const page = params.get('page')
    if (page) this.state.page = parseInt(page, 10) || 1
  }

  writeStateToURL() {
    const params = new URLSearchParams()
    const filterDims = ['search', 'region', 'country', 'type', 'tribe']
    filterDims.forEach((dim) => {
      const val = this.state.filters[dim]
      if (val && val !== 'all') params.set(dim, val)
    })
    if (this.state.sortBy !== 'relevance') params.set('sort', this.state.sortBy)
    if (this.state.page > 1) params.set('page', this.state.page)
    const qs = params.toString()
    const url = qs ? '?' + qs : window.location.pathname
    window.history.replaceState(null, '', url)
  }

  syncFilterUI() {
    const dimToInput = {
      search: this.type === 'creatures' ? 'bestiary-search' : 'story-search',
      region: this.type === 'creatures' ? 'bestiary-region' : 'story-region-filter',
      country: this.type === 'creatures' ? 'bestiary-country' : 'story-country-filter',
      type: this.type === 'creatures' ? 'bestiary-type' : 'story-type-filter',
    }
    for (const dim in dimToInput) {
      const el = document.getElementById(dimToInput[dim])
      if (el && this.state.filters[dim]) el.value = this.state.filters[dim]
    }
    const sortEl = document.getElementById(this.type === 'creatures' ? 'bestiary-sort' : 'stories-sort')
    if (sortEl) sortEl.value = this.state.sortBy
  }
}
