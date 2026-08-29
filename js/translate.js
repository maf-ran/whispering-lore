(function () {
  'use strict'

  // On-demand Gemini translation for non-native, non-English languages.
  //
  // The heavy lifting happens server-side in the Netlify Function
  // / .netlify/functions/translate (which holds GEMINI_API_KEY). This module:
  //   1. translates chrome ([data-i18n] keys) using a dict generated from the
  //      English UI dictionary,
  //   2. translates the visible content containers in place,
  //   3. caches everything per-language in localStorage,
  //   4. degrades gracefully to English if the function is not configured.

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
  var originalTexts = null // slug -> element -> original textContent (for revert)

  // ---- persistence (safe in private mode) ----
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
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: source || 'en', target: target, strings: clean })
    }).then(function (r) {
      if (r.status === 503 || r.status === 500) {
        return r.json().then(function (b) { throw new Error(b.error || ('http ' + r.status)) })
      }
      if (!r.ok) throw new Error('http ' + r.status)
      return r.json()
    }).then(function (data) {
      var out = new Array(strings.length)
      data.translations.forEach(function (t, k) { out[idx[k]] = t })
      return out
    })
  }

  // ---- collect visible text nodes to translate ----
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
          // only translate leaf-ish text (parent has no element children besides this text)
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
    // cache hit layer
    return findCached(uniqArr).then(function (cached) {
      var missing = []
      uniqArr.forEach(function (u) {
        if (cached[u] !== undefined && cached[u] !== null) map[u] = cached[u]
        else missing.push(u)
      })
      if (!missing.length) { applyToItems(items, map); return }
      return callTranslate(activeLang, missing).then(function (tr) {
        missing.forEach(function (u, i) { if (tr[i]) map[u] = tr[i] })
        storeCached(missing, map)
        applyToItems(items, map)
      })
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
    arr.forEach(function (u, i) { if (map[u]) m[u] = map[u] })
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

  // ---- chrome dictionary from English UI dict via Gemini ----
  function translateChrome() {
    var en = (window.__i18n && window.__i18n.en) ? window.__i18n.en : {}
    var sorted = Object.keys(en)
    if (!sorted.length) return Promise.resolve()
    var cached = readCache('dict:' + activeLang) || {}
    var missing = sorted.filter(function (k) { return cached[k] === undefined })
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
      validPairs.forEach(function (p, i) {
        if (tr && tr[i] !== undefined) {
          cached[p.key] = tr[i]
        }
      })
      writeCache('dict:' + activeLang, cached)
      applyChromeDict(cached)
    }).catch(function () {
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

  // ---- revert to original English ----
  function captureOriginal(items) {
    if (originalTexts) return
    originalTexts = []
    items.forEach(function (it) { originalTexts.push({ node: it.node, kind: it.isPlaceholder ? 'ph' : 'd', text: it.text }) })
  }

  // ---- lifecycle ----
  function enable(code) {
    if (activeLang === code) return Promise.resolve()
    disable()
    activeLang = code
    _cacheStore = null // load this language's cache map fresh
    // snapshot current visible state for revert
    var chrome = collectChrome()
    var content = collectContent()
    captureOriginal(chrome)
    document.body.classList.add('gemini-active')
    document.documentElement.setAttribute('lang', code)
    window.__i18nLangGemini = code
    return Promise.all([
      translateChrome().catch(function () {}),
      translateNodes(chrome.concat(content)).catch(function (e) {
        disable()
        throw e
      })
    ]).then(function () { return code })
  }

  function disable() {
    if (!activeLang) return
    activeLang = null
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

  window.__translate = {
    enable: enable,
    disable: disable,
    isActive: isActive,
    getActive: getActive,
    setLangParam: setLangParam,
    _test: { MAX_STRINGS: MAX_STRINGS }
  }
})()
