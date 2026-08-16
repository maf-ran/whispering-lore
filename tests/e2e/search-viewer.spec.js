/* eslint-env node */
const { test, expect } = require('@playwright/test');

const SEARCH_URL = 'http://localhost:3000/search.html';
const BESTIARY_URL = 'http://localhost:3000/bestiary.html';
const STORIES_URL = 'http://localhost:3000/stories.html';
const ITEMS_URL = 'http://localhost:3000/items.html';

test.describe('Search viewer', () => {
  test('accepts ?q= param and shows grouped results', async ({ page }) => {
    await page.goto(`${SEARCH_URL}?q=dragon`, { waitUntil: 'load', timeout: 15000 });

    const input = page.locator('#site-search');
    await expect(input).toHaveValue('dragon', { timeout: 10000 });

    const status = page.locator('#search-status');
    await expect(status).not.toContainText('Loading the archive', { timeout: 20000 });
    await expect(status).toContainText(/results for "dragon"/, { timeout: 20000 });

    const group = page.locator('.search-group').filter({ hasText: 'Creatures' }).first();
    await expect(group).toBeVisible({ timeout: 20000 });
    await expect(group.locator('.card')).not.toHaveCount(0);
  });

  test('typing in the input updates results and URL', async ({ page }) => {
    await page.goto(SEARCH_URL, { waitUntil: 'load', timeout: 15000 });

    await page.locator('#site-search').fill('tyrfing');

    const status = page.locator('#search-status');
    await expect(status).toContainText(/result[s]? for "tyrfing"/, { timeout: 20000 });

    await expect(page).toHaveURL(/[?&]q=tyrfing/, { timeout: 10000 });

    const itemsGroup = page.locator('.search-group').filter({ hasText: 'Artifacts' }).first();
    await expect(itemsGroup).toBeVisible({ timeout: 20000 });
    await expect(itemsGroup.locator('.card').first().locator('h3')).toContainText(/Tyrfing/i);
  });

  test('creature results link to bestiary detail', async ({ page }) => {
    await page.goto(`${SEARCH_URL}?q=draugr`, { waitUntil: 'load', timeout: 15000 });

    const creaturesGroup = page.locator('.search-group').filter({ hasText: 'Creatures' }).first();
    await expect(creaturesGroup.locator('.card').first()).toBeVisible({ timeout: 20000 });

    const link = creaturesGroup.locator('.card-cta').first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^bestiary\.html\?creature=/);

    const cardSlug = await creaturesGroup.locator('.card').first().getAttribute('data-slug');
    expect(href).toContain(encodeURIComponent(cardSlug));

    await link.click();
    await page.waitForURL(/[?&]creature=/, { timeout: 10000 });
    expect(page.url().startsWith(BESTIARY_URL)).toBe(true);
  });

  test('story results link to stories detail', async ({ page }) => {
    await page.goto(`${SEARCH_URL}?q=ragnarok`, { waitUntil: 'load', timeout: 15000 });

    const storiesGroup = page.locator('.search-group').filter({ hasText: 'Stories' }).first();
    await expect(storiesGroup.locator('.card').first()).toBeVisible({ timeout: 20000 });

    const link = storiesGroup.locator('.card-cta').first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^stories\.html\?story=/);

    await link.click();
    await page.waitForURL(/[?&]story=/, { timeout: 10000 });
    expect(page.url().startsWith(STORIES_URL)).toBe(true);
  });

  test('artifact results link to items detail', async ({ page }) => {
    await page.goto(`${SEARCH_URL}?q=gjallarhorn`, { waitUntil: 'load', timeout: 15000 });

    const itemsGroup = page.locator('.search-group').filter({ hasText: 'Artifacts' }).first();
    await expect(itemsGroup.locator('.card').first()).toBeVisible({ timeout: 20000 });

    const link = itemsGroup.locator('.card-cta').first();
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^items\.html\?item=/);

    await link.click();
    await page.waitForURL(/[?&]item=/, { timeout: 10000 });
    expect(page.url().startsWith(ITEMS_URL)).toBe(true);
  });

  test('shows empty state for no matches', async ({ page }) => {
    await page.goto(`${SEARCH_URL}?q=zzzznotfoundzzz`, { waitUntil: 'load', timeout: 15000 });

    const status = page.locator('#search-status');
    await expect(status).toContainText('No results found', { timeout: 20000 });

    const empty = page.locator('#search-results .no-results');
    await expect(empty).toBeVisible({ timeout: 10000 });
  });
});
