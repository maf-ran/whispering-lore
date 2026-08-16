import { BaseViewer } from './viewer-base.js'

class StoriesViewer extends BaseViewer {
  constructor() {
    super({
      type: 'stories',
      gridId: 'story-grid',
      emptyId: 'story-empty',
      loadMoreId: 'story-load-more',
      countSelector: '.story-count',
    })
    this.storiesCache = null
  }

  estimateReadingTime(text) {
    if (!text) return '1 min read'
    const words = text.trim().split(/\s+/).length
    const minutes = Math.max(1, Math.ceil(words / 200))
    return minutes + ' min read'
  }

  renderStoryText(text) {
    if (!text)
      return '<p class="story-empty-text">Full text not yet transcribed. Our archivists are working on it.</p>'
    const paras = text.split('\n').filter(Boolean)
    return paras
      .map((p) => '<p>' + window.__sharedUtils.escapeXml(p) + '</p>')
      .join('')
  }

  cardRenderer(story, index) {
    const card = document.createElement('article')
    card.className = 'card story-card staggered-card'
    card.setAttribute('data-title', story.title)

    const placeholder = document.createElement('div')
    placeholder.className = 'card-image-placeholder'
    const svgHTML =
      window.__sharedUtils && window.__sharedUtils.placeholderSVG
        ? window.__sharedUtils.placeholderSVG(story.title, story.region)
        : ''
    placeholder.innerHTML = svgHTML
    card.appendChild(placeholder)

    const body = document.createElement('div')
    body.className = 'card-body'
    const accent = document.createElement('span')
    accent.className = 'crimson-accent'
    body.appendChild(accent)

    const h3 = document.createElement('h3')
    h3.textContent = story.title
    body.appendChild(h3)

    const p = document.createElement('p')
    p.textContent = story.summary || 'No summary available.'
    body.appendChild(p)

    if (story.country) {
      const countryEl = document.createElement('span')
      countryEl.className = 'story-country'
      countryEl.textContent = story.country
      body.appendChild(countryEl)
    }

    const slug = story.slug || window.__sharedUtils.getSlug(story.title)
    const a = document.createElement('a')
    a.href = '?story=' + slug
    a.className = 'card-cta'
    a.setAttribute('data-slug', slug)
    a.textContent = 'Read Story'
    body.appendChild(a)
    card.appendChild(body)

    card.style.transitionDelay = (index % this.perPage) * 0.05 + 's'
    card.addEventListener('click', (e) => {
      e.preventDefault()
      sessionStorage.setItem('wl-stories-scroll', window.pageYOffset)
      history.pushState(null, '', '?story=' + slug)
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

    const regionParam = this.getParam('region')
    if (regionParam) this.state.filters.region = regionParam
    const storyParam = this.getParam('story')

    await this.loadData()
    this.populateDropdowns()
    this.readStateFromURL()
    this.syncFilterUI()
    this.applyFilters()
    if (storyParam) this.showDetail(storyParam)
  }

  async loadData() {
    const sh = window.__sharedUtils && window.__sharedUtils.Shimmer
    if (!sh) return

    await sh.loadManifest()

    await new Promise((resolve) => {
      sh.loadAllShards('stories', (err, data) => resolve())
    })
    this.cache = sh.getAllItems('stories')
    window.__FULL_STORIES = this.cache
  }

  initLinks() {
    document.addEventListener('click', (e) => {
      const cta = e.target.closest('.card-cta')
      if (cta) {
        e.preventDefault()
        const slug = cta.getAttribute('data-slug')
        if (slug) {
          history.pushState(null, '', '?story=' + slug)
          this.showDetail(slug)
        }
      }
    })
  }

  initDropdowns() {
    const regionDropdown = document.getElementById('story-region-filter')
    if (regionDropdown) {
      regionDropdown.addEventListener('change', (e) => {
        this.state.filters.region =
          e.target.value === 'all' ? null : e.target.value
        this.applyFilters()
      })
    }
    const countryDropdown = document.getElementById('story-country-filter')
    if (countryDropdown) {
      countryDropdown.addEventListener('change', (e) => {
        this.state.filters.country =
          e.target.value === 'all' ? null : e.target.value
        this.applyFilters()
      })
    }
    const tribeDropdown = document.getElementById('story-tribe-filter')
    if (tribeDropdown) {
      tribeDropdown.addEventListener('change', (e) => {
        this.state.filters.tribe =
          e.target.value === 'all' ? null : e.target.value
        this.applyFilters()
      })
    }
    const typeDropdown = document.getElementById('story-type-filter')
    if (typeDropdown) {
      typeDropdown.addEventListener('change', (e) => {
        this.state.filters.type =
          e.target.value === 'all' ? null : e.target.value
        this.applyFilters()
      })
    }
    const sortDropdown = document.getElementById('stories-sort')
    if (sortDropdown) {
      sortDropdown.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value
        this.applyFilters()
      })
    }
    const searchInput = document.getElementById('story-search')
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
    this.populateSelect('story-region-filter', 'region')
    this.populateSelect('story-country-filter', 'country')
    this.populateSelect('story-tribe-filter', 'tribe')
    this.populateSelect('story-type-filter', 'type')
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
        const region = quickChip.getAttribute('data-region')
        this.state.filters.region = region
        this.applyFilters()
        return
      }
      const resetBtn = e.target.closest('.filter-reset')
      if (resetBtn) {
        this.resetFilters()
      }
    })
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return
      const option = e.target.closest('.facet-option')
      if (option) {
        e.preventDefault()
        const dim = option.getAttribute('data-dimension')
        const val = option.getAttribute('data-value')
        this.state.filters[dim] = this.state.filters[dim] === val ? null : val
        this.applyFilters()
        return
      }
      const chip = e.target.closest('.filter-chip')
      if (chip) {
        e.preventDefault()
        const dim = chip.getAttribute('data-dimension')
        this.state.filters[dim] = null
        this.applyFilters()
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
    const grid = document.getElementById('story-grid')
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

  showDetail(slug) {
    const detail = document.getElementById('story-detail')
    const pageHero = document.querySelector('.page-hero')
    const filterBar = document.querySelector('.filter-bar')
    const bestiaryLayout = document.querySelector('.bestiary-layout')
    const loader = document.getElementById('detail-loader')
    const content = document.getElementById('detail-content')
    const error = document.getElementById('detail-error')

    if (pageHero) pageHero.classList.add('is-hidden')
    if (filterBar) filterBar.classList.add('is-hidden')
    if (bestiaryLayout) bestiaryLayout.classList.add('is-hidden')
    if (detail) detail.classList.remove('is-hidden')
    if (loader) loader.classList.remove('is-hidden')
    if (content) content.classList.add('is-hidden')
    if (error) error.classList.add('is-hidden')
    window.scrollTo(0, 0)
    document.body.style.overflow = 'hidden'

    const renderStory = (story) => {
      if (loader) loader.classList.add('is-hidden')
      if (!story) {
        if (error) {
          error.querySelector('p').textContent =
            'No story found for "' + slug + '".'
          error.classList.remove('is-hidden')
        }
        return
      }

      if (content) {
        const lb = window.__sharedUtils && window.__sharedUtils.LoreBox
        if (lb) {
          const viewedS = lb.get('viewed_stories') || []
          const storySlug =
            story.slug || window.__sharedUtils.getSlug(story.title)
          if (viewedS.indexOf(storySlug) === -1) {
            viewedS.push(storySlug)
            lb.set('viewed_stories', viewedS)
          }
        }

        const setText = (id, val) => {
          const el = document.getElementById(id)
          if (el) el.textContent = val || ''
        }

        setText('detail-title', story.title || slug)
        setText('detail-country', story.country || 'Unknown')
        setText('detail-region', story.region || 'Unknown')
        setText('detail-themes', story.themes || 'Not documented')
        setText('detail-moral', story.moral || '')
        setText('detail-period', story.period || 'Unknown')

        const attrCard = document.getElementById('detail-attribution-card')
        const stBadge = document.getElementById('detail-source-type-badge')
        if (stBadge && story.source_type) {
          const st = story.source_type
          const est = window.__sharedUtils.escapeXml(st)
          const stLabel = window.__sharedUtils.escapeXml(
            st.replace(/_/g, ' ').replace(/\b\w/g, function (l) {
              return l.toUpperCase()
            })
          )
          stBadge.innerHTML =
            '<span class="source-type-badge source-type-badge--' +
            est +
            '">' +
            stLabel +
            '</span>'
          if (attrCard) attrCard.classList.remove('is-hidden')
        } else if (attrCard) {
          attrCard.classList.add('is-hidden')
        }

        const attrEl = document.getElementById('detail-attribution')
        if (attrEl && story.source_type === 'oral_tradition') {
          attrEl.textContent =
            'This story is part of the oral tradition of ' +
            (story.country || 'its region') +
            '. We honor the communities and storytellers who have preserved it across generations.'
        } else if (attrEl) {
          attrEl.textContent = ''
        }

        const readingTimeEl = document.getElementById('detail-reading-time')
        if (readingTimeEl) {
          readingTimeEl.textContent = this.estimateReadingTime(
            story.full_text || ''
          )
        }

        const updatedEl = document.getElementById('detail-last-updated')
        if (updatedEl) {
          updatedEl.textContent = story.lastUpdated || 'Unknown'
        }

        const fullTextEl = document.getElementById('detail-fulltext')
        if (fullTextEl) {
          if (story.full_text) {
            const paragraphs = story.full_text.split('\n').filter(Boolean)
            fullTextEl.innerHTML = ''
            paragraphs.forEach((p) => {
              const pEl = document.createElement('p')
              pEl.textContent = p
              fullTextEl.appendChild(pEl)
            })
          } else {
            fullTextEl.innerHTML =
              '<p class="story-empty-text">Full text not yet transcribed. Our archivists are working on it.</p>'
          }
        }

        const bookBtn = document.getElementById('detail-book')
        if (bookBtn && lb) {
          const isBook = lb.get('stories').some((i) => i.id === story.id)
          bookBtn.textContent = isBook ? '✓ Bookmarked' : 'Bookmark'
          bookBtn.onclick = () => {
            const active = lb.toggle('stories', story)
            bookBtn.textContent = active ? '✓ Bookmarked' : 'Bookmark'
          }
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
          const citations = gen.generateAll(story, true)
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

        const recsSection = document.getElementById('story-recs')
        const recsGrid = document.getElementById('story-recs-grid')
        if (recsSection && recsGrid) {
          const allStories = this.cache || window.__STORIES_DATA || []
          const recs = allStories
            .filter((s) => {
              if (s.slug === slug) return false
              const sThemes =
                typeof s.themes === 'string' ? s.themes.toLowerCase() : ''
              const stThemes =
                typeof story.themes === 'string'
                  ? story.themes.toLowerCase()
                  : ''
              const sharedThemes = sThemes && stThemes && sThemes === stThemes
              const sameRegion = s.region === story.region
              return sharedThemes || sameRegion
            })
            .slice(0, 3)
          if (recs.length > 0) {
            recsGrid.innerHTML = recs
              .map(
                (r) => `<a href="stories.html?story=${encodeURIComponent(
                  r.slug
                )}" class="detail-creature-link">
              <span class="creature-link-name">${window.__sharedUtils.escapeXml(
                r.title
              )}</span>
              <span class="creature-link-type">${window.__sharedUtils.escapeXml(
                r.country
              )}</span>
            </a>`
              )
              .join('')
            recsSection.classList.remove('is-hidden')
          } else {
            recsSection.classList.add('is-hidden')
          }
        }

        const creaturesSection = document.getElementById(
          'detail-creatures-section'
        )
        const creaturesGrid = document.getElementById('detail-creatures')
        if (
          creaturesSection &&
          creaturesGrid &&
          story.creatures &&
          story.creatures.length > 0
        ) {
          this.renderDetailCreatures(story, creaturesSection, creaturesGrid)
        }

        content.classList.remove('is-hidden')
        document.title = story.title + ' — Whispering Lore Stories'
        history.replaceState(
          null,
          '',
          '?story=' + encodeURIComponent(story.slug)
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

        this.releaseFocusTrap()
        this.trapFocus(detail)
      }
    }

    const cached = this.cache || window.__STORIES_DATA
    if (cached) {
      const found = cached.find(
        (s) =>
          s.slug === slug ||
          (s.title && window.__sharedUtils.getSlug(s.title) === slug)
      )
      if (found) {
        renderStory(found)
        return
      }
    }

    const sh = window.__sharedUtils && window.__sharedUtils.Shimmer
    if (sh && sh.manifest) {
      sh.getItem('stories', slug, (err, item) => renderStory(item))
    } else {
      renderStory(null)
    }
  }

  async renderDetailCreatures(story, section, grid) {
    if (window.__FULL_CREATURES_READY) {
      try { await window.__FULL_CREATURES_READY } catch (e) { /* swallow */ }
    }
    const allC = window.__FULL_CREATURES || []
    const resolved = story.creatures.filter((ref) =>
      allC.some((c) => c.slug === ref)
    )
    if (resolved.length > 0) {
      grid.innerHTML = ''
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
        grid.appendChild(link)
      })
      section.classList.remove('is-hidden')
    } else {
      section.classList.add('is-hidden')
    }
  }

  closeDetail() {
    const detail = document.getElementById('story-detail')
    const pageHero = document.querySelector('.page-hero')
    const filterBar = document.querySelector('.filter-bar')
    const bestiaryLayout = document.querySelector('.bestiary-layout')

    if (detail) detail.classList.add('is-hidden')
    if (pageHero) pageHero.classList.remove('is-hidden')
    if (filterBar) filterBar.classList.remove('is-hidden')
    if (bestiaryLayout) bestiaryLayout.classList.remove('is-hidden')
    document.body.style.overflow = ''

    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler)
      this._keyHandler = null
    }

    this.releaseFocusTrap()

    document.title = 'Stories — Whispering Lore'
    history.replaceState(null, '', window.location.pathname)
    window.scrollTo(
      0,
      parseInt(sessionStorage.getItem('wl-stories-scroll')) || 0
    )
  }

  renderDetailNav(slug) {
    const data = this.state.filteredData || this.cache || []
    const idx = data.findIndex((s) => {
      const sSlug = s.slug || window.__sharedUtils.getSlug(s.title)
      return sSlug === slug
    })
    const prevBtn = document.getElementById('detail-prev')
    const nextBtn = document.getElementById('detail-next')
    if (prevBtn) {
      if (idx > 0) {
        prevBtn.classList.remove('is-hidden')
        const prevSlug = data[idx - 1].slug || window.__sharedUtils.getSlug(data[idx - 1].title)
        prevBtn.onclick = () => this.showDetail(prevSlug)
      } else {
        prevBtn.classList.add('is-hidden')
      }
    }
    if (nextBtn) {
      if (idx < data.length - 1) {
        nextBtn.classList.remove('is-hidden')
        const nextSlug = data[idx + 1].slug || window.__sharedUtils.getSlug(data[idx + 1].title)
        nextBtn.onclick = () => this.showDetail(nextSlug)
      } else {
        nextBtn.classList.add('is-hidden')
      }
    }
  }
}

const viewer = new StoriesViewer()
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => viewer.init())
} else {
  viewer.init()
}
window.showDetail = (slug) => viewer.showDetail(slug)
