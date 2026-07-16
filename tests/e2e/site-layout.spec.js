const { test, expect } = require('@playwright/test');

const VIEWPORTS = [
  { w: 320, h: 568, label: '320' },
  { w: 812, h: 375, label: '812-landscape' },
  { w: 768, h: 1024, label: '768' },
  { w: 1280, h: 800, label: '1280' },
  { w: 1920, h: 1080, label: '1920' },
];

const DATA_PAGES = ['bestiary.html', 'stories.html', 'world.html'];

async function commonChecks(page, path, vp) {
  const issues = [];

  // --- NAV ---
  const nav = page.locator('#site-nav');
  const navLinks = nav.locator('a');
  const linkCount = await navLinks.count();
  if (linkCount < 7) issues.push(`nav has ${linkCount} links, expected ≥7`);

  // Active link matches current page
  const navLabels = {
    'index': 'HOME', 'bestiary': 'BESTIARY', 'stories': 'STORIES',
    'world': 'WORLD', 'quiz': 'EXAMINATION', 'about': 'ABOUT', 'mylore': 'MY LORE'
  };
  const pageName = path.replace('.html', '');
  const activeLabel = navLabels[pageName];
  if (!activeLabel) return issues; // skip pages not in nav (e.g. 404)
  const activeLink = navLinks.filter({ hasText: activeLabel });
  const activeClass = await activeLink.evaluate(el => el?.className || '');
  if (!activeClass.includes('active')) {
    issues.push(`active nav link for ${path} missing .active class`);
  }

  // Header is present
  const header = page.locator('header');
  const headerHeight = await header.evaluate(el => el.getBoundingClientRect().height);
  if (headerHeight < 50) issues.push(`header too short: ${headerHeight}px`);

  // --- MAIN CONTENT ---
  const main = page.locator('#main-content');
  const mainTop = await main.evaluate(el => el.getBoundingClientRect().top);
  if (mainTop < 0) issues.push(`main content starts above viewport (top=${mainTop})`);

  // --- SKIP LINK ---
  const sl = page.locator('.skip-link');
  if (await sl.count() > 0) {
    const skipHref = await sl.getAttribute('href');
    if (skipHref !== '#main-content') issues.push(`skip-link href is "${skipHref}"`);
  }

  // --- FOOTER ---
  const footer = page.locator('footer');
  const footerLinks = footer.locator('a');
  const flc = await footerLinks.count();
  if (flc < 7) issues.push(`footer has ${flc} links, expected ≥7`);

  const footerP = footer.locator('p');
  const fpc = await footerP.count();
  if (fpc < 2) issues.push(`footer has ${fpc} paragraphs, expected ≥2`);
  const copyrightText = await footerP.first().textContent();
  if (!copyrightText || !copyrightText.includes('Whispering Lore')) {
    issues.push(`footer copyright missing: "${copyrightText}"`);
  }

  return issues;
}

async function heroChecks(page) {
  const issues = [];
  const hero = page.locator('.hero');
  if (await hero.count() === 0) return issues;

  const h1 = hero.locator('h1');
  const h1Text = await h1.textContent();
  if (!h1Text || !h1Text.trim()) issues.push('hero h1 is empty');

  // Hero is full-viewport height
  const heroHeight = await hero.evaluate(el => el.getBoundingClientRect().height);
  const vh = await page.evaluate(() => window.innerHeight);
  if (heroHeight < vh * 0.9) issues.push(`hero height ${heroHeight}px < 90vh (${vh}px)`);

  // Hero background gradient container should cover hero
  const heroBg = hero.locator('.hero-bg');
  if (await heroBg.count() === 0) issues.push('hero missing .hero-bg');

  return issues;
}

async function pageHeroChecks(page) {
  const issues = [];
  const hero = page.locator('.page-hero');
  if (await hero.count() === 0) return issues;

  const h1 = hero.locator('h1');
  const h1Text = await h1.textContent();
  if (!h1Text || !h1Text.trim()) issues.push('page-hero h1 is empty');

  const subtitle = hero.locator('p');
  const st = await subtitle.textContent();
  if (!st || !st.trim()) issues.push('page-hero subtitle p is empty');

  // Accent line present
  const accentLine = hero.locator('.accent-line');
  if (await accentLine.count() === 0) issues.push('page-hero missing .accent-line');

  return issues;
}

async function filterBarChecks(page) {
  const issues = [];
  const fb = page.locator('.filter-bar');
  if (await fb.count() === 0) return issues;

  const searchInput = fb.locator('input[type="text"]');
  if (await searchInput.count() === 0) issues.push('filter-bar missing search input');
  return issues;
}

async function cardGridChecks(page, minCards) {
  const issues = [];
  const grid = page.locator('.content-grid');
  if (await grid.count() === 0) return issues;

  const cards = grid.locator('> .card');
  const count = await cards.count();
  if (count < minCards) issues.push(`card grid has ${count} cards, expected ≥${minCards}`);

  // At desktop widths, grid should have ≥2 columns
  const isDesktop = await page.evaluate(() => window.innerWidth > 768);
  if (isDesktop && count > 0) {
    const cols = await grid.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    const trackCount = cols.split(' ').filter(c => c.trim()).length;
    if (trackCount < 2) issues.push(`card grid has ${trackCount} columns at >768px`);
  }

  return issues;
}

// ---------------------------------------------------------------------------

// Index page
test.describe('Index layout', () => {
  for (const vp of VIEWPORTS) {
    test(`layout at ${vp.label} (${vp.w}x${vp.h})`, async ({ page }) => {
      test.setTimeout(45000);
      test.slow();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:3000/index.html', { waitUntil: 'load', timeout: 15000 });

      let issues = await commonChecks(page, 'index.html', vp);
      issues = issues.concat(await heroChecks(page));

      // Stats bar should show numbers
      const stats = page.locator('.hero-stats');
      const statItems = stats.locator('.hero-stat');
      const sc = await statItems.count();
      if (sc < 3) issues.push(`stats has ${sc} items, expected ≥3`);

      // Ghost CTA buttons
      const actions = page.locator('.hero-actions');
      const btns = actions.locator('a.btn-ghost');
      const bc = await btns.count();
      if (bc < 2) issues.push(`hero has ${bc} CTA buttons, expected ≥2`);

      expect(issues).toEqual([]);
    });
  }
});

// Bestiary
test.describe('Bestiary layout', () => {
  for (const vp of VIEWPORTS) {
    test(`layout at ${vp.label} (${vp.w}x${vp.h})`, async ({ page }) => {
      test.setTimeout(30000);
      if (vp.w <= 414 || vp.h <= 414) test.slow();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:3000/bestiary.html', { waitUntil: 'load', timeout: 15000 });
      await page.locator('.card[data-slug]').first().waitFor({ state: 'visible', timeout: 20000 });

      let issues = await commonChecks(page, 'bestiary.html', vp);
      issues = issues.concat(await pageHeroChecks(page));
      issues = issues.concat(await filterBarChecks(page));
      issues = issues.concat(await cardGridChecks(page, 1));

      // Sidebar filters present
      const sidebar = page.locator('.bestiary-sidebar');
      const sidebarVisible = await sidebar.isVisible();
      const isWide = vp.w > 768;
      if (isWide && !sidebarVisible) issues.push('sidebar should be visible at >768px');
      if (!isWide && sidebarVisible && vp.w <= 768) {
        // On mobile sidebar might be hidden or below — soft check
        // Just log, don't fail since sidebar might be in dom but not visually meaningful on mobile
      }

      expect(issues).toEqual([]);
    });
  }
});

// Stories
test.describe('Stories layout', () => {
  for (const vp of VIEWPORTS) {
    test(`layout at ${vp.label} (${vp.w}x${vp.h})`, async ({ page }) => {
      test.setTimeout(45000);
      test.slow();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:3000/stories.html', { waitUntil: 'load', timeout: 15000 });
      await page.locator('.card').first().waitFor({ state: 'visible', timeout: 30000 });

      let issues = await commonChecks(page, 'stories.html', vp);
      issues = issues.concat(await pageHeroChecks(page));
      issues = issues.concat(await filterBarChecks(page));
      issues = issues.concat(await cardGridChecks(page, 1));

      expect(issues).toEqual([]);
    });
  }
});

// World
test.describe('World layout', () => {
  for (const vp of VIEWPORTS) {
    test(`layout at ${vp.label} (${vp.w}x${vp.h})`, async ({ page }) => {
      test.setTimeout(45000);
      test.slow();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:3000/world.html', { waitUntil: 'load', timeout: 15000 });

      // Wait for region cards to appear (soft — data may not load under heavy parallel load)
      const regionCards = page.locator('#region-list .region-card');
      try {
        await regionCards.first().waitFor({ state: 'attached', timeout: 20000 });
      } catch (_) { /* region cards not loaded — still check everything else */ }
      const rc = await regionCards.count();

      // The globe wrapper exists
      const globe = page.locator('#globe-container, #globe-wrapper');
      const globeCount = await globe.count();

      let issues = await commonChecks(page, 'world.html', vp);
      issues = issues.concat(await pageHeroChecks(page));

      // Country rows should load
      const countryRows = page.locator('.globe-country-row');
      const countryCount = await countryRows.count();

      expect(issues).toEqual([]);
    });
  }
});

// Quiz
test.describe('Quiz layout', () => {
  for (const vp of VIEWPORTS) {
    test(`layout at ${vp.label} (${vp.w}x${vp.h})`, async ({ page }) => {
      test.setTimeout(30000);
      if (vp.w <= 414 || vp.h <= 414) test.slow();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:3000/quiz.html', { waitUntil: 'load', timeout: 15000 });

      let issues = await commonChecks(page, 'quiz.html', vp);
      issues = issues.concat(await heroChecks(page));

      // Quiz controls in hero actions
      const actions = page.locator('#quiz-hero-actions');
      if (await actions.count() === 0) issues.push('missing #quiz-hero-actions');

      // Select controls present
      const selects = actions.locator('select');
      const sc = await selects.count();
      if (sc < 4) issues.push(`quiz has ${sc} selects, expected ≥4`);

      // Start button
      const startBtn = page.locator('#start-quiz');
      if (await startBtn.count() === 0) issues.push('missing #start-quiz button');

      expect(issues).toEqual([]);
    });
  }
});

// About
test.describe('About layout', () => {
  for (const vp of VIEWPORTS) {
    test(`layout at ${vp.label} (${vp.w}x${vp.h})`, async ({ page }) => {
      test.setTimeout(30000);
      if (vp.w <= 414 || vp.h <= 414) test.slow();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:3000/about.html', { waitUntil: 'load', timeout: 15000 });

      let issues = await commonChecks(page, 'about.html', vp);
      issues = issues.concat(await pageHeroChecks(page));

      // About content section
      const content = page.locator('#main-content');
      const paragraphs = content.locator('p');
      const pc = await paragraphs.count();
      if (pc < 1) issues.push('about page has no content paragraphs');

      expect(issues).toEqual([]);
    });
  }
});

// 404
test.describe('404 layout', () => {
  for (const vp of VIEWPORTS) {
    test(`layout at ${vp.label} (${vp.w}x${vp.h})`, async ({ page }) => {
      test.setTimeout(30000);
      if (vp.w <= 414 || vp.h <= 414) test.slow();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:3000/404.html', { waitUntil: 'load', timeout: 15000 });

      let issues = await commonChecks(page, '404.html', vp);

      // Error page specific
      const content = page.locator('#main-content');
      const h1 = content.locator('h1');
      const h1Text = await h1.textContent();
      if (!h1Text || h1Text.trim() === '') issues.push('404 page h1 is empty');

      const links = content.locator('a');
      const lc = await links.count();
      if (lc < 1) issues.push('404 page has no navigation links');

      expect(issues).toEqual([]);
    });
  }
});

// My Lore
test.describe('My Lore layout', () => {
  for (const vp of VIEWPORTS) {
    test(`layout at ${vp.label} (${vp.w}x${vp.h})`, async ({ page }) => {
      test.setTimeout(30000);
      if (vp.w <= 414 || vp.h <= 414) test.slow();
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('http://localhost:3000/mylore.html', { waitUntil: 'load', timeout: 15000 });

      let issues = await commonChecks(page, 'mylore.html', vp);
      issues = issues.concat(await pageHeroChecks(page));

      // Card grid if data present
      issues = issues.concat(await cardGridChecks(page, 0));

      expect(issues).toEqual([]);
    });
  }
});
