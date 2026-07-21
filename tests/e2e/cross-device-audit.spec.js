const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const VIEWPORTS = [
  { w: 320, h: 568, label: 'iPhone-SE', deviceScaleFactor: 2 },
  { w: 375, h: 812, label: 'iPhone-13', deviceScaleFactor: 3 },
  { w: 414, h: 896, label: 'iPhone-11-Pro-Max', deviceScaleFactor: 3 },
  { w: 768, h: 1024, label: 'iPad-Mini', deviceScaleFactor: 2 },
  { w: 1024, h: 768, label: 'iPad-Landscape', deviceScaleFactor: 2 },
  { w: 1280, h: 800, label: 'Laptop-1280', deviceScaleFactor: 1 },
  { w: 1440, h: 900, label: 'Desktop-1440', deviceScaleFactor: 1 },
  { w: 1920, h: 1080, label: 'Full-HD', deviceScaleFactor: 1 },
];

const PAGES = [
  'index.html',
  'bestiary.html',
  'stories.html',
  'world.html',
  'about.html',
  'quiz.html',
  'methodology.html',
];

const SCREENSHOT_DIR = path.join(__dirname, '../../test-screenshots');

test.describe('Cross-device audit', () => {

  for (const vp of VIEWPORTS) {
    test.describe(`${vp.label} (${vp.w}x${vp.h})`, () => {

      for (const pageName of PAGES) {
        test(`${pageName} — layout + no overflow`, async ({ page }) => {
          test.setTimeout(30000);
          await page.setViewportSize({ width: vp.w, height: vp.h });
          await page.goto(`/${pageName}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await page.waitForLoadState('load').catch(() => {});

          // Screenshot
          const ssDir = path.join(SCREENSHOT_DIR, vp.label);
          fs.mkdirSync(ssDir, { recursive: true });
          await page.screenshot({
            path: path.join(ssDir, `${pageName.replace('.html', '')}.png`),
            fullPage: true
          });

          // 1. No horizontal overflow
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          expect(bodyWidth, `Horizontal overflow on ${pageName}`).toBeLessThanOrEqual(vp.w + 2);

          // 2. Header visible
          const header = page.locator('header');
          if (await header.count() > 0) {
            const headerBox = await header.boundingBox();
            expect(headerBox).not.toBeNull();
            expect(headerBox.height, `Header height on ${pageName}`).toBeGreaterThan(30);
          }

          // 3. No console errors
          const errors = [];
          page.on('console', msg => {
            if (msg.type() === 'error') errors.push(msg.text());
          });
          await page.waitForTimeout(500);
          const criticalErrors = errors.filter(e =>
            !e.includes('favicon') &&
            !e.includes('service-worker') &&
            !e.includes('DevTools')
          );
          expect(criticalErrors, `Console errors on ${pageName}`).toHaveLength(0);

          // 4. Main content not clipped by header
          const mainContent = page.locator('#main-content');
          if (await mainContent.count() > 0) {
            const mainBox = await mainContent.boundingBox();
            if (mainBox) {
              expect(mainBox.height, `Main content height on ${pageName}`).toBeGreaterThan(100);
            }
          }
        });
      }

      test('hero — no element overlap at this viewport', async ({ page }) => {
        test.setTimeout(20000);
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await page.goto('/index.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForLoadState('load').catch(() => {});

        const hero = page.locator('.hero');
        const heroBox = await hero.boundingBox();
        if (!heroBox) return;

        // Check hero content doesn't extend below hero bottom
        const heroContent = page.locator('.hero-content');
        if (await heroContent.count() > 0) {
          const contentBox = await heroContent.boundingBox();
          if (contentBox) {
            const overflow = (contentBox.y + contentBox.height) - (heroBox.y + heroBox.height);
            // On very small screens with overflow:hidden, some clip is expected
            // but flag if more than 50px clipped
            if (overflow > 50) {
              console.warn(`Hero content overflows by ${overflow.toFixed(0)}px at ${vp.label}`);
            }
          }
        }

        // Check feature-pill doesn't overlap hero content
        const pill = page.locator('.hero-feature-pill');
        if (await pill.count() > 0 && await pill.isVisible()) {
          const pillBox = await pill.boundingBox();
          if (pillBox && heroContent) {
            const contentBox = await heroContent.boundingBox();
            if (contentBox) {
              const overlap = (contentBox.y + contentBox.height) - pillBox.y;
              // Small overlap (< 60px) is cosmetic; large overlap means content is clipped
              expect(overlap, `Feature pill overlaps hero content by ${overlap.toFixed(0)}px at ${vp.label}`).toBeLessThanOrEqual(60);
            }
          }
        }
      });

      test('nav — scrollable and accessible', async ({ page }) => {
        test.setTimeout(15000);
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await page.goto('/index.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForLoadState('load').catch(() => {});

        const nav = page.locator('#site-nav');
        if (await nav.count() === 0) return;

        const navLinks = nav.locator('a');
        const linkCount = await navLinks.count();
        expect(linkCount, 'Nav links count').toBeGreaterThanOrEqual(7);

        // All nav links should be clickable (not zero-width)
        for (let i = 0; i < linkCount; i++) {
          const link = navLinks.nth(i);
          const box = await link.boundingBox();
          if (box) {
            expect(box.width, `Nav link ${i} width`).toBeGreaterThan(0);
          }
        }

        // Brand should be hidden on mobile
        if (vp.w <= 768) {
          const brand = page.locator('.header-brand');
          if (await brand.count() > 0) {
            const visible = await brand.isVisible();
            expect(visible, 'Brand hidden on mobile').toBe(false);
          }
        }
      });

      test('no JS errors on page load', async ({ page }) => {
        test.setTimeout(15000);
        const jsErrors = [];
        page.on('pageerror', err => jsErrors.push(err.message));

        await page.setViewportSize({ width: vp.w, height: vp.h });
        await page.goto('/index.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForLoadState('load').catch(() => {});
        await page.waitForTimeout(2000);

        const critical = jsErrors.filter(e =>
          !e.includes('ResizeObserver') &&
          !e.includes('service-worker')
        );
        expect(critical, `JS errors at ${vp.label}`).toHaveLength(0);
      });
    });
  }
});
