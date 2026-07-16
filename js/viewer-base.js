// js/viewer-base.js
export class BaseViewer {
  constructor(options) {
    this.type = options.type; 
    this.perPage = options.perPage || 24;
    this.gridId = options.gridId;
    this.emptyId = options.emptyId;
    this.loadMoreId = options.loadMoreId;
    this.countSelector = options.countSelector;
    
    this.state = {
      filters: {},
      sortBy: 'relevance',
      page: 1,
      filteredData: [],
      rafId: null
    };
    
    this.cache = null;
  }

  safeEl(id) { return document.getElementById(id); }

  getName(item) {
    return item.name || item.title || '';
  }

  updateCount() {
    var countEl = document.querySelector(this.countSelector);
    if (!countEl) return;
    if (this.state.rafId) cancelAnimationFrame(this.state.rafId);
    
    var currentText = countEl.textContent;
    var numMatch = currentText.match(/\d+/);
    var startVal = numMatch ? parseInt(numMatch[0]) : 0;
    
    var total = 0;
    var man = window.__SHARD_MANIFEST || (window.__sharedUtils && window.__sharedUtils.Shimmer && window.__sharedUtils.Shimmer.manifest);
    if (man && man[this.type] && man[this.type].total) {
      total = man[this.type].total;
    } else if (this.cache) {
      total = this.cache.length;
    }
    
    var endVal = this.state.filteredData ? this.state.filteredData.length : 0;
    var duration = 300;
    var startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = Math.floor(progress * (endVal - startVal) + startVal);
      countEl.textContent = 'Showing ' + current + ' of ' + total + ' ' + (this.type === 'creatures' ? 'creatures' : 'stories');
      if (progress < 1) {
        this.state.rafId = window.requestAnimationFrame(animate);
      } else {
        this.state.rafId = null;
      }
    };
    this.state.rafId = window.requestAnimationFrame(animate);
  }

  sortData() {
    if (!this.state.filteredData || this.state.filteredData.length === 0) return;
    var data = this.state.filteredData.slice();
    
    if (this.state.sortBy === 'alphabetical') {
      data.sort((a, b) => this.getName(a).localeCompare(this.getName(b)));
    } else if (this.state.sortBy === 'newest') {
      data.sort((a, b) => {
        var aDate = a.lastUpdated || '';
        var bDate = b.lastUpdated || '';
        return bDate.localeCompare(aDate);
      });
    }
    this.state.filteredData = data;
  }

  renderGrid(append, cardRenderer) {
    var grid = this.safeEl(this.gridId);
    var emptyState = this.safeEl(this.emptyId);
    var loadMoreBtn = this.safeEl(this.loadMoreId);
    if (!grid) return;

    if (this.state.filteredData.length === 0) {
      grid.innerHTML = '';
      grid.classList.add('is-hidden');
      if (emptyState) emptyState.classList.remove('is-hidden');
      if (loadMoreBtn) loadMoreBtn.classList.add('is-hidden');
      return;
    }

    grid.classList.remove('is-hidden');
    if (emptyState) emptyState.classList.add('is-hidden');
    if (!append) grid.innerHTML = '';

    var start = (this.state.page - 1) * this.perPage;
    var end = this.state.page * this.perPage;
    var slice = this.state.filteredData.slice(start, end);

    slice.forEach((item, index) => {
      // CRITICAL: Ensure correct this context for the renderer
      var card = cardRenderer.call(this, item, index);
      grid.appendChild(card);
    });

    if (loadMoreBtn) {
      loadMoreBtn.classList.toggle('is-hidden', this.state.filteredData.length <= this.state.page * this.perPage);
      var self = this;
      if (!loadMoreBtn._listener) {
        loadMoreBtn.addEventListener('click', function() {
          self.state.page++;
          self.renderGrid(true, self.cardRenderer);
        });
        loadMoreBtn._listener = true;
      }
    }
  }

  applyFilters() {
    var data = this.cache || (this.type === 'creatures' ? window.__FULL_CREATURES : window.__FULL_STORIES) || [];

    var filters = this.state.filters;
    var hasActive = false;
    for (var k in filters) {
      var v = filters[k];
      if (v !== null && v !== undefined && v !== '' && v !== 'all') { hasActive = true; break; }
    }

    if (!hasActive) {
      this.state.filteredData = data.slice();
    } else {
      this.state.filteredData = data.filter(function(item) {
        for (var dim in filters) {
          var val = filters[dim];
          if (val === null || val === undefined || val === '' || val === 'all') continue;

          if (dim === 'search') {
            var q = val.toLowerCase();
            var name = (item.name || item.title || '').toLowerCase();
            var type = (item.type || '').toLowerCase();
            var country = (item.country || '').toLowerCase();
            if (name.indexOf(q) === -1 && type.indexOf(q) === -1 && country.indexOf(q) === -1) return false;
            continue;
          }

          var itemVal = item[dim];
          if (!itemVal || itemVal.toLowerCase() !== val.toLowerCase()) return false;
        }
        return true;
      });
    }

    this.updateCount();
    this.sortData();
    this.state.page = 1;
    this.renderGrid(false, this.cardRenderer);
    this.calculateFacets();
    this.updateFilterChips();
  }

  calculateFacets() {
    var groups = document.querySelectorAll('.facet-group');
    var self = this;
    groups.forEach(function(group) {
      var dim = group.getAttribute('data-dimension');
      if (!dim) return;
      var counts = {};
      self.state.filteredData.forEach(function(item) {
        var val = item[dim];
        if (val) counts[val] = (counts[val] || 0) + 1;
      });
      var container = group.querySelector('.facet-options');
      if (!container) return;
      var sorted = Object.keys(counts).sort();
      var html = '';
      sorted.forEach(function(val) {
        var activeClass = (self.state.filters[dim] === val) ? 'active' : '';
        html += '<div class="facet-option ' + activeClass + '" data-dimension="' + window.__sharedUtils.escapeXml(dim) + '" data-value="' + window.__sharedUtils.escapeXml(val) + '">' +
                window.__sharedUtils.escapeXml(val) + ' <span class="facet-count">(' + counts[val] + ')</span></div>';
      });
      container.innerHTML = html;
    });
  }

  populateSelect(selectId, field) {
    var select = document.getElementById(selectId);
    if (!select || !this.cache) return;
    var values = {};
    this.cache.forEach(function(item) {
      var v = item[field];
      if (v && typeof v === 'string') { values[v] = true; }
    });
    var sorted = Object.keys(values).sort();
    if (sorted.length === 0) return;
    sorted.forEach(function(v) {
      var opt = document.createElement('option');
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
  }

  updateFilterChips() {
    var containers = document.querySelectorAll('.filter-chips-container, .active-filters');
    if (containers.length === 0) return;
    var html = '';
    for (var dim in this.state.filters) {
      var val = this.state.filters[dim];
      if (val && val !== 'all') {
        html += '<div class="filter-chip" data-dimension="' + dim + '" data-value="' + val + '">' +
                window.__sharedUtils.escapeXml(val) + ' <span class="chip-remove">&times;</span>' +
                '</div>';
      }
    }
    containers.forEach((container) => { container.innerHTML = html; });
  }

  getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
}
