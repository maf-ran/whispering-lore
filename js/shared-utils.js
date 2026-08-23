(function () {
  'use strict'

  function fetchJSON(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return res.json()
    })
  }

  function escapeXml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  function animateNumber(el, target, duration) {
    const start = 0
    let startTime = null
    if (!duration) duration = 1200

    function step(timestamp) {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * target)
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
    return (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  // Normalize names for matching (remove non-alphanumeric, lowercase)
  function normalizeName(str) {
    return (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
  }

  function toggleVisibility(el, show) {
    if (!el) return
    el.classList.toggle('is-hidden', !show)
  }

  function loreboxSet(key, val) {
    try {
      localStorage.setItem('lorebox_' + key, JSON.stringify(val))
    } catch (e) { /* ignore storage-quota/private-mode errors */ }
  }

  const LoreBox = {
    get: function (key) {
      let data
      try {
        data = localStorage.getItem('lorebox_' + key)
      } catch (e) {
        return []
      }
      if (!data) return []
      try {
        return JSON.parse(data)
      } catch (e) {
        return []
      }
    },
    add: function (key, item) {
      const list = this.get(key)
      if (!list.some((i) => i.id === item.id)) {
        list.push(item)
        loreboxSet(key, list)
      }
    },
    remove: function (key, id) {
      const list = this.get(key).filter((i) => i.id !== id)
      loreboxSet(key, list)
    },
    set: function (key, val) {
      loreboxSet(key, val)
    },
    toggle: function (key, item) {
      const list = this.get(key)
      const idx = list.findIndex((i) => i.id === item.id)
      if (idx > -1) {
        this.remove(key, item.id)
        return false
      } else {
        this.add(key, item)
        return true
      }
    },
  }

  // ── Shimmer: manifest-driven lazy shard loader with IndexedDB cache ──
  const Shimmer = {
    manifest: null,
    shards: {}, // {type: {regionName: [items]}}
    slugBatches: {}, // {type: {firstChar: [items]}}
    _dbReady: false,
    _dbQueue: [],

    // Open IndexedDB
    _openDB: function (callback) {
      if (typeof indexedDB === 'undefined') {
        callback(new Error('IDB unavailable'))
        return
      }
      if (this._dbReady) {
        callback(null, this._db)
        return
      }
      const self = this
      const req = indexedDB.open('whispering-lore', 1)
      req.onupgradeneeded = function (e) {
        const db = e.target.result
        if (!db.objectStoreNames.contains('shards')) {
          db.createObjectStore('shards', { keyPath: ['type', 'region'] })
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      }
      req.onsuccess = function (e) {
        self._db = e.target.result
        self._dbReady = true
        // Flush queued operations
        const q = self._dbQueue
        self._dbQueue = []
        q.forEach(function (fn) {
          fn()
        })
        callback(null, self._db)
      }
      req.onerror = function () {
        callback(new Error('IDB open failed'))
      }
    },

    // Store a shard in IDB
    _cacheShard: function (type, region, data) {
      const self = this
      this._openDB(function (err, db) {
        if (err) return
        const tx = db.transaction('shards', 'readwrite')
        tx.objectStore('shards').put({
          type: type,
          region: region,
          data: data,
          cachedAt: Date.now(),
        })
      })
    },

    // Retrieve a shard from IDB
    _getCachedShard: function (type, region, callback) {
      const self = this
      this._openDB(function (err, db) {
        if (err) {
          callback(err)
          return
        }
        const tx = db.transaction('shards', 'readonly')
        const req = tx.objectStore('shards').get([type, region])
        req.onsuccess = function () {
          callback(null, req.result ? req.result.data : null)
        }
        req.onerror = function () {
          callback(new Error('IDB read error'))
        }
      })
    },

    // Store manifest version in IDB
    _cacheManifest: function (manifest) {
      const self = this
      this._openDB(function (err, db) {
        if (err) return
        const tx = db.transaction('meta', 'readwrite')
        tx.objectStore('meta').put({ key: 'manifest', value: manifest })
        tx.objectStore('meta').put({ key: 'cachedAt', value: Date.now() })
      })
    },

    // Get cached manifest from IDB
    _getCachedManifest: function (callback) {
      const self = this
      this._openDB(function (err, db) {
        if (err) {
          callback(err)
          return
        }
        const tx = db.transaction('meta', 'readonly')
        const req = tx.objectStore('meta').get('manifest')
        req.onsuccess = function () {
          callback(null, req.result ? req.result.value : null)
        }
        req.onerror = function () {
          callback(new Error('IDB read error'))
        }
      })
    },

    // Get all cached shards for a type
    _getAllCachedShards: function (type, callback) {
      const self = this
      this._openDB(function (err, db) {
        if (err) {
          callback(err)
          return
        }
        const tx = db.transaction('shards', 'readonly')
        const req = tx.objectStore('shards').openCursor()
        const results = {}
        req.onsuccess = function (e) {
          const cursor = e.target.result
          if (cursor) {
            if (cursor.value.type === type) {
              results[cursor.value.region] = cursor.value.data
            }
            cursor.continue()
          } else {
            callback(null, results)
          }
        }
        req.onerror = function () {
          callback(new Error('IDB read error'))
        }
      })
    },

    // Fetch manifest.json
    loadManifest: function (callback) {
      if (this.manifest) {
        if (callback) callback(null)
        return Promise.resolve(this.manifest)
      }
      const self = this

      return new Promise((resolve, reject) => {
        // Check IDB cache first
        if (typeof indexedDB !== 'undefined') {
          this._getCachedManifest(function (err, cachedManifest) {
            if (!err && cachedManifest && cachedManifest.creatures) {
              self.manifest = cachedManifest
              // Refresh from network in background
              self._fetchManifestFromNetwork(function () {})
              if (callback) callback(null)
              resolve(self.manifest)
            } else {
              self._fetchManifestFromNetwork(function (err) {
                if (callback) callback(err)
                if (err) reject(err)
                else resolve(self.manifest)
              })
            }
          })
        } else {
          this._fetchManifestFromNetwork(function (err) {
            if (callback) callback(err)
            if (err) reject(err)
            else resolve(self.manifest)
          })
        }
      })
    },

    _fetchManifestFromNetwork: function (callback) {
      const self = this
      fetchJSON('data/sharded/manifest.json')
        .then(function (json) {
          self.manifest = json
          self._cacheManifest(json)
          callback(null)
        })
        .catch(function () {
          callback(new Error('no manifest'))
        })
    },

    // Load a region shard (type = 'creatures' or 'stories')
    // ── Native-language overlay merge (Phase 2) ──
    _overlayPromises: {},

    _loadOverlayFor: function (type, region, lang) {
      var key = lang + ':' + type + ':' + region
      if (!this._overlayPromises[key]) {
        var fileKey = region
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
        this._overlayPromises[key] = fetchJSON(
          'data/i18n/' + lang + '/' + type + '-' + fileKey + '.json'
        ).catch(function () {
          return null // missing overlay = untranslated region, not an error
        })
      }
      return this._overlayPromises[key]
    },

    // Delivery-time decoration: caches always hold raw EN shards; native
    // mode merges sparse slug-keyed patches onto COPIES handed to callers.
    _deliverShard: function (type, region, err, data, callback) {
      var lang = window.__sharedUtils.getNativeLang()
      if (err || !data || !lang) {
        callback(err, data)
        return
      }
      var self = this
      this._loadOverlayFor(type, region, lang).then(function (ov) {
        if (!ov || !ov.entries) {
          callback(err, data)
          return
        }
        var out = data.map(function (it) {
          var c = Object.assign({}, it)
          c._i18n = { lang: lang, partial: true }
          var patch = ov.entries[c.slug]
          if (patch) {
            Object.keys(patch).forEach(function (k) {
              c[k] = patch[k]
            })
          }
          return c
        })
        callback(err, out)
      }).catch(function () {
        callback(err, data)
      })
    },

    loadRegionShard: function (type, region, callback, forceRefresh) {
      if (!this.shards[type]) this.shards[type] = {}
      if (!forceRefresh && this.shards[type][region]) {
        this._deliverShard(
          type,
          region,
          null,
          this.shards[type][region],
          callback
        )
        return
      }

      // Coalesce concurrent requests for the same shard into one fetch
      const pendingKey = type + ':' + region
      this._pendingShardRequests = this._pendingShardRequests || {}
      if (!forceRefresh && this._pendingShardRequests[pendingKey]) {
        this._pendingShardRequests[pendingKey].push(callback)
        return
      }
      this._pendingShardRequests[pendingKey] = [callback]
      const self = this
      const settle = function (err, data) {
        const queued = self._pendingShardRequests[pendingKey] || []
        delete self._pendingShardRequests[pendingKey]
        for (let i = 0; i < queued.length; i++) queued[i](err, data)
      }

      const key = region
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      if (!key) {
        settle(new Error('bad region key'))
        return
      }

      // Check IDB cache first
      if (typeof indexedDB !== 'undefined') {
        this._getCachedShard(type, region, function (err, cached) {
          if (!err && cached) {
            self.shards[type][region] = cached
            self._deliverShard(type, region, null, cached, settle)
            // Refresh from network in background
            self._fetchShardFromNetwork(type, region, key, function () {})
            return
          }
          self._fetchShardFromNetwork(type, region, key, function (err2, data2) {
            self._deliverShard(type, region, err2, data2, settle)
          })
        })
      } else {
        this._fetchShardFromNetwork(type, region, key, function (err2, data2) {
          self._deliverShard(type, region, err2, data2, settle)
        })
      }
    },

    _fetchShardFromNetwork: function (type, region, key, callback) {
      const self = this
      fetchJSON(
        'data/sharded/' + type + '/by-region/' + key + '.json'
      )
        .then(function (data) {
          self.shards[type][region] = data
          self._cacheShard(type, region, data)
          callback(null, data)
        })
        .catch(function () {
          callback(new Error('shard fetch error'))
        })
    },

    // Load a slug batch (e.g. 'a', 'b')
    // Slug batches mix regions; decorate each entry via its region overlay.
    _deliverSlugBatch: function (type, err, data, callback) {
      var self = this
      var lang = err || !data || !data.length
        ? null
        : window.__sharedUtils.getNativeLang()
      if (!lang) { callback(err, data); return }
      var regions = []
      var seen = {}
      data.forEach(function (it) {
        if (it.region && !seen[it.region]) { seen[it.region] = true; regions.push(it.region) }
      })
      if (!regions.length) { callback(err, data); return }
      Promise.all(regions.map(function (r) {
        return self._loadOverlayFor(type, r, lang)
      })).then(function (ovs) {
        var byRegion = {}
        regions.forEach(function (r, i) {
          if (ovs[i] && ovs[i].entries) byRegion[r] = ovs[i]
        })
        var out = data.map(function (it) {
          var ov = byRegion[it.region]
          if (!ov) return it
          var c = Object.assign({}, it)
          c._i18n = { lang: lang, partial: true }
          var patch = ov.entries[c.slug]
          if (patch) {
            Object.keys(patch).forEach(function (k) {
              c[k] = patch[k]
            })
          }
          return c
        })
        callback(err, out)
      }).catch(function () {
        callback(err, data)
      })
    },

    loadSlugBatch: function (type, firstChar, callback) {
      if (!this.slugBatches[type]) this.slugBatches[type] = {}
      if (this.slugBatches[type][firstChar]) {
        // Non-native callers keep the original synchronous delivery.
        if (!window.__sharedUtils.getNativeLang()) { callback(null, this.slugBatches[type][firstChar]); return }
        this._deliverSlugBatch(type, null, this.slugBatches[type][firstChar], callback)
        return
      }
      const self = this
      fetchJSON(
        'data/sharded/' + type + '/by-slug/' + firstChar + '.json'
      )
        .then(function (data) {
          self.slugBatches[type][firstChar] = data
          self._deliverSlugBatch(type, null, data, callback)
        })
        .catch(function () {
          callback(new Error('slug fetch error'))
        })
    },

    // Load top N region shards and return their union
    loadTopRegions: function (type, n, callback) {
      const regions = Object.keys(this.manifest[type].regions)
      const top = regions.slice(0, n)
      if (top.length === 0) {
        callback(null, [])
        return
      }
      let pending = top.length
      let all = []
      const self = this
      top.forEach(function (r) {
        self.loadRegionShard(type, r, function (err, data) {
          if (data) all = all.concat(data)
          pending--
          if (pending === 0) callback(null, all)
        })
      })
    },

    // Single-item delivery: same overlay decoration as shards/batches.
    _deliverItem: function (type, err, item, callback) {
      var lang = err || !item || !item.region
        ? null
        : window.__sharedUtils.getNativeLang()
      if (!lang) { callback(err, item); return }
      var self = this
      this._loadOverlayFor(type, item.region, lang).then(function (ov) {
        if (!ov || !ov.entries) { callback(err, item); return }
        var c = Object.assign({}, item)
        c._i18n = { lang: lang, partial: true }
        var patch = ov.entries[c.slug]
        if (patch) {
          Object.keys(patch).forEach(function (k) {
            c[k] = patch[k]
          })
        }
        callback(err, c)
      }).catch(function () {
        callback(err, item)
      })
    },

    // Public single-item decoration for viewers rendering from raw caches.
    decorateItem: function (type, item, callback) {
      this._deliverItem(type, null, item, callback)
    },

    // Get a single item by slug, loading batch if needed
    getItem: function (type, slug, callback) {
      const deliver = (err, raw) => this._deliverItem(type, err, raw, callback)
      // Check already loaded shards
      const shards = this.shards[type] || {}
      for (const region in shards) {
        const items = shards[region]
        for (let i = 0; i < items.length; i++) {
          if (items[i].slug === slug) {
            deliver(null, items[i])
            return
          }
        }
      }
      // Check already loaded slug batches
      const batches = this.slugBatches[type] || {}
      for (const ch in batches) {
        const batch = batches[ch]
        for (let j = 0; j < batch.length; j++) {
          if (batch[j].slug === slug) {
            deliver(null, batch[j])
            return
          }
        }
      }
      // Need to load the batch
      const first = slug.replace(/^(the|a|an)-/, '')[0] || '_'
      const self = this
      this.loadSlugBatch(type, first, function (err, data) {
        if (err || !data) {
          callback(new Error('item not found: ' + slug))
          return
        }
        for (let k = 0; k < data.length; k++) {
          if (data[k].slug === slug) {
            self._deliverItem(type, null, data[k], callback)
            return
          }
        }
        callback(new Error('item not found: ' + slug))
      })
    },

    // Load ALL region shards for a type (for search/filter)
    loadAllShards: function (type, callback) {
      if (!this.manifest) {
        const self = this
        this.loadManifest(function () {
          self.loadAllShards(type, callback)
        })
        return
      }
      const allLoaded = this.shards[type] || {}
      const allRegions = Object.keys(this.manifest[type].regions)
      const missing = allRegions.filter(function (r) {
        return !allLoaded[r]
      })
      if (missing.length === 0) {
        callback(null, this.getAllItems(type))
        return
      }

      const self = this

      // Try loading from IDB cache first for instant response
      if (typeof indexedDB !== 'undefined') {
        this._getAllCachedShards(type, function (err, cached) {
          if (!err && cached) {
            if (!self.shards[type]) self.shards[type] = {}
            let cachedCount = 0
            const stillMissing = []
            missing.forEach(function (r) {
              if (cached[r]) {
                self.shards[type][r] = cached[r]
                cachedCount++
              } else {
                stillMissing.push(r)
              }
            })

            // If we got everything from cache, callback immediately
            if (cachedCount === missing.length) {
              callback(null, self.getAllItems(type))
              // Refresh all from network in background
              self._loadShardsFromNetwork(
                type,
                allRegions,
                function () {},
                true
              )
              return
            }

            // Some cached, some not — load the missing ones
            if (cachedCount > 0) {
              self._loadShardsFromNetwork(
                type,
                stillMissing,
                function (err, data) {
                  callback(err, self.getAllItems(type))
                }
              )
              return
            }
          }
          // Nothing cached — load all from network
          self._loadShardsFromNetwork(type, missing, callback)
        })
      } else {
        // No IDB support — load from network
        this._loadShardsFromNetwork(type, missing, callback)
      }
    },

    // Load specific shards from network
    _loadShardsFromNetwork: function (type, regions, callback, forceRefresh) {
      if (!regions || regions.length === 0) {
        callback(null, this.getAllItems(type))
        return
      }
      let pending = regions.length
      const self = this
      regions.forEach(function (r) {
        self.loadRegionShard(
          type,
          r,
          function () {
            pending--
            if (pending === 0) callback(null, self.getAllItems(type))
          },
          forceRefresh
        )
      })
    },

    // Get totals from manifest without loading all shards
    getTotals: function (type) {
      if (!this.manifest || !this.manifest[type]) return null
      return {
        total: this.manifest[type].total || 0,
        regions: this.manifest[type].regions || {},
        countries: this.manifest[type].countries || {},
        tribes: this.manifest[type].tribes || {},
      }
    },

    getAllItems: function (type) {
      let result = []
      const shards = this.shards[type] || {}
      for (const region in shards) result = result.concat(shards[region])
      if (result.length <= 1) return result
      const seen = {},
        deduped = []
      result.forEach(function (item) {
        const key = item.slug
        if (!seen[key]) {
          seen[key] = true
          deduped.push(item)
        }
      })
      return deduped
    },
  }

  window.__sharedUtils = {
    fetchJSON: fetchJSON,
    escapeXml: escapeXml,

    // ── Native language state (Phase 2: ?lang=sv) ──
    // Only languages with curated overlay content ship natively; any other
    // ?lang= value falls through to the Google Translate flow.
    getNativeLang: function () {
      try {
        var m = window.location.search.match(/[?&]lang=([A-Za-z-]+)/)
        if (!m) return null
        return ['sv'].indexOf(m[1]) !== -1 ? m[1] : null
      } catch (e) {
        return null
      }
    },

    isNative: function () {
      return this.getNativeLang() !== null
    },

    withLang: function (url, lang) {
      // only default when the argument is omitted; explicit null means "strip"
      if (lang === undefined) lang = this.getNativeLang()
      var hash = ''
      var hashIdx = url.indexOf('#')
      if (hashIdx !== -1) {
        hash = url.slice(hashIdx)
        url = url.slice(0, hashIdx)
      }
      url = url
        .replace(/([?&])lang=[^&]*/g, '$1')
        .replace(/\?&+/, '?')
        .replace(/&&+/g, '&')
        .replace(/[?&]$/, '')
      if (!lang) return url + hash
      var sep = url.indexOf('?') === -1 ? '?' : '&'
      return url + sep + 'lang=' + lang + hash
    },

    stripLangUrl: function (url) {
      return this.withLang(url, null)
    },

    // Muted "translation missing" marker for entries lacking sv coverage.
    i18nBadgeEl: function (entry) {
      if (!this.isNative()) return null
      if (!entry || !entry._i18n || !entry._i18n.partial) return null
      var el = document.createElement('span')
      el.className = 'i18n-pending'
      var lang = this.getNativeLang()
      var dict = lang && window.__i18n ? window.__i18n[lang] : null
      el.textContent = (dict && dict['badge.pending']) || 'översättning saknas'
      return el
    },


    animateNumber: animateNumber,
    getSlug: getSlug,
    normalizeName: normalizeName,
    toggleVisibility: toggleVisibility,
    LoreBox: LoreBox,
    Shimmer: Shimmer,

    // Create a region-themed SVG decorative placeholder
    placeholderSVG: function (label, region) {
      const symbols = {
        nordic: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛝᛞᛟ',
        celtic: '◇○□△▽☆◎●◆■▲▼★',
        eastAsian: '⛩☯❀⚘✿❁✾❃❊✤✥✦❋',
        african: '◉◈◆◇○●◎◐◑◒◓',
        pacific: '🌊⛵★☆☀☽⚓',
        slavic: '⨁⨀⨂⨄⨆⨉⨊⨋',
        mesoamerican: '▣◈◆◇◉◐◑○●',
        southAmerican: '✦✧★☆✶✷✸✹',
        default: '·✦·✧·✶·✷·✸',
      }
      const key = (region || '').toLowerCase().replace(/[^a-z]/g, '')
      let pool = symbols.default
      for (const k in symbols) {
        if (key.indexOf(k) !== -1) {
          pool = symbols[k]
          break
        }
      }
      const chars = []
      for (let i = 0; i < 12; i++)
        chars.push(pool[Math.floor(Math.random() * pool.length)])
      const first = label ? label.charAt(0).toUpperCase() : '·'
      return (
        '<svg viewBox="0 0 200 160" xmlns="http://www.w3.org/2000/svg">' +
        '<rect width="200" height="160" fill="none"/>' +
        '<text x="100" y="85" text-anchor="middle" dominant-baseline="central" font-size="48" font-family="Cinzel,serif" fill="rgba(153,27,27,0.08)" font-weight="600">' +
        escapeXml(first) +
        '</text>' +
        '<text x="100" y="25" text-anchor="middle" font-size="9" fill="rgba(153,27,27,0.06)" font-family="serif">' +
        escapeXml(chars.slice(0, 6).join(' ')) +
        '</text>' +
        '<text x="100" y="140" text-anchor="middle" font-size="9" fill="rgba(153,27,27,0.06)" font-family="serif">' +
        escapeXml(chars.slice(6, 12).join(' ')) +
        '</text>' +
        '</svg>'
      )
    },

    // Debounce a function call
    debounce: function (fn, ms) {
      let timer
      return function () {
        const ctx = this,
          args = arguments
        clearTimeout(timer)
        timer = setTimeout(function () {
          fn.apply(ctx, args)
        }, ms || 150)
      }
    },

    // Normalize creature type aliases to canonical forms
    TYPE_ALIAS_MAP: {
      dragon: 'dragon',
      'dragon-like': 'dragon',
      'sea-serpent': 'dragon',
      wyrm: 'dragon',
      drake: 'dragon',
      wyvern: 'dragon',
      'serpent-dragon': 'dragon',
      'water-dragon': 'dragon',
      'sky-dragon': 'dragon',
      ghost: 'ghost',
      phantom: 'ghost',
      spectre: 'ghost',
      wraith: 'ghost',
      'spirit-ghost': 'ghost',
      demon: 'demon',
      devil: 'demon',
      fiend: 'demon',
      'evil-spirit': 'demon',
      monster: 'monster',
      beast: 'monster',
      leviathan: 'monster',
      chimera: 'monster',
      goblin: 'goblin',
      hobgoblin: 'goblin',
      imp: 'goblin',
      fairy: 'fairy',
      faerie: 'fairy',
      fae: 'fairy',
      elf: 'fairy',
      pixie: 'fairy',
      sprite: 'fairy',
      undead: 'undead',
      zombie: 'undead',
      skeleton: 'undead',
      lich: 'undead',
      vampire: 'vampire',
      'vampiric-entity': 'vampire',
      werewolf: 'werewolf',
      lycanthrope: 'werewolf',
      wolfman: 'werewolf',
      'shape-shifter': 'shapeshifter',
      shapeshifter: 'shapeshifter',
      transformer: 'shapeshifter',
      giant: 'giant',
      ogre: 'giant',
      ettin: 'giant',
      jotunn: 'giant',
      cyclops: 'giant',
      troll: 'troll',
      'water-horse': 'water-horse',
      kelpie: 'water-horse',
      'each-uisge': 'water-horse',
      'water-spirit': 'water-spirit',
      merperson: 'water-spirit',
      mermaid: 'water-spirit',
      merman: 'water-spirit',
      siren: 'water-spirit',
      nymph: 'water-spirit',
      naiad: 'water-spirit',
      undine: 'water-spirit',
      'nature-spirit': 'nature-spirit',
      'forest-spirit': 'nature-spirit',
      'wood-spirit': 'nature-spirit',
      'tree-spirit': 'nature-spirit',
      dryad: 'nature-spirit',
      'household-spirit': 'household-spirit',
      domovoi: 'household-spirit',
      brownie: 'household-spirit',
      hob: 'household-spirit',
      'ancestor-spirit': 'ancestor-spirit',
      ancestor: 'ancestor-spirit',
      'animal-spirit': 'animal-spirit',
      totem: 'animal-spirit',
      guardian: 'guardian',
      'guardian-spirit': 'guardian',
      protector: 'guardian',
      deity: 'deity',
      god: 'deity',
      goddess: 'deity',
      'lesser-god': 'deity',
      trickster: 'trickster',
      'culture-hero': 'trickster',
      spirit: 'spirit',
      elemental: 'elemental',
      'air-elemental': 'elemental',
      'fire-elemental': 'elemental',
      'water-elemental': 'elemental',
      'earth-elemental': 'elemental',
    },

    normalizeType: function (rawType) {
      if (!rawType) return 'unknown'
      const key = rawType.toLowerCase().trim()
      return window.__sharedUtils.TYPE_ALIAS_MAP[key] || key
    },
  }

  // Auto-load manifest on pages that use shared-utils
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.__sharedUtils.Shimmer.loadManifest(function () {}).catch(function () {})
      initPageTransitions()
    })
  } else {
    window.__sharedUtils.Shimmer.loadManifest(function () {}).catch(function () {})
    initPageTransitions()
  }

  // Smooth cross-browser page transitions
  function initPageTransitions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    document.addEventListener('click', function (e) {
      const link = e.target.closest('a')
      if (!link) return
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0)
        return

      // Skip links inside story/creature cards — they open overlays
      if (link.closest('.story-card') || link.closest('.bestiary-card')) return

      const href = link.getAttribute('href')
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('http') ||
        href.startsWith('//')
      )
        return

      // Same-origin internal link
      e.preventDefault()
      document.body.classList.add('page-exit')
      if (window._pageTransitionTimer) clearTimeout(window._pageTransitionTimer)
      window._pageTransitionTimer = setTimeout(function () {
        window.location = href
      }, 200)
    })
  }
})()
