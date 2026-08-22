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
    var sv = document.querySelector('#language-menu [data-code="sv"]');
    sv.click();
    expect(applied).toEqual(['sv']);
    expect(LT.readGoogtrans()).toBe('sv');
    expect(document.getElementById('language-menu')).toBeFalsy(); // rebuilt lazily
    LT.clearGoogtrans();
  });
});
