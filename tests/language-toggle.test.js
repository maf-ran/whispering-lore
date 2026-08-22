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
