const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { name: 'mobile-360', width: 360, height: 640 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-414', width: 414, height: 896 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'tablet-834', width: 834, height: 1194 },
  { name: 'desktop-1024', width: 1024, height: 768 },
  { name: 'desktop-1280', width: 1280, height: 720 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'ultrawide-2560', width: 2560, height: 1440 },
];

const PAGES = {
  fast: [
    { name: 'about', path: 'about.html' },
    { name: '404', path: '404.html' },
    { name: 'mylore', path: 'mylore.html' },
    { name: 'quiz', path: 'quiz.html' },
  ],
  medium: [
    { name: 'index', path: 'index.html' },
    { name: 'bestiary', path: 'bestiary.html' },
    { name: 'stories', path: 'stories.html' },
  ],
  slow: [
    { name: 'world', path: 'world.html' },
  ],
};

async function checkLayout(page) {
  const results = await page.evaluate(() => {
    const issues = [];
    if (document.body.scrollWidth > window.innerWidth + 2) {
      issues.push(`horizontal-scroll: ${document.body.scrollWidth}px > ${window.innerWidth}px`);
    }
    const hero = document.querySelector('.page-hero');
    if (hero) {
      const heroRect = hero.getBoundingClientRect();
      if (heroRect.right > window.innerWidth + 1) {
        issues.push('hero-overflow-right');
      }
    }
    const footer = document.querySelector('footer, contentinfo');
    if (!footer) {
      issues.push('no-footer');
    }
    const nav = document.querySelector('nav#site-nav, nav');
    if (nav) {
      const navStyle = window.getComputedStyle(nav);
      if (navStyle.display === 'none' || navStyle.visibility === 'hidden') {
        issues.push('nav-hidden');
      }
    }
    return { issues, scrollWidth: document.body.scrollWidth, viewportWidth: window.innerWidth };
  });
  return results;
}

async function checkNavAccessible(page) {
  const nav = page.locator('nav#site-nav');
  await expect(nav).toBeVisible();
  const links = await nav.locator('a');
  const count = await links.count();
  expect(count).toBeGreaterThanOrEqual(7);
  for (let i = 0; i < count; i++) {
    await expect(links.nth(i)).toBeVisible();
  }
}

async function checkGridRendering(page) {
  const result = await page.evaluate(() => {
    const grid = document.querySelector('#bestiary-grid, #story-grid');
    if (!grid) return { skip: true };
    const cards = grid.querySelectorAll('.bestiary-card, .story-card');
    if (cards.length < 2) return { skip: true };
    const style = window.getComputedStyle(grid);
    const cols = style.gridTemplateColumns;
    const r1 = cards[0].getBoundingClientRect();
    const r2 = cards[1].getBoundingClientRect();
    const overlap = !(r1.right <= r2.x || r2.right <= r1.x ||
                      r1.bottom <= r2.y || r2.bottom <= r1.y);
    return { skip: false, cols, overlap, r1, r2 };
  });
  if (result && !result.skip && result.overlap) {
    console.log(`  Grid overlap: cols=${result.cols}, r1(Y:${Math.round(result.r1.y)}-${Math.round(result.r1.bottom)}) r2(Y:${Math.round(result.r2.y)}-${Math.round(result.r2.bottom)})`);
  }
  if (!result || result.skip) return;
  expect(result.overlap).toBe(false);
}

async function checkContentFit(page) {
  const result = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if (style.overflow === 'hidden' || style.overflowX === 'hidden' || style.overflowX === 'auto') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width > window.innerWidth + 2 && rect.left >= 0 && rect.top >= 0) {
        if (el.tagName !== 'HTML' && el.tagName !== 'BODY') {
          const tag = el.tagName.toLowerCase();
          const id = el.id ? '#' + el.id : '';
          const cls = el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '';
          return { tag: tag + id + cls, width: Math.round(rect.width), viewport: window.innerWidth };
        }
      }
    }
    return null;
  });
  if (result) {
    console.log(`  Content overflow: ${result.tag} (${result.width}px > ${result.viewport}px)`);
  }
  expect(result).toBeNull();
}

// ── Fast pages (no heavy data): all 10 viewports ──
for (const pageInfo of PAGES.fast) {
  test.describe(`${pageInfo.name} responsive`, () => {
    for (const vp of VIEWPORTS) {
      test(`renders at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`http://localhost:3000/${pageInfo.path}`, { waitUntil: 'load', timeout: 15000 });

        const layout = await checkLayout(page);
        expect(layout.issues).toEqual([]);

        await checkNavAccessible(page);
        await checkContentFit(page);
      });
    }
  });
}

// ── Medium pages (data-loading): select viewports ──
const MEDIUM_VP = VIEWPORTS.filter(v =>
  ['mobile-390', 'tablet-768', 'tablet-834', 'desktop-1280', 'desktop-1920'].includes(v.name)
);
for (const pageInfo of PAGES.medium) {
  test.describe(`${pageInfo.name} responsive`, () => {
    test.describe.configure({ timeout: 30000 });
    for (const vp of MEDIUM_VP) {
      test(`renders at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`http://localhost:3000/${pageInfo.path}`, { waitUntil: 'load', timeout: 15000 });

        const layout = await checkLayout(page);
        expect(layout.issues).toEqual([]);

        await checkNavAccessible(page);

        if (pageInfo.name === 'bestiary' || pageInfo.name === 'stories') {
          await page.waitForTimeout(5000);
          await checkGridRendering(page);
        }

        await checkContentFit(page);
      });
    }
  });
}

// ── Slow pages (shimmer data): select viewports ──
const SLOW_VP = VIEWPORTS.filter(v =>
  ['mobile-390', 'tablet-768', 'desktop-1440'].includes(v.name)
);
for (const pageInfo of PAGES.slow) {
  test.describe(`${pageInfo.name} responsive`, () => {
    test.describe.configure({ timeout: 60000 });
    for (const vp of SLOW_VP) {
      test(`renders at ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
        test.slow();
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`http://localhost:3000/${pageInfo.path}`, { waitUntil: 'load', timeout: 30000 });

        const layout = await checkLayout(page);
        expect(layout.issues).toEqual([]);

        await checkNavAccessible(page);
        await checkContentFit(page);
      });
    }
  });
}
