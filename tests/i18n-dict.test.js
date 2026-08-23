/** @jest-environment jsdom */
/* eslint-env node */

describe('chrome i18n dictionary', function () {
  var D;
  beforeAll(function () {
    require('../js/i18n.js');
    D = window.__i18n;
  });

  test('sv dictionary covers every en key', function () {
    Object.keys(D.en).forEach(function (k) {
      expect(typeof D.sv[k]).toBe('string');
      expect(D.sv[k].length).toBeGreaterThan(0);
    });
  });

  test('applier swaps data-i18n nodes when native', function () {
    document.body.innerHTML =
      '<nav><a href="/index.html" data-i18n="nav.home">Home</a></nav>';
    window.history.replaceState({}, '', '/index.html?lang=sv');
    D.applyChrome();
    expect(document.querySelector('[data-i18n="nav.home"]').textContent).toBe(D.sv['nav.home']);
    window.history.replaceState({}, '', '/index.html');
    document.body.innerHTML =
      '<nav><a href="/index.html" data-i18n="nav.home">Home</a></nav>';
    D.applyChrome();
    expect(document.querySelector('[data-i18n="nav.home"]').textContent).toBe('Home');
  });

  test('sets html lang + localized title/description when native', function () {
    document.head.innerHTML =
      '<title>Whispering Lore</title><meta name="description" content="x"/>';
    window.history.replaceState({}, '', '/index.html?lang=sv');
    D.applyChrome();
    expect(document.documentElement.lang).toBe('sv');
    expect(document.title).toBe(D.sv['title.index']);
    window.history.replaceState({}, '', '/index.html');
  });
});
