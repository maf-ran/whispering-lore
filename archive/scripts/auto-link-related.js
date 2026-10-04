#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

var DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
var creatures = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'creatures.json'), 'utf-8'));

var bySlug = {};
creatures.forEach(function(c) { bySlug[c.slug] = c; });

function scoreRelatedness(a, b) {
  var score = 0;
  if (a.region && b.region && a.region === b.region) score += 3;
  if (a.type && b.type && a.type === b.type) score += 3;
  if (a.country && b.country && a.country === b.country) score += 2;
  if (a.culture && b.culture && a.culture === b.culture) score += 2;
  if (a.archetype && b.archetype && a.archetype === b.archetype) score += 2;
  if (a.element && b.element && a.element === b.element) score += 1;
  if (a.parent_species && b.parent_species && a.parent_species === b.parent_species) score += 2;
  if (a.behavior_tags && b.behavior_tags && Array.isArray(a.behavior_tags) && Array.isArray(b.behavior_tags)) {
    var shared = a.behavior_tags.filter(function(t) { return b.behavior_tags.indexOf(t) !== -1; });
    score += Math.min(shared.length, 3);
  }
  if (a.habitat_tags && b.habitat_tags && Array.isArray(a.habitat_tags) && Array.isArray(b.habitat_tags)) {
    var shared = a.habitat_tags.filter(function(t) { return b.habitat_tags.indexOf(t) !== -1; });
    score += Math.min(shared.length, 3);
  }
  return score;
}

var updatedCount = 0;
var totalRelated = 0;

creatures.forEach(function(c) {
  var existing = (c.related && Array.isArray(c.related)) ? c.related.slice() : [];
  
  var scored = [];
  creatures.forEach(function(other) {
    if (other.slug === c.slug) return;
    if (existing.indexOf(other.slug) !== -1) return;
    var score = scoreRelatedness(c, other);
    if (score > 0) {
      scored.push({ slug: other.slug, score: score });
    }
  });
  
  scored.sort(function(a, b) { return b.score - a.score; });
  var top = scored.slice(0, 5).map(function(s) { return s.slug; });
  
  var merged = existing.concat(top);
  var unique = [];
  var seen = {};
  merged.forEach(function(slug) {
    if (!seen[slug]) {
      seen[slug] = true;
      unique.push(slug);
    }
  });
  
  c.related = unique.slice(0, 10);
  
  if (existing.length !== c.related.length || existing.some(function(s) { return c.related.indexOf(s) === -1; })) {
    updatedCount++;
    totalRelated += c.related.length;
  }
});

fs.writeFileSync(path.join(DATA_DIR, 'creatures.json'), JSON.stringify(creatures, null, 2), 'utf-8');
console.log('Updated ' + updatedCount + ' creatures with related arrays');
console.log('Total related refs: ' + totalRelated);

var empty = creatures.filter(function(c) { return !c.related || c.related.length === 0; });
console.log('Still empty: ' + empty.length + '/' + creatures.length + ' (' + Math.round(empty.length/creatures.length*100) + '%)');
