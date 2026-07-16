// js/region-glyphs.js
;(function () {
  'use strict';

  var REGION_GLYPHS = {
    'East Asia': 'M16 2L22 10L16 18L10 10L16 2Z M16 22L10 14L16 6L22 14L16 22Z', // Interlocking diamonds
    'South Asia': 'M12 2L15 8L20 8L16 12L18 18L12 14L6 18L8 12L4 8L9 8L12 2Z', // Lotus-like star
    'Southeast Asia': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z', // Concentric circles
    'Pacific': 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z', // Wave ring
    'Sub-Saharan Africa': 'M12 2L4 12L12 22L20 12L12 2Z M12 8V16 M8 12H16', // Geometric cross
    'Northern America': 'M16 2L8 12L16 22L24 12L16 2Z M12 12H20 M12 12V8', // Compass-style
    'Southern America': 'M12 2L2 12L12 22L22 12L12 2Z M16 12L12 8L8 12L12 16L16 12Z', // Nested diamonds
    'Central America': 'M12 2L22 12L12 22L2 12L12 2Z M12 6L18 12L12 18L6 12L12 6Z', // Stepped pyramid shape
    'Middle East': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z', // Crescent-style
    'Nordic': 'M16 2L22 16L16 30L10 16L16 2Z M16 10L12 16L16 22L20 16L16 10Z', // Rune-diamond
    'Celtic': 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14l-2-2 2-2 2 2-2 2z', // Knot-style
    'European': 'M12 2L20 12L12 22L4 12L12 2Z', // Classic diamond
    'Arctic': 'M12 2L4 12L12 22L20 12L12 2Z M12 8V16', // Ice spike
    'Antarctic': 'M12 2L4 12L12 22L20 12L12 2Z M8 12H16', // Horizon line
    'default': 'M16 2L30 16L16 30L2 16L16 2Z' // Diamond logo
  };

  window.__sharedUtils = window.__sharedUtils || {};
  window.__sharedUtils.RegionGlyphs = {
    getGlyph: function(region) {
      return REGION_GLYPHS[region] || REGION_GLYPHS['default'];
    }
  };
})();
