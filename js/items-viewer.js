import { BaseViewer } from './viewer-base.js'

class ItemsViewer extends BaseViewer {
  constructor() {
    super({
      type: 'items',
      countLabel: 'artifacts',
      gridId: 'item-grid',
      emptyId: 'item-empty',
      loadMoreId: 'item-load-more',
      countSelector: '.item-count',
    })
  }

  async loadData() {
    const sh = window.__sharedUtils && window.__sharedUtils.Shimmer
    if (!sh) return

    await sh.loadManifest()

    // Use Promise.race to ensure we don't hang forever
    await Promise.race([
      new Promise((resolve) => sh.loadAllShards('items', resolve)),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ])

    this.cache = sh.getAllItems('items')
    window.__ITEMS = this.cache
  }

  cardRenderer(item, index) {
    const card = document.createElement('article')
    card.className = 'card item-card staggered-card'
    card.setAttribute('data-title', item.name)

    const placeholder = document.createElement('div')
    placeholder.className = 'card-image-placeholder'
    const svgHTML =
      window.__sharedUtils && window.__sharedUtils.placeholderSVG
        ? window.__sharedUtils.placeholderSVG(item.name, item.region)
        : ''
    placeholder.innerHTML = svgHTML
    card.appendChild(placeholder)

    const body = document.createElement('div')
    body.className = 'card-body'
    const accent = document.createElement('span')
    accent.className = 'crimson-accent'
    body.appendChild(accent)

    const h3 = document.createElement('h3')
    h3.textContent = item.name
    body.appendChild(h3)

    if (item.type) {
      const typeEl = document.createElement('span')
      typeEl.className = 'card-type-badge'
      typeEl.textContent = item.type
      body.appendChild(typeEl)
    }

    if (item.country) {
      const countryEl = document.createElement('span')
      countryEl.className = 'story-country'
      countryEl.textContent = item.country
      body.appendChild(countryEl)
    }

    const slug = item.slug
    const a = document.createElement('a')
    a.href = '?item=' + slug
    a.className = 'card-cta'
    a.setAttribute('data-slug', slug)
    a.textContent = 'View Artifact'
    body.appendChild(a)
    card.appendChild(body)

    card.style.transitionDelay = (index % this.perPage) * 0.05 + 's'
    card.addEventListener('click', (e) => {
      e.preventDefault()
      sessionStorage.setItem('wl-items-scroll', window.pageYOffset)
      history.pushState(null, '', '?item=' + slug)
      this.showDetail(slug)
    })

    setTimeout(() => card.classList.add('visible'), 50)
    return card
  }

  async init() {
    this.initLinks()
    this.initFacetListeners()
    this.renderSkeletons()
    this.initDropdowns()

    const itemParam = this.getParam('item')

    await this.loadData()
    this.populateDropdowns()
    this.readStateFromURL()
    this.syncFilterUI()
    this.applyFilters()
    if (window.__WL_PRELOAD) {
      await window.__WL_PRELOAD
    }
    if (itemParam) this.showDetail(itemParam)
  }

  initLinks() {
    document.addEventListener('click', (e) => {
      const cta = e.target.closest('.card-cta')
      if (cta) {
        e.preventDefault()
        const slug = cta.getAttribute('data-slug')
        if (slug) {
          history.pushState(null, '', '?item=' + slug)
          this.showDetail(slug)
        }
      }
    })
  }

  initDropdowns() {
    const regionDropdown = document.getElementById('item-region')
    if (regionDropdown) {
      regionDropdown.addEventListener('change', (e) => {
        this.state.filters.region =
          e.target.value === 'all' ? null : e.target.value
        this.applyFilters()
      })
    }
    const countryDropdown = document.getElementById('item-country')
    if (countryDropdown) {
      countryDropdown.addEventListener('change', (e) => {
        this.state.filters.country =
          e.target.value === 'all' ? null : e.target.value
        this.applyFilters()
      })
    }
    const typeDropdown = document.getElementById('item-type')
    if (typeDropdown) {
      typeDropdown.addEventListener('change', (e) => {
        this.state.filters.type =
          e.target.value === 'all' ? null : e.target.value
        this.applyFilters()
      })
    }
    const sortDropdown = document.getElementById('items-sort')
    if (sortDropdown) {
      sortDropdown.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value
        this.applyFilters()
      })
    }
    const searchInput = document.getElementById('item-search')
    if (searchInput) {
      let timer = null
      searchInput.addEventListener('input', (e) => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          this.state.filters.search = e.target.value.trim() || null
          this.applyFilters()
        }, 250)
      })
    }
  }

  populateDropdowns() {
    this.populateSelect('item-region', 'region')
    this.populateSelect('item-country', 'country')
    this.populateSelect('item-type', 'type')
  }

  initFacetListeners() {
    document.addEventListener('click', (e) => {
      const option = e.target.closest('.facet-option')
      if (option) {
        const dim = option.getAttribute('data-dimension')
        const val = option.getAttribute('data-value')
        this.state.filters[dim] = this.state.filters[dim] === val ? null : val
        this.applyFilters()
      }
      const chipRemove = e.target.closest('.chip-remove')
      if (chipRemove) {
        const chip = chipRemove.closest('.filter-chip')
        if (!chip) return
        const dim = chip.getAttribute('data-dimension')
        this.state.filters[dim] = null
        this.applyFilters()
      }
      const quickChip = e.target.closest('.quick-filters .chip')
      if (quickChip) {
        e.stopPropagation()
        const type = quickChip.getAttribute('data-type')
        this.state.filters.type = type
        this.applyFilters()
        return
      }
      const resetBtn = e.target.closest('.filter-reset')
      if (resetBtn) {
        this.resetFilters()
      }
    })
  }

  resetFilters() {
    for (const dim in this.state.filters) {
      this.state.filters[dim] = null
    }
    this.applyFilters()
  }

  renderSkeletons() {
    const grid = document.getElementById('item-grid')
    if (!grid) return
    grid.innerHTML = ''
    for (let i = 0; i < 24; i++) {
      const skel = document.createElement('div')
      skel.className = 'skeleton'
      skel.innerHTML =
        '<div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>'
      grid.appendChild(skel)
    }
  }

  syncFilterUI() {
    const dimToInput = {
      search: 'item-search',
      region: 'item-region',
      country: 'item-country',
      type: 'item-type',
    }
    for (const dim in dimToInput) {
      const el = document.getElementById(dimToInput[dim])
      if (el && this.state.filters[dim]) el.value = this.state.filters[dim]
    }
    const sortEl = document.getElementById('items-sort')
    if (sortEl) sortEl.value = this.state.sortBy
  }

  async showDetail(slug) {
    const detail = document.getElementById('item-detail')
    const pageHero = document.querySelector('.page-hero')
    const filterBar = document.querySelector('.filter-bar')
    const layout = document.querySelector('.bestiary-layout')
    const loader = document.getElementById('detail-loader')
    const content = document.getElementById('detail-content')
    const error = document.getElementById('detail-error')

    if (pageHero) pageHero.classList.add('is-hidden')
    if (filterBar) filterBar.classList.add('is-hidden')
    if (layout) layout.classList.add('is-hidden')
    if (detail) detail.classList.remove('is-hidden')
    if (loader) loader.classList.remove('is-hidden')
    if (content) content.classList.add('is-hidden')
    if (error) error.classList.add('is-hidden')
    window.scrollTo(0, 0)
    document.body.style.overflow = 'hidden'

    const renderItem = (item) => {
      if (loader) loader.classList.add('is-hidden')
      if (!item) {
        if (error) {
          error.querySelector('p').textContent =
            'No artifact found for "' + slug + '".'
          error.classList.remove('is-hidden')
        }
        return
      }

      if (content) {
        const setText = (id, val) => {
          const el = document.getElementById(id)
          if (el) el.textContent = val || ''
        }

        setText('detail-name', item.name || slug)
        setText('detail-country', item.country || 'Unknown')
        setText('detail-region', item.region || 'Unknown')
        setText('detail-culture', item.culture || 'Not documented')
        setText('detail-material', item.material || 'Not documented')
        setText('detail-era', item.era || 'Not documented')
        setText('detail-maker', item.maker || 'Not documented')
        setText('detail-powers', item.powers || 'Not documented')
        setText('detail-description', item.description || '')
        setText('detail-last-updated', item.lastUpdated || 'Unknown')

        const typeBadge = document.getElementById('detail-type-badge')
        if (typeBadge && item.type) {
          typeBadge.textContent = item.type
        }

        const sourceBadge = document.getElementById('detail-source-type-badge')
        const attrCard = document.getElementById('detail-attribution-card')
        if (sourceBadge && item.source_type) {
          const st = item.source_type
          const stLabel = st.replace(/_/g, ' ').replace(/\b\w/g, function (l) {
            return l.toUpperCase()
          })
          sourceBadge.innerHTML =
            '<span class="source-type-badge source-type-badge--' +
            window.__sharedUtils.escapeXml(st) +
            '">' +
            window.__sharedUtils.escapeXml(stLabel) +
            '</span>'
          if (attrCard) attrCard.classList.remove('is-hidden')
        } else if (attrCard) {
          attrCard.classList.add('is-hidden')
        }

        const attrEl = document.getElementById('detail-attribution')
        if (attrEl) {
          if (item.source_type === 'oral_tradition') {
            attrEl.textContent =
              'This artifact belongs to the oral tradition of ' +
              (item.country || 'its region') +
              '. We honor the communities and storytellers who have preserved it across generations.'
          } else if (item.source) {
            attrEl.textContent = 'Source: ' + item.source
          } else {
            attrEl.textContent = ''
          }
        }

        const creaturesSection = document.getElementById(
          'detail-creatures-section'
        )
        const creaturesGrid = document.getElementById('detail-creatures')
        if (
          creaturesSection &&
          creaturesGrid &&
          item.related_creatures &&
          item.related_creatures.length > 0
        ) {
          const allC = window.__FULL_CREATURES || []
          const resolved = item.related_creatures.filter((ref) =>
            allC.some((c) => c.slug === ref)
          )
          if (resolved.length > 0) {
            creaturesGrid.innerHTML = ''
            resolved.forEach((ref) => {
              const cr = allC.find((c) => c.slug === ref)
              const link = document.createElement('a')
              link.href =
                'bestiary.html?creature=' + encodeURIComponent(cr.slug)
              link.className = 'detail-creature-link'
              link.innerHTML =
                '<span class="creature-link-name">' +
                window.__sharedUtils.escapeXml(cr.name) +
                '</span><span class="creature-link-type">' +
                window.__sharedUtils.escapeXml(cr.type || '') +
                '</span>'
              creaturesGrid.appendChild(link)
            })
            creaturesSection.classList.remove('is-hidden')
          } else {
            creaturesSection.classList.add('is-hidden')
          }
        } else if (creaturesSection) {
          creaturesSection.classList.add('is-hidden')
        }

        const storiesSection = document.getElementById('detail-stories-section')
        const storiesGrid = document.getElementById('detail-stories')
        if (
          storiesSection &&
          storiesGrid &&
          item.featured_in_stories &&
          item.featured_in_stories.length > 0
        ) {
          const allS = window.__FULL_STORIES || []
          const resolved = item.featured_in_stories.filter((ref) =>
            allS.some((s) => s.slug === ref)
          )
          if (resolved.length > 0) {
            storiesGrid.innerHTML = ''
            resolved.forEach((ref) => {
              const st = allS.find((s) => s.slug === ref)
              const link = document.createElement('a')
              link.href = 'stories.html?story=' + encodeURIComponent(st.slug)
              link.className = 'detail-creature-link'
              link.innerHTML =
                '<span class="creature-link-name">' +
                window.__sharedUtils.escapeXml(st.title) +
                '</span><span class="creature-link-type">' +
                window.__sharedUtils.escapeXml(st.country || '') +
                '</span>'
              storiesGrid.appendChild(link)
            })
            storiesSection.classList.remove('is-hidden')
          } else {
            storiesSection.classList.add('is-hidden')
          }
        } else if (storiesSection) {
          storiesSection.classList.add('is-hidden')
        }

        const shareBtn = document.getElementById('detail-share')
        if (shareBtn) {
          shareBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
              const orig = shareBtn.textContent
              shareBtn.textContent = '✓ Copied'
              setTimeout(() => (shareBtn.textContent = orig), 2000)
            }).catch(function () {})
          }
        }

        if (window.__sharedUtils && window.__sharedUtils.CitationGenerator) {
          const gen = window.__sharedUtils.CitationGenerator
          const citations = gen.generateAll(item, false, true)
          const textEl = document.getElementById('cite-text')
          if (textEl) {
            let currentFormat = 'bibtex'
            textEl.textContent = citations[currentFormat]
            document.querySelectorAll('.cite-format-tab').forEach((tab) => {
              tab.onclick = () => {
                document
                  .querySelectorAll('.cite-format-tab')
                  .forEach((t) => t.classList.remove('active'))
                tab.classList.add('active')
                currentFormat = tab.getAttribute('data-format')
                textEl.textContent = citations[currentFormat]
              }
            })
          }
          const copyBtn = document.getElementById('cite-copy-btn')
          if (copyBtn) {
            copyBtn.onclick = () => {
              const textEl2 = document.getElementById('cite-text')
              if (textEl2)
                navigator.clipboard.writeText(textEl2.textContent).then(() => {
                  const orig = copyBtn.textContent
                  copyBtn.textContent = 'Copied'
                  setTimeout(() => (copyBtn.textContent = orig), 2000)
                }).catch(function () {})
            }
          }
        }

        content.classList.remove('is-hidden')
        document.title = item.name + ' — Whispering Lore Artifacts'
        history.replaceState(
          null,
          '',
          '?item=' + encodeURIComponent(item.slug)
        )

        const backLink = document.getElementById('detail-back-link')
        if (backLink) {
          if (this._backLinkHandler) {
            backLink.removeEventListener('click', this._backLinkHandler)
          }
          this._backLinkHandler = (e) => {
            e.preventDefault()
            this.closeDetail()
          }
          backLink.addEventListener('click', this._backLinkHandler)
        }
        if (this._escKeyHandler) {
          document.removeEventListener('keydown', this._escKeyHandler)
        }
        this._escKeyHandler = (e) => {
          if (e.key === 'Escape') this.closeDetail()
        }
        document.addEventListener('keydown', this._escKeyHandler)

        this.renderDetailNav(slug)

        this._keyHandler = (e) => {
          if (e.key === 'ArrowLeft') {
            const btn = document.getElementById('detail-prev')
            if (btn && btn.style.display !== 'none') btn.click()
          }
          if (e.key === 'ArrowRight') {
            const btn = document.getElementById('detail-next')
            if (btn && btn.style.display !== 'none') btn.click()
          }
        }
        document.addEventListener('keydown', this._keyHandler)
      }
    }

    const cached = this.cache || window.__ITEMS
    if (cached) {
      const found = cached.find((i) => i.slug === slug)
      if (found) {
        if (window.__WL_PRELOAD) {
          await window.__WL_PRELOAD.catch(() => {})
        }
        renderItem(found)
        return
      }
    }
    renderItem(null)
  }

  closeDetail() {
    const detail = document.getElementById('item-detail')
    const pageHero = document.querySelector('.page-hero')
    const filterBar = document.querySelector('.filter-bar')
    const layout = document.querySelector('.bestiary-layout')

    if (detail) detail.classList.add('is-hidden')
    if (pageHero) pageHero.classList.remove('is-hidden')
    if (filterBar) filterBar.classList.remove('is-hidden')
    if (layout) layout.classList.remove('is-hidden')
    document.body.style.overflow = ''

    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler)
      this._keyHandler = null
    }

    document.title = 'Artifacts — Whispering Lore'
    history.replaceState(null, '', window.location.pathname)
    window.scrollTo(
      0,
      parseInt(sessionStorage.getItem('wl-items-scroll')) || 0
    )
  }

  renderDetailNav(slug) {
    const data = this.state.filteredData || this.cache || []
    const idx = data.findIndex((i) => i.slug === slug)
    const prevBtn = document.getElementById('detail-prev')
    const nextBtn = document.getElementById('detail-next')
    if (prevBtn) {
      if (idx > 0) {
        prevBtn.classList.remove('is-hidden')
        const prevSlug = data[idx - 1].slug
        prevBtn.onclick = () => this.showDetail(prevSlug)
      } else {
        prevBtn.classList.add('is-hidden')
      }
    }
    if (nextBtn) {
      if (idx < data.length - 1) {
        nextBtn.classList.remove('is-hidden')
        const nextSlug = data[idx + 1].slug
        nextBtn.onclick = () => this.showDetail(nextSlug)
      } else {
        nextBtn.classList.add('is-hidden')
      }
    }
  }
}

const viewer = new ItemsViewer()
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => viewer.init())
} else {
  viewer.init()
}
window.showItem = (slug) => viewer.showDetail(slug)

export { ItemsViewer }
