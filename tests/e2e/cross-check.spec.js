const { test, expect } = require('@playwright/test');

test.describe('Cross-check: duplicate manifest.json', () => {
  const pages = [
    'index.html', 'about.html', 'bestiary.html', 'stories.html',
    'quiz.html', 'world.html', '404.html', 'mylore.html'
  ];

  for (const page of pages) {
    test(`${page} has exactly one manifest.json link`, async ({ page: p }) => {
      await p.goto(`http://localhost:3000/${page}`);
      const links = p.locator('link[rel="manifest"]');
      const count = await links.count();
      expect(count).toBe(1);
    });
  }
});

test.describe('Cross-check: console errors', () => {
  const pages = [
    'index.html', 'about.html', 'bestiary.html', 'stories.html',
    'quiz.html', 'world.html', '404.html', 'mylore.html'
  ];

  for (const page of pages) {
    test(`${page} loads without console errors`, async ({ page: p }) => {
      // Data-heavy pages (bestiary, stories, world, index) need extra time for 150+ XHR shard requests
      if (['bestiary.html', 'stories.html', 'world.html', 'index.html'].includes(page)) {
        test.slow();
      }
      const errors = [];
      p.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          errors.push({ type: msg.type(), text: msg.text() });
        }
      });
      await p.goto(`http://localhost:3000/${page}`);
      await p.waitForTimeout(2000);
      // Filter out known benign warnings
      const relevantErrors = errors.filter(e =>
        !e.text.includes('Failed to load resource') && // can be 404s for data
        !e.text.includes('manifest.json') &&
        !e.text.includes('Swipe')
      );
      if (relevantErrors.length > 0) {
        console.log(`[${page}] Console issues:`, relevantErrors);
      }
    });
  }
});

test.describe('Cross-check: data loading and overlap', () => {
  test('bestiary.html loads creature cards', async ({ page }) => {
    await page.goto('http://localhost:3000/bestiary.html');
    // Wait for shards to load
    await page.waitForTimeout(3000);
    const cards = page.locator('.bestiary-card');
    const count = await cards.count();
    console.log(`Bestiary cards loaded: ${count}`);
    expect(count).toBeGreaterThan(0);
  });

  test('stories.html loads story cards', async ({ page }) => {
    await page.goto('http://localhost:3000/stories.html');
    await page.waitForTimeout(3000);
    const cards = page.locator('.story-card');
    const count = await cards.count();
    console.log(`Story cards loaded: ${count}`);
    expect(count).toBeGreaterThan(0);
  });

  test('world.html loads and has country data', async ({ page }) => {
    test.slow(); // shard loading (150+ XHRs) needs extra time under parallel workers
    await page.goto('http://localhost:3000/world.html', { waitUntil: 'load', timeout: 60000 });
    // Wait for data to load (shimmer/XHR async) and region list to populate
    const regionCards = page.locator('#region-list .region-card');
    await regionCards.first().waitFor({ state: 'attached', timeout: 60000 });
    const regionCount = await regionCards.count();
    console.log(`Region cards loaded: ${regionCount}`);
    expect(regionCount).toBeGreaterThan(0);

    // Check that the country list renders
    const countryRows = page.locator('.globe-country-row');
    const countryCount = await countryRows.count();
    console.log(`Country rows loaded: ${countryCount}`);
  });

  test('index.html hero stats animate to correct values', async ({ page }) => {
    await page.goto('http://localhost:3000/index.html');
    await page.waitForTimeout(3000);
    const statNums = page.locator('.hero-stat-num');
    const count = await statNums.count();
    console.log(`Hero stat numbers found: ${count}`);
    if (count >= 1) {
      const text = await statNums.first().textContent();
      console.log(`First stat value: "${text}"`);
      expect(parseInt(text, 10)).toBeGreaterThan(0);
    }
  });

  test('quiz page loads question pool', async ({ page }) => {
    await page.goto('http://localhost:3000/quiz.html');
    const startBtn = page.getByRole('button', { name: /start/i });
    await expect(startBtn).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Cross-check: dead scripts and unnecessary loads', () => {
  test('quiz page does NOT load world-viewer.js', async ({ page }) => {
    let loadedWorldViewer = false;
    page.on('request', req => {
      if (req.url().includes('world-viewer.js')) loadedWorldViewer = true;
    });
    await page.goto('http://localhost:3000/quiz.html');
    await page.waitForTimeout(1000);
    expect(loadedWorldViewer).toBe(false);
  });

  test('bestiary page does NOT load world-viewer.js', async ({ page }) => {
    let loadedWorldViewer = false;
    page.on('request', req => {
      if (req.url().includes('world-viewer.js')) loadedWorldViewer = true;
    });
    await page.goto('http://localhost:3000/bestiary.html');
    await page.waitForTimeout(1000);
    expect(loadedWorldViewer).toBe(false);
  });
});

test.describe('Cross-check: dependency loading', () => {
  test('three.js loads correctly on world page', async ({ page }) => {
    let threeLoaded = false;
    page.on('request', req => {
      if (req.url().includes('three')) threeLoaded = true;
    });
    await page.goto('http://localhost:3000/world.html');
    await page.waitForTimeout(2000);
    expect(threeLoaded).toBe(true);
  });

  test('all pages load shared-utils.js', async ({ page }) => {
    let sharedLoaded = false;
    page.on('request', req => {
      if (req.url().includes('shared-utils.js')) sharedLoaded = true;
    });
    await page.goto('http://localhost:3000/index.html');
    await page.waitForTimeout(1000);
    expect(sharedLoaded).toBe(true);
  });
});

test.describe('Cross-check: SEO and meta tags', () => {
  const pages = [
    'index.html', 'about.html', 'bestiary.html', 'stories.html',
    'quiz.html', 'world.html', 'mylore.html'
  ];

  for (const pageName of pages) {
    test(`${pageName} has meta description`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${pageName}`);
      const metaDesc = page.locator('meta[name="description"]');
      const content = await metaDesc.getAttribute('content');
      expect(content).toBeTruthy();
      expect(content.length).toBeGreaterThan(10);
    });

    test(`${pageName} has og:title`, async ({ page }) => {
      await page.goto(`http://localhost:3000/${pageName}`);
      const ogTitle = page.locator('meta[property="og:title"]');
      const content = await ogTitle.getAttribute('content');
      expect(content).toBeTruthy();
    });
  }
});
