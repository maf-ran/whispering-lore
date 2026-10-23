(function () {
  'use strict'

  // Languages spoken across countries covered by the archive.
  // Labels are native names. Codes must be valid Google Translate codes.
  const GROUPS = [
    { label: 'Nordic', codes: [['sv', 'Svenska'], ['no', 'Norsk'], ['da', 'Dansk'], ['fi', 'Suomi'], ['is', 'Íslenska']] },
    { label: 'Celtic & Isles', codes: [['ga', 'Gaeilge'], ['gd', 'Gàidhlig'], ['cy', 'Cymraeg']] },
    { label: 'Western Europe', codes: [['de', 'Deutsch'], ['fr', 'Français'], ['nl', 'Nederlands'], ['it', 'Italiano'], ['es', 'Español'], ['pt', 'Português']] },
    { label: 'Eastern Europe', codes: [['pl', 'Polski'], ['cs', 'Čeština'], ['sk', 'Slovenčina'], ['hu', 'Magyar'], ['ro', 'Română'], ['bg', 'Български'], ['el', 'Ελληνικά'], ['ru', 'Русский'], ['uk', 'Українська']] },
    { label: 'Middle East & Central Asia', codes: [['tr', 'Türkçe'], ['ar', 'العربية'], ['he', 'עברית'], ['fa', 'فارسی'], ['ur', 'اردو']] },
    { label: 'South & East Asia', codes: [['hi', 'हिन्दी'], ['bn', 'বাংলা'], ['ta', 'தமிழ்'], ['zh-CN', '中文'], ['ja', '日本語'], ['ko', '한국어']] },
    { label: 'Southeast Asia', codes: [['th', 'ไทย'], ['vi', 'Tiếng Việt'], ['id', 'Bahasa Indonesia'], ['ms', 'Bahasa Melayu'], ['tl', 'Filipino']] },
    { label: 'Africa', codes: [['sw', 'Kiswahili'], ['yo', 'Yorùbá'], ['zu', 'isiZulu'], ['am', 'አማርኛ'], ['ha', 'Hausa']] },
    { label: 'Americas', codes: [['ht', 'Kreyòl ayisyen']] }
  ]

  function allCodes() {
    const out = []
    GROUPS.forEach(function (g) {
      g.codes.forEach(function (pair) { out.push(pair[0]) })
    })
    return out
  }

  function buildGoogtransValue(lang) {
    return '/en/' + lang
  }

  function setGoogtrans(lang) {
    document.cookie =
      'googtrans=' + buildGoogtransValue(lang) + ';path=/;max-age=31536000;samesite=lax'
  }

  function clearGoogtrans() {
    document.cookie = 'googtrans=;path=/;max-age=0'
  }

  function isNativeHere() {
    return !!(window.__sharedUtils &&
      window.__sharedUtils.isNative &&
      window.__sharedUtils.isNative())
  }

  function readGoogtrans() {
    if (isNativeHere()) return null
    const m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([A-Za-z]{2}(?:-[A-Z]{2})?)/)
    return m ? m[1] : null
  }

  const GLOBE_SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' +
    '</svg>'

  // Languages shipped with curated overlay content; routed to URL-only
  // native mode (?lang=xx) instead of the on-demand Gemini translation.
  // Keep in sync with shared-utils getNativeLangs().
  const NATIVE_LANGS = ['sv', 'no', 'es']

  let comboApplier = null
  let reloadFn = function () { window.location.reload() }
  let navigatorFn = function (url) { window.location.assign(url) }
  let NATIVE_COVERAGE_READY = false // flips true when sv coverage is meaningful
  let btn = null
  let menu = null

  // Native Swedish mode: URL-only state (?lang=sv), no GT cookie involved.
  function currentUrl() {
    return window.location.pathname + window.location.search
  }

  function stripLangFallback(u) {
    const q = u.indexOf('?')
    if (q === -1) return u
    const base = u.slice(0, q)
    const pairs = u.slice(q + 1).split('&').filter(function (p) {
      return p && p.indexOf('lang=') !== 0
    })
    return pairs.length ? base + '?' + pairs.join('&') : base
  }

  function chooseNative(lang) {
    if (lang === undefined) lang = NATIVE_LANGS[0]
    clearGoogtrans()
    if (window.__translate && window.__translate.disable) {
      window.__translate.disable()
    }
    const banner = document.querySelector('.goog-te-banner-frame')
    if (banner && banner.parentNode) banner.parentNode.removeChild(banner)
    let u
    if (window.__sharedUtils && window.__sharedUtils.withLang) {
      u = window.__sharedUtils.withLang(currentUrl(), lang)
    } else {
      u = currentUrl()
      u += (u.indexOf('?') === -1 ? '?' : '&') + 'lang=' + lang
    }
    closeMenu(false)
    navigatorFn(u)
  }

  function leaveNative() {
    let u
    if (window.__sharedUtils && window.__sharedUtils.stripLangUrl) {
      u = window.__sharedUtils.stripLangUrl(currentUrl())
    } else {
      u = stripLangFallback(currentUrl())
    }
    closeMenu(false)
    navigatorFn(u)
  }

  function buildMenu() {
    menu = document.createElement('div')
    menu.id = 'language-menu'
    menu.className = 'language-menu'
    menu.setAttribute('role', 'menu')
    menu.hidden = true

    function item(label, code) {
      const b = document.createElement('button')
      b.type = 'button'
      b.setAttribute('role', 'menuitem')
      b.setAttribute('data-code', code)
      b.textContent = label
      b.addEventListener('click', function () {
        choose(code)
      })
      return b
    }

    let active = readGoogtrans()
    if (!active && isNativeHere() && window.__sharedUtils && window.__sharedUtils.getNativeLang) {
      active = window.__sharedUtils.getNativeLang()
    }
    const gem = window.__translate && window.__translate.getActive ? window.__translate.getActive() : null
    if (gem) active = gem
    const originalItem = item('Original (English)', '')
    if (!active) originalItem.classList.add('is-active')
    menu.appendChild(originalItem)

    GROUPS.forEach(function (g) {
      const head = document.createElement('div')
      head.className = 'language-menu-heading'
      head.textContent = g.label
      menu.appendChild(head)
      g.codes.forEach(function (pair) {
        const el = item(pair[1], pair[0])
        if (active && pair[0] === active) el.classList.add('is-active')
        menu.appendChild(el)
      })
    })

    document.body.appendChild(menu)
    menu.addEventListener('keydown', onMenuKeydown)
  }

  function positionMenu() {
    const r = btn.getBoundingClientRect()
    menu.style.top = r.bottom + window.scrollY + 8 + 'px'
    const right = window.innerWidth - r.right - window.scrollX
    menu.style.right = Math.max(8, right) + 'px'
  }

  function menuItems() {
    return Array.prototype.slice.call(
      menu.querySelectorAll('[data-code]')
    )
  }

  function openMenu() {
    if (!menu) buildMenu()
    // Native-coverage dot may flip at runtime; keep the native items in sync.
    NATIVE_LANGS.forEach(function (langCode) {
      const el = menu.querySelector('[data-code="' + langCode + '"]')
      if (el) el.classList.toggle('is-native', !!NATIVE_COVERAGE_READY)
    })
    positionMenu()
    menu.hidden = false
    btn.setAttribute('aria-expanded', 'true')
    // Menu pattern: focus enters the menu, landing on the active language.
    const target = menu.querySelector('[data-code].is-active') || menu.querySelector('[data-code]')
    if (target) target.focus()
  }

  function onMenuKeydown(e) {
    if (!menu || menu.hidden) return
    const items = menuItems()
    if (!items.length) return
    const idx = items.indexOf(document.activeElement)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      items[(idx + 1) % items.length].focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      items[(idx - 1 + items.length) % items.length].focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      items[0].focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      items[items.length - 1].focus()
    } else if (e.key === 'Tab') {
      // Tab leaves the menu; close it and let natural order resume.
      closeMenu(false)
    }
  }

  function closeMenu(refocus) {
    if (!menu || menu.hidden) return
    menu.hidden = true
    btn.setAttribute('aria-expanded', 'false')
    if (refocus) btn.focus()
  }

  function choose(code) {
    if (NATIVE_LANGS.indexOf(code) !== -1) { chooseNative(code); return }
    if (code) {
      if (window.__translate && window.__translate.enable) {
        window.__translate.setLangParam(code)
        window.__translate.enable(code)
      } else {
        if (window.__translate && window.__translate.disable) {
          window.__translate.disable()
        }
        if (isNativeHere()) {
          const cleanUrl = window.__sharedUtils && window.__sharedUtils.stripLangUrl
            ? window.__sharedUtils.stripLangUrl(currentUrl())
            : stripLangFallback(currentUrl())
          setGoogtrans(code)
          closeMenu(false)
          navigatorFn(cleanUrl)
          return
        }
        applyLanguage(code)
      }
    } else resetToOriginal()
    closeMenu(false)
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu)
    menu = null
  }

  function onDocKeydown(e) {
    if (e.key === 'Escape') closeMenu(true)
  }

  function onDocClick(e) {
    if (!menu || menu.hidden) return
    if (menu.contains(e.target) || btn.contains(e.target)) return
    closeMenu(false)
  }

  function initUI() {
    const themeToggle = document.getElementById('theme-toggle')
    if (!themeToggle || document.getElementById('lang-toggle')) return

    btn = document.createElement('button')
    btn.id = 'lang-toggle'
    btn.className = 'lang-toggle'
    btn.type = 'button'
    btn.setAttribute('aria-label', 'Select language')
    btn.setAttribute('aria-haspopup', 'true')
    btn.setAttribute('aria-expanded', 'false')
    btn.innerHTML = GLOBE_SVG
    btn.addEventListener('click', function () {
      if (!menu || menu.hidden) openMenu()
      else closeMenu(true)
    })

    themeToggle.insertAdjacentElement('afterend', btn)
    buildMenu()
    document.addEventListener('keydown', onDocKeydown)
    document.addEventListener('click', onDocClick)

    // Auto-restore: a stored googtrans cookie only translates once element.js
    // is loaded, so returning visitors get their language back without a click.
    if (readGoogtrans()) ensureTranslate().catch(function () {})
  }

  let gtPromise = null

  function ensureTranslate() {
    if (gtPromise) return gtPromise
    gtPromise = new Promise(function (resolve, reject) {
      let settled = false
      let timeoutId = null
      const container = document.createElement('div')
      container.id = 'google_translate_element'
      container.style.display = 'none'
      container.hidden = true
      document.body.appendChild(container)

      function fail(err) {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        gtPromise = null
        // A blocked/unavailable GT CDN must not remove the language control;
        // native mode and the Gemini path still work without it.
        closeMenu(false)
        if (window.console && console.warn) console.warn('google translate unavailable:', err && err.message)
        reject(err)
      }

      window.__languageToggleInit = function () {
        if (settled) return
        try {
          if (window.google && window.google.translate && window.google.translate.TranslateElement) {
            new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: allCodes().join(','),
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
            }, 'google_translate_element')
          }
          settled = true
          clearTimeout(timeoutId)
          resolve(container)
        } catch (err) {
          fail(err)
        }
      }

      // No SRI pin: Google rotates this loader without notice and a stale hash
      // breaks translation for every visitor.
      const s = document.createElement('script')
      s.src = 'https://translate.google.com/translate_a/element.js?cb=__languageToggleInit'
      s.async = true
      s.onerror = function () { fail(new Error('element.js failed to load')) }
      document.head.appendChild(s)

      timeoutId = setTimeout(function () {
        // Slow CDN ≠ dead CDN: give up waiting quietly, keep the button, and
        // let the next interaction retry (gtPromise reset allows a fresh run).
        if (!settled) {
          settled = true
          clearTimeout(timeoutId)
          gtPromise = null
          resolve(container)
        }
      }, 12000)
    })
    return gtPromise
  }

  function applyLanguage(code) {
    setGoogtrans(code)
    if (comboApplier) { comboApplier(code); return }
    const combo = document.querySelector('.goog-te-combo')
    if (combo) {
      combo.value = code
      combo.dispatchEvent(new Event('change'))
    } else {
      reloadFn()
    }
  }

  function resetToOriginal() {
    clearGoogtrans()
    if (window.__translate && window.__translate.disable) {
      window.__translate.disable()
    }
    if (isNativeHere()) { leaveNative(); return }
    if (comboApplier) { comboApplier(''); return }
    const combo = document.querySelector('.goog-te-combo')
    if (combo) {
      combo.value = ''
      combo.dispatchEvent(new Event('change'))
    } else {
      reloadFn()
    }
  }

  function _resetForTests() {
    document.removeEventListener('keydown', onDocKeydown)
    document.removeEventListener('click', onDocClick)
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn)
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu)
    const gtContainer = document.getElementById('google_translate_element')
    if (gtContainer && gtContainer.parentNode) gtContainer.parentNode.removeChild(gtContainer)
    btn = null
    menu = null
    comboApplier = null
    reloadFn = function () { window.location.reload() }
    navigatorFn = function (url) { window.location.assign(url) }
    NATIVE_COVERAGE_READY = false
    gtPromise = null
    delete window.__languageToggleInit
    delete window.__translate
    clearGoogtrans()
  }

  window.__languageToggle = {
    GROUPS: GROUPS,
    NATIVE_LANGS: NATIVE_LANGS,
    allCodes: allCodes,
    buildGoogtransValue: buildGoogtransValue,
    setGoogtrans: setGoogtrans,
    clearGoogtrans: clearGoogtrans,
    readGoogtrans: readGoogtrans,
    initUI: initUI,
    ensureTranslate: ensureTranslate,
    applyLanguage: applyLanguage,
    resetToOriginal: resetToOriginal,
    chooseNative: chooseNative,
    leaveNative: leaveNative,
    choose: choose,
    get NATIVE_COVERAGE_READY() { return NATIVE_COVERAGE_READY },
    set NATIVE_COVERAGE_READY(v) { NATIVE_COVERAGE_READY = !!v },
    _resetForTests: _resetForTests,
    _setComboApplierForTests: function (fn) { comboApplier = fn },
    _setReloaderForTests: function (fn) { reloadFn = fn },
    _setNavigatorForTests: function (fn) { navigatorFn = fn }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI)
  } else {
    initUI()
  }
})()
