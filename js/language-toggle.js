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

  window.__languageToggle = {
    GROUPS: GROUPS,
    allCodes: allCodes,
    buildGoogtransValue: buildGoogtransValue,
    setGoogtrans: setGoogtrans,
    clearGoogtrans: clearGoogtrans,
    readGoogtrans: readGoogtrans
  }
})()
