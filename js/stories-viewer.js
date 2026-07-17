import { BaseViewer } from './viewer-base.js';

class StoriesViewer extends BaseViewer {
  constructor() {
    super({
      type: 'stories',
      gridId: 'story-grid',
      emptyId: 'story-empty',
      loadMoreId: 'story-load-more',
      countSelector: '.story-count'
    });
    this.storiesCache = null;
  }

  estimateReadingTime(text) {
    if (!text) return '1 min read';
    var words = text.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.ceil(words / 200));
    return minutes + ' min read';
  }

  renderStoryText(text) {
    if (!text) return '<p class="story-empty-text">Full text not yet transcribed. Our archivists are working on it.</p>';
    var paras = text.split('\n').filter(Boolean);
    return paras.map(p => '<p>' + window.__sharedUtils.escapeXml(p) + '</p>').join('');
  }

  cardRenderer(story, index) {
    var card = document.createElement('article');
    card.className = 'card story-card staggered-card';
    card.setAttribute('data-title', story.title);

    var placeholder = document.createElement('div');
    placeholder.className = 'card-image-placeholder';
    var svgHTML = (window.__sharedUtils && window.__sharedUtils.placeholderSVG)
      ? window.__sharedUtils.placeholderSVG(story.title, story.region)
      : '';
    placeholder.innerHTML = svgHTML;
    card.appendChild(placeholder);

    var body = document.createElement('div');
    body.className = 'card-body';
    var accent = document.createElement('span');
    accent.className = 'crimson-accent';
    body.appendChild(accent);

    var h3 = document.createElement('h3');
    h3.textContent = story.title;
    body.appendChild(h3);

    var p = document.createElement('p');
    p.textContent = story.summary || 'No summary available.';
    body.appendChild(p);

    if (story.country) {
      var countryEl = document.createElement('span');
      countryEl.className = 'story-country';
      countryEl.textContent = story.country;
      body.appendChild(countryEl);
    }

    var slug = story.slug || window.__sharedUtils.getSlug(story.title);
    var a = document.createElement('a');
    a.href = '?story=' + slug;
    a.className = 'card-cta';
    a.setAttribute('data-slug', slug);
    a.textContent = 'Read Story';
    body.appendChild(a);
    card.appendChild(body);

    card.style.transitionDelay = ((index % this.perPage) * 0.05) + 's';
    card.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('wl-stories-scroll', window.pageYOffset);
      history.pushState(null, '', '?story=' + slug);
      this.showDetail(slug);
    });

    setTimeout(() => card.classList.add('visible'), 50);
    return card;
  }

  async init() {
    this.initLinks();
    this.initFacetListeners();
    this.renderSkeletons();
    this.initDropdowns();
    
    var regionParam = this.getParam('region');
    if (regionParam) this.state.filters.region = regionParam;
    var storyParam = this.getParam('story');
    
    await this.loadData();
    this.populateDropdowns();
    this.applyFilters();
    if (storyParam) this.showDetail(storyParam);
  }

  async loadData() {
    var sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
    if (!sh) return;

    await sh.loadManifest();

    await new Promise((resolve) => {
      sh.loadAllShards('stories', (err, data) => resolve());
    });
    this.cache = sh.getAllItems('stories');
  }

  initLinks() {
    document.addEventListener('click', (e) => {
      var cta = e.target.closest('.card-cta');
      if (cta) {
        e.preventDefault();
        var slug = cta.getAttribute('data-slug');
        if (slug) {
          history.pushState(null, '', '?story=' + slug);
          this.showDetail(slug);
        }
      }
    });
  }

  initDropdowns() {
    var regionDropdown = document.getElementById('story-region-filter');
    if (regionDropdown) {
      regionDropdown.addEventListener('change', (e) => {
        this.state.filters.region = (e.target.value === 'all') ? null : e.target.value;
        this.applyFilters();
      });
    }
    var countryDropdown = document.getElementById('story-country-filter');
    if (countryDropdown) {
      countryDropdown.addEventListener('change', (e) => {
        this.state.filters.country = (e.target.value === 'all') ? null : e.target.value;
        this.applyFilters();
      });
    }
    var tribeDropdown = document.getElementById('story-tribe-filter');
    if (tribeDropdown) {
      tribeDropdown.addEventListener('change', (e) => {
        this.state.filters.tribe = (e.target.value === 'all') ? null : e.target.value;
        this.applyFilters();
      });
    }
    var typeDropdown = document.getElementById('story-type-filter');
    if (typeDropdown) {
      typeDropdown.addEventListener('change', (e) => {
        this.state.filters.type = (e.target.value === 'all') ? null : e.target.value;
        this.applyFilters();
      });
    }
    var sortDropdown = document.getElementById('stories-sort');
    if (sortDropdown) {
      sortDropdown.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value;
        this.applyFilters();
      });
    }
    var searchInput = document.getElementById('story-search');
    if (searchInput) {
      var timer = null;
      searchInput.addEventListener('input', (e) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          this.state.filters.search = e.target.value.trim() || null;
          this.applyFilters();
        }, 250);
      });
    }
  }

  populateDropdowns() {
    this.populateSelect('story-region-filter', 'region');
    this.populateSelect('story-country-filter', 'country');
    this.populateSelect('story-tribe-filter', 'tribe');
    this.populateSelect('story-type-filter', 'type');
  }

  initFacetListeners() {
    document.addEventListener('click', (e) => {
      var option = e.target.closest('.facet-option');
      if (option) {
        var dim = option.getAttribute('data-dimension');
        var val = option.getAttribute('data-value');
        this.state.filters[dim] = (this.state.filters[dim] === val) ? null : val;
        this.applyFilters();
      }
      var chipRemove = e.target.closest('.chip-remove');
      if (chipRemove) {
        var chip = chipRemove.closest('.filter-chip');
        if (!chip) return;
        var dim = chip.getAttribute('data-dimension');
        this.state.filters[dim] = null;
        this.applyFilters();
      }
      var quickChip = e.target.closest('.quick-filters .chip');
      if (quickChip) {
        e.stopPropagation();
        var region = quickChip.getAttribute('data-region');
        this.state.filters.region = region;
        this.applyFilters();
        return;
      }
      var resetBtn = e.target.closest('.filter-reset');
      if (resetBtn) {
        this.resetFilters();
      }
    });
  }

  resetFilters() {
    for (var dim in this.state.filters) {
      this.state.filters[dim] = null;
    }
    this.applyFilters();
  }

  renderSkeletons() {
    var grid = document.getElementById('story-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 0; i < 24; i++) {
      var skel = document.createElement('div');
      skel.className = 'skeleton';
      skel.innerHTML = '<div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>';
      grid.appendChild(skel);
    }
  }

  showDetail(slug) {
    var detail = document.getElementById('story-detail');
    var pageHero = document.querySelector('.page-hero');
    var filterBar = document.querySelector('.filter-bar');
    var bestiaryLayout = document.querySelector('.bestiary-layout');
    var loader = document.getElementById('detail-loader');
    var content = document.getElementById('detail-content');
    var error = document.getElementById('detail-error');

    if (pageHero) pageHero.classList.add('is-hidden');
    if (filterBar) filterBar.classList.add('is-hidden');
    if (bestiaryLayout) bestiaryLayout.classList.add('is-hidden');
    if (detail) detail.classList.remove('is-hidden');
    if (loader) loader.classList.remove('is-hidden');
    if (content) content.classList.add('is-hidden');
    if (error) error.classList.add('is-hidden');

    const renderStory = (story) => {
      if (loader) loader.classList.add('is-hidden');
      if (!story) {
        if (error) {
          error.querySelector('p').textContent = 'No story found for "' + slug + '".';
          error.classList.remove('is-hidden');
        }
        return;
      }

      if (content) {
        var lb = window.__sharedUtils && window.__sharedUtils.LoreBox;
        if (lb) {
          var viewedS = lb.get('viewed_stories') || [];
          var storySlug = story.slug || window.__sharedUtils.getSlug(story.title);
          if (viewedS.indexOf(storySlug) === -1) {
            viewedS.push(storySlug);
            lb.set('viewed_stories', viewedS);
          }
        }

        const setText = (id, val) => {
          var el = document.getElementById(id);
          if (el) el.textContent = val || '';
        };

        setText('detail-title', story.title || slug);
        setText('detail-country', story.country || 'Unknown');
        setText('detail-region', story.region || 'Unknown');
        setText('detail-themes', story.themes || 'Not documented');
        setText('detail-moral', story.moral || '');
        setText('detail-period', story.period || 'Unknown');

        var attrCard = document.getElementById('detail-attribution-card');
        var stBadge = document.getElementById('detail-source-type-badge');
        if (stBadge && story.source_type) {
          var st = story.source_type;
          var est = window.__sharedUtils.escapeXml(st);
          var stLabel = window.__sharedUtils.escapeXml(st.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }));
          stBadge.innerHTML = '<span class="source-type-badge source-type-badge--' + est + '">' + stLabel + '</span>';
          if (attrCard) attrCard.classList.remove('is-hidden');
        } else if (attrCard) {
          attrCard.classList.add('is-hidden');
        }

        var attrEl = document.getElementById('detail-attribution');
        if (attrEl && story.source_type === 'oral_tradition') {
          attrEl.textContent = 'This story is part of the oral tradition of ' + (story.country || 'its region') + '. We honor the communities and storytellers who have preserved it across generations.';
        } else if (attrEl) {
          attrEl.textContent = '';
        }

        var readingTimeEl = document.getElementById('detail-reading-time');
        if (readingTimeEl) {
          readingTimeEl.textContent = this.estimateReadingTime(story.full_text || '');
        }

        var updatedEl = document.getElementById('detail-last-updated');
        if (updatedEl) {
          updatedEl.textContent = story.lastUpdated || 'Unknown';
        }

        var fullTextEl = document.getElementById('detail-fulltext');
        if (fullTextEl) {
          if (story.full_text) {
            var paragraphs = story.full_text.split('\n').filter(Boolean);
            fullTextEl.innerHTML = '';
            paragraphs.forEach(p => {
              var pEl = document.createElement('p');
              pEl.textContent = p;
              fullTextEl.appendChild(pEl);
            });
          } else {
            fullTextEl.innerHTML = '<p class="story-empty-text">Full text not yet transcribed. Our archivists are working on it.</p>';
          }
        }

        var bookBtn = document.getElementById('detail-book');
        if (bookBtn && lb) {
          var isBook = lb.get('stories').some(i => i.id === story.id);
          bookBtn.textContent = isBook ? '✓ Bookmarked' : 'Bookmark';
          bookBtn.onclick = () => {
            var active = lb.toggle('stories', story);
            bookBtn.textContent = active ? '✓ Bookmarked' : 'Bookmark';
          };
        }

        var shareBtn = document.getElementById('detail-share');
        if (shareBtn) {
          shareBtn.onclick = () => {
            navigator.clipboard.writeText(window.location.href).then(() => {
              var orig = shareBtn.textContent;
              shareBtn.textContent = '✓ Copied';
              setTimeout(() => shareBtn.textContent = orig, 2000);
            });
          };
        }

        if (window.__sharedUtils && window.__sharedUtils.CitationGenerator) {
          var gen = window.__sharedUtils.CitationGenerator;
          var citations = gen.generateAll(story, true);
          var textEl = document.getElementById('cite-text');
          if (textEl) {
            var currentFormat = 'bibtex';
            textEl.textContent = citations[currentFormat];
            document.querySelectorAll('.cite-format-tab').forEach(tab => {
              tab.onclick = () => {
                document.querySelectorAll('.cite-format-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                currentFormat = tab.getAttribute('data-format');
                textEl.textContent = citations[currentFormat];
              };
            });
          }
          var copyBtn = document.getElementById('cite-copy-btn');
          if (copyBtn) {
            copyBtn.onclick = () => {
              var textEl2 = document.getElementById('cite-text');
              if (textEl2) navigator.clipboard.writeText(textEl2.textContent).then(() => {
                var orig = copyBtn.textContent;
                copyBtn.textContent = 'Copied';
                setTimeout(() => copyBtn.textContent = orig, 2000);
              });
            };
          }
        }

        var recsSection = document.getElementById('story-recs');
        var recsGrid = document.getElementById('story-recs-grid');
        if (recsSection && recsGrid) {
          var allStories = this.cache || window.__STORIES_DATA || [];
          var recs = allStories.filter(s => {
            if (s.slug === slug) return false;
            var sThemes = typeof s.themes === 'string' ? s.themes.toLowerCase() : '';
            var stThemes = typeof story.themes === 'string' ? story.themes.toLowerCase() : '';
            var sharedThemes = sThemes && stThemes && sThemes === stThemes;
            var sameRegion = s.region === story.region;
            return sharedThemes || sameRegion;
          }).slice(0, 3);
          if (recs.length > 0) {
            recsGrid.innerHTML = recs.map(r => `<a href="stories.html?story=${encodeURIComponent(r.slug)}" class="detail-creature-link">
              <span class="creature-link-name">${window.__sharedUtils.escapeXml(r.title)}</span>
              <span class="creature-link-type">${window.__sharedUtils.escapeXml(r.country)}</span>
            </a>`).join('');
            recsSection.classList.remove('is-hidden');
          } else {
            recsSection.classList.add('is-hidden');
          }
        }

        var creaturesSection = document.getElementById('detail-creatures-section');
        var creaturesGrid = document.getElementById('detail-creatures');
        if (creaturesSection && creaturesGrid && story.creatures && story.creatures.length > 0) {
          var allC = window.__FULL_CREATURES || [];
          var resolved = story.creatures.filter(ref => allC.some(c => c.slug === ref));
          if (resolved.length > 0) {
            creaturesGrid.innerHTML = '';
            resolved.forEach(ref => {
              var cr = allC.find(c => c.slug === ref);
              var link = document.createElement('a');
              link.href = 'bestiary.html?creature=' + encodeURIComponent(cr.slug);
              link.className = 'detail-creature-link';
              link.innerHTML = '<span class="creature-link-name">' + window.__sharedUtils.escapeXml(cr.name) + '</span><span class="creature-link-type">' + window.__sharedUtils.escapeXml(cr.type || '') + '</span>';
              creaturesGrid.appendChild(link);
            });
            creaturesSection.classList.remove('is-hidden');
          } else {
            creaturesSection.classList.add('is-hidden');
          }
        }

        content.classList.remove('is-hidden');
        document.title = story.title + ' — Whispering Lore Stories';
        history.replaceState(null, '', '?story=' + encodeURIComponent(story.slug));

        var backLink = document.getElementById('detail-back-link');
        if (backLink) {
          if (this._backLinkHandler) {
            backLink.removeEventListener('click', this._backLinkHandler);
          }
          this._backLinkHandler = (e) => { e.preventDefault(); this.closeDetail(); };
          backLink.addEventListener('click', this._backLinkHandler);
        }
        if (this._escKeyHandler) {
          document.removeEventListener('keydown', this._escKeyHandler);
        }
        this._escKeyHandler = (e) => { if (e.key === 'Escape') this.closeDetail(); };
        document.addEventListener('keydown', this._escKeyHandler);
      }
    }

    var cached = this.cache || window.__STORIES_DATA;
    if (cached) {
      var found = cached.find(s => s.slug === slug || (s.title && window.__sharedUtils.getSlug(s.title) === slug));
      if (found) { renderStory(found); return; }
    }

    var sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
    if (sh && sh.manifest) {
      sh.getItem('stories', slug, (err, item) => renderStory(item));
    } else {
      renderStory(null);
    }
  }

  closeDetail() {
    var detail = document.getElementById('story-detail');
    var pageHero = document.querySelector('.page-hero');
    var filterBar = document.querySelector('.filter-bar');
    var bestiaryLayout = document.querySelector('.bestiary-layout');

    if (detail) detail.classList.add('is-hidden');
    if (pageHero) pageHero.classList.remove('is-hidden');
    if (filterBar) filterBar.classList.remove('is-hidden');
    if (bestiaryLayout) bestiaryLayout.classList.remove('is-hidden');

    document.title = 'Stories — Whispering Lore';
    history.replaceState(null, '', window.location.pathname);
    window.scrollTo(0, parseInt(sessionStorage.getItem('wl-stories-scroll')) || 0);
  }
}

const viewer = new StoriesViewer();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => viewer.init());
} else {
  viewer.init();
}
window.showDetail = (slug) => viewer.showDetail(slug);
