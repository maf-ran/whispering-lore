/* eslint-env node */
const { test, expect } = require('@playwright/test')

const BASE = 'http://localhost:3000'

// On-demand Gemini translation behind the Netlify Function. The function holds
// the API key server-side, so the browser suite stubs that same-origin route
// and asserts the full user path (menu click -> POST / .netlify/functions/translate
// -> chrome + visible content swapped -> html lang set).
test.describe('gemini on-demand translate', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'chromium-only suite')

    await page.route('**/.netlify/functions/translate**', async (route) => {
      const post = route.request()
      const body = post.postDataJSON ? post.postDataJSON() : JSON.parse(post.postData() || '{}')
      const strings = (body && body.strings) || []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          translations: strings.map((s) => `TR:${s}`)
        }),
      })
    })

    await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 })
  })

  test('choosing a non-native language translates chrome via the function', async ({
    page,
  }) => {
    const reqBodies = []
    page.on('request', (r) => {
      if (r.url().includes('.netlify/functions/translate')) {
        reqBodies.push(JSON.parse(r.postData() || '{}'))
      }
    })

    await page.click('#lang-toggle')
    await page.click('#language-menu [data-code="de"]')

    // navigation label is chrome ([data-i18n="nav.home"])
    await expect(page.locator('[data-i18n="nav.home"]')).toHaveText('TR:HOME', {
      timeout: 20000,
    })
    await expect(page.locator('html')).toHaveAttribute('lang', 'de')

    // at least one request went to the function with the right target
    expect(reqBodies.length).toBeGreaterThanOrEqual(1)
    const last = reqBodies[reqBodies.length - 1]
    expect(last.target).toBe('de')
    expect(Array.isArray(last.strings)).toBe(true)
  })

  test('Original (English) reverts the translation and drops the lang', async ({
    page,
  }) => {
    await page.click('#lang-toggle')
    await page.click('#language-menu [data-code="fr"]')
    await expect(page.locator('[data-i18n="nav.home"]')).toHaveText('TR:HOME', {
      timeout: 20000,
    })
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr')

    await page.click('#lang-toggle')
    await page.click('#language-menu [data-code=""]') // Original (English)
    await expect(page.locator('[data-i18n="nav.home"]')).toHaveText('HOME')
    await expect(page.locator('html')).not.toHaveAttribute('lang', 'fr')
  })
})
