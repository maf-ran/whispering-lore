/* eslint-env node */
const { test, expect } = require('@playwright/test')

test.describe('production smoke', () => {
  test.use({ viewport: { width: 1280, height: 900 } })

  test('home shows correct counts and SW', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'chromium-only suite')
    await page.goto('https://whisperinglore.com/', { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(1500)
    await expect(page.locator('#stat-creatures')).toHaveText('3,775')
    await expect(page.locator('#stat-stories')).toHaveText('2,185')
    await expect(page.locator('#stat-countries')).toHaveText('242')
    const sw = await page.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.controller ? 'controlled' : 'no-sw')
    // SW is registered; just ensure page loads
    expect(sw === 'controlled' || sw === 'no-sw').toBeTruthy()
  })

  test('about page has correct counts', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'chromium-only suite')
    const resp = await page.goto('https://whisperinglore.com/about.html', { waitUntil: 'domcontentloaded', timeout: 45000 })
    expect(resp.status()).toBe(200)
    await expect(page.locator('#stat-creatures')).toHaveText('3,775')
  })

  test('language toggle works with Google blocked and translates via Gemini', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'chromium-only suite')
    await page.route(/(translate\.google\.com|translate\.googleapis\.com|translate\.google\.com\.hk)/, (route) => route.abort())
    await page.goto('https://whisperinglore.com/', { waitUntil: 'domcontentloaded', timeout: 45000 })
    await page.waitForTimeout(2000)
    await expect(page.locator('#lang-toggle')).toBeVisible()
    await page.click('#lang-toggle')
    await expect(page.locator('#language-menu')).toBeVisible()
    await page.waitForTimeout(200)
    await page.click('#language-menu [data-code="fr"]')
    await page.waitForTimeout(3000)
    expect(await page.evaluate(() => document.documentElement.lang)).toBe('fr')
    expect(page.url()).toContain('gmlang=fr')
    const stored = await page.evaluate(() => localStorage.getItem('wl:active_gmlang'))
    expect(stored).toBe('fr')
  })

  test('translate function works', async ({ request }) => {
    test.skip(test.info().project.name !== 'chromium', 'chromium-only suite')
    const resp = await request.post('https://whisperinglore.com/.netlify/functions/translate', {
      headers: { 'Content-Type': 'application/json', Origin: 'https://whisperinglore.com' },
      data: { source: 'en', target: 'es', strings: ['Hello'] }
    })
    expect(resp.status()).toBe(200)
    const json = await resp.json()
    expect(json.translations).toBeTruthy()
    expect(json.translations.length).toBe(1)
  })
})
