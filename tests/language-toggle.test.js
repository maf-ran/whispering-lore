/** @jest-environment jsdom */
/* eslint-env node */

describe('languageToggle data', function () {
  var LT;

  beforeAll(function () {
    require('../js/language-toggle.js');
    LT = window.__languageToggle;
  });

  test('exposes grouped language map with native labels', function () {
    expect(Array.isArray(LT.GROUPS)).toBe(true);
    expect(LT.GROUPS.length).toBeGreaterThanOrEqual(8);
    LT.GROUPS.forEach(function (g) {
      expect(typeof g.label).toBe('string');
      expect(g.label.length).toBeGreaterThan(0);
      expect(Array.isArray(g.codes)).toBe(true);
      g.codes.forEach(function (pair) {
        expect(pair).toHaveLength(2);
        expect(typeof pair[0]).toBe('string');
        expect(typeof pair[1]).toBe('string');
      });
    });
  });

  test('has 40+ unique valid Google Translate codes', function () {
    var seen = {};
    var count = 0;
    LT.allCodes().forEach(function (code) {
      expect(code).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      expect(seen[code]).toBeFalsy();
      seen[code] = true;
      count++;
    });
    expect(count).toBeGreaterThanOrEqual(40);
    expect(seen['sv']).toBe(true);
  });

  test('builds and parses the googtrans cookie value', function () {
    expect(LT.buildGoogtransValue('sv')).toBe('/en/sv');
    document.cookie = 'googtrans=' + LT.buildGoogtransValue('sv') + ';path=/';
    expect(LT.readGoogtrans()).toBe('sv');
  });

  test('setGoogtrans writes cookie, clearGoogtrans removes it', function () {
    LT.setGoogtrans('fr');
    expect(LT.readGoogtrans()).toBe('fr');
    LT.clearGoogtrans();
    expect(LT.readGoogtrans()).toBeNull();
  });
})

describe('languageToggle UI', function () {
  var LT;

  beforeEach(function () {
    document.body.innerHTML = '<header><nav id="site-nav"></nav><button class="theme-toggle" id="theme-toggle" aria-label="Toggle light/dark mode"></button></header>';
    LT = window.__languageToggle;
    LT.initUI();
  });

  afterEach(function () {
    LT._resetForTests();
    document.body.innerHTML = '';
  });

  test('injects square button directly below the theme toggle', function () {
    var btn = document.getElementById('lang-toggle');
    expect(btn).toBeTruthy();
    expect(btn.previousElementSibling.id).toBe('theme-toggle');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.querySelector('svg')).toBeTruthy();
  });

  test('menu opens and closes; aria-expanded tracks state', function () {
    var btn = document.getElementById('lang-toggle');
    var menu = document.getElementById('language-menu');
    btn.click();
    expect(menu.hidden).toBe(false);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    btn.click();
    expect(menu.hidden).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('menu lists every language code exactly once plus Original', function () {
    var btn = document.getElementById('lang-toggle');
    btn.click();
    var items = Array.prototype.slice.call(
      document.querySelectorAll('#language-menu [data-code]')
    );
    var codes = items.map(function (el) { return el.getAttribute('data-code') });
    expect(codes[0]).toBe('');
    expect(codes.slice(1).sort()).toEqual(LT.allCodes().sort());
  });

  test('auto-restores translation when googtrans cookie pre-exists', function () {
    LT._resetForTests();
    document.body.innerHTML =
      '<header><nav id="site-nav"></nav><button class="theme-toggle" id="theme-toggle"></button></header>';
    LT.setGoogtrans('de');
    LT.initUI();
    expect(
      document.querySelector('script[src*="translate.google.com"]')
    ).toBeTruthy();
    LT.clearGoogtrans();
  });

  test('open focuses the active item (or first), arrows cycle, Tab closes', function () {
    var btn = document.getElementById('lang-toggle');
    btn.click();
    var items = document.querySelectorAll('#language-menu [data-code]');
    expect(document.activeElement).toBe(items[0]); // Original, nothing active yet

    items[1].focus();
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
    );
    expect(document.activeElement).toBe(items[2]);

    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })
    );
    expect(document.activeElement).toBe(items[0]); // wraps to first

    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })
    );
    expect(document.getElementById('language-menu').hidden).toBe(true);
  });

  test('open lands on the marked active language when one is stored', function () {
    LT._resetForTests();
    document.body.innerHTML =
      '<header><nav id="site-nav"></nav><button class="theme-toggle" id="theme-toggle"></button></header>';
    LT.setGoogtrans('fr');
    LT.initUI();
    var fr = document.querySelector('#language-menu [data-code="fr"]');
    expect(fr.classList.contains('is-active')).toBe(true);
    document.getElementById('lang-toggle').click();
    expect(document.activeElement).toBe(fr);
    LT.clearGoogtrans();
  });

  test('Escape closes an open menu and returns focus to the button', function () {
    var btn = document.getElementById('lang-toggle');
    var menu = document.getElementById('language-menu');
    btn.click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(btn);
  });

  test('clicking a language sets cookie, notifies applier, closes menu', function () {
    var applied = [];
    LT._setComboApplierForTests(function (code) { applied.push(code); });
    var btn = document.getElementById('lang-toggle');
    btn.click();
    // 'de' exercises the Google-Translate path; 'sv' is native mode now.
    var de = document.querySelector('#language-menu [data-code="de"]');
    de.click();
    expect(applied).toEqual(['de']);
    expect(LT.readGoogtrans()).toBe('de');
    expect(document.getElementById('language-menu')).toBeFalsy(); // rebuilt lazily
    LT.clearGoogtrans();
  });
});

describe('languageToggle google integration', function () {
  var LT;

  beforeEach(function () {
    document.body.innerHTML =
      '<header><nav id="site-nav"></nav>' +
      '<button class="theme-toggle" id="theme-toggle"></button></header>';
    LT = window.__languageToggle;
    LT._resetForTests();
    LT.initUI();
  });

  afterEach(function () {
    LT._resetForTests();
    delete window.google;
    delete window.__languageToggleInit;
    document.body.innerHTML = '';
  });

  test('ensureTranslate injects script, initializes once via callback', async function () {
    var configs = [];
    window.google = {
      translate: {
        TranslateElement: function (cfg, containerId) {
          configs.push({ cfg: cfg, containerId: containerId });
        }
      }
    };
    window.google.translate.TranslateElement.InlineLayout = { SIMPLE: 'SIMPLE' };
    var p = LT.ensureTranslate();
    expect(configs).toHaveLength(0);
    expect(document.querySelector('script[src*="element.js"]')).toBeTruthy();
    window.__languageToggleInit();
    await p;
    expect(configs).toHaveLength(1);
    expect(configs[0].cfg.pageLanguage).toBe('en');
    expect(configs[0].cfg.autoDisplay).toBe(false);
    expect(configs[0].cfg.includedLanguages.split(',')).toContain('sv');
    expect(configs[0].containerId).toBe('google_translate_element');
    await LT.ensureTranslate();
    expect(configs).toHaveLength(1);
  });

  test('applyLanguage stores cookie and reloads; resetToOriginal clears and reloads', function () {
    var reloads = [];
    LT._setReloaderForTests(function () { reloads.push(1); });

    LT.applyLanguage('de');
    expect(reloads).toHaveLength(1);
    expect(LT.readGoogtrans()).toBe('de');

    LT.resetToOriginal();
    expect(reloads).toHaveLength(2);
    expect(LT.readGoogtrans()).toBeNull();
  });

  test('applyLanguage uses injected applier without GT when set (unit path)', function () {
    var applied = [];
    LT._setComboApplierForTests(function (code) { applied.push(code); });
    LT.applyLanguage('sv');
    expect(applied).toEqual(['sv']);
    expect(LT.readGoogtrans()).toBe('sv');
    LT.clearGoogtrans();
  });

  test('script failure hides the toggle button and rejects', async function () {
    var realCreate = document.createElement.bind(document);
    var spy = jest.spyOn(document, 'createElement').mockImplementation(function (tag) {
      var el = realCreate(tag);
      if (tag === 'script') {
        setTimeout(function () {
          el.dispatchEvent(new Event('error'));
        }, 0);
      }
      return el;
    });
    await LT.ensureTranslate().catch(function () {});
    expect(document.getElementById('lang-toggle')).toBeFalsy();

    // retry allowed: promise was reset on failure; second attempt succeeds
    spy.mockRestore();
    window.google = {
      translate: {
        TranslateElement: function () {}
      }
    };
    window.google.translate.TranslateElement.InlineLayout = { SIMPLE: 'SIMPLE' };
    var p = LT.ensureTranslate();
    window.__languageToggleInit();
    await p;
    expect(document.getElementById('google_translate_element')).toBeTruthy();
  });
});

describe('languageToggle native mode switching', function () {
  var LT;

  beforeEach(function () {
    document.body.innerHTML =
      '<header><nav id="site-nav"></nav>' +
      '<button class="theme-toggle" id="theme-toggle"></button></header>';
    LT = window.__languageToggle;
    LT._resetForTests();
    LT.initUI();
  });
  afterEach(function () {
    LT._resetForTests();
    window.history.replaceState({}, '', '/index.html');
    document.body.innerHTML = '';
  });

  test('chooseSvenska clears GT cookie, navigates to ?lang=sv keeping params', function () {
    LT.setGoogtrans('de');
    window.history.replaceState({}, '', '/bestiary.html?creature=tomte');
    var navs = [];
    LT._setNavigatorForTests(function (url) { navs.push(url); });
    LT.chooseNative();
    expect(navs).toEqual(['/bestiary.html?creature=tomte&lang=sv']);
    expect(LT.readGoogtrans()).toBeNull();
  });

  test('leaving native strips lang param and hands off to GT flow', function () {
    window.history.replaceState({}, '', '/bestiary.html?lang=sv&creature=tomte');
    var navs = [];
    LT._setNavigatorForTests(function (url) { navs.push(url); });
    LT.leaveNative();
    expect(navs).toEqual(['/bestiary.html?creature=tomte']);
  });

  test('menu marks Svenska with native dot when coverage flag set', function () {
    LT.NATIVE_COVERAGE_READY = true;
    document.getElementById('lang-toggle').click();
    var sv = document.querySelector('#language-menu [data-code="sv"]');
    expect(sv.classList.contains('is-native')).toBe(true);
  });
});
