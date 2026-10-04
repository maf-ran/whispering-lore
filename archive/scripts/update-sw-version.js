#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

var SW_PATH = path.join(__dirname, '..', 'sw.js');
var MANIFEST_PATH = path.join(__dirname, '..', 'data', 'sharded', 'manifest.json');

try {
  var manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  var version = manifest.version || '1.0.0';
  var newCacheName = 'whisperinglore-v' + version.replace(/\./g, '_');
  
  var swContent = fs.readFileSync(SW_PATH, 'utf-8');
  var updatedContent = swContent.replace(/^var CACHE_NAME = '.*'/, 'var CACHE_NAME = "' + newCacheName + '"');
  
  fs.writeFileSync(SW_PATH, updatedContent, 'utf-8');
  console.log('Updated SW cache name to: ' + newCacheName);
} catch (e) {
  console.error('Error updating SW version:', e);
  process.exit(1);
}
