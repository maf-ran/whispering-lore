/**
 * @jest-environment jsdom
 */

var dbStore = {};

function makeRequest (result) {
  var req = { result: result, onerror: null };
  Object.defineProperty(req, 'onsuccess', {
    set: function (fn) {
      if (typeof fn === 'function') fn({ target: req });
    }
  });
  return req;
}

function makeTx (mockStore) {
  var tx = {
    objectStore: jest.fn(function () { return mockStore }),
    onerror: null
  };
  Object.defineProperty(tx, 'oncomplete', {
    set: function (fn) {
      if (typeof fn === 'function') fn();
    }
  });
  return tx;
}

beforeAll(function () {
  var mockStore = {
    put: jest.fn(function (record) {
      dbStore[record.type] = record;
    }),
    get: jest.fn(function (type) {
      return makeRequest(dbStore[type] || null);
    }),
    delete: jest.fn(function (type) {
      delete dbStore[type];
      return makeRequest();
    }),
    clear: jest.fn(function () {
      dbStore = {};
      return makeRequest();
    }),
    getAll: jest.fn(function () {
      return makeRequest(Object.values(dbStore));
    })
  };

  var mockDB = {
    close: jest.fn(),
    objectStoreNames: { contains: jest.fn(function () { return true }) },
    transaction: jest.fn(function () { return makeTx(mockStore) }),
    createObjectStore: jest.fn()
  };

  global.indexedDB = {
    open: jest.fn(function () {
      var req = { onerror: null };
      Object.defineProperty(req, 'onsuccess', {
        set: function (fn) {
          if (typeof fn === 'function') {
            fn({ target: { result: mockDB } });
          }
        }
      });
      return req;
    })
  };
});

afterAll(function () {
  delete global.indexedDB;
});

beforeEach(function () {
  dbStore = {};
  jest.resetModules();
  jest.isolateModules(function () {
    require('../js/db.js');
  });
});

describe('db.js', function () {
  it('exposes window.__DB with all methods', function () {
    expect(window.__DB).toBeDefined();
    expect(typeof window.__DB.store).toBe('function');
    expect(typeof window.__DB.load).toBe('function');
    expect(typeof window.__DB.remove).toBe('function');
    expect(typeof window.__DB.clearAll).toBe('function');
    expect(typeof window.__DB.list).toBe('function');
    expect(typeof window.__DB.close).toBe('function');
  });

  it('store() and load() round-trip data', function (done) {
    window.__DB.store('test-type', { foo: 'bar', num: 42 }, function () {
      window.__DB.load('test-type', function (result) {
        expect(result).toEqual({ foo: 'bar', num: 42 });
        done();
      });
    });
  });

  it('load() returns null for missing key', function (done) {
    window.__DB.load('nonexistent', function (result) {
      expect(result).toBeNull();
      done();
    });
  });

  it('remove() deletes a cached entry', function (done) {
    window.__DB.store('remove-me', { x: 1 }, function () {
      window.__DB.remove('remove-me', function () {
        window.__DB.load('remove-me', function (result) {
          expect(result).toBeNull();
          done();
        });
      });
    });
  });

  it('clearAll() empties all cache entries', function (done) {
    window.__DB.store('a', { v: 1 }, function () {
      window.__DB.store('b', { v: 2 }, function () {
        window.__DB.clearAll(function () {
          window.__DB.list(function (list) {
            expect(list).toEqual([]);
            done();
          });
        });
      });
    });
  });

  it('list() returns metadata for all cached entries', function (done) {
    window.__DB.store('alpha', { v: 1 }, function () {
      window.__DB.store('beta', { v: 2 }, function () {
        window.__DB.list(function (entries) {
          expect(entries.length).toBe(2);
          var types = entries.map(function (e) { return e.type }).sort();
          expect(types).toEqual(['alpha', 'beta']);
          entries.forEach(function (e) {
            expect(typeof e.cachedAt).toBe('number');
            expect(e.cachedAt).toBeGreaterThan(0);
          });
          done();
        });
      });
    });
  });

  it('list() returns empty array when nothing cached', function (done) {
    window.__DB.list(function (entries) {
      expect(entries).toEqual([]);
      done();
    });
  });

  it('close() resets connection and subsequent load works', function (done) {
    window.__DB.store('persist', { val: true }, function () {
      window.__DB.close(function () {
        window.__DB.load('persist', function (result) {
          expect(result).toEqual({ val: true });
          done();
        });
      });
    });
  });

  it('store and load handles multiple entries', function (done) {
    window.__DB.store('a', { n: 1 }, function () {
      window.__DB.store('b', { n: 2 }, function () {
        window.__DB.store('c', { n: 3 }, function () {
          window.__DB.list(function (entries) {
            expect(entries.length).toBe(3);
            done();
          });
        });
      });
    });
  });
});
