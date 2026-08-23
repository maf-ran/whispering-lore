/** @jest-environment jsdom */
/* eslint-env node */

// jsdom lacks matchMedia; shared-utils initPageTransitions() needs it
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addEventListener: function () {},
      removeEventListener: function () {},
    };
  };

describe('native lang helpers', function () {
  var U;
  beforeAll(function () {
    require('../js/shared-utils.js');
    U = window.__sharedUtils;
  });

  test('getNativeLang parses ?lang= only for sv', function () {
    window.history.replaceState({}, '', '/bestiary.html?lang=sv');
    expect(U.getNativeLang()).toBe('sv');
    window.history.replaceState({}, '', '/bestiary.html?lang=de');
    expect(U.getNativeLang()).toBeNull(); // only sv ships natively
    window.history.replaceState({}, '', '/bestiary.html?creature=tomte');
    expect(U.getNativeLang()).toBeNull();
  });

  test('withLang appends/preserves/replaces lang param', function () {
    expect(U.withLang('/stories.html', 'sv')).toBe('/stories.html?lang=sv');
    expect(U.withLang('/stories.html?story=x', 'sv')).toBe('/stories.html?story=x&lang=sv');
    expect(U.withLang('/stories.html?lang=sv&page=2', null)).toBe('/stories.html?page=2');
    expect(U.withLang('/stories.html?lang=de', 'sv')).toBe('/stories.html?lang=sv');
  });

  test('isNative reflects URL and stripLangUrl builds clean path', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    expect(U.isNative()).toBe(true);
    expect(
      U.stripLangUrl('http://localhost/bestiary.html?lang=sv&x=1')
    ).toBe('http://localhost/bestiary.html?x=1');
  });
});
