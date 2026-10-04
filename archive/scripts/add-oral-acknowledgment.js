#!/usr/bin/env node
var fs = require('fs');
var path = require('path');

var DATA_DIR = path.join(__dirname, '..', 'data', 'datasets');
var stories = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stories.json'), 'utf-8'));

var updatedCount = 0;
var ACKNOWLEDGMENT = '\n\n--- \nThis story is preserved from an oral tradition. We acknowledge the communities and storytellers who have kept this legend alive through generations.';

stories.forEach(function(s) {
  // We don't have source_type on stories yet (only creatures), 
  // so we use the 'oral' keywords in summary/themes or the source field.
  var isOral = s.summary && s.summary.toLowerCase().indexOf('oral') !== -1 ||
               (Array.isArray(s.themes) && s.themes.some(function(t) { return t.toLowerCase().indexOf('oral') !== -1; })) ||
               (s.source && s.source.toLowerCase().indexOf('oral') !== -1);
  
  if (isOral && s.full_text && s.full_text.indexOf(ACKNOWLEDGMENT) === -1) {
    s.full_text += ACKNOWLEDGMENT;
    updatedCount++;
  }
});

fs.writeFileSync(path.join(DATA_DIR, 'stories.json'), JSON.stringify(stories, null, 2), 'utf-8');
console.log('Updated ' + updatedCount + ' stories with oral tradition acknowledgment.');
