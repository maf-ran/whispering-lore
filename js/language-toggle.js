(function () {
  'use strict'

  // Languages spoken across countries covered by the archive.
  // Labels are native names. Codes must be valid Google Translate codes.
  var GROUPS = [
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
    var out = []
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

  function readGoogtrans() {
    var m = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([A-Za-z]{2}(?:-[A-Z]{2})?)/)
    return m ? m[1] : null
  }

  var GLOBE_SVG =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>' +
    '</svg>'

  var comboApplier = null
  var btn = null
  var menu = null

  function buildMenu() {
    menu = document.createElement('div')
    menu.id = 'language-menu'
    menu.className = 'language-menu'
    menu.setAttribute('role', 'menu')
    menu.hidden = true

    function item(label, code) {
      var b = document.createElement('button')
      b.type = 'button'
      b.setAttribute('role', 'menuitem')
      b.setAttribute('data-code', code)
      b.textContent = label
      b.addEventListener('click', function () {
        choose(code)
      })
      return b
    }

    var active = readGoogtrans()
    var originalItem = item('Original (English)', '')
    if (!active) originalItem.classList.add('is-active')
    menu.appendChild(originalItem)

    GROUPS.forEach(function (g) {
      var head = document.createElement('div')
      head.className = 'language-menu-heading'
      head.textContent = g.label
      menu.appendChild(head)
      g.codes.forEach(function (pair) {
        var el = item(pair[1], pair[0])
        if (active && pair[0] === active) el.classList.add('is-active')
        menu.appendChild(el)
      })
    })

    document.body.appendChild(menu)
  }

  function positionMenu() {
    var r = btn.getBoundingClientRect()
    menu.style.top = r.bottom + window.scrollY + 8 + 'px'
    var right = window.innerWidth - r.right - window.scrollX
    menu.style.right = Math.max(8, right) + 'px'
  }

  function openMenu() {
    if (!menu) buildMenu()
    positionMenu()
    menu.hidden = false
    btn.setAttribute('aria-expanded', 'true')
  }

  function closeMenu(refocus) {
    if (!menu || menu.hidden) return
    menu.hidden = true
    btn.setAttribute('aria-expanded', 'false')
    if (refocus) btn.focus()
  }

  function choose(code) {
    if (code) {
      setGoogtrans(code)
      if (comboApplier) comboApplier(code)
    } else {
      clearGoogtrans()
      if (comboApplier) comboApplier('')
    }
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
    var themeToggle = document.getElementById('theme-toggle')
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
  }

  function _resetForTests() {
    if (btn && btn.parentNode) btn.parentNode.removeChild(btn)
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu)
    btn = null
    menu = null
    comboApplier = null
    clearGoogtrans()
  }

  window.__languageToggle = {
    GROUPS: GROUPS,
    allCodes: allCodes,
    buildGoogtransValue: buildGoogtransValue,
    setGoogtrans: setGoogtrans,
    clearGoogtrans: clearGoogtrans,
    readGoogtrans: readGoogtrans,
    initUI: initUI,
    _resetForTests: _resetForTests,
    _setComboApplierForTests: function (fn) { comboApplier = fn }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI)
  } else {
    initUI()
  }
})()
