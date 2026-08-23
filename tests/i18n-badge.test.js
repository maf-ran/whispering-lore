/** @jest-environment jsdom */
/* eslint-env node */

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addEventListener: function () {},
      removeEventListener: function () {},
    };
  };

describe('i18n pending badge helper', function () {
  var U;
  beforeAll(function () {
    require('../js/shared-utils.js');
    U = window.__sharedUtils;
  });

  test('creates badge element only for partial entries in native mode', function () {
    window.history.replaceState({}, '', '/index.html?lang=sv');
    var el = U.i18nBadgeEl({ _i18n: { lang: 'sv', partial: true } });
    expect(el).toBeTruthy();
    expect(el.className).toBe('i18n-pending');
    expect(el.textContent).toBe('översättning saknas');
    expect(U.i18nBadgeEl({})).toBeNull();
    expect(U.i18nBadgeEl(null)).toBeNull();
    expect(
      U.i18nBadgeEl({ _i18n: { lang: 'sv', partial: true } })
    ).toBeTruthy();
  });

  test('no badge outside native mode', function () {
    window.history.replaceState({}, '', '/index.html');
    expect(U.i18nBadgeEl({ _i18n: { lang: 'sv', partial: true } })).toBeNull();
  });
});
