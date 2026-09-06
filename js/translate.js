(function () {
  'use strict'

  // On-demand Gemini translation for non-native, non-English languages.
  // Server-side Netlify Function holds GEMINI_API_KEY. This module translates
  // chrome ([data-i18n]) + visible content in place, caches per-language in
  // localStorage, and falls back to the original text on failure (toast shown).

  var ENDPOINT = '/.netlify/functions/translate'
  var CACHE_PREFIX = 'wl:gemini:'
  var MAX_STRINGS = 200
  var MAX_STRING_LEN = 400
  var SKIP_SELECTOR = 'script,style,noscript,svg,canvas,[class*="language-menu"],[data-i18n],.card-cta a,button,input,label,select,textarea,nav a'
  var CONTENT_SELECTOR =
    '.content-grid,.card,article,#detail-content,.cd-page,.cd-sidelist,' +
    '.hero-excerpt,.feature-excerpt,.card-title,.card-summary,' +
    'section,main,p,h1,h2,h3,h4,h5,li,span,div'

  var activeLang = null
  var originalTexts = null

  function readCache(key) {
    try { var v = localStorage.getItem(CACHE_PREFIX + key); return v ? JSON.parse(v) : null } catch (e) { return null }
  }
  function writeCache(key, val) {
    try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(val)) } catch (e) { /* storage unavailable */ }
  }

  function callTranslate(target, strings, source) {
    var clean = []
    var idx = []
    strings.forEach(function (s, i) {
      var t = String(s).trim()
      if (t && t.length <= MAX_STRING_LEN) { clean.push(t); idx.push(i) }
    })
    if (!clean.length) return Promise.resolve([])

    var CHUNK_SIZE = 25
    var chunks = []
    for (var i = 0; i < clean.length; i += CHUNK_SIZE) {
      chunks.push({
        subClean: clean.slice(i, i + CHUNK_SIZE),
        subIdx: idx.slice(i, i + CHUNK_SIZE)
      })
    }

    var out = new Array(strings.length)
    var p = Promise.resolve()

    chunks.forEach(function (chunk) {
      p = p.then(function () {
        return fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ source: source || 'en', target: target, strings: chunk.subClean })
        }).then(function (r) {
          if (!r.ok) return r.text().then(function (t) { throw new Error('http ' + r.status + ': ' + t) })
          return r.json()
        }).then(function (data) {
          if (data && data.translations) {
            data.translations.forEach(function (t, k) {
              out[chunk.subIdx[k]] = t
            })
          }
        }).catch(function (err) {
          console.warn('Gemini chunk translate soft fallback:', err.message)
          if (err && err.message && (err.message.indexOf('503') !== -1 || err.message.indexOf('not_configured') !== -1 || err.message.indexOf('500') !== -1 || err.message.indexOf('502') !== -1)) {
            showToast('Live translation service temporarily unavailable. Displaying original text.')
          }
          // Graceful fallback: keep original strings for this chunk
          chunk.subClean.forEach(function (orig, k) {
            out[chunk.subIdx[k]] = orig
          })
        })
      })
    })

    return p.then(function () { return out })
  }

  function collectChrome() {
    var out = []
    var nodes = document.querySelectorAll('[data-i18n]')
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute('data-i18n')
      var txt = nodes[i].textContent.trim()
      if (k && txt) out.push({ node: nodes[i], key: k, text: txt })
    }
    var ph = document.querySelectorAll('[data-i18n-placeholder]')
    for (var p = 0; p < ph.length; p++) {
      var pk = ph[p].getAttribute('data-i18n-placeholder')
      var pt = ph[p].getAttribute('placeholder')
      if (pk && pt) out.push({ node: ph[p], key: pk, text: pt, isPlaceholder: true })
    }
    return out
  }

  function collectContent() {
    var seen = {}
    var out = []
    var nodes = document.querySelectorAll(CONTENT_SELECTOR)
    function add(el, txt) {
      if (!txt || !txt.trim()) return
      if (seen[el] === undefined) seen[el] = []
      seen[el].push(txt)
    }
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i]
      if (el.matches(SKIP_SELECTOR)) continue
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          var p = n.parentNode
          if (!p) return NodeFilter.FILTER_REJECT
          if (p.matches && p.matches('[data-i18n],.language-menu,' + SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT
          var hasEl = false
          for (var c = p.firstChild; c; c = c.nextSibling) {
            if (c.nodeType === 1) { hasEl = true; if (c !== n) break }
          }
          if (hasEl && n !== p.firstChild) return NodeFilter.FILTER_REJECT
          return n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        }
      })
      var n = walker.nextNode()
      while (n) { add(n.parentNode, n.textContent.trim()); n = walker.nextNode() }
    }
    return out
  }

  function translateNodes(items) {
    if (!items.length) return Promise.resolve()
    var unique = {}
    items.forEach(function (it) { if (it.text && unique[it.text] === undefined) unique[it.text] = it.text })
    var uniqArr = Object.keys(unique)
    var map = {}
    return findCached(uniqArr).then(function (cached) {
      var missing = []
      uniqArr.forEach(function (u) {
        if (cached[u] !== undefined && cached[u] !== null) map[u] = cached[u]
        else missing.push(u)
      })
      if (!missing.length) { applyToItems(items, map); return }
      return callTranslate(activeLang, missing).then(function (tr) {
        if (tr) {
          missing.forEach(function (u, i) { if (tr[i] !== undefined) map[u] = tr[i] })
          storeCached(missing, map)
        }
        applyToItems(items, map)
      })
    }).catch(function (err) {
      console.warn('translateNodes soft error:', err)
    })
  }

  var _cacheKey = function () { return 'str:' + activeLang }
  var _cacheStore = null
  function loadCacheMap() {
    if (_cacheStore === null) _cacheStore = readCache(_cacheKey()) || {}
    return _cacheStore
  }
  function findCached(arr) {
    var m = loadCacheMap()
    var hit = {}
    arr.forEach(function (u) { if (m[u]) hit[u] = m[u] })
    return Promise.resolve(hit)
  }
  function storeCached(arr, map) {
    var m = loadCacheMap()
    arr.forEach(function (u) { if (map[u]) m[u] = map[u] })
    writeCache(_cacheKey(), m)
  }

  function applyToItems(items, map) {
    items.forEach(function (it) {
      var v = map[it.text]
      if (v == null || v === it.text) return
      if (it.isPlaceholder) it.node.setAttribute('placeholder', v)
      else it.node.textContent = v
    })
  }

  function translateChrome() {
    var en = (window.__i18n && window.__i18n.en) ? window.__i18n.en : {}
    var cached = readCache('dict:' + activeLang) || {}

    var visibleKeys = []
    var nodes = document.querySelectorAll('[data-i18n]')
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute('data-i18n')
      if (k) visibleKeys.push(k)
    }
    var ph = document.querySelectorAll('[data-i18n-placeholder]')
    for (var p = 0; p < ph.length; p++) {
      var pk = ph[p].getAttribute('data-i18n-placeholder')
      if (pk) visibleKeys.push(pk)
    }
    var page = pageName()
    visibleKeys.push('title.' + page)
    visibleKeys.push('desc.' + page)

    var missing = visibleKeys.filter(function (k) { return cached[k] === undefined && en[k] !== undefined })
    if (!missing.length) {
      applyChromeDict(cached)
      return Promise.resolve()
    }
    var validPairs = []
    missing.forEach(function (k) {
      var v = en[k]
      if (v && v.indexOf('<') === -1) {
        validPairs.push({ key: k, val: v })
      } else if (v) {
        cached[k] = v
      }
    })
    if (!validPairs.length) {
      applyChromeDict(cached)
      return Promise.resolve()
    }
    var values = validPairs.map(function (p) { return p.val })
    return callTranslate(activeLang, values).then(function (tr) {
      if (tr) {
        validPairs.forEach(function (p, i) {
          if (tr[i] !== undefined) {
            cached[p.key] = tr[i]
          }
        })
        writeCache('dict:' + activeLang, cached)
      }
      applyChromeDict(cached)
    }).catch(function (err) {
      console.warn('translateChrome soft error:', err)
      applyChromeDict(cached)
    })
  }

  function applyChromeDict(dict) {
    document.documentElement.setAttribute('lang', activeLang)
    var nodes = document.querySelectorAll('[data-i18n]')
    for (var i = 0; i < nodes.length; i++) {
      var k = nodes[i].getAttribute('data-i18n')
      if (dict[k]) nodes[i].textContent = dict[k]
    }
    var ph = document.querySelectorAll('[data-i18n-placeholder]')
    for (var p = 0; p < ph.length; p++) {
      var pk = ph[p].getAttribute('data-i18n-placeholder')
      if (dict[pk]) ph[p].setAttribute('placeholder', dict[pk])
    }
    var tKey = 'title.' + pageName()
    if (dict[tKey]) document.title = dict[tKey]
    var meta = document.querySelector('meta[name="description"]')
    if (meta && dict['desc.' + pageName()]) meta.setAttribute('content', dict['desc.' + pageName()])
  }

  function pageName() {
    var p = (window.location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, '')
    return p || 'index'
  }

  function captureOriginal(items) {
    if (originalTexts) return
    originalTexts = []
    items.forEach(function (it) { originalTexts.push({ node: it.node, kind: it.isPlaceholder ? 'ph' : 'd', text: it.text }) })
  }

  function showToast(msg) {
    if (typeof document === 'undefined') return
    var existing = document.getElementById('wl-translate-toast')
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing)
    var toast = document.createElement('div')
    toast.id = 'wl-translate-toast'
    toast.className = 'translate-toast'
    toast.textContent = msg
    document.body.appendChild(toast)
    setTimeout(function () {
      toast.classList.add('is-visible')
    }, 20)
    setTimeout(function () {
      if (toast && toast.parentNode) {
        toast.classList.remove('is-visible')
        setTimeout(function () {
          if (toast && toast.parentNode) toast.parentNode.removeChild(toast)
        }, 300)
      }
    }, 4500)
  }

  function enable(code) {
    if (activeLang === code) return Promise.resolve()
    disable()
    activeLang = code
    try { localStorage.setItem('wl:active_gmlang', code) } catch (e) { /* storage unavailable */ }
    _cacheStore = null
    var chrome = collectChrome()
    var content = collectContent()
    captureOriginal(chrome)
    document.body.classList.add('gemini-active')
    document.documentElement.setAttribute('lang', code)
    window.__i18nLangGemini = code
    return translateChrome().then(function () {
      return translateNodes(chrome.concat(content)).catch(function (e) {
        console.warn('translateNodes soft error:', e)
      })
    }).catch(function (err) {
      console.warn('translate enable soft error:', err)
    }).then(function () { return code })
  }

  function disable() {
    if (!activeLang) return
    activeLang = null
    try { localStorage.removeItem('wl:active_gmlang') } catch (e) { /* storage unavailable */ }
    _cacheStore = null
    document.body.classList.remove('gemini-active')
    document.documentElement.removeAttribute('lang')
    if (originalTexts) {
      originalTexts.forEach(function (o) {
        if (o.node && o.node.isConnected) {
          if (o.kind === 'ph') o.node.setAttribute('placeholder', o.text)
          else if (o.node.textContent !== o.text) o.node.textContent = o.text
        }
      })
      originalTexts = null
    }
    var m = window.location.search.match(/[?&]gmlang=([A-Za-z-]+)/)
    if (m) {
      var url = window.location.pathname + window.location.search.replace(/[?&]gmlang=[A-Za-z-]+/, '').replace(/^&/, '?')
      try { window.history.replaceState(null, '', url) } catch (e) { /* noop */ }
    }
  }

  function isActive() { return !!activeLang }
  function getActive() { return activeLang }
  function setLangParam(code) {
    var url = window.location.pathname + window.location.search
    var clean = url.replace(/([?&])gmlang=[A-Za-z-]+/g, '$1').replace(/[?&]$/, '').replace(/[?]&/, '?')
    var sep = clean.indexOf('?') === -1 ? '?' : '&'
    clean = clean + sep + 'gmlang=' + code
    try { window.history.replaceState(null, '', clean) } catch (e) { /* noop */ }
  }

  function initAutoTranslate() {
    try {
      if (typeof window === 'undefined') return
      // If native mode is explicitly set in URL (?lang=sv), do not auto-run Gemini
      if (window.location.search.indexOf('lang=') !== -1) return
      var m = window.location.search.match(/[?&]gmlang=([A-Za-z-]+)/)
      var saved = m ? m[1] : localStorage.getItem('wl:active_gmlang')
      if (saved && saved !== 'en' && saved !== 'sv') {
        enable(saved)
      }
    } catch (e) { /* storage unavailable */ }
  }

  window.__translate = {
    enable: enable,
    disable: disable,
    isActive: isActive,
    getActive: getActive,
    setLangParam: setLangParam,
    _test: { MAX_STRINGS: MAX_STRINGS }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAutoTranslate)
    } else {
      initAutoTranslate()
    }
  }
})()
