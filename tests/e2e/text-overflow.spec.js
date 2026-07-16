const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { width: 320, height: 568 },   // iPhone SE
  { width: 375, height: 812 },   // iPhone X
  { width: 414, height: 896 },   // iPhone 11 Pro Max
  { width: 768, height: 1024 },  // iPad
  { width: 1024, height: 768 },  // desktop small
  { width: 1280, height: 800 },  // desktop wide
];

const SLOW_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

const LANDSCAPE_VP = [
  { width: 568, height: 320 },   // iPhone SE landscape
  { width: 812, height: 375 },   // iPhone X landscape
  { width: 896, height: 414 },   // iPhone 11 Pro Max landscape
  { width: 1920, height: 1080 }, // Full HD desktop
  { width: 2560, height: 1440 }, // WQHD desktop
];

const LANDSCAPE_SLOW = [
  { width: 568, height: 320 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1440 },
];

test.describe('Detail overlay text visibility', () => {
  test.describe('creature detail page', () => {
    for (const vp of VIEWPORTS) {
      test(`no horizontal overflow at ${vp.width}x${vp.height}`, async ({ page }) => {
        test.setTimeout(30000);
        if (vp.width <= 414) test.slow();

        await page.setViewportSize(vp);
        await page.goto('http://localhost:3000/bestiary.html', { waitUntil: 'load', timeout: 15000 });

        // Wait for cards to render then click first card
        const card = page.locator('.card[data-slug]').first();
        await card.waitFor({ state: 'visible', timeout: 20000 });
        await card.click();

        // Wait for detail page to be visible
        const detail = page.locator('#creature-detail');
        await expect(detail).not.toHaveClass(/is-hidden/, { timeout: 10000 });

        // Wait for content to render
        await expect(detail.locator('#detail-content')).not.toHaveClass(/is-hidden/, { timeout: 10000 });
        await page.waitForTimeout(600);

        // --- Checks ---

        // 1. No horizontal scroll on the page
        const noPageScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2;
        });
        expect(noPageScroll).toBeTruthy();

        // 2. All text sections have visible content
        const sections = detail.locator('.detail-section');
        const count = await sections.count();
        expect(count).toBeGreaterThan(0);

        const badSections = [];
        for (let i = 0; i < count; i++) {
          const section = sections.nth(i);
          const ps = section.locator('p');
          const pCount = await ps.count();
          let hasContent = false;
          for (let j = 0; j < pCount; j++) {
            const p = ps.nth(j);
            const text = await p.textContent();
            const height = await p.evaluate(el => el.offsetHeight);
            if (text && text.trim()) {
              hasContent = true;
              if (height === 0) {
                const heading = await section.locator('h3').textContent();
                badSections.push(heading || `section-${i}`);
              }
            }
          }
        }
        expect(badSections).toEqual([]);

        // 3. Creature name is visible in hero
        const nameEl = detail.locator('#detail-name');
        await expect(nameEl).not.toBeEmpty();

        // Close via Escape
        await page.keyboard.press('Escape');
        await expect(detail).toHaveClass(/is-hidden/, { timeout: 5000 });
      });
    }
  });

  test.describe('story detail overlay', () => {
    // Stories with full_text can be heavy — test only key viewports
    for (const vp of SLOW_VIEWPORTS) {
      test(`no horizontal overflow at ${vp.width}x${vp.height}`, async ({ page }) => {
        test.setTimeout(45000);
        test.slow();

        await page.setViewportSize(vp);
        await page.goto('http://localhost:3000/stories.html', { waitUntil: 'load', timeout: 15000 });

        // Wait for story cards to render
        const card = page.locator('.card').first();
        await card.waitFor({ state: 'visible', timeout: 30000 });

        // Click first card to open overlay (text-content click to avoid backdrop intercept)
        await card.click();

        // Wait for overlay to be visible
        const overlay = page.locator('#story-detail');
        await expect(overlay).not.toHaveClass(/is-hidden/, { timeout: 10000 });

        // Let animations finish + story full_text render (split into paragraphs)
        await page.waitForTimeout(800);

        // --- Checks ---

        // 1. Container has no horizontal scroll
        const container = overlay.locator('.detail-container');
        const noHScroll = await container.evaluate(el => el.scrollWidth <= el.clientWidth + 1);
        expect(noHScroll).toBeTruthy();

        // 2. All text sections have visible content
        const sections = overlay.locator('.detail-section');
        const count = await sections.count();
        expect(count).toBeGreaterThan(0);

        const badSections = [];
        for (let i = 0; i < count; i++) {
          const section = sections.nth(i);
          const ps = section.locator('p');
          const pCount = await ps.count();
          let hasContent = false;
          for (let j = 0; j < pCount; j++) {
            const p = ps.nth(j);
            const text = await p.textContent();
            const height = await p.evaluate(el => el.offsetHeight);
            if (text && text.trim()) {
              hasContent = true;
              if (height === 0) {
                const heading = await section.locator('h3').textContent();
                badSections.push(heading || `section-${i}`);
              }
            }
          }
        }
        expect(badSections).toEqual([]);

        // 3. No horizontal scroll anywhere in the overlay body
        const noBodyScroll = await overlay.evaluate(el => el.scrollWidth <= el.clientWidth + 1);
        expect(noBodyScroll).toBeTruthy();

        // Close overlay
        await page.keyboard.press('Escape');
        await expect(overlay).toHaveClass(/is-hidden/, { timeout: 5000 });
      });
    }
  });

  test.describe('creature detail — landscape + ultra-wide', () => {
    for (const vp of LANDSCAPE_VP) {
      test(`no overflow at ${vp.width}x${vp.height}`, async ({ page }) => {
        test.setTimeout(30000);
        if (vp.height <= 414) test.slow();

        await page.setViewportSize(vp);
        await page.goto('http://localhost:3000/bestiary.html', { waitUntil: 'load', timeout: 15000 });
        const card = page.locator('.card[data-slug]').first();
        await card.waitFor({ state: 'visible', timeout: 20000 });
        await card.click();
        const overlay = page.locator('#creature-detail');
        await expect(overlay).not.toHaveClass(/is-hidden/, { timeout: 10000 });
        await expect(overlay.locator('#detail-content')).not.toHaveClass(/is-hidden/, { timeout: 10000 });
        await page.waitForTimeout(600);

        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2)).toBeTruthy();

        const sections = overlay.locator('.detail-section');
        const count = await sections.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
          const ps = sections.nth(i).locator('p');
          for (let j = 0; j < await ps.count(); j++) {
            const text = await ps.nth(j).textContent();
            const height = await ps.nth(j).evaluate(el => el.offsetHeight);
            if (text && text.trim() && height === 0) {
              const heading = await sections.nth(i).locator('h3').textContent();
              expect(`section "${heading}" has zero height`).toBe('');
            }
          }
        }

        await expect(overlay.locator('#detail-name')).not.toBeEmpty();
        await page.keyboard.press('Escape');
        await expect(overlay).toHaveClass(/is-hidden/, { timeout: 5000 });
      });
    }
  });

  test.describe('story overlay — landscape + ultra-wide', () => {
    for (const vp of LANDSCAPE_SLOW) {
      test(`no overflow at ${vp.width}x${vp.height}`, async ({ page }) => {
        test.setTimeout(45000);
        test.slow();

        await page.setViewportSize(vp);
        await page.goto('http://localhost:3000/stories.html', { waitUntil: 'load', timeout: 15000 });
        const card = page.locator('.card').first();
        await card.waitFor({ state: 'visible', timeout: 30000 });
        await card.click();
        const overlay = page.locator('#story-detail');
        await expect(overlay).not.toHaveClass(/is-hidden/, { timeout: 10000 });
        await page.waitForTimeout(800);

        const container = overlay.locator('.detail-container');
        expect(await container.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBeTruthy();

        const sections = overlay.locator('.detail-section');
        const count = await sections.count();
        expect(count).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
          const ps = sections.nth(i).locator('p');
          for (let j = 0; j < await ps.count(); j++) {
            const text = await ps.nth(j).textContent();
            const height = await ps.nth(j).evaluate(el => el.offsetHeight);
            if (text && text.trim() && height === 0) {
              const heading = await sections.nth(i).locator('h3').textContent();
              expect(`section "${heading}" has zero height`).toBe('');
            }
          }
        }

        expect(await overlay.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBeTruthy();
        await page.keyboard.press('Escape');
        await expect(overlay).toHaveClass(/is-hidden/, { timeout: 5000 });
      });
    }
  });
});
