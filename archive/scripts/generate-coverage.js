const creatures = require('../data/datasets/creatures.json');
const stories = require('../data/datasets/stories.json');

console.log('Total creatures:', creatures.length);
console.log('Total stories:', stories.length);

var types = {};
creatures.forEach(function(c) {
  if (c.type) types[c.type] = (types[c.type] || 0) + 1;
});
var typeEntries = Object.entries(types).sort(function(a, b) { return b[1] - a[1]; });
console.log('\nTop Creature Types:');
typeEntries.slice(0, 15).forEach(function(e) {
  console.log('  ' + e[0] + ': ' + e[1]);
});

var countries = {};
creatures.forEach(function(c) {
  if (c.country) {
    var parts = c.country.split(/[,/]/);
    parts.forEach(function(p) {
      var t = p.trim();
      if (t && t.length < 40) countries[t] = (countries[t] || 0) + 1;
    });
  }
});
console.log('\nTotal countries (creatures):', Object.keys(countries).length);

var regions = {};
creatures.forEach(function(c) {
  if (c.region) regions[c.region] = (regions[c.region] || 0) + 1;
});
console.log('\nRegions:');
Object.entries(regions).sort(function(a, b) { return b[1] - a[1]; }).forEach(function(e) {
  console.log('  ' + e[0] + ': ' + e[1]);
});

var shortDescs = creatures.filter(function(c) { return !c.description || c.description.length < 30; });
console.log('\nDescriptions < 30 chars:', shortDescs.length);

var withRefs = stories.filter(function(s) { return s.creatures && s.creatures.length > 0; });
console.log('Stories with creature refs:', withRefs.length, '/', stories.length, '(' + Math.round(withRefs.length/stories.length*100) + '%)');
