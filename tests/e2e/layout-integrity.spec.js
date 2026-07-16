const { test, expect } = require('@playwright/test');

const FULL_VP = [
  { width: 320, height: 568 },
  { width: 375, height: 812 },
  { width: 414, height: 896 },
  { width: 568, height: 320 },
  { width: 812, height: 375 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1920, height: 1080 },
];

test.describe('Creature detail layout integrity', () => {
  for (const vp of FULL_VP) {
    test(`layout checks at ${vp.width}x${vp.height}`, async ({ page }) => {
      test.setTimeout(30000);
      if (vp.width <= 414 || vp.height <= 414) test.slow();

      await page.setViewportSize(vp);
      await page.goto('http://localhost:3000/bestiary.html', { waitUntil: 'load', timeout: 15000 });
      const card = page.locator('.card[data-slug]').first();
      await card.waitFor({ state: 'visible', timeout: 20000 });
      await card.click();
      const overlay = page.locator('#creature-detail');
      await expect(overlay).not.toHaveClass(/is-hidden/, { timeout: 10000 });
      await page.waitForTimeout(600);

      // --- Layout checks ---

      const results = await page.evaluate(() => {
        const issues = [];
        const overlayEl = document.getElementById('creature-detail');
        if (!overlayEl) return ['no overlay found'];

        const backdrop = overlayEl.querySelector('.detail-backdrop');
        const container = overlayEl.querySelector('.detail-container');
        const closeBtn = document.getElementById('detail-close');
        const backLink = overlayEl.querySelector('.detail-back');
        const header = overlayEl.querySelector('.detail-header');
        const body = overlayEl.querySelector('.detail-body');
        const grid = overlayEl.querySelector('.detail-grid');

        // 1. Backdrop covers full viewport (should be same size as overlay)
        if (backdrop) {
          const br = backdrop.getBoundingClientRect();
          if (br.left > 0 || br.top > 0 || br.right < window.innerWidth - 1 || br.bottom < window.innerHeight - 1) {
            issues.push('backdrop does not cover full viewport');
          }
        }

        // 2. Container is horizontally centered
        if (container) {
          const cr = container.getBoundingClientRect();
          const margin = (window.innerWidth - cr.width) / 2;
          if (Math.abs(cr.left - margin) > 2) {
            issues.push('container not horizontally centered');
          }
          if (cr.top < 0) {
            issues.push('container top is above viewport');
          }
        }

        // 3. Close button is visible and within viewport
        if (closeBtn) {
          const cbr = closeBtn.getBoundingClientRect();
          if (cbr.width === 0 || cbr.height === 0) {
            issues.push('close button has zero dimensions');
          }
          if (cbr.right > window.innerWidth || cbr.bottom < 0 || cbr.top > window.innerHeight) {
            issues.push('close button outside viewport');
          }
        }

        // 4. Back link is visible
        if (backLink) {
          const blr = backLink.getBoundingClientRect();
          if (blr.width === 0 || blr.height === 0) {
            issues.push('back link has zero dimensions');
          }
        }

        // 5. Header and body don't overlap
        if (header && body) {
          const hr = header.getBoundingClientRect();
          const br = body.getBoundingClientRect();
          if (hr.bottom > br.top + 1) {
            issues.push('header overlaps with body');
          }
        }

        // 6. Detail-grid column structure
        if (grid) {
          const cols = getComputedStyle(grid).gridTemplateColumns;
          const isWide = window.innerWidth > 768;
          const trackCount = cols.split(' ').filter(c => c.trim()).length;
          if (isWide && trackCount < 2) {
            issues.push(`grid should have 2 columns at >768px but has ${trackCount}`);
          }
          if (!isWide && trackCount > 1) {
            issues.push(`grid should have 1 column at ≤768px but has ${trackCount}`);
          }
        }

        // 7. Overlay z-index is above backdrop
        const overlayZ = getComputedStyle(overlayEl).zIndex;
        const backdropZ = backdrop ? getComputedStyle(backdrop).zIndex : 'auto';
        if (parseInt(overlayZ) <= parseInt(backdropZ)) {
          issues.push(`overlay z-index (${overlayZ}) not above backdrop (${backdropZ})`);
        }

        // 8. Body scroll is locked when overlay is open
        if (document.body.style.overflow !== 'hidden') {
          issues.push('body scroll not locked when overlay open');
        }

        return issues;
      });

      expect(results).toEqual([]);

      // Close
      await page.keyboard.press('Escape');
      await expect(overlay).toHaveClass(/is-hidden/, { timeout: 5000 });
    });
  }
});

test.describe('Story detail layout integrity', () => {
  // Fewer viewports for stories (heavier page)
  const STORY_VP = [
    { width: 320, height: 568 },
    { width: 812, height: 375 },
    { width: 1280, height: 800 },
  ];

  for (const vp of STORY_VP) {
    test(`layout checks at ${vp.width}x${vp.height}`, async ({ page }) => {
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

      const results = await page.evaluate(() => {
        const issues = [];
        const overlayEl = document.getElementById('story-detail');
        if (!overlayEl) return ['no overlay found'];

        const backdrop = overlayEl.querySelector('.detail-backdrop');
        const container = overlayEl.querySelector('.detail-container');
        const closeBtn = document.getElementById('story-detail')?.querySelector('.detail-close');
        const header = overlayEl.querySelector('.detail-header');
        const body = overlayEl.querySelector('.detail-body');
        const grid = overlayEl.querySelector('.detail-grid');

        if (backdrop) {
          const br = backdrop.getBoundingClientRect();
          if (br.left > 0 || br.top > 0 || br.right < window.innerWidth - 1 || br.bottom < window.innerHeight - 1) {
            issues.push('backdrop does not cover full viewport');
          }
        }

        if (container) {
          const cr = container.getBoundingClientRect();
          const margin = (window.innerWidth - cr.width) / 2;
          if (Math.abs(cr.left - margin) > 2) {
            issues.push('container not horizontally centered');
          }
        }

        if (closeBtn) {
          const cbr = closeBtn.getBoundingClientRect();
          if (cbr.width === 0 || cbr.height === 0) {
            issues.push('close button has zero dimensions');
          }
        }

        if (header && body) {
          const hr = header.getBoundingClientRect();
          const br = body.getBoundingClientRect();
          if (hr.bottom > br.top + 1) {
            issues.push('header overlaps with body');
          }
        }

        if (grid) {
          const cols = getComputedStyle(grid).gridTemplateColumns;
          const isWide = window.innerWidth > 768;
          const trackCount = cols.split(' ').filter(c => c.trim()).length;
          if (isWide && trackCount < 2) {
            issues.push(`grid should have 2 columns at >768px but has ${trackCount}`);
          }
          if (!isWide && trackCount > 1) {
            issues.push(`grid should have 1 column at ≤768px but has ${trackCount}`);
          }
        }

        if (document.body.style.overflow !== 'hidden') {
          issues.push('body scroll not locked when overlay open');
        }

        return issues;
      });

      expect(results).toEqual([]);

      await page.keyboard.press('Escape');
      await expect(overlay).toHaveClass(/is-hidden/, { timeout: 5000 });
    });
  }
});
