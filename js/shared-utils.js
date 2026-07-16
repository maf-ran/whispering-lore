;(function () {
  'use strict'

  function escapeXml(str) {
    return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function safeText(str) {
    if (str == null) return '';
    var el = { textContent: String(str) };
    return el.textContent;
  }

  function animateNumber(el, target, duration) {
    var start = 0
    var startTime = null
    if (!duration) duration = 1200

    function step(timestamp) {
      if (!startTime) startTime = timestamp
      var progress = Math.min((timestamp - startTime) / duration, 1)
      var eased = 1 - Math.pow(1 - progress, 3)
      var current = Math.floor(eased * target)
      el.textContent = current
      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        el.textContent = target
      }
    }

    requestAnimationFrame(step)
  }


  function getSlug(text) {
    return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  // Normalize names for matching (remove non-alphanumeric, lowercase)
  function normalizeName(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function toggleVisibility(el, show) {
    if (!el) return
    el.classList.toggle('is-hidden', !show)
  }




  function loreboxSet(key, val) {
    try { localStorage.setItem('lorebox_' + key, JSON.stringify(val)); } catch (e) {}
  }

  var LoreBox = {
    get: function(key) {
      try { var data = localStorage.getItem('lorebox_' + key); } catch (e) { return []; }
      if (!data) return [];
      try { return JSON.parse(data); } catch (e) { return []; }
    },
    add: function(key, item) {
      var list = this.get(key);
      if (!list.some(i => i.id === item.id)) {
        list.push(item);
        loreboxSet(key, list);
      }
    },
    remove: function(key, id) {
      var list = this.get(key).filter(i => i.id !== id);
      loreboxSet(key, list);
    },
    set: function(key, val) {
      loreboxSet(key, val);
    },
    toggle: function(key, item) {
      var list = this.get(key);
      var idx = list.findIndex(i => i.id === item.id);
      if (idx > -1) {
        this.remove(key, item.id);
        return false;
      } else {
        this.add(key, item);
        return true;
      }
    }
  }

  // ── Shimmer: manifest-driven lazy shard loader with IndexedDB cache ──
  var Shimmer = {
    manifest: null,
    shards: {},      // {type: {regionName: [items]}}
    slugBatches: {}, // {type: {firstChar: [items]}}
    _dbReady: false,
    _dbQueue: [],

    // Open IndexedDB
    _openDB: function(callback) {
      if (this._dbReady) { callback(null, this._db); return; }
      var self = this;
      var req = indexedDB.open('whispering-lore', 1);
      req.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains('shards')) {
          db.createObjectStore('shards', { keyPath: ['type', 'region'] });
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      };
      req.onsuccess = function(e) {
        self._db = e.target.result;
        self._dbReady = true;
        // Flush queued operations
        var q = self._dbQueue;
        self._dbQueue = [];
        q.forEach(function(fn) { fn(); });
        callback(null, self._db);
      };
      req.onerror = function() { callback(new Error('IDB open failed')); };
    },

    // Store a shard in IDB
    _cacheShard: function(type, region, data) {
      var self = this;
      this._openDB(function(err, db) {
        if (err) return;
        var tx = db.transaction('shards', 'readwrite');
        tx.objectStore('shards').put({
          type: type,
          region: region,
          data: data,
          cachedAt: Date.now()
        });
      });
    },

    // Retrieve a shard from IDB
    _getCachedShard: function(type, region, callback) {
      var self = this;
      this._openDB(function(err, db) {
        if (err) { callback(err); return; }
        var tx = db.transaction('shards', 'readonly');
        var req = tx.objectStore('shards').get([type, region]);
        req.onsuccess = function() {
          callback(null, req.result ? req.result.data : null);
        };
        req.onerror = function() { callback(new Error('IDB read error')); };
      });
    },

    // Store manifest version in IDB
    _cacheManifest: function(manifest) {
      var self = this;
      this._openDB(function(err, db) {
        if (err) return;
        var tx = db.transaction('meta', 'readwrite');
        tx.objectStore('meta').put({ key: 'manifest', value: manifest });
        tx.objectStore('meta').put({ key: 'cachedAt', value: Date.now() });
      });
    },

    // Get cached manifest from IDB
    _getCachedManifest: function(callback) {
      var self = this;
      this._openDB(function(err, db) {
        if (err) { callback(err); return; }
        var tx = db.transaction('meta', 'readonly');
        var req = tx.objectStore('meta').get('manifest');
        req.onsuccess = function() {
          callback(null, req.result ? req.result.value : null);
        };
        req.onerror = function() { callback(new Error('IDB read error')); };
      });
    },

    // Get all cached shards for a type
    _getAllCachedShards: function(type, callback) {
      var self = this;
      this._openDB(function(err, db) {
        if (err) { callback(err); return; }
        var tx = db.transaction('shards', 'readonly');
        var req = tx.objectStore('shards').openCursor();
        var results = {};
        req.onsuccess = function(e) {
          var cursor = e.target.result;
          if (cursor) {
            if (cursor.value.type === type) {
              results[cursor.value.region] = cursor.value.data;
            }
            cursor.continue();
          } else {
            callback(null, results);
          }
        };
        req.onerror = function() { callback(new Error('IDB read error')); };
      });
    },

    // Fetch manifest.json
    loadManifest: function(callback) {
      if (this.manifest) { 
        if (callback) callback(null); 
        return Promise.resolve(this.manifest); 
      }
      var self = this;

      return new Promise((resolve, reject) => {
        // Check IDB cache first
        if (typeof indexedDB !== 'undefined') {
          this._getCachedManifest(function(err, cachedManifest) {
            if (!err && cachedManifest && cachedManifest.creatures) {
              self.manifest = cachedManifest;
              // Refresh from network in background
              self._fetchManifestFromNetwork(function() {});
              if (callback) callback(null);
              resolve(self.manifest);
            } else {
              self._fetchManifestFromNetwork(function(err) {
                if (callback) callback(err);
                if (err) reject(err); else resolve(self.manifest);
              });
            }
          });
        } else {
          this._fetchManifestFromNetwork(function(err) {
            if (callback) callback(err);
            if (err) reject(err); else resolve(self.manifest);
          });
        }
      });
    },

    _fetchManifestFromNetwork: function(callback) {
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/sharded/manifest.json', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            var json = JSON.parse(xhr.responseText);
            self.manifest = json;
            self._cacheManifest(json);
            callback(null);
          } catch (e) { callback(new Error('bad manifest')); }
        } else { callback(new Error('no manifest')); }
      };
      xhr.onerror = function() { callback(new Error('no manifest')); };
      xhr.send();
    },

    // Load a region shard (type = 'creatures' or 'stories')
    loadRegionShard: function(type, region, callback, forceRefresh) {
      if (!this.shards[type]) this.shards[type] = {};
      if (!forceRefresh && this.shards[type][region]) { callback(null, this.shards[type][region]); return; }
      var self = this;
      var key = region.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!key) { callback(new Error('bad region key')); return; }

      // Check IDB cache first
      if (typeof indexedDB !== 'undefined') {
        this._getCachedShard(type, region, function(err, cached) {
          if (!err && cached) {
            self.shards[type][region] = cached;
            callback(null, cached);
            // Refresh from network in background
            self._fetchShardFromNetwork(type, region, key, function() {});
            return;
          }
          self._fetchShardFromNetwork(type, region, key, callback);
        });
      } else {
        this._fetchShardFromNetwork(type, region, key, callback);
      }
    },

    _fetchShardFromNetwork: function(type, region, key, callback) {
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/sharded/' + type + '/by-region/' + key + '.json', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            self.shards[type][region] = data;
            self._cacheShard(type, region, data);
            callback(null, data);
          } catch (e) { callback(new Error('bad shard data')); }
        } else { callback(new Error('shard not found: ' + region)); }
      };
      xhr.onerror = function() { callback(new Error('shard fetch error')); };
      xhr.send();
    },

    // Load a slug batch (e.g. 'a', 'b')
    loadSlugBatch: function(type, firstChar, callback) {
      if (!this.slugBatches[type]) this.slugBatches[type] = {};
      if (this.slugBatches[type][firstChar]) { callback(null, this.slugBatches[type][firstChar]); return; }
      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'data/sharded/' + type + '/by-slug/' + firstChar + '.json', true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            self.slugBatches[type][firstChar] = data;
            callback(null, data);
          } catch (e) { callback(new Error('bad slug data')); }
        } else { callback(new Error('slug batch not found: ' + firstChar)); }
      };
      xhr.onerror = function() { callback(new Error('slug fetch error')); };
      xhr.send();
    },

    // Load top N region shards and return their union
    loadTopRegions: function(type, n, callback) {
      var regions = Object.keys(this.manifest[type].regions);
      var top = regions.slice(0, n);
      if (top.length === 0) { callback(null, []); return; }
      var pending = top.length;
      var all = [];
      var self = this;
      top.forEach(function(r) {
        self.loadRegionShard(type, r, function(err, data) {
          if (data) all = all.concat(data);
          pending--;
          if (pending === 0) callback(null, all);
        });
      });
    },

    // Get a single item by slug, loading batch if needed
    getItem: function(type, slug, callback) {
      // Check already loaded shards
      var shards = this.shards[type] || {};
      for (var region in shards) {
        var items = shards[region];
        for (var i = 0; i < items.length; i++) {
          if (items[i].slug === slug) { callback(null, items[i]); return; }
        }
      }
      // Check already loaded slug batches
      var batches = this.slugBatches[type] || {};
      for (var ch in batches) {
        var batch = batches[ch];
        for (var j = 0; j < batch.length; j++) {
          if (batch[j].slug === slug) { callback(null, batch[j]); return; }
        }
      }
      // Need to load the batch
      var first = slug.replace(/^(the|a|an)-/, '')[0] || '_';
      var self = this;
      this.loadSlugBatch(type, first, function(err, data) {
        if (err || !data) { callback(new Error('item not found: ' + slug)); return; }
        for (var k = 0; k < data.length; k++) {
          if (data[k].slug === slug) { callback(null, data[k]); return; }
        }
        callback(new Error('item not found: ' + slug));
      });
    },

    // Load ALL region shards for a type (for search/filter)
    loadAllShards: function(type, callback) {
      if (!this.manifest) {
        var self = this;
        this.loadManifest(function() {
          self.loadAllShards(type, callback);
        });
        return;
      }
      var allLoaded = this.shards[type] || {};
      var allRegions = Object.keys(this.manifest[type].regions);
      var missing = allRegions.filter(function(r) { return !allLoaded[r]; });
      if (missing.length === 0) { callback(null, this.getAllItems(type)); return; }

      var self = this;

      // Try loading from IDB cache first for instant response
      if (typeof indexedDB !== 'undefined') {
        this._getAllCachedShards(type, function(err, cached) {
          if (!err && cached) {
            if (!self.shards[type]) self.shards[type] = {};
            var cachedCount = 0;
            var stillMissing = [];
            missing.forEach(function(r) {
              if (cached[r]) {
                self.shards[type][r] = cached[r];
                cachedCount++;
              } else {
                stillMissing.push(r);
              }
            });

            // If we got everything from cache, callback immediately
            if (cachedCount === missing.length) {
              callback(null, self.getAllItems(type));
              // Refresh all from network in background
              self._loadShardsFromNetwork(type, allRegions, function() {}, true);
              return;
            }

            // Some cached, some not — load the missing ones
            if (cachedCount > 0) {
              self._loadShardsFromNetwork(type, stillMissing, function(err, data) {
                callback(err, self.getAllItems(type));
              });
              return;
            }
          }
          // Nothing cached — load all from network
          self._loadShardsFromNetwork(type, missing, callback);
        });
      } else {
        // No IDB support — load from network
        this._loadShardsFromNetwork(type, missing, callback);
      }
    },

    // Load specific shards from network
    _loadShardsFromNetwork: function(type, regions, callback, forceRefresh) {
      if (!regions || regions.length === 0) {
        callback(null, this.getAllItems(type));
        return;
      }
      var pending = regions.length;
      var self = this;
      regions.forEach(function(r) {
        self.loadRegionShard(type, r, function() {
          pending--;
          if (pending === 0) callback(null, self.getAllItems(type));
        }, forceRefresh);
      });
    },

    // Get totals from manifest without loading all shards
    getTotals: function(type) {
      if (!this.manifest || !this.manifest[type]) return null;
      return {
        total: this.manifest[type].total || 0,
        regions: this.manifest[type].regions || {},
        countries: this.manifest[type].countries || {},
        tribes: this.manifest[type].tribes || {}
      };
    },

    getAllItems: function(type) {
      var result = [];
      var shards = this.shards[type] || {};
      for (var region in shards) result = result.concat(shards[region]);
      if (result.length <= 1) return result;
      var nameField = type === 'stories' ? 'title' : 'name';
      var seen = {}, deduped = [];
      result.forEach(function(item) {
        var key = item[nameField];
        if (!seen[key]) { seen[key] = true; deduped.push(item); }
      });
      return deduped;
    }
  };

  window.__sharedUtils = {
    escapeXml: escapeXml,
    safeText: safeText,
    animateNumber: animateNumber,
    getSlug: getSlug,
    normalizeName: normalizeName,
    toggleVisibility: toggleVisibility,
    LoreBox: LoreBox,
    Shimmer: Shimmer,

    // Create a region-themed SVG decorative placeholder
    placeholderSVG: function(label, region) {
      var symbols = {
        nordic: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛝᛞᛟ',
        celtic: '◇○□△▽☆◎●◆■▲▼★',
        eastAsian: '⛩☯❀⚘✿❁✾❃❊✤✥✦❋',
        african: '◉◈◆◇○●◎◐◑◒◓',
        pacific: '🌊⛵★☆☀☽⚓',
        slavic: '⨁⨀⨂⨄⨆⨉⨊⨋',
        mesoamerican: '▣◈◆◇◉◐◑○●',
        southAmerican: '✦✧★☆✶✷✸✹',
        default: '·✦·✧·✶·✷·✸'
      };
      var key = (region || '').toLowerCase().replace(/[^a-z]/g, '');
      var pool = symbols.default;
      for (var k in symbols) {
        if (key.indexOf(k) !== -1) { pool = symbols[k]; break; }
      }
      var chars = [];
      for (var i = 0; i < 12; i++) chars.push(pool[Math.floor(Math.random() * pool.length)]);
      var first = label ? label.charAt(0).toUpperCase() : '·';
      return '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="200" height="160" fill="none"/>' +
        '<text x="100" y="85" text-anchor="middle" dominant-baseline="central" font-size="48" font-family="Cinzel,serif" fill="rgba(153,27,27,0.08)" font-weight="600">' + escapeXml(first) + '</text>' +
        '<text x="100" y="25" text-anchor="middle" font-size="9" fill="rgba(153,27,27,0.06)" font-family="serif">' + escapeXml(chars.slice(0,6).join(' ')) + '</text>' +
        '<text x="100" y="140" text-anchor="middle" font-size="9" fill="rgba(153,27,27,0.06)" font-family="serif">' + escapeXml(chars.slice(6,12).join(' ')) + '</text>' +
        '</svg>';
    },

    // Debounce a function call
    debounce: function(fn, ms) {
      var timer;
      return function() {
        var ctx = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function() { fn.apply(ctx, args); }, ms || 150);
      };
    },

    // Normalize creature type aliases to canonical forms
    TYPE_ALIAS_MAP: {
      'dragon': 'dragon', 'dragon-like': 'dragon', 'sea-serpent': 'dragon', 'wyrm': 'dragon',
      'drake': 'dragon', 'wyvern': 'dragon', 'serpent-dragon': 'dragon', 'water-dragon': 'dragon',
      'sky-dragon': 'dragon', 'ghost': 'ghost', 'phantom': 'ghost', 'spectre': 'ghost',
      'wraith': 'ghost', 'spirit-ghost': 'ghost', 'demon': 'demon', 'devil': 'demon',
      'fiend': 'demon', 'evil-spirit': 'demon', 'monster': 'monster', 'beast': 'monster',
      'leviathan': 'monster', 'chimera': 'monster', 'goblin': 'goblin', 'hobgoblin': 'goblin',
      'imp': 'goblin', 'fairy': 'fairy', 'faerie': 'fairy', 'fae': 'fairy', 'elf': 'fairy',
      'pixie': 'fairy', 'sprite': 'fairy', 'undead': 'undead', 'zombie': 'undead',
      'skeleton': 'undead', 'lich': 'undead', 'vampire': 'vampire', 'vampiric-entity': 'vampire',
      'werewolf': 'werewolf', 'lycanthrope': 'werewolf', 'wolfman': 'werewolf',
      'shape-shifter': 'shapeshifter', 'shapeshifter': 'shapeshifter', 'transformer': 'shapeshifter',
      'giant': 'giant', 'ogre': 'giant', 'ettin': 'giant', 'jotunn': 'giant', 'cyclops': 'giant',
      'troll': 'troll', 'water-horse': 'water-horse', 'kelpie': 'water-horse', 'each-uisge': 'water-horse',
      'water-spirit': 'water-spirit', 'merperson': 'water-spirit', 'mermaid': 'water-spirit',
      'merman': 'water-spirit', 'siren': 'water-spirit', 'nymph': 'water-spirit', 'naiad': 'water-spirit',
      'undine': 'water-spirit', 'nature-spirit': 'nature-spirit', 'forest-spirit': 'nature-spirit',
      'wood-spirit': 'nature-spirit', 'tree-spirit': 'nature-spirit', 'dryad': 'nature-spirit',
      'household-spirit': 'household-spirit', 'domovoi': 'household-spirit', 'brownie': 'household-spirit',
      'hob': 'household-spirit', 'ancestor-spirit': 'ancestor-spirit', 'ancestor': 'ancestor-spirit',
      'animal-spirit': 'animal-spirit', 'totem': 'animal-spirit', 'guardian': 'guardian',
      'guardian-spirit': 'guardian', 'protector': 'guardian', 'deity': 'deity', 'god': 'deity',
      'goddess': 'deity', 'lesser-god': 'deity', 'trickster': 'trickster', 'culture-hero': 'trickster',
      'spirit': 'spirit', 'elemental': 'elemental', 'air-elemental': 'elemental',
      'fire-elemental': 'elemental', 'water-elemental': 'elemental', 'earth-elemental': 'elemental'
    },

    normalizeType: function(rawType) {
      if (!rawType) return 'unknown';
      var key = rawType.toLowerCase().trim();
      return window.__sharedUtils.TYPE_ALIAS_MAP[key] || key;
    }
  }
})()

// Auto-load manifest on pages that use shared-utils
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    window.__sharedUtils.Shimmer.loadManifest(function() {});
    initPageTransitions();
  });
} else {
  window.__sharedUtils.Shimmer.loadManifest(function() {});
  initPageTransitions();
}

// Smooth cross-browser page transitions
function initPageTransitions() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('click', function(e) {
    var link = e.target.closest('a');
    if (!link) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;

    // Skip links inside story/creature cards — they open overlays
    if (link.closest('.story-card') || link.closest('.bestiary-card')) return;

    var href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http') || href.startsWith('//')) return;

    // Same-origin internal link
    e.preventDefault();
    document.body.classList.add('page-exit');
    if (window._pageTransitionTimer) clearTimeout(window._pageTransitionTimer);
    window._pageTransitionTimer = setTimeout(function() { window.location = href; }, 200);
  });
}