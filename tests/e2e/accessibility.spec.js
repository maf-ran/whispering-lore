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

// page-key -> array of excluded rule ids (strings). MUST stay empty unless a
// finding is verified as a false positive; record the reason as a comment on
// the entry line itself.
const EXCLUSIONS = {};

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 320, height: 568 },
];

// Deterministic readiness signals for pages whose content renders async.
// Pages absent from this map are fully static and can be scanned directly.
const SETTLE = {
  'index.html': async (page) => {
    // daily-feature.js fetches datasets then fills both cards
    await expect(page.locator('#daily-creature .feature-name')).toBeVisible({ timeout: 20000 });
  },
  'world.html': async (page) => {
    // world-viewer.js renders region cards only after dataset load
    await expect(page.locator('.region-card--loaded').first()).toBeVisible({ timeout: 20000 });
  },
  'bestiary.html': async (page) => {
    await expect(page.locator('#bestiary-grid .card').first()).toBeVisible({ timeout: 20000 });
  },
  'stories.html': async (page) => {
    await expect(page.locator('#story-grid .card').first()).toBeVisible({ timeout: 20000 });
  },
  'items.html': async (page) => {
    await expect(page.locator('#item-grid .card').first()).toBeVisible({ timeout: 20000 });
  },
  'quiz.html': async (page) => {
    // quiz.js populates the geography dropdown after geo data loads; the quiz
    // itself only renders after an explicit user click, so this is the only
    // deterministic load-time signal.
    await expect(page.locator('#quiz-geo option').nth(1)).toBeAttached({ timeout: 20000 });
  },
};

// Wait out entrance animations (css/styles.css) before scanning: axe
// composites still-fading content over its backdrop estimate and reports
// bogus near-1:1 color-contrast failures. quiz.html is the proven case — its
// controls sit inside .hero-actions { opacity: 0; animation: fadeInUp 1.4s
// ease 1.1s forwards }, so the page is interactive long before the controls
// are opaque; body's own 0.3s pageFadeIn does not cover that window. Await
// every finite animation currently known to the document; infinite loops
// (pulse/shimmer keyframes) are excluded so this always resolves. The race
// timeout is a safety net so a stuck/canceled animation cannot hang the gate.
async function awaitSettled(page) {
  await page.evaluate(() => {
    const finite = document
      .getAnimations({ subtree: true })
      .filter((anim) => {
        try {
          return anim.effect.getComputedTiming().iterationCount !== Infinity;
        } catch (err) {
          return false;
        }
      })
      .map((anim) => anim.finished.catch(() => {}));
    if (finite.length === 0) return undefined;
    return Promise.race([
      Promise.all(finite),
      new Promise((resolve) => setTimeout(resolve, 4000)),
    ]);
  });
}

async function scan(page, key) {
  await awaitSettled(page);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const excluded = (EXCLUSIONS[key] || []);
  return results.violations.filter((v) => !excluded.includes(v.id));
}

function assertClean(violations, label) {
  const summary = violations
    .map((v) => {
      const targets = v.nodes
        .slice(0, 3)
        .map((n) => n.target.join(' '))
        .join(', ');
      return `${v.id} (${v.impact}): ${v.nodes.length} node(s) [${targets}]`;
    })
    .join('; ');
  expect(violations, `${label}: ${summary}`).toHaveLength(0);
}

test.describe('Accessibility (axe)', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    // Playwright requires hook args to be destructuring patterns and eslint
    // bans empty patterns ({}), so TestInfo is read via test.info() instead.
    test.skip(test.info().project.name !== 'chromium', 'chromium-only accessibility gate');

    // Hermetic Ko-fi coverage: pages inject the third-party widget script from
    // storage.ko-fi.com on window load, and nothing waits for it, so an
    // unreachable CDN would silently drop the .kofi-button/.kofitext nodes the
    // css contrast overrides target out of every scan (vacuous pass). The stub
    // mirrors the real call shape: loadKoFi() calls kofiwidget2.init(...) then
    // inserts getHTML(), which must contain a.kofi-button > span.kofitext.
    await page.route('**/storage.ko-fi.com/**', (route) => {
      if (route.request().url().includes('widget/Widget_2.js')) {
        route.fulfill({
          status: 200,
          contentType: 'application/javascript',
          body: [
            'kofiwidget2 = {',
            '  init: function () {},',
            '  getHTML: function () {',
            '    return \'<a href="https://ko-fi.com/X7B3253Q7T" class="kofi-button">' +
              '<span class="kofitext">Support</span></a>\';',
            '  }',
            '};',
          ].join('\n'),
        });
      } else {
        route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
      }
    });

    // Hermetic Google Translate: the language toggle only loads element.js on
    // click, but if a future change preloads it, an unreachable CDN must not
    // wedge pages or inject unscannable chrome. Stub defines an inert
    // TranslateElement that adds a hidden combo select (no visible DOM).
    const gtStub =
      'window.google = window.google || {}; ' +
      'window.google.translate = window.google.translate || {}; ' +
      'window.google.translate.TranslateElement = function (cfg, id) {' +
      '  var c = document.getElementById(id);' +
      '  if (c && !c.querySelector("select")) {' +
      '    var s = document.createElement("select");' +
      '    s.className = "goog-te-combo";' +
      '    s.hidden = true;' +
      '    c.appendChild(s);' +
      '  }' +
      '};' +
      'window.google.translate.TranslateElement.InlineLayout = { SIMPLE: "SIMPLE" };';
    await page.route('**/translate.google.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: gtStub })
    );
    await page.route('**/translate.googleapis.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
    );
    await page.route('**/translate-pa.googleapis.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
    );
  });

  for (const vp of VIEWPORTS) {
    test.describe(vp.name, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      for (const p of PAGES) {
        test(`static ${p}`, async ({ page }) => {
          await page.goto(`${BASE}/${p}`, { waitUntil: 'load', timeout: 20000 });
          const settle = SETTLE[p];
          if (settle) await settle(page);
          assertClean(await scan(page, p), `${p} @${vp.name}`);
        });
      }
    });
  }

  test('ko-fi mock renders scannable fixture', async ({ page }) => {
    await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 20000 });
    // Injection happens on window load + script onload (async even when
    // mocked), so poll instead of asserting immediately. Visible, not merely
    // attached: axe skips hidden nodes, so visibility is what makes the scoped
    // .kofi-button/.kofitext contrast overrides genuinely exercised by scans.
    await expect(page.locator('.ko-fi-support .kofitext')).toBeVisible({ timeout: 15000 });
  });

  test('detail overlay: creature (bestiary)', async ({ page }) => {
    await page.goto(`${BASE}/bestiary.html?creature=troll-norway`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#creature-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    await expect(page.locator('#detail-content')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    await expect(page.locator('#detail-name')).toContainText(/troll/i, { timeout: 20000 });
    assertClean(await scan(page, 'bestiary-detail'), 'bestiary detail overlay');
  });

  test('detail overlay: story', async ({ page }) => {
    await page.goto(`${BASE}/stories.html?story=ragnark-the-end-and-rebirth`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#story-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    await expect(page.locator('#detail-content')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    await expect(page.locator('#detail-title')).toContainText(/ragnark|ragnar/i, { timeout: 20000 });
    assertClean(await scan(page, 'stories-detail'), 'stories detail overlay');
  });

  test('detail overlay: item', async ({ page }) => {
    await page.goto(`${BASE}/items.html?item=mjolnir`, {
      waitUntil: 'load',
      timeout: 20000,
    });
    await expect(page.locator('#item-detail')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    await expect(page.locator('#detail-content')).not.toHaveClass(/is-hidden/, { timeout: 20000 });
    await expect(page.locator('#detail-name')).toContainText(/mjölnir|mjolnir/i, { timeout: 20000 });

    assertClean(await scan(page, 'items-detail'), 'items detail overlay');
  });

  test('search results state', async ({ page }) => {
    await page.goto(`${BASE}/search.html?q=troll`, { waitUntil: 'load', timeout: 20000 });
    await expect(page.locator('#search-status')).toContainText(/results? for "troll"/, { timeout: 20000 });
    assertClean(await scan(page, 'search-results'), 'search results');
  });
});
