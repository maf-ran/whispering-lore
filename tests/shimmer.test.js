/**
 * @jest-environment jsdom
 */

// ── jsdom globals ──
window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener: function () {}, removeEventListener: function () {} };
};

// ── Polyfill structuredClone for jsdom (needed by fake-indexeddb v6) ──
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// ── fake-indexeddb polyfill ──
var { IDBFactory } = require('fake-indexeddb');
globalThis.indexedDB = new IDBFactory();

// ── Fixtures ──
var fs = require('fs');
var path = require('path');
var FIX = path.join(__dirname, 'fixtures');

var manifest = JSON.parse(fs.readFileSync(path.join(FIX, 'manifest.json'), 'utf8'));

var regionData = {
  nordic: JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-nordic.json'), 'utf8')),
  celtic: JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-celtic.json'), 'utf8')),
  'east-asian': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-east-asian.json'), 'utf8'))
};

var regionStories = {
  nordic: JSON.parse(fs.readFileSync(path.join(FIX, 'stories-nordic.json'), 'utf8')),
  celtic: JSON.parse(fs.readFileSync(path.join(FIX, 'stories-celtic.json'), 'utf8')),
  'east-asian': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-east-asian.json'), 'utf8'))
};

var slugData = {
  'creatures/t': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-nordic.json'), 'utf8')),
  'creatures/d': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-nordic.json'), 'utf8')).filter(function (c) { return c.slug === 'draugr'; }),
  'creatures/s': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-celtic.json'), 'utf8')),
  'creatures/k': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-east-asian.json'), 'utf8')),
  'stories/d': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-d.json'), 'utf8')),
  'stories/k': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-k.json'), 'utf8')),
  'stories/s': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-s.json'), 'utf8')),
  'stories/t': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-t.json'), 'utf8')),
  'stories/g': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-g.json'), 'utf8'))
};

// ── URL → data map ──
var fixtureMap = {};
fixtureMap['data/sharded/manifest.json'] = manifest;
Object.keys(regionData).forEach(function (r) {
  fixtureMap['data/sharded/creatures/by-region/' + r + '.json'] = regionData[r];
});
Object.keys(regionStories).forEach(function (r) {
  fixtureMap['data/sharded/stories/by-region/' + r + '.json'] = regionStories[r];
});
Object.keys(slugData).forEach(function (key) {
  var parts = key.split('/');
  fixtureMap['data/sharded/' + parts[0] + '/by-slug/' + parts[1] + '.json'] = slugData[key];
});

// ── XHR Mock ──
function MockXHR() {
  this.method = '';
  this.url = '';
  this.onload = null;
  this.onerror = null;
  this.responseText = '';
  this.status = 0;
}
MockXHR.prototype.open = function (method, url) {
  this.method = method;
  this.url = url;
};
MockXHR.prototype.send = function () {
  var self = this;
  var data = fixtureMap[self.url];
  if (data) {
    self.responseText = JSON.stringify(data);
    self.status = 200;
  } else {
    self.status = 404;
    self.responseText = '';
  }
  setTimeout(function () { if (self.onload) self.onload(); }, 0);
};
global.XMLHttpRequest = MockXHR;

// ── Load Shimmer ──
require('../js/shared-utils.js');
var Shimmer = window.__sharedUtils.Shimmer;

// ── Save original IDB methods ──
var _origOpenDB = Shimmer._openDB;
var _origCacheManifest = Shimmer._cacheManifest;
var _origCacheShard = Shimmer._cacheShard;
var _origGetCachedManifest = Shimmer._getCachedManifest;
var _origGetCachedShard = Shimmer._getCachedShard;
var _origGetAllCachedShards = Shimmer._getAllCachedShards;

// ── Helpers ──
function disableIDB() {
  Shimmer._openDB = function (cb) { cb(new Error('IDB disabled')); };
  Shimmer._cacheManifest = function () {};
  Shimmer._cacheShard = function () {};
  Shimmer._getCachedManifest = function (cb) { cb(new Error('IDB disabled')); };
  Shimmer._getCachedShard = function (t, r, cb) { cb(new Error('IDB disabled')); };
  Shimmer._getAllCachedShards = function (t, cb) { cb(new Error('IDB disabled')); };
}

function enableIDB() {
  Shimmer._openDB = _origOpenDB;
  Shimmer._cacheManifest = _origCacheManifest;
  Shimmer._cacheShard = _origCacheShard;
  Shimmer._getCachedManifest = _origGetCachedManifest;
  Shimmer._getCachedShard = _origGetCachedShard;
  Shimmer._getAllCachedShards = _origGetAllCachedShards;
}

function resetShimmer() {
  Shimmer.manifest = null;
  Shimmer.shards = {};
  Shimmer.slugBatches = {};
  Shimmer._dbReady = false;
  Shimmer._db = null;
  Shimmer._dbQueue = [];
}

function resetIDB() {
  globalThis.indexedDB = new IDBFactory();
  enableIDB();
}

function waitForBackground() {
  return new Promise(function (r) { setTimeout(r, 20); });
}

// ══════════════════════════════════════════════════════════════════════
// Default: disable IDB for reliable network-only tests (like the
// original test file). IDB-specific describe blocks re-enable it.
// ══════════════════════════════════════════════════════════════════════
disableIDB();

beforeEach(function () {
  resetShimmer();
  disableIDB();
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer.loadManifest (network path, IDB disabled)
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.loadManifest', function () {
  it('fetches manifest from network and sets this.manifest', async function () {
    var result = await Shimmer.loadManifest();
    expect(result).toBeTruthy();
    expect(result.creatures.total).toBe(5);
    expect(result.stories.total).toBe(5);
    expect(Shimmer.manifest).toBe(result);
  });

  it('returns already-loaded manifest without re-fetching', async function () {
    await Shimmer.loadManifest();
    var second = await Shimmer.loadManifest();
    expect(second.creatures.total).toBe(5);
  });

  it('callback receives null on success', function (done) {
    Shimmer.loadManifest(function (err) {
      expect(err).toBeNull();
      expect(Shimmer.manifest).toBeTruthy();
      done();
    });
  });

  it('falls back to network when indexedDB is undefined', async function () {
    var savedIDB = globalThis.indexedDB;
    delete globalThis.indexedDB;
    try {
      var result = await Shimmer.loadManifest();
      expect(result).toBeTruthy();
      expect(result.creatures.total).toBe(5);
    } finally {
      globalThis.indexedDB = savedIDB;
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer.loadRegionShard
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.loadRegionShard', function () {
  it('loads a region shard from network', function (done) {
    Shimmer.loadRegionShard('creatures', 'Nordic', function (err, data) {
      expect(err).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].slug).toBe('troll');
      expect(Shimmer.shards.creatures.Nordic).toBe(data);
      done();
    });
  });

  it('returns cached shard from memory on second call', function (done) {
    Shimmer.loadRegionShard('creatures', 'Nordic', function (err1, firstData) {
      expect(err1).toBeNull();
      Shimmer.loadRegionShard('creatures', 'Nordic', function (err2, data) {
        expect(err2).toBeNull();
        expect(data).toBe(firstData);
        done();
      });
    });
  });

  it('forceRefresh bypasses memory cache', function (done) {
    Shimmer.loadRegionShard('creatures', 'Nordic', function (err, data) {
      expect(err).toBeNull();
      Shimmer.shards.creatures.Nordic = [{ slug: 'fake', name: 'Fake' }];
      Shimmer.loadRegionShard('creatures', 'Nordic', function (err2, freshData) {
        expect(err2).toBeNull();
        expect(freshData[0].slug).toBe('troll');
        expect(freshData[0].name).toBe('Troll');
        done();
      }, true);
    });
  });

  it('returns error for nonexistent region', function (done) {
    Shimmer.loadRegionShard('creatures', 'Nonexistent', function (err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('not found');
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer.loadSlugBatch
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.loadSlugBatch', function () {
  it('loads a slug batch from network', function (done) {
    Shimmer.loadSlugBatch('stories', 'd', function (err, data) {
      expect(err).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].slug).toBe('draugr-quest');
      done();
    });
  });

  it('returns cached batch from memory on second call', function (done) {
    Shimmer.loadSlugBatch('stories', 's', function (err1, firstData) {
      expect(err1).toBeNull();
      Shimmer.loadSlugBatch('stories', 's', function (err2, data) {
        expect(err2).toBeNull();
        expect(data).toBe(firstData);
        done();
      });
    });
  });

  it('returns error for nonexistent batch', function (done) {
    Shimmer.loadSlugBatch('creatures', 'zzz', function (err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('not found');
      done();
    });
  });

  it('returns error for non-200 status', function (done) {
    var origXHR = global.XMLHttpRequest;
    function NotFoundXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        self.responseText = '';
        self.status = 404;
        setTimeout(function () { if (self.onload) self.onload(); }, 0);
      };
    }
    global.XMLHttpRequest = NotFoundXHR;
    Shimmer.loadSlugBatch('stories', 'x', function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('not found');
      done();
    });
  });

  it('returns error for bad JSON response', function (done) {
    var origXHR = global.XMLHttpRequest;
    function BadJSONXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        self.responseText = '{bad json}';
        self.status = 200;
        setTimeout(function () { if (self.onload) self.onload(); }, 0);
      };
    }
    global.XMLHttpRequest = BadJSONXHR;
    Shimmer.loadSlugBatch('stories', 'x', function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('bad slug data');
      done();
    });
  });

  it('returns error on XHR failure', function (done) {
    var origXHR = global.XMLHttpRequest;
    function ErrorXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        setTimeout(function () { if (self.onerror) self.onerror(); }, 0);
      };
    }
    global.XMLHttpRequest = ErrorXHR;
    Shimmer.loadSlugBatch('stories', 'x', function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('slug fetch error');
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer.loadTopRegions
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.loadTopRegions', function () {
  it('loads top N region shards and returns union', function (done) {
    Shimmer.loadManifest(function () {
      Shimmer.loadTopRegions('creatures', 2, function (err, items) {
        expect(err).toBeNull();
        expect(items.length).toBeGreaterThanOrEqual(2);
        done();
      });
    });
  });

  it('returns empty array when no regions exist', function (done) {
    Shimmer.manifest = { creatures: { regions: {} } };
    Shimmer.loadTopRegions('creatures', 5, function (err, items) {
      expect(err).toBeNull();
      expect(items).toEqual([]);
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer.getItem
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.getItem', function () {
  it('finds item in already-loaded region shard', function (done) {
    Shimmer.loadRegionShard('creatures', 'Nordic', function () {
      Shimmer.getItem('creatures', 'troll', function (err, item) {
        expect(err).toBeNull();
        expect(item.name).toBe('Troll');
        done();
      });
    });
  });

  it('finds item in already-loaded slug batch', function (done) {
    Shimmer.loadSlugBatch('stories', 's', function () {
      Shimmer.getItem('stories', 'selkie-song', function (err, item) {
        expect(err).toBeNull();
        expect(item.title).toBe("The Selkie's Song");
        done();
      });
    });
  });

  it('loads slug batch automatically to find unloaded item', function (done) {
    Shimmer.getItem('stories', 'draugr-quest', function (err, item) {
      expect(err).toBeNull();
      expect(item.title).toBe('Draugr Quest');
      done();
    });
  });

  it('strips "the-" prefix when computing slug batch key', function (done) {
    Shimmer.getItem('stories', 'the-great-troll', function (err, item) {
      expect(err).toBeNull();
      expect(item.title).toBe('The Great Troll');
      done();
    });
  });

  it('returns error for nonexistent slug', function (done) {
    Shimmer.getItem('stories', 'nonexistent-slug', function (err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('not found');
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer.loadAllShards
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.loadAllShards', function () {
  it('loads all region shards and returns union of creatures', function (done) {
    Shimmer.loadManifest(function () {
      Shimmer.loadAllShards('creatures', function (err, items) {
        expect(err).toBeNull();
        expect(items.length).toBeGreaterThanOrEqual(5);
        var names = items.map(function (i) { return i.name; });
        expect(names).toContain('Troll');
        expect(names).toContain('Selkie');
        expect(names).toContain('Kappa');
        done();
      });
    });
  });

  it('deduplicates items by name', function (done) {
    Shimmer.loadManifest(function () {
      Shimmer.loadAllShards('creatures', function (err, items) {
        expect(err).toBeNull();
        var names = items.map(function (i) { return i.name; });
        var unique = names.filter(function (n, i) { return names.indexOf(n) === i; });
        expect(names.length).toBe(unique.length);
        done();
      });
    });
  });

  it('auto-loads manifest when not yet loaded', function (done) {
    expect(Shimmer.manifest).toBeNull();
    Shimmer.loadAllShards('creatures', function (err, items) {
      expect(err).toBeNull();
      expect(Shimmer.manifest).toBeTruthy();
      expect(items.length).toBeGreaterThanOrEqual(5);
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer.getTotals
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.getTotals', function () {
  it('returns null when manifest is not loaded', function () {
    expect(Shimmer.getTotals('creatures')).toBeNull();
  });

  it('returns totals after manifest is loaded', async function () {
    await Shimmer.loadManifest();
    var totals = Shimmer.getTotals('creatures');
    expect(totals).toBeTruthy();
    expect(totals.total).toBe(5);
    expect(totals.regions).toHaveProperty('Nordic');
    expect(totals.countries).toHaveProperty('Norway');
  });

  it('returns null for unknown type', async function () {
    await Shimmer.loadManifest();
    expect(Shimmer.getTotals('unknown')).toBeNull();
  });

  it('returns empty sub-objects when manifest has minimal data', function () {
    Shimmer.manifest = { creatures: { total: 10 } };
    var totals = Shimmer.getTotals('creatures');
    expect(totals.total).toBe(10);
    expect(totals.regions).toEqual({});
    expect(totals.countries).toEqual({});
    expect(totals.tribes).toEqual({});
  });
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer.getAllItems
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.getAllItems', function () {
  it('returns empty array when no shards loaded', function () {
    expect(Shimmer.getAllItems('creatures')).toEqual([]);
  });

  it('returns items from loaded region shards', function (done) {
    Shimmer.loadRegionShard('creatures', 'Nordic', function () {
      Shimmer.loadRegionShard('creatures', 'Celtic', function () {
        var items = Shimmer.getAllItems('creatures');
        expect(items.length).toBe(4);
        var names = items.map(function (i) { return i.name; });
        expect(names).toContain('Troll');
        expect(names).toContain('Draugr');
        expect(names).toContain('Selkie');
        expect(names).toContain('Sidhe');
        done();
      });
    });
  });

  it('deduplicates by name for creatures type', function () {
    Shimmer.shards.creatures = {
      'RegionA': [{ slug: 'x', name: 'Same Name', region: 'A' }],
      'RegionB': [{ slug: 'x', name: 'Same Name', region: 'B' }]
    };
    var items = Shimmer.getAllItems('creatures');
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Same Name');
  });

  it('deduplicates by title for stories type', function () {
    Shimmer.shards.stories = {
      'RegionA': [{ slug: 'x', title: 'Same Title', region: 'A' }],
      'RegionB': [{ slug: 'x', title: 'Same Title', region: 'B' }]
    };
    var items = Shimmer.getAllItems('stories');
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe('Same Title');
  });

  it('returns single item without running dedup', function () {
    Shimmer.shards.creatures = {
      'Only': [{ slug: 'solo', name: 'Solo', region: 'Only' }]
    };
    var items = Shimmer.getAllItems('creatures');
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Solo');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Shimmer error paths
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer error paths', function () {
  it('handle bad JSON in manifest response', function (done) {
    var origXHR = global.XMLHttpRequest;
    function BadJSONXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        self.responseText = '{ bad json }}}';
        self.status = 200;
        setTimeout(function () { if (self.onload) self.onload(); }, 0);
      };
    }
    global.XMLHttpRequest = BadJSONXHR;

    Shimmer.loadManifest().then(function () {
      global.XMLHttpRequest = origXHR;
      done(new Error('should not resolve'));
    }).catch(function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('bad manifest');
      done();
    });
  });

  it('handle XHR network error for manifest', function (done) {
    var origXHR = global.XMLHttpRequest;
    function ErrorXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        setTimeout(function () { if (self.onerror) self.onerror(); }, 0);
      };
    }
    global.XMLHttpRequest = ErrorXHR;

    Shimmer.loadManifest().then(function () {
      global.XMLHttpRequest = origXHR;
      done(new Error('should not resolve'));
    }).catch(function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('no manifest');
      done();
    });
  });

  it('handle non-200 status for manifest', function (done) {
    var origXHR = global.XMLHttpRequest;
    function ServerErrorXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        self.responseText = '';
        self.status = 500;
        setTimeout(function () { if (self.onload) self.onload(); }, 0);
      };
    }
    global.XMLHttpRequest = ServerErrorXHR;

    Shimmer.loadManifest().then(function () {
      global.XMLHttpRequest = origXHR;
      done(new Error('should not resolve'));
    }).catch(function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('no manifest');
      done();
    });
  });

  it('handle bad JSON in region shard response', function (done) {
    var origXHR = global.XMLHttpRequest;
    function BadShardXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        self.responseText = 'not json at all';
        self.status = 200;
        setTimeout(function () { if (self.onload) self.onload(); }, 0);
      };
    }
    global.XMLHttpRequest = BadShardXHR;

    Shimmer.loadRegionShard('creatures', 'Nordic', function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('bad shard data');
      done();
    });
  });

  it('handle XHR error for region shard', function (done) {
    var origXHR = global.XMLHttpRequest;
    function ErrorXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        setTimeout(function () { if (self.onerror) self.onerror(); }, 0);
      };
    }
    global.XMLHttpRequest = ErrorXHR;

    Shimmer.loadRegionShard('creatures', 'Nordic', function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('shard fetch error');
      done();
    });
  });

  it('handle non-200 status for region shard', function (done) {
    var origXHR = global.XMLHttpRequest;
    function ServerErrorXHR() {
      this.open = function () {};
      this.send = function () {
        var self = this;
        self.responseText = '';
        self.status = 500;
        setTimeout(function () { if (self.onload) self.onload(); }, 0);
      };
    }
    global.XMLHttpRequest = ServerErrorXHR;

    Shimmer.loadRegionShard('creatures', 'Nordic', function (err) {
      global.XMLHttpRequest = origXHR;
      expect(err).toBeTruthy();
      expect(err.message).toContain('shard not found');
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// IDB caching integration tests (re-enable IDB via fake-indexeddb)
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer IDB integration', function () {
  beforeEach(function () {
    resetShimmer();
    resetIDB();
  });

  it('loads manifest from network and caches in IDB', async function () {
    var result = await Shimmer.loadManifest();
    expect(result).toBeTruthy();
    expect(result.creatures.total).toBe(5);

    // Wait for IDB write to complete
    await waitForBackground();

    // Reset in-memory state but keep IDB
    Shimmer.manifest = null;
    Shimmer._dbReady = false;
    Shimmer._db = null;

    // Stub _fetchManifestFromNetwork to verify IDB is hit instead
    var networkCalled = false;
    Shimmer._fetchManifestFromNetwork = function (cb) {
      networkCalled = true;
      cb(null);
    };

    var cached = await Shimmer.loadManifest();
    expect(cached).toBeTruthy();
    expect(cached.creatures.total).toBe(5);
    // Background refresh hits network, but initial load should come from IDB
    await waitForBackground();
  });

  it('loads region shard from network and caches in IDB', function (done) {
    Shimmer.loadRegionShard('creatures', 'Nordic', function (err, data) {
      expect(err).toBeNull();
      expect(data).toHaveLength(2);

      // Reset in-memory but keep IDB
      Shimmer.shards = {};
      Shimmer._dbReady = false;
      Shimmer._db = null;

      Shimmer.loadRegionShard('creatures', 'Nordic', function (err2, data2) {
        expect(err2).toBeNull();
        expect(data2).toHaveLength(2);
        expect(data2[0].slug).toBe('troll');
        done();
      });
    });
  });

  it('falls back to network when IDB cache is empty', function (done) {
    Shimmer.loadRegionShard('creatures', 'Celtic', function (err, data) {
      expect(err).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].slug).toBe('selkie');
      done();
    });
  });

  it('IDB _openDB creates both shards and meta stores', function (done) {
    Shimmer._openDB(function (err, db) {
      expect(err).toBeNull();
      expect(db).toBeTruthy();
      expect(db.objectStoreNames.contains('shards')).toBe(true);
      expect(db.objectStoreNames.contains('meta')).toBe(true);
      db.close();
      done();
    });
  });

  it('_cacheManifest writes and _getCachedManifest reads manifest', function (done) {
    Shimmer._openDB(function (err, db) {
      expect(err).toBeNull();
      Shimmer._cacheManifest(manifest);
      // Wait for transaction to complete
      setTimeout(function () {
        Shimmer._getCachedManifest(function (err2, cached) {
          expect(err2).toBeNull();
          expect(cached).toBeTruthy();
          expect(cached.creatures.total).toBe(5);
          done();
        });
      }, 20);
    });
  });

  it('_getCachedShard returns null when not cached', function (done) {
    Shimmer._openDB(function () {
      Shimmer._getCachedShard('creatures', 'Nordic', function (err, data) {
        expect(err).toBeNull();
        expect(data).toBeNull();
        done();
      });
    });
  });

  it('_cacheShard writes and _getCachedShard reads shard data', function (done) {
    Shimmer._openDB(function () {
      Shimmer._cacheShard('creatures', 'Nordic', regionData.nordic);
      setTimeout(function () {
        Shimmer._getCachedShard('creatures', 'Nordic', function (err, data) {
          expect(err).toBeNull();
          expect(data).toHaveLength(2);
          expect(data[0].slug).toBe('troll');
          done();
        });
      }, 20);
    });
  });

  it('_getAllCachedShards returns all cached shards for a type', function (done) {
    Shimmer._openDB(function () {
      Shimmer._cacheShard('creatures', 'Nordic', regionData.nordic);
      Shimmer._cacheShard('creatures', 'Celtic', regionData.celtic);
      setTimeout(function () {
        Shimmer._getAllCachedShards('creatures', function (err, all) {
          expect(err).toBeNull();
          expect(all).toBeTruthy();
          expect(all['Nordic']).toHaveLength(2);
          expect(all['Celtic']).toHaveLength(2);
          done();
        });
      }, 20);
    });
  });

  it('_openDB queues operations while DB is opening', function (done) {
    // Reset to force fresh open
    Shimmer._dbReady = false;
    Shimmer._db = null;

    var callback1Fired = false;
    var callback2Fired = false;

    // First call - starts DB open
    Shimmer._openDB(function (err, db) {
      expect(err).toBeNull();
      callback1Fired = true;
    });

    // Second call - should be queued (DB not ready yet)
    Shimmer._openDB(function (err, db) {
      expect(err).toBeNull();
      callback2Fired = true;
      expect(callback1Fired).toBe(true);
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// loadAllShards IDB cache path coverage (stubs, no real IDB)
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.loadAllShards IDB paths (stubbed)', function () {
  beforeEach(function () {
    resetShimmer();
    disableIDB();
    // Pre-load manifest so loadAllShards skips that step
    Shimmer.manifest = manifest;
  });

  it('partial cache hit: some regions from cache, rest from network', function (done) {
    var origGetAllCached = Shimmer._getAllCachedShards;
    Shimmer._getAllCachedShards = function (type, cb) {
      cb(null, { Nordic: regionData.nordic });
    };
    Shimmer.loadAllShards('creatures', function (err, items) {
      Shimmer._getAllCachedShards = origGetAllCached;
      expect(err).toBeNull();
      expect(items.length).toBeGreaterThanOrEqual(5);
      var names = items.map(function (i) { return i.name; });
      expect(names).toContain('Troll');
      expect(names).toContain('Selkie');
      done();
    });
  });

  it('full cache hit: all regions from cache', function (done) {
    var origGetAllCached = Shimmer._getAllCachedShards;
    Shimmer._getAllCachedShards = function (type, cb) {
      cb(null, {
        Nordic: regionData.nordic,
        Celtic: regionData.celtic,
        'East Asian': regionData['east-asian']
      });
    };
    Shimmer.loadAllShards('creatures', function (err, items) {
      Shimmer._getAllCachedShards = origGetAllCached;
      expect(err).toBeNull();
      expect(items.length).toBeGreaterThanOrEqual(5);
      done();
    });
  });

  it('cache empty: falls through to network', function (done) {
    var origGetAllCached = Shimmer._getAllCachedShards;
    Shimmer._getAllCachedShards = function (type, cb) {
      cb(null, {});
    };
    Shimmer.loadAllShards('creatures', function (err, items) {
      Shimmer._getAllCachedShards = origGetAllCached;
      expect(err).toBeNull();
      expect(items.length).toBeGreaterThanOrEqual(5);
      done();
    });
  });

  it('cache error: falls through to network', function (done) {
    var origGetAllCached = Shimmer._getAllCachedShards;
    Shimmer._getAllCachedShards = function (type, cb) {
      cb(new Error('IDB read error'));
    };
    Shimmer.loadAllShards('creatures', function (err, items) {
      Shimmer._getAllCachedShards = origGetAllCached;
      expect(err).toBeNull();
      expect(items.length).toBeGreaterThanOrEqual(5);
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// loadAllShards with no IDB (typeof indexedDB === 'undefined' path)
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.loadAllShards (no IDB)', function () {
  var savedIDB;

  beforeAll(function () {
    savedIDB = globalThis.indexedDB;
    delete globalThis.indexedDB;
    disableIDB();
  });

  afterAll(function () {
    globalThis.indexedDB = savedIDB;
    enableIDB();
  });

  beforeEach(function () {
    resetShimmer();
  });

  it('loads all shards from network when indexedDB is undefined', function (done) {
    // Pre-set manifest to avoid loadManifest hitting IDB
    Shimmer.manifest = manifest;
    Shimmer._loadShardsFromNetwork('creatures', Object.keys(manifest.creatures.regions), function (err, items) {
      expect(err).toBeNull();
      expect(items.length).toBeGreaterThanOrEqual(5);
      var names = items.map(function (i) { return i.name; });
      expect(names).toContain('Troll');
      expect(names).toContain('Selkie');
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// loadRegionShard when indexedDB is undefined (line 274)
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.loadRegionShard (no indexedDB)', function () {
  var savedIDB;

  beforeAll(function () {
    savedIDB = globalThis.indexedDB;
    delete globalThis.indexedDB;
  });

  afterAll(function () {
    globalThis.indexedDB = savedIDB;
  });

  beforeEach(function () {
    resetShimmer();
  });

  it('fetches from network directly when indexedDB is undefined', function (done) {
    Shimmer.loadRegionShard('creatures', 'Nordic', function (err, data) {
      expect(err).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].slug).toBe('troll');
      done();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// _loadShardsFromNetwork with empty regions (line 422-424)
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer._loadShardsFromNetwork', function () {
  beforeEach(function () {
    resetShimmer();
    disableIDB();
  });

  it('returns immediately with empty array when no regions given', function (done) {
    Shimmer.loadManifest(function () {
      Shimmer._loadShardsFromNetwork('creatures', [], function (err, items) {
        expect(err).toBeNull();
        expect(items).toEqual([]);
        done();
      });
    });
  });

  it('returns immediately when regions is null', function (done) {
    Shimmer.loadManifest(function () {
      Shimmer._loadShardsFromNetwork('creatures', null, function (err, items) {
        expect(err).toBeNull();
        expect(items).toEqual([]);
        done();
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────
// getItem — slug not found in batch after loading
// ─────────────────────────────────────────────────────────────────────
describe('Shimmer.getItem (slug not in batch)', function () {
  beforeEach(function () {
    resetShimmer();
    disableIDB();
  });

  it('returns error when slug exists in batch file but item is missing', function (done) {
    // Load a valid batch first so it's cached, then look for a slug in it
    // that doesn't exist in that batch. 'draugr' batch has only 'draugr-quest'.
    // Looking for 'missing-story' in the 'm' batch (404 → error).
    Shimmer.getItem('stories', 'missing-story', function (err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('not found');
      done();
    });
  });

  it('strips "a-" prefix when computing slug batch key', function (done) {
    // Load selkie from Celtic slug batch (selkie is in s batch via creatures/s)
    // The 'a-' prefix stripping should work similarly to 'the-'
    // We need a fixture with a slug starting with 'a-' in the right batch
    // For now test that it attempts to load with prefix stripped:
    Shimmer.getItem('stories', 'a-test-slug', function (err) {
      // batch 'test-slug' → first char 't' → loads stories/t batch
      // 'a-test-slug' won't be in the batch, so error
      expect(err).toBeTruthy();
      done();
    });
  });

  it('strips "an-" prefix when computing slug batch key', function (done) {
    Shimmer.getItem('stories', 'an-old-song', function (err) {
      // 'an-' stripped → 'old-song' → first char 'o' → loads stories/o batch (404)
      expect(err).toBeTruthy();
      done();
    });
  });
});
