/* eslint-env node */
const { test, expect } = require('@playwright/test')

const BASE = 'http://localhost:3000'

// Hermetic Google Translate: element.js is stubbed so the suite never touches
// the real (deprecated) CDN. The stub records init config on window.__gtCalls
// and creates the hidden combo select our applyLanguage() drives, so the full
// user path (menu click → cookie → combo change) is exercised deterministically.
test.describe('language toggle', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'chromium-only suite')

    const gtStub =
      'window.__gtCalls = []; ' +
      'window.google = { translate: { TranslateElement: function (cfg, id) {' +
      '  window.__gtCalls.push({ cfg: cfg, id: id });' +
      '  var c = document.getElementById(id);' +
      '  if (c) { var s = document.createElement("select"); s.className = "goog-te-combo"; c.appendChild(s); }' +
      '} } };' +
      'window.google.translate.TranslateElement.InlineLayout = { SIMPLE: "SIMPLE" };' +
      // real element.js invokes the cb constant after defining its API
      'if (typeof window.__languageToggleInit === "function") window.__languageToggleInit();'
    await page.route('**/translate.google.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: gtStub })
    )
    await page.route('**/translate.googleapis.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
    )
    await page.route('**/translate-pa.googleapis.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
    )

    await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 })
  })

  test('toggle matches theme toggle size and sits below it in DOM order', async ({
    page,
  }) => {
    const tt = await page.locator('#theme-toggle').boundingBox()
    const lt = await page.locator('#lang-toggle').boundingBox()
    expect(Math.abs(tt.height - lt.height)).toBeLessThanOrEqual(2)
    expect(Math.abs(tt.width - lt.width)).toBeLessThanOrEqual(2)
    // header is a non-wrapping flex row: side-by-side, vertically aligned
    expect(Math.abs(tt.y - lt.y)).toBeLessThanOrEqual(4)
    const prevId = await page.evaluate(() => {
      var el = document.getElementById('lang-toggle')
      return el.previousElementSibling && el.previousElementSibling.id
    })
    expect(prevId).toBe('theme-toggle')
  })

  test('menu lists region headings and every language exactly once', async ({
    page,
  }) => {
    await page.click('#lang-toggle')
    await expect(page.locator('#language-menu')).toBeVisible()
    await expect(page.locator('#language-menu [data-code="sv"]')).toHaveText(
      'Svenska'
    )
    const codes = await page.$$eval('#language-menu [data-code]', (els) =>
      els.map((e) => e.getAttribute('data-code'))
    )
    expect(codes[0]).toBe('')
    const unique = new Set(codes.slice(1))
    expect(unique.size).toBe(codes.length - 1)
    expect(unique.size).toBeGreaterThanOrEqual(40)
    const headings = await page.$$eval(
      '#language-menu .language-menu-heading',
      (els) => els.length
    )
    expect(headings).toBeGreaterThanOrEqual(8)
    await page.keyboard.press('Escape')
    await expect(page.locator('#language-menu')).toBeHidden()
  })

  test('choosing Svenska enters native ?lang=sv mode without GT', async ({
    page,
  }) => {
    await page.click('#lang-toggle')
    await Promise.all([
      page.waitForLoadState('load'),
      page.click('#language-menu [data-code="sv"]'),
    ])
    // native mode is URL-driven: no googtrans cookie, no element.js injection
    expect(page.url()).toContain('lang=sv')
    const cookie = await page.evaluate(() => document.cookie)
    expect(cookie).not.toContain('googtrans=')
    await expect
      .poll(
        () => page.evaluate(() => (window.__gtCalls ? window.__gtCalls.length : 0)),
        { timeout: 10000 }
      )
      .toBe(0)
    const htmlLang = await page.evaluate(() => document.documentElement.lang)
    expect(htmlLang).toBe('sv')
    const homeLabel = await page.evaluate(() =>
      document.querySelector('nav a[data-i18n="nav.home"]').textContent
    )
    expect(homeLabel).toBe('HEM')
  })

  test('Original clears cookie and skips GT on the next load', async ({
    page,
  }) => {
    await page.click('#lang-toggle')
    // 'de' exercises the Google-Translate path; 'sv' is native mode now.
    await Promise.all([
      page.waitForLoadState('load'),
      page.click('#language-menu [data-code="de"]'),
    ])
    await expect
      .poll(
        () => page.evaluate(() => (window.__gtCalls ? window.__gtCalls.length : 0)),
        { timeout: 10000 }
      )
      .toBe(1)

    await page.click('#lang-toggle') // menu rebuilt lazily after reload
    await Promise.all([
      page.waitForLoadState('load'),
      page.click('#language-menu [data-code=""]'),
    ])
    const cleared = await page.evaluate(() =>
      document.cookie.includes('googtrans=')
    )
    expect(cleared).toBe(false)
    // no stored language → no element.js injection on this load
    await page.waitForTimeout(500)
    const scriptTags = await page.evaluate(() =>
      Array.from(document.scripts).filter((s) =>
        s.src.includes('translate.google.com')
      ).length
    )
    expect(scriptTags).toBe(0)
  })

  test('choice persists across navigation via cookie restore', async ({
    page,
  }) => {
    await page.click('#lang-toggle')
    await page.click('#language-menu [data-code="de"]')
    await page.goto(`${BASE}/about.html`, { waitUntil: 'load', timeout: 20000 })
    const restored = await page.evaluate(() => {
      const m = document.cookie.match(/googtrans=\/en\/([A-Za-z-]+)/)
      return m ? m[1] : null
    })
    expect(restored).toBe('de')
  })

  test('pages expose en/sv hreflang alternates', async ({ page }) => {
    const count = await page.$$eval('link[rel="alternate"][hreflang]', (els) =>
      els.filter((e) => e.hreflang === 'en' || e.hreflang === 'sv').length
    )
    expect(count).toBe(2)
    const svHref = await page.$eval('link[rel="alternate"][hreflang="sv"]', (e) => e.href)
    expect(svHref).toContain('lang=sv')
  })
})
