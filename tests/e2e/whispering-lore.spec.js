const { test, expect } = require('@playwright/test');

test('Home page loads and has daily feature', async ({ page }) => {
  await page.goto('http://localhost:3000/index.html');
  await expect(page).toHaveTitle(/Whispering Lore/);
  const dailyFeature = page.locator('.daily-feature');
  await expect(dailyFeature).toBeVisible();
});

test('Bestiary search and detail navigation', async ({ page }) => {
  await page.goto('http://localhost:3000/bestiary.html');
  const searchInput = page.locator('#bestiary-search');
  await searchInput.fill('Dragon');
  await page.waitForTimeout(300); // debounce
  
  const firstCard = page.locator('.bestiary-card').first();
  await expect(firstCard).toBeVisible();
  await firstCard.click();
  
  const detail = page.locator('#creature-detail');
  await expect(detail).toBeVisible();
});

test('Stories navigation and reading', async ({ page }) => {
  await page.goto('http://localhost:3000/stories.html');
  const firstStory = page.locator('.story-card').first();
  await firstStory.click();
  
  const detail = page.locator('#story-detail');
  await expect(detail).toBeVisible();
});
