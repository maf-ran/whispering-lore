/* eslint-env node */
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const BASE = 'http://localhost:3000';
const PAGES = [
  'index.html',
  'about.html',
  'world.html',
  'bestiary.html',
  'items.html',
  'stories.html',
  'quiz.html',
  'mylore.html',
  'methodology.html',
  '404.html',
];

// page-key -> rule-id -> reason. MUST stay empty unless a finding is
// verified as a false positive with a link/explanation recorded here.
const EXCLUSIONS = {};

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 320, height: 568 },
];

async function scan(page, key) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const excluded = (EXCLUSIONS[key] || []);
  return results.violations.filter((v) => !excluded.includes(v.id));
}

function assertClean(violations, label) {
  const summary = violations
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`)
    .join('; ');
  expect(violations, `${label}: ${summary}`).toHaveLength(0);
}

test.describe('Accessibility (axe)', () => {
  for (const vp of VIEWPORTS) {
    test.describe(vp.name, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const p of PAGES) {
        test(`static ${p}`, async ({ page }) => {
          await page.goto(`${BASE}/${p}`, { waitUntil: 'load', timeout: 20000 });
          // let async viewers/renderers settle before scanning
          await page.waitForTimeout(1500);
          assertClean(await scan(page, p), `${p} @${vp.name}`);
        });
      }
    });
  }

  test('detail overlay: creature (bestiary)', async ({ page }) => {
    await page.goto(`${BASE}/bestiary.html?creature=troll-norway`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#creature-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    assertClean(await scan(page, 'bestiary-detail'), 'bestiary detail overlay');
  });

  test('detail overlay: story', async ({ page }) => {
    await page.goto(`${BASE}/stories.html?story=ragnark-the-end-and-rebirth`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#story-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    assertClean(await scan(page, 'stories-detail'), 'stories detail overlay');
  });

  test('detail overlay: item', async ({ page }) => {
    await page.goto(`${BASE}/items.html?item=mjolnir`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#item-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    assertClean(await scan(page, 'items-detail'), 'items detail overlay');
  });

  test('search results state', async ({ page }) => {
    await page.goto(`${BASE}/search.html?q=troll`, { waitUntil: 'load', timeout: 20000 });
    await expect(page.locator('#search-status')).toContainText(/results for "troll"/, { timeout: 20000 });
    assertClean(await scan(page, 'search-results'), 'search results');
  });
});
