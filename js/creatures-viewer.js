import { BaseViewer } from './viewer-base.js';

class CreaturesViewer extends BaseViewer {
  constructor() {
    super({
      type: 'creatures',
      gridId: 'bestiary-grid',
      emptyId: 'bestiary-empty',
      loadMoreId: 'load-more',
      countSelector: '.bestiary-count'
    });
  }

  normalizeType(rawType) {
    return window.__sharedUtils.normalizeType(rawType);
  }

  cardRenderer(creature, index) {
    var card = document.createElement('article');
    card.className = 'card bestiary-card staggered-card';
    card.setAttribute('data-name', creature.name);
    card.setAttribute('data-slug', creature.slug);
    card.setAttribute('data-type', creature.type);

    var placeholder = document.createElement('div');
    placeholder.className = 'card-image-placeholder';
    var glyphPath = (window.__sharedUtils && window.__sharedUtils.RegionGlyphs)
      ? window.__sharedUtils.RegionGlyphs.getGlyph(creature.region)
      : 'M16 2L30 16L16 30L2 16L16 2Z';
    placeholder.innerHTML = '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40%;height:40%;"><path d="' + glyphPath + '"/></svg>';
    card.appendChild(placeholder);

    var typeBadge = document.createElement('span');
    typeBadge.className = 'card-type-badge';
    typeBadge.textContent = creature.type || 'Unknown';
    card.appendChild(typeBadge);

    var body = document.createElement('div');
    body.className = 'card-body';
    var accent = document.createElement('span');
    accent.className = 'gold-accent';
    body.appendChild(accent);

    var h3 = document.createElement('h3');
    h3.textContent = creature.name;
    body.appendChild(h3);

    var p = document.createElement('p');
    p.textContent = creature.description || 'No description available.';
    body.appendChild(p);

    if (creature.country) {
      var countryEl = document.createElement('span');
      countryEl.className = 'card-country';
      countryEl.textContent = creature.country;
      body.appendChild(countryEl);
    }

    var a = document.createElement('a');
    a.href = '?creature=' + creature.slug;
    a.className = 'card-cta';
    a.textContent = 'View Entry';
    body.appendChild(a);
    card.appendChild(body);

    card.style.transitionDelay = ((index % this.perPage) * 0.05) + 's';
    setTimeout(() => card.classList.add('visible'), 50);
    return card;
  }

  async init() {
    this.initLinks();
    this.initFacetListeners();
    this.renderSkeletons();
    
    var regionParam = this.getParam('region');
    if (regionParam) this.state.filters.region = regionParam;
    var countryParam = this.getParam('country');
    if (countryParam) this.state.filters.country = countryParam;
    var typeParam = this.getParam('type');
    if (typeParam) this.state.filters.type = typeParam;
    
    this.initDropdowns();
    
    var slug = this.getParam('creature');
    
    try {
      await this.loadData();
    } catch (e) {
      console.error('Data load failed:', e);
    } finally {
      this.populateDropdowns();
      this.applyFilters();
    }
    
    if (slug) this.showDetail(slug);
  }

  async loadData() {
    var sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
    if (!sh) return;

    await sh.loadManifest();

    // Use Promise.race to ensure we don't hang forever
    await Promise.race([
      new Promise((resolve) => sh.loadAllShards('creatures', resolve)),
      new Promise((resolve) => setTimeout(resolve, 5000))
    ]);
    
    this.cache = sh.getAllItems('creatures');
  }

  initDropdowns() {
    var typeDropdown = document.getElementById('bestiary-type');
    if (typeDropdown) {
      typeDropdown.addEventListener('change', (e) => {
        this.state.filters.type = (e.target.value === 'all') ? null : e.target.value;
        this.applyFilters();
      });
    }
    var regionDropdown = document.getElementById('bestiary-region');
    if (regionDropdown) {
      regionDropdown.addEventListener('change', (e) => {
        var val = e.target.value === 'all' ? null : e.target.value;
        this.onRegionFilterChange(val);
      });
    }
    var countryDropdown = document.getElementById('bestiary-country');
    if (countryDropdown) {
      countryDropdown.addEventListener('change', (e) => {
        this.state.filters.country = (e.target.value === 'all') ? null : e.target.value;
        this.applyFilters();
      });
    }
    var tribeDropdown = document.getElementById('bestiary-tribe');
    if (tribeDropdown) {
      tribeDropdown.addEventListener('change', (e) => {
        this.state.filters.tribe = (e.target.value === 'all') ? null : e.target.value;
        this.applyFilters();
      });
    }
    var parentDropdown = document.getElementById('bestiary-parent');
    if (parentDropdown) {
      parentDropdown.addEventListener('change', (e) => {
        this.state.filters.parent = (e.target.value === 'all') ? null : e.target.value;
        this.applyFilters();
      });
    }
    var sortDropdown = document.getElementById('bestiary-sort');
    if (sortDropdown) {
      sortDropdown.addEventListener('change', (e) => {
        this.state.sortBy = e.target.value;
        this.applyFilters();
      });
    }
    var searchInput = document.getElementById('bestiary-search');
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
    this.populateSelect('bestiary-region', 'region');
    this.populateSelect('bestiary-country', 'country');
    this.populateSelect('bestiary-tribe', 'tribe');
    this.populateSelect('bestiary-type', 'type');
    this.populateSelect('bestiary-parent', 'parent');
    var countryEl = document.getElementById('bestiary-country');
    if (countryEl) countryEl.disabled = false;
  }

  onRegionFilterChange(region) {
    this.state.filters.region = region || null;
    var sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
    if (!sh) return;
    sh.loadRegionShard('creatures', region, () => {
      this.cache = sh.getAllItems('creatures');
      this.applyFilters();
    });
  }

  initLinks() {
    document.addEventListener('click', (e) => {
      var cta = e.target.closest('.card-cta');
      if (cta) {
        e.preventDefault();
        var slug = cta.closest('.bestiary-card')?.getAttribute('data-slug');
        if (slug) {
          sessionStorage.setItem('wl-creatures-scroll', window.pageYOffset);
          history.pushState(null, '', '?creature=' + encodeURIComponent(slug));
          this.showDetail(slug);
        }
        return;
      }
      var card = e.target.closest('.bestiary-card');
      if (card && !e.target.closest('.card-fav-btn') && !e.target.closest('.card-type-badge')) {
        e.preventDefault();
        var slug = card.getAttribute('data-slug');
        if (slug) {
          sessionStorage.setItem('wl-creatures-scroll', window.pageYOffset);
          history.pushState(null, '', '?creature=' + encodeURIComponent(slug));
          this.showDetail(slug);
        }
      }
    });
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
        this.onRegionFilterChange(region);
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

  showDetail(slug) {
    var detail = document.getElementById('creature-detail');
    var pageHero = document.querySelector('.page-hero');
    var filterBar = document.querySelector('.filter-bar');
    var bestiaryLayout = document.querySelector('.bestiary-layout');
    var loader = document.getElementById('detail-loader');
    var content = document.getElementById('detail-content');
    var error = document.getElementById('detail-error');

    if (pageHero) pageHero.classList.add('is-hidden');
    if (filterBar) filterBar.classList.add('is-hidden');
    if (bestiaryLayout) bestiaryLayout.classList.add('is-hidden');
    window.scrollTo(0, 0);

    if (detail) detail.classList.remove('is-hidden');
    if (loader) loader.classList.remove('is-hidden');
    if (content) content.classList.add('is-hidden');
    if (error) error.classList.add('is-hidden');

    const renderCreature = (creature) => {
      if (loader) loader.classList.add('is-hidden');
      if (!creature) {
        if (error) {
          error.querySelector('p').textContent = 'No creature found for "' + slug + '".';
          error.classList.remove('is-hidden');
        }
        return;
      }

      if (content) {
        var lb = window.__sharedUtils && window.__sharedUtils.LoreBox;
        if (lb) {
          var viewedC = lb.get('viewed_creatures') || [];
          if (viewedC.indexOf(creature.slug) === -1) {
            viewedC.push(creature.slug);
            lb.set('viewed_creatures', viewedC);
          }
        }

        const setText = (id, val) => {
          var el = document.getElementById(id);
          if (el) el.textContent = val || '';
        };
        setText('detail-name', creature.name || slug);

        if (creature.pronunciation_ipa) {
          var nameEl = document.getElementById('detail-name');
          if (nameEl) {
            var ipaSpan = document.createElement('span');
            ipaSpan.className = 'detail-ipa';
            ipaSpan.textContent = ' [' + creature.pronunciation_ipa + ']';
            nameEl.appendChild(ipaSpan);
          }
        }

        var favBtn = document.getElementById('detail-fav');
        if (favBtn && lb) {
          var isFav = lb.get('creatures').some(function(i) { return i.id === creature.id; });
          favBtn.textContent = isFav ? 'Unfavorite' : 'Favorite';
          favBtn.onclick = function() {
            var active = lb.toggle('creatures', creature);
            favBtn.textContent = active ? 'Unfavorite' : 'Favorite';
          };
        }

        var shareBtn = document.getElementById('detail-share');
        if (shareBtn) {
          shareBtn.onclick = function() {
            navigator.clipboard.writeText(window.location.href).then(function() {
              var orig = shareBtn.textContent;
              shareBtn.textContent = 'Copied';
              setTimeout(function() { shareBtn.textContent = orig; }, 2000);
            });
          };
        }

        var citeBtn = document.getElementById('detail-cite-btn');
        var citePopover = document.getElementById('detail-cite-popover');
        if (citeBtn && citePopover && window.__sharedUtils && window.__sharedUtils.CitationGenerator) {
          var gen = window.__sharedUtils.CitationGenerator;
          var currentFormat = 'bibtex';
          const showCitation = () => {
            var citations = gen.generateAll(creature, false);
            var textEl = document.getElementById('cite-text');
            if (textEl) textEl.textContent = citations[currentFormat];
            citePopover.classList.remove('is-hidden');
          };
          citeBtn.onclick = function(e) {
            e.stopPropagation();
            if (!citePopover.classList.contains('is-hidden')) {
              citePopover.classList.add('is-hidden');
            } else {
              showCitation();
            }
          };
          citePopover.querySelectorAll('.cite-format-tab').forEach(function(tab) {
            tab.onclick = function() {
              citePopover.querySelectorAll('.cite-format-tab').forEach(function(t) { t.classList.remove('active'); });
              tab.classList.add('active');
              currentFormat = tab.getAttribute('data-format');
              showCitation();
            };
          });
          var copyBtn = document.getElementById('cite-copy-btn');
          if (copyBtn) {
            copyBtn.onclick = function() {
              var textEl = document.getElementById('cite-text');
              if (textEl) navigator.clipboard.writeText(textEl.textContent).then(function() {
                var orig = copyBtn.textContent;
                copyBtn.textContent = 'Copied';
                setTimeout(function() { copyBtn.textContent = orig; }, 2000);
              });
            };
          }
        }

        setText('detail-type', creature.type || 'Unknown');
        setText('detail-country', creature.country || 'Unknown');
        setText('detail-region', creature.region || 'Unknown');

        var badgeEl = document.getElementById('detail-source-badge');
        if (badgeEl && creature.source_quality) {
          var sq = creature.source_quality;
          var esq = window.__sharedUtils.escapeXml(sq);
          badgeEl.innerHTML = '<span class="source-badge source-badge--' + esq + '">' + sq.charAt(0).toUpperCase() + sq.slice(1) + '</span>';
        }

        var sourceTypeBadge = document.getElementById('detail-source-type-badge');
        if (sourceTypeBadge && creature.source_type) {
          var st = creature.source_type;
          var est = window.__sharedUtils.escapeXml(st);
          var stLabel = window.__sharedUtils.escapeXml(st.replace(/_/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); }));
          sourceTypeBadge.innerHTML = '<span class="source-type-badge source-type-badge--' + est + '">' + stLabel + '</span>';
        }

        var liveBadgeEl = document.getElementById('detail-live-badge');
        if (liveBadgeEl) {
          if (creature.living_tradition === true) {
            liveBadgeEl.innerHTML = '<span class="live-badge">Living Tradition</span>';
          } else if (creature.living_tradition === false) {
            liveBadgeEl.innerHTML = '<span class="live-badge live-badge--inactive">Historical</span>';
          } else {
            liveBadgeEl.innerHTML = '';
          }
        }

        var updatedEl = document.getElementById('detail-last-updated');
        if (updatedEl) {
          updatedEl.textContent = creature.lastUpdated || 'Unknown';
        }

        setText('detail-description', creature.description || 'No description available.');
        setText('detail-appearance', creature.appearance || 'Not documented.');
        setText('detail-behaviour', creature.behavior || 'Not documented.');
        setText('detail-habitat', creature.habitat || 'Not documented.');
        setText('detail-culture', creature.cultural_significance || 'Not documented.');
        setText('detail-funfact', creature.fun_fact || '');

        this.renderRelatedCreatures(creature.slug, creature.type, creature.region);
        this.renderCreatureStories(creature.slug, creature.name);

        content.classList.remove('is-hidden');
        document.title = creature.name + ' — Whispering Lore Bestiary';
        history.replaceState(null, '', '?creature=' + encodeURIComponent(creature.slug));

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

    var cached = this.cache || window.__FULL_CREATURES;
    if (cached) {
      var found = cached.find(function(c) { return c.slug === slug; });
      if (found) { renderCreature(found); return; }
    }

    var sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
    if (sh && sh.manifest) {
      sh.getItem('creatures', slug, function(err, item) { renderCreature(item); });
    } else {
      renderCreature(null);
    }
  }

  closeDetail() {
    var detail = document.getElementById('creature-detail');
    var pageHero = document.querySelector('.page-hero');
    var filterBar = document.querySelector('.filter-bar');
    var bestiaryLayout = document.querySelector('.bestiary-layout');

    if (detail) detail.classList.add('is-hidden');
    if (pageHero) pageHero.classList.remove('is-hidden');
    if (filterBar) filterBar.classList.remove('is-hidden');
    if (bestiaryLayout) bestiaryLayout.classList.remove('is-hidden');

    document.title = 'Bestiary — Whispering Lore';
    history.replaceState(null, '', window.location.pathname);
    window.scrollTo(0, parseInt(sessionStorage.getItem('wl-creatures-scroll')) || 0);
  }

  renderRelatedCreatures(slug, type, region) {
    var container = document.getElementById('related-creatures');
    if (!container) return;
    var all = this.cache || window.__FULL_CREATURES || [];
    if (!all.length) { container.classList.add('is-hidden'); return; }
    var related = [];
    related = all.filter(c => c.slug !== slug && c.type === type && c.region === region).slice(0, 6);
    if (!related.length) {
      related = all.filter(c => c.slug !== slug && c.type === type).slice(0, 6);
    }
    if (!related.length) { container.classList.add('is-hidden'); return; }
    container.classList.remove('is-hidden');
    var grid = container.querySelector('.related-grid');
    if (!grid) return;
    grid.innerHTML = '';
    related.forEach(c => {
      var a = document.createElement('a');
      a.href = '?creature=' + encodeURIComponent(c.slug);
      a.className = 'related-creature-card';
      a.innerHTML = '<span class="related-name">' + window.__sharedUtils.escapeXml(c.name) + '</span><span class="related-type">' + window.__sharedUtils.escapeXml(c.type || '') + '</span>';
      a.addEventListener('click', (e) => {
        e.preventDefault();
        history.pushState(null, '', '?creature=' + encodeURIComponent(c.slug));
        this.showDetail(c.slug);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      grid.appendChild(a);
    });
  }

  renderCreatureStories(slug, name) {
    var container = document.getElementById('creature-stories');
    if (!container) return;
    var stories = window.__STORIES_DATA || [];
    if (!stories.length) { container.classList.add('is-hidden'); return; }
    var slugNorm = window.__sharedUtils.normalizeName(slug);
    var nameNorm = window.__sharedUtils.normalizeName(name);
    var matching = stories.filter(s => {
      var refs = s.creatures || [];
      return refs.some(ref => {
        var refNorm = window.__sharedUtils.normalizeName(ref);
        return refNorm === slugNorm || refNorm === nameNorm;
      });
    }).slice(0, 6);
    if (!matching.length) { container.classList.add('is-hidden'); return; }
    container.classList.remove('is-hidden');
    var grid = container.querySelector('.stories-grid');
    if (!grid) return;
    grid.innerHTML = '';
    matching.forEach(s => {
      var a = document.createElement('a');
      var storySlug = s.slug || window.__sharedUtils.getSlug(s.title);
      a.href = 'stories.html?story=' + encodeURIComponent(storySlug);
      a.className = 'related-story-card';
      a.innerHTML = '<span class="related-story-title">' + window.__sharedUtils.escapeXml(s.title) + '</span><span class="related-story-country">' + window.__sharedUtils.escapeXml(s.country || '') + '</span>';
      grid.appendChild(a);
    });
  }

  renderSkeletons() {
    var grid = document.getElementById('bestiary-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (var i = 0; i < 24; i++) {
      var skel = document.createElement('div');
      skel.className = 'skeleton';
      skel.innerHTML = '<div class="skeleton-img"></div><div class="skeleton-body"><div class="skeleton-line"></div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>';
      grid.appendChild(skel);
    }
  }
}

const viewer = new CreaturesViewer();
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => viewer.init());
} else {
  viewer.init();
}
window.showDetail = (slug) => viewer.showDetail(slug);
