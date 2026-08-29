/** @jest-environment jsdom */
/* eslint-env node */

describe('translate (Gemini on-demand)', function () {
  var T;
  var calls = [];

  function setupDom() {
    document.body.innerHTML =
      '<nav><a data-i18n="nav.home">HOME</a></nav>' +
      '<section id="bestiary-grid"><div class="card"><h2 class="card-title">Draugr</h2>' +
      '<p class="card-summary">An undead creature.</p></div></section>' +
      '<input data-i18n-placeholder="search.placeholder" placeholder="Search">';
    window.__i18n = {
      en: { 'nav.home': 'HOME', 'search.placeholder': 'Search', 'title.index': 'Title' },
      sv: {}
    };
  }

  function mockFetch() {
    calls = [];
    global.fetch = function (url, opts) {
      calls.push({ url: url, body: JSON.parse(opts.body) });
      var payload = JSON.parse(opts.body);
      return Promise.resolve({
        ok: true,
        status: 200,
        json: function () {
          return Promise.resolve({
            translations: payload.strings.map(function (s) { return 'TR[' + s + ']' })
          });
        }
      });
    };
  }

  beforeAll(function () {
    require('../js/translate.js');
    T = window.__translate;
  });

  beforeEach(function () {
    localStorage.clear();
    setupDom();
    mockFetch();
    T.disable();
  });

  test('exposes the public API', function () {
    expect(typeof T.enable).toBe('function');
    expect(typeof T.disable).toBe('function');
    expect(typeof T.isActive).toBe('function');
    expect(typeof T.getActive).toBe('function');
    expect(typeof T.setLangParam).toBe('function');
  });

  test('enable translates chrome [data-i18n] and sets document lang', function () {
    return T.enable('fr').then(function () {
      expect(document.documentElement.getAttribute('lang')).toBe('fr');
      var nav = document.querySelector('[data-i18n="nav.home"]');
      // Chrome dict is built from en dict via the endpoint -> 'TR[HOME]'
      expect(nav.textContent).toBe('TR[HOME]');
      expect(T.isActive()).toBe(true);
      expect(T.getActive()).toBe('fr');
    });
  });

  test('sends a POST to the translate function with target language', function () {
    return T.enable('de').then(function () {
      expect(calls.length).toBeGreaterThanOrEqual(1);
      var last = calls[calls.length - 1];
      expect(last.url).toBe('/.netlify/functions/translate');
      expect(last.body.target).toBe('de');
      expect(Array.isArray(last.body.strings)).toBe(true);
    });
  });

  test('disable reverts original English text', function () {
    return T.enable('es').then(function () {
      var nav = document.querySelector('[data-i18n="nav.home"]');
      expect(nav.textContent).toBe('TR[HOME]');
      T.disable();
      expect(nav.textContent).toBe('HOME');
      expect(T.isActive()).toBe(false);
    });
  });

  test('503 not_configured degrades to English without crashing', function () {
    global.fetch = function () {
      return Promise.resolve({ ok: false, status: 503, json: function () { return Promise.resolve({ error: 'not_configured' }) } });
    };
    return T.enable('fr').then(
      function () { throw new Error('should have rejected'); },
      function () {
        expect(T.isActive()).toBe(false);
        expect(document.querySelector('[data-i18n="nav.home"]').textContent).toBe('HOME');
      }
    );
  });

  test('setLangParam adds gmlang to the URL', function () {
    window.history.replaceState(null, '', '/bestiary.html?creature=x');
    T.setLangParam('ru');
    expect(window.location.search).toMatch(/gmlang=ru/);
  });
});
