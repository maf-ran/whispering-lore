const { test, expect } = require('@playwright/test');

const ITEMS_URL = 'http://localhost:3000/items.html';
const INDEX_URL = 'http://localhost:3000/index.html';

test.describe('Items viewer', () => {
  test('shows the full artifact count', async ({ page }) => {
    await page.goto(ITEMS_URL, { waitUntil: 'load', timeout: 15000 });
    const count = page.locator('.item-count');
    await expect(count).toHaveText(/151/, { timeout: 20000 });
  });

  test('search narrows the artifact grid', async ({ page }) => {
    await page.goto(ITEMS_URL, { waitUntil: 'load', timeout: 15000 });
    await page.locator('#item-grid .card').first().waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('#item-search').fill('tyrfing');
    await expect(page.locator('.item-count')).toContainText('1 of 1', { timeout: 10000 });

    const cards = page.locator('#item-grid .card');
    await expect(cards).toHaveCount(1);
    await expect(cards.first().locator('h3')).toContainText(/Tyrfing/i);
  });

  test('opens artifact detail with creature cross-reference', async ({ page }) => {
    await page.goto(ITEMS_URL, { waitUntil: 'load', timeout: 15000 });
    await page.locator('#item-grid .card').first().waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('#item-search').fill('mjölnir');
    await expect(page.locator('.item-count')).toContainText('1 of 1', { timeout: 10000 });

    const card = page.locator('#item-grid .card').first();
    await expect(card.locator('h3')).toContainText(/Mjölnir/i);
    await card.click();

    const detail = page.locator('#item-detail');
    await expect(detail).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#detail-name')).toContainText(/Mjölnir/i);

    const creaturesSection = page.locator('#detail-creatures-section');
    await expect(creaturesSection).toBeVisible({ timeout: 10000 });
    await expect(creaturesSection.locator('a[href*="dwarf-dvergr"]')).toBeVisible();
  });

  test('opens artifact detail with story cross-reference', async ({ page }) => {
    await page.goto(ITEMS_URL, { waitUntil: 'load', timeout: 15000 });
    await page.locator('#item-grid .card').first().waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('#item-search').fill('grotte mill');
    await expect(page.locator('.item-count')).toContainText('1 of 1', { timeout: 10000 });

    const card = page.locator('#item-grid .card').first();
    await expect(card.locator('h3')).toContainText(/Grotte Mill/i);
    await card.click();

    const detail = page.locator('#item-detail');
    await expect(detail).toBeVisible({ timeout: 10000 });

    const storiesSection = page.locator('#detail-stories-section');
    await expect(storiesSection).toBeVisible({ timeout: 10000 });
    await expect(storiesSection.locator('a[href*="why-the-sea-is-salt"]')).toBeVisible();
  });

  test('deep-links to an artifact via ?item=', async ({ page }) => {
    await page.goto('http://localhost:3000/items.html?item=mjolnir', { waitUntil: 'load', timeout: 15000 });

    const detail = page.locator('#item-detail');
    await expect(detail).toBeVisible({ timeout: 10000 });
    await expect(page.locator('#detail-name')).toContainText(/Mjölnir/i);
  });

  test('index stats show artifact total', async ({ page }) => {
    await page.goto(INDEX_URL, { waitUntil: 'load', timeout: 15000 });
    const stat = page.locator('#stat-artifacts');
    await expect(stat).toHaveText('151', { timeout: 20000 });
  });
});
