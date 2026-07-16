/**
 * @jest-environment jsdom
 */

window.matchMedia = window.matchMedia || function () {
  return { matches: false, addEventListener: function () {}, removeEventListener: function () {} }
};

// Load fixtures
const fs = require('fs');
const path = require('path');
const FIX = path.join(__dirname, 'fixtures');

const manifest = JSON.parse(fs.readFileSync(path.join(FIX, 'manifest.json'), 'utf8'));

const regionData = {
  nordic: JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-nordic.json'), 'utf8')),
  celtic: JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-celtic.json'), 'utf8')),
  'east-asian': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-east-asian.json'), 'utf8')),
};

const regionStories = {
  nordic: JSON.parse(fs.readFileSync(path.join(FIX, 'stories-nordic.json'), 'utf8')),
  celtic: JSON.parse(fs.readFileSync(path.join(FIX, 'stories-celtic.json'), 'utf8')),
  'east-asian': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-east-asian.json'), 'utf8')),
};

const slugData = {
  'creatures/t': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-nordic.json'), 'utf8')),
  'creatures/d': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-nordic.json'), 'utf8')).filter(c => c.slug === 'draugr'),
  'creatures/s': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-celtic.json'), 'utf8')),
  'creatures/k': JSON.parse(fs.readFileSync(path.join(FIX, 'creatures-east-asian.json'), 'utf8')),
  'stories/d': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-d.json'), 'utf8')),
  'stories/k': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-k.json'), 'utf8')),
  'stories/s': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-s.json'), 'utf8')),
  'stories/t': JSON.parse(fs.readFileSync(path.join(FIX, 'stories-batch-t.json'), 'utf8')),
};

// ── Build URL→data map ──
const fixtureMap = {};
fixtureMap['data/sharded/manifest.json'] = manifest;
Object.keys(regionData).forEach(r => {
  fixtureMap[`data/sharded/creatures/by-region/${r}.json`] = regionData[r];
});
Object.keys(regionStories).forEach(r => {
  fixtureMap[`data/sharded/stories/by-region/${r}.json`] = regionStories[r];
});
Object.keys(slugData).forEach(key => {
  const [type, char] = key.split('/');
  fixtureMap[`data/sharded/${type}/by-slug/${char}.json`] = slugData[key];
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
MockXHR.prototype.open = function(method, url) {
  this.method = method;
  this.url = url;
};
MockXHR.prototype.send = function() {
  var self = this;
  var data = fixtureMap[self.url];
  if (data) {
    self.responseText = JSON.stringify(data);
    self.status = 200;
  } else {
    self.status = 404;
    self.responseText = '';
  }
  setTimeout(function() { if (self.onload) self.onload(); }, 0);
};

global.XMLHttpRequest = MockXHR;

// Block IDB from being detected — Shimmer falls back to network-only when
// typeof indexedDB === 'undefined'. We stub _cacheShard/_getCachedShard etc.
// so _fetchManifestFromNetwork doesn't throw when calling _cacheManifest.
delete global.indexedDB;
delete window.indexedDB;

// Load Shimmer
require('../js/shared-utils.js');
var Shimmer = window.__sharedUtils.Shimmer;

// Patch Shimmer to be IDB-safe: make _openDB a no-op that never succeeds
// (so all IDB code paths are skipped) while _cacheManifest/_cacheShard become no-ops
Shimmer._openDB = function(callback) { callback(new Error('IDB disabled in tests')); };
Shimmer._cacheManifest = function() {}; // no-op
Shimmer._cacheShard = function() {};    // no-op

function resetShimmer() {
  Shimmer.manifest = null;
  Shimmer.shards = {};
  Shimmer.slugBatches = {};
  Shimmer._dbReady = false;
  Shimmer._db = null;
  Shimmer._dbQueue = [];
}

beforeEach(() => {
  resetShimmer();
});

// ── Tests ──

describe('Shimmer.loadManifest', () => {
  it('fetches manifest from network and sets this.manifest', async () => {
    const result = await Shimmer.loadManifest();
    expect(result).toBeTruthy();
    expect(result.creatures.total).toBe(5);
    expect(result.stories.total).toBe(5);
    expect(Shimmer.manifest).toBe(result);
  });

  it('returns already-loaded manifest without re-fetching', async () => {
    await Shimmer.loadManifest();
    const result = await Shimmer.loadManifest();
    expect(result.creatures.total).toBe(5);
  });

  it('callback receives null on success', (done) => {
    Shimmer.loadManifest(function(err) {
      expect(err).toBeNull();
      expect(Shimmer.manifest).toBeTruthy();
      done();
    });
  });
});

describe('Shimmer.loadRegionShard', () => {
  it('loads a region shard from network', (done) => {
    Shimmer.loadRegionShard('creatures', 'Nordic', function(err, data) {
      expect(err).toBeNull();
      expect(data).toHaveLength(2);
      expect(data[0].slug).toBe('troll');
      expect(Shimmer.shards.creatures.Nordic).toBe(data);
      done();
    });
  });

  it('returns cached shard from memory on second call', (done) => {
    Shimmer.loadRegionShard('creatures', 'Nordic', function(firstErr, firstData) {
      expect(firstErr).toBeNull();
      Shimmer.loadRegionShard('creatures', 'Nordic', function(err, data) {
        expect(err).toBeNull();
        expect(data).toBe(firstData);
        done();
      });
    });
  });

  it('returns error for nonexistent region', (done) => {
    Shimmer.loadRegionShard('creatures', 'Nonexistent', function(err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('not found');
      done();
    });
  });
});

describe('Shimmer.loadSlugBatch', () => {
  it('loads a slug batch from network', (done) => {
    Shimmer.loadSlugBatch('stories', 'd', function(err, data) {
      expect(err).toBeNull();
      expect(data).toHaveLength(1);
      expect(data[0].slug).toBe('draugr-quest');
      done();
    });
  });

  it('returns cached batch from memory on second call', (done) => {
    Shimmer.loadSlugBatch('stories', 's', function(firstErr, firstData) {
      expect(firstErr).toBeNull();
      Shimmer.loadSlugBatch('stories', 's', function(err, data) {
        expect(err).toBeNull();
        expect(data).toBe(firstData);
        done();
      });
    });
  });

  it('returns error for nonexistent batch', (done) => {
    Shimmer.loadSlugBatch('creatures', 'zzz', function(err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('not found');
      done();
    });
  });
});

describe('Shimmer.getItem', () => {
  it('finds item in already-loaded region shard', (done) => {
    Shimmer.loadRegionShard('creatures', 'Nordic', function() {
      Shimmer.getItem('creatures', 'troll', function(err, item) {
        expect(err).toBeNull();
        expect(item.name).toBe('Troll');
        done();
      });
    });
  });

  it('finds item in already-loaded slug batch', (done) => {
    Shimmer.loadSlugBatch('stories', 's', function() {
      Shimmer.getItem('stories', 'selkie-song', function(err, item) {
        expect(err).toBeNull();
        expect(item.title).toBe("The Selkie's Song");
        done();
      });
    });
  });

  it('loads slug batch automatically to find unloaded item', (done) => {
    Shimmer.getItem('stories', 'draugr-quest', function(err, item) {
      expect(err).toBeNull();
      expect(item.title).toBe('Draugr Quest');
      done();
    });
  });

  it('returns error for nonexistent slug', (done) => {
    Shimmer.getItem('stories', 'nonexistent-slug', function(err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('not found');
      done();
    });
  });
});

describe('Shimmer.loadAllShards', () => {
  it('loads all region shards and returns union of creatures', (done) => {
    Shimmer.loadManifest(function() {
      Shimmer.loadAllShards('creatures', function(err, items) {
        expect(err).toBeNull();
        expect(items.length).toBeGreaterThanOrEqual(5);
        var names = items.map(function(i) { return i.name; });
        expect(names).toContain('Troll');
        expect(names).toContain('Selkie');
        expect(names).toContain('Kappa');
        done();
      });
    });
  });

  it('deduplicates items by name', (done) => {
    Shimmer.loadManifest(function() {
      Shimmer.loadAllShards('creatures', function(err, items) {
        expect(err).toBeNull();
        var names = items.map(function(i) { return i.name; });
        var unique = names.filter(function(n, i) { return names.indexOf(n) === i; });
        expect(names.length).toBe(unique.length);
        done();
      });
    });
  });
});

describe('Shimmer.getTotals', () => {
  it('returns null when manifest is not loaded', () => {
    expect(Shimmer.getTotals('creatures')).toBeNull();
  });

  it('returns totals after manifest is loaded', async () => {
    await Shimmer.loadManifest();
    var totals = Shimmer.getTotals('creatures');
    expect(totals).toBeTruthy();
    expect(totals.total).toBe(5);
    expect(totals.regions).toHaveProperty('Nordic');
    expect(totals.countries).toHaveProperty('Norway');
  });

  it('returns null for unknown type', async () => {
    await Shimmer.loadManifest();
    expect(Shimmer.getTotals('unknown')).toBeNull();
  });
});

describe('Shimmer.getAllItems', () => {
  it('returns empty array when no shards loaded', () => {
    expect(Shimmer.getAllItems('creatures')).toEqual([]);
  });

  it('returns items from loaded region shards', (done) => {
    Shimmer.loadRegionShard('creatures', 'Nordic', function() {
      Shimmer.loadRegionShard('creatures', 'Celtic', function() {
        var items = Shimmer.getAllItems('creatures');
        expect(items.length).toBe(4);
        var names = items.map(function(i) { return i.name; });
        expect(names).toContain('Troll');
        expect(names).toContain('Draugr');
        expect(names).toContain('Selkie');
        expect(names).toContain('Sidhe');
        done();
      });
    });
  });

  it('deduplicates by title for stories type', (done) => {
    Shimmer.loadRegionShard('stories', 'Nordic', function() {
      Shimmer.loadRegionShard('stories', 'Celtic', function() {
        var items = Shimmer.getAllItems('stories');
        expect(items.length).toBe(2);
        done();
      });
    });
  });
});

describe('Shimmer error paths', () => {
  it('handle bad JSON in manifest response', (done) => {
    var origXHR = global.XMLHttpRequest;
    function BadJSONXHR() {
      this.open = function() {};
      this.send = function() {
        var self = this;
        self.responseText = '{ bad json }}}';
        self.status = 200;
        setTimeout(function() { if (self.onload) self.onload(); }, 0);
      };
    }
    global.XMLHttpRequest = BadJSONXHR;

    Shimmer.loadManifest().then(function() {
      global.XMLHttpRequest = origXHR;
      done(new Error('should not resolve'));
    }).catch(function(err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('bad manifest');
      global.XMLHttpRequest = origXHR;
      done();
    });
  });

  it('handle XHR network error', (done) => {
    var origXHR = global.XMLHttpRequest;
    function ErrorXHR() {
      this.open = function() {};
      this.send = function() {
        var self = this;
        setTimeout(function() { if (self.onerror) self.onerror(); }, 0);
      };
    }
    global.XMLHttpRequest = ErrorXHR;

    Shimmer.loadManifest().then(function() {
      global.XMLHttpRequest = origXHR;
      done(new Error('should not resolve'));
    }).catch(function(err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('no manifest');
      global.XMLHttpRequest = origXHR;
      done();
    });
  });

  it('handle bad JSON in region shard response', (done) => {
    var origXHR = global.XMLHttpRequest;
    function BadShardXHR() {
      this.open = function() {};
      this.send = function() {
        var self = this;
        self.responseText = 'not json at all';
        self.status = 200;
        setTimeout(function() { if (self.onload) self.onload(); }, 0);
      };
    }
    global.XMLHttpRequest = BadShardXHR;

    Shimmer.loadRegionShard('creatures', 'Nordic', function(err) {
      expect(err).toBeTruthy();
      expect(err.message).toContain('bad shard data');
      global.XMLHttpRequest = origXHR;
      done();
    });
  });
});
