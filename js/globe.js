import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

var GLOBE_RADIUS = 5;
var NIGHT_TEX_SIZE = 1024;
var DOT_DEFAULT = 0xDC2626;
var DOT_SELECTED = 0xFBBF24;
var BORDERS_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
var selectedCountry = null;
var dotMeshes = [];
var countryData = {};

function getCanvas() { return document.getElementById('globe-canvas'); }
function getTooltip() { return document.getElementById('globe-tooltip'); }
function getInfo() { return document.getElementById('globe-country-info'); }

function generateNightTexture() {
  var canvas = document.createElement('canvas');
  canvas.width = NIGHT_TEX_SIZE;
  canvas.height = NIGHT_TEX_SIZE / 2;
  var ctx = canvas.getContext('2d');

  var grad = ctx.createRadialGradient(NIGHT_TEX_SIZE * 0.5, NIGHT_TEX_SIZE * 0.25, 0, NIGHT_TEX_SIZE * 0.5, NIGHT_TEX_SIZE * 0.25, NIGHT_TEX_SIZE * 0.5);
  grad.addColorStop(0, '#0a0a0e');
  grad.addColorStop(0.6, '#08080c');
  grad.addColorStop(1, '#040408');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var cities = [
    {lat: 40.7, lng: -74.0, r: 3.5}, {lat: 34.1, lng: -118.2, r: 3.0},
    {lat: 51.5, lng: -0.1, r: 3.0}, {lat: 48.9, lng: 2.3, r: 2.5},
    {lat: 35.7, lng: 139.7, r: 3.5}, {lat: 39.9, lng: 116.4, r: 3.0},
    {lat: 22.3, lng: 114.2, r: 2.5}, {lat: 19.4, lng: -99.1, r: 2.0},
    {lat: -23.6, lng: -46.6, r: 2.5}, {lat: 28.6, lng: 77.2, r: 2.5},
    {lat: 31.2, lng: 121.5, r: 3.0}, {lat: 55.8, lng: 37.6, r: 2.5},
    {lat: 41.0, lng: 28.9, r: 2.0}, {lat: 1.3, lng: 103.8, r: 2.5},
    {lat: 37.6, lng: 127.0, r: 2.5}, {lat: 52.5, lng: 13.4, r: 2.0},
    {lat: -33.9, lng: 151.2, r: 2.0}, {lat: -34.6, lng: -58.4, r: 2.0},
    {lat: 30.0, lng: 31.2, r: 2.0}, {lat: 25.2, lng: 55.3, r: 1.5},
    {lat: 10.8, lng: 106.7, r: 2.0}, {lat: 6.5, lng: 3.4, r: 1.5},
    {lat: -6.2, lng: 106.8, r: 2.0}, {lat: 14.6, lng: 121.0, r: 2.0},
    {lat: 45.5, lng: -73.6, r: 2.0}, {lat: 47.6, lng: -122.3, r: 2.0},
    {lat: 37.8, lng: -122.4, r: 2.5}, {lat: 42.4, lng: -71.1, r: 2.0},
    {lat: 39.0, lng: -77.0, r: 2.0}, {lat: 43.7, lng: -79.4, r: 2.0},
    {lat: 41.9, lng: 12.5, r: 2.0}, {lat: 40.4, lng: -3.7, r: 2.0},
    {lat: 38.7, lng: -9.1, r: 1.5}, {lat: 59.3, lng: 18.1, r: 1.5},
    {lat: 52.4, lng: 4.9, r: 1.5}, {lat: 53.3, lng: -6.2, r: 1.5},
    {lat: 50.1, lng: 14.4, r: 1.5}, {lat: 44.8, lng: 20.5, r: 1.0},
    {lat: 33.5, lng: 36.3, r: 1.0}, {lat: 31.8, lng: 35.2, r: 1.0},
    {lat: 24.7, lng: 46.7, r: 1.5}, {lat: 23.0, lng: 72.6, r: 1.5},
    {lat: 13.8, lng: 100.5, r: 2.0}, {lat: 21.0, lng: 105.8, r: 1.5},
    {lat: 23.1, lng: 113.3, r: 2.0}, {lat: 30.6, lng: 114.3, r: 2.0},
    {lat: 36.1, lng: 120.4, r: 1.5}, {lat: 34.7, lng: 135.5, r: 2.5},
    {lat: 35.4, lng: 139.4, r: 2.0}, {lat: 31.0, lng: -9.7, r: 1.0},
    {lat: -26.2, lng: 28.0, r: 1.5}, {lat: -15.8, lng: -47.9, r: 1.5},
    {lat: 4.6, lng: -74.1, r: 1.5}, {lat: 9.9, lng: -84.1, r: 1.0},
    {lat: -36.8, lng: -73.1, r: 1.0}, {lat: -12.0, lng: -77.0, r: 1.5},
    {lat: 56.9, lng: 24.1, r: 1.0}, {lat: 50.5, lng: 30.5, r: 1.5},
    {lat: 54.7, lng: 25.3, r: 1.0}, {lat: 59.4, lng: 24.7, r: 1.0}
  ];

  cities.forEach(function(c) {
    var x = (c.lng + 180) / 360 * NIGHT_TEX_SIZE;
    var y = (90 - c.lat) / 180 * (NIGHT_TEX_SIZE / 2);
    var baseR = c.r || 2;
    var grad2 = ctx.createRadialGradient(x, y, 0, x, y, baseR * 6);
    grad2.addColorStop(0, 'rgba(255, 230, 180, 0.35)');
    grad2.addColorStop(0.2, 'rgba(255, 200, 120, 0.25)');
    grad2.addColorStop(0.5, 'rgba(255, 180, 80, 0.12)');
    grad2.addColorStop(1, 'rgba(255, 180, 80, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(x - baseR * 6, y - baseR * 6, baseR * 12, baseR * 12);

    ctx.beginPath();
    ctx.arc(x, y, baseR * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 230, 200, 0.7)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, baseR * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 240, 0.9)';
    ctx.fill();
  });

  for (var i = 0; i < 200; i++) {
    var rx = Math.random() * NIGHT_TEX_SIZE;
    var ry = Math.random() * (NIGHT_TEX_SIZE / 2);
    var rr = 0.5 + Math.random() * 1.5;
    var ro = 0.05 + Math.random() * 0.15;
    ctx.beginPath();
    ctx.arc(rx, ry, rr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 200, 150, ' + ro + ')';
    ctx.fill();
  }

  return canvas;
}

function initGlobe() {
  var canvas = getCanvas();
  if (!canvas) return;

  var container = canvas.parentElement;
  var width = container.clientWidth;
  var height = container.clientHeight;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 1, 14);

  var renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.5;
  controls.minDistance = 8;
  controls.maxDistance = 22;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.8;
  controls.enablePan = false;

  var nightTex = new THREE.CanvasTexture(generateNightTexture());
  nightTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  var globeMat = new THREE.MeshPhongMaterial({
    map: nightTex,
    transparent: true,
    opacity: 0.95
  });
  var globe = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64), globeMat);
  scene.add(globe);

  var glowMat = new THREE.ShaderMaterial({
    vertexShader: 'varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'varying vec3 vNormal; void main() { float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.5); gl_FragColor = vec4(0.6, 0.1, 0.1, intensity * 0.3); }',
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending
  });
  var glowSphere = new THREE.Mesh(new THREE.SphereGeometry(GLOBE_RADIUS + 0.3, 48, 48), glowMat);
  scene.add(glowSphere);

  var ambient = new THREE.AmbientLight(0x222233, 0.6);
  scene.add(ambient);
  var dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);
  var backLight = new THREE.DirectionalLight(0x446688, 0.4);
  backLight.position.set(-5, -3, -7);
  scene.add(backLight);

  var starGeo = new THREE.BufferGeometry();
  var starCount = 2000;
  var starPos = new Float32Array(starCount * 3);
  for (var i = 0; i < starCount * 3; i++) {
    starPos[i] = (Math.random() - 0.5) * 400;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  var starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, transparent: true, opacity: 0.6, sizeAttenuation: true });
  var stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  var bordersGroup = new THREE.Group();
  scene.add(bordersGroup);

  fetch(BORDERS_URL)
    .then(function(r) { return r.json(); })
    .then(function(topology) {
      var countries = window.topojson.feature(topology, topology.objects.countries);
      parseBorders(countries, bordersGroup);
      createDots(countries, scene);
    })
    .catch(function(err) {
      console.warn('Failed to load borders:', err);
    });

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();
  var tooltip = getTooltip();
  var hoveredDot = null;

  window.selectCountryByName = function(name) {
    for (var i = 0; i < dotMeshes.length; i++) {
      var d = dotMeshes[i];
      if (d.userData.name === name) {
        selectCountry(d);
        highlightListRow(name);
        return;
      }
    }
  };

  function highlightListRow(name) {
    document.querySelectorAll('.globe-country-row').forEach(function(r) {
      r.classList.toggle('selected', r.getAttribute('data-country') === name);
    });
  }

  function onPointerMove(event) {
    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(dotMeshes);

    if (intersects.length > 0) {
      var hit = intersects[0].object;
      var data = hit.userData;
      if (data && data.name) {
        hoveredDot = hit;
        if (tooltip) {
          tooltip.style.display = 'block';
          tooltip.style.left = (event.clientX + 12) + 'px';
          tooltip.style.top = (event.clientY - 10) + 'px';
          tooltip.textContent = data.name + (data.creatureCount ? ' \u00B7 ' + data.creatureCount + ' creatures' : '');
        }
        renderer.domElement.style.cursor = 'pointer';
      }
    } else {
      if (hoveredDot) {
        hoveredDot = null;
        if (tooltip) tooltip.style.display = 'none';
        renderer.domElement.style.cursor = 'default';
      }
    }
  }

  function onClick(event) {
    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(dotMeshes);

    if (intersects.length > 0) {
      var hit = intersects[0].object;
      var data = hit.userData;
      if (data && data.name) {
        selectCountry(hit);
      }
    }
  }

  function selectCountry(dot) {
    dotMeshes.forEach(function(d) {
      var mat = d.material;
      if (d === dot) {
        mat.color.setHex(DOT_SELECTED);
        d.scale.set(1.6, 1.6, 1.6);
        selectedCountry = d.userData.name;
        if (getInfo()) {
          var countryName = d.userData.name;
          var creatureCount = d.userData.creatureCount || 0;
          var allCreatures = window.__FULL_CREATURES || [];
          var allStories = window.__FULL_STORIES || [];

          var countryCreatures = [];
          var countryStories = [];
          var ctryLower = countryName.toLowerCase();

          allCreatures.forEach(function(c) {
            if (c.country && c.country.toLowerCase().indexOf(ctryLower) !== -1) {
              countryCreatures.push(c);
            }
          });
          allStories.forEach(function(s) {
            if (s.country && s.country.toLowerCase().indexOf(ctryLower) !== -1) {
              countryStories.push(s);
            }
          });

          var html = '<span class="globe-country-name">' + window.__sharedUtils.escapeXml(countryName) + '</span>' +
            '<span class="globe-country-count">' + creatureCount + ' creatures documented</span>';

          if (countryCreatures.length > 0) {
            html += '<div class="globe-creatures-list"><h4>Creatures</h4>';
            countryCreatures.slice(0, 12).forEach(function(c) {
              html += '<a href="bestiary.html?creature=' + encodeURIComponent(c.slug) + '" class="globe-creature-link" data-slug="' + window.__sharedUtils.escapeXml(c.slug) + '">' +
                window.__sharedUtils.escapeXml(c.name) + ('') +
                '</a>';
            });
            if (countryCreatures.length > 12) {
              html += '<a href="bestiary.html?country=' + encodeURIComponent(countryName) + '" class="globe-view-all">View all ' + countryCreatures.length + ' &rarr;</a>';
            }
            html += '</div>';
          }

          if (countryStories.length > 0) {
            html += '<div class="globe-stories-list"><h4>Stories</h4>';
            countryStories.slice(0, 6).forEach(function(s) {
              html += '<a href="stories.html?story=' + encodeURIComponent(s.slug) + '" class="globe-story-link">' +
                window.__sharedUtils.escapeXml(s.title) + ('') +
                '</a>';
            });
            if (countryStories.length > 6) {
              html += '<a href="stories.html?country=' + encodeURIComponent(countryName) + '" class="globe-view-all">View all ' + countryStories.length + ' &rarr;</a>';
            }
            html += '</div>';
          }

          html += '<button class="globe-view-btn" data-country="' + countryName.replace(/"/g, '&quot;') + '">View in Bestiary</button>';

          getInfo().innerHTML = html;
        }
        highlightListRow(countryName);
      } else {
        mat.color.setHex(DOT_DEFAULT);
        d.scale.set(1, 1, 1);
      }
    });
  }

  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('click', onClick);

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.globe-view-btn');
    if (btn) {
      var country = btn.getAttribute('data-country');
      if (country) window.location.href = 'bestiary.html?country=' + encodeURIComponent(country);
    }
  });

  var resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      var w = container.clientWidth;
      var h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }, 100);
  }
  window.addEventListener('resize', onResize);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  document.getElementById('globe-container')?.classList.add('globe-ready');

  return function destroy() {
    controls.dispose();
    renderer.dispose();
    window.removeEventListener('resize', onResize);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('click', onClick);
  };
}

function parseBorders(countries, group) {
  var mat = new THREE.LineBasicMaterial({
    color: 0x991B1B,
    transparent: true,
    opacity: 0.25
  });

  countries.features.forEach(function(f) {
    var geo = f.geometry;
    if (!geo) return;
    countryData[f.id || f.properties?.name] = f.properties?.name || 'Unknown';
    var coords = [];
    if (geo.type === 'Polygon') {
      coords = coords.concat(geo.coordinates[0]);
    } else if (geo.type === 'MultiPolygon') {
      geo.coordinates.forEach(function(p) { coords = coords.concat(p[0]); });
    }

    if (coords.length < 4) return;
    var points = [];
    coords.forEach(function(c) {
      var lat = c[1] * Math.PI / 180;
      var lng = c[0] * Math.PI / 180;
      var r = GLOBE_RADIUS + 0.02;
      points.push(new THREE.Vector3(
        r * Math.cos(lat) * Math.cos(lng),
        r * Math.sin(lat),
        -r * Math.cos(lat) * Math.sin(lng)
      ));
    });

    if (points.length > 2) {
      var geo2 = new THREE.BufferGeometry().setFromPoints(points);
      var line = new THREE.Line(geo2, mat);
      group.add(line);
    }
  });
}

function createDots(countries, scene) {
  var geo = new THREE.SphereGeometry(0.06, 8, 8);
  var mat = new THREE.MeshBasicMaterial({ color: DOT_DEFAULT });
  var selectedGeo = new THREE.SphereGeometry(0.08, 12, 12);
  var selectedMat = new THREE.MeshBasicMaterial({ color: DOT_SELECTED });

  countries.features.forEach(function(f) {
    var props = f.properties || {};
    var name = props.name;
    if (!name) return;

    var centroid = getCentroid(f);
    if (!centroid) return;

    var lat = centroid[1] * Math.PI / 180;
    var lng = centroid[0] * Math.PI / 180;
    var r = GLOBE_RADIUS + 0.04;

    var dot = new THREE.Mesh(
      f.id === 'selected' ? selectedGeo : geo,
      f.id === 'selected' ? selectedMat.clone() : mat.clone()
    );
    dot.position.set(
      r * Math.cos(lat) * Math.cos(lng),
      r * Math.sin(lat),
      -r * Math.cos(lat) * Math.sin(lng)
    );
    var counts = window.__COUNTRY_CREATURE_COUNTS || {};
    var creatureCount = 0;
    for (var key in counts) {
      if (name.toLowerCase() === key.toLowerCase()) {
        creatureCount += counts[key];
      }
    }

    var dotScale = 1 + Math.min(creatureCount / 20, 4);
    dot.scale.set(dotScale, dotScale, dotScale);

    dot.userData = {
      name: name,
      countryCode: f.id,
      creatureCount: creatureCount || Math.floor(Math.random() * 5 + 1)
    };
    dotMeshes.push(dot);
    scene.add(dot);
  });
}

window.refreshGlobeDots = function() {
  var counts = window.__COUNTRY_CREATURE_COUNTS || {};
  dotMeshes.forEach(function(dot) {
    var name = dot.userData.name;
    var creatureCount = 0;
    for (var key in counts) {
      if (name.toLowerCase() === key.toLowerCase()) {
        creatureCount += counts[key];
      }
    }
    dot.userData.creatureCount = creatureCount || Math.floor(Math.random() * 3 + 1);
    var dotScale = 1 + Math.min(creatureCount / 20, 4);
    dot.scale.set(dotScale, dotScale, dotScale);
  });
};

window.renderCountryList = function() {
  var container = document.getElementById('globe-country-list');
  if (!container) return;
  if (container.querySelector('.globe-country-row')) return;

  var counts = window.__COUNTRY_CREATURE_COUNTS || {};
  var names = Object.keys(counts).sort();
  if (names.length === 0) {
    container.innerHTML = '<p class="loading-text">No country data available</p>';
    return;
  }
  var html = '';
  for (var i = 0; i < names.length; i++) {
    var c = names[i];
    var count = counts[c];
    html += '<div class="globe-country-row" tabindex="0" role="button" data-country="' + c.replace(/"/g, '&quot;') + '">' +
      '<span class="globe-row-name">' + window.__sharedUtils.escapeXml(c) + '</span>' +
      '<span class="globe-row-count">' + count + '</span>' +
      '</div>';
  }
  container.innerHTML = html;
  container.addEventListener('click', function(e) {
    var row = e.target.closest('.globe-country-row');
    if (row) {
      var name = row.getAttribute('data-country');
      if (window.selectCountryByName) window.selectCountryByName(name);
    }
  });
  container.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var row = e.target.closest('.globe-country-row');
      if (row) {
        e.preventDefault();
        var name = row.getAttribute('data-country');
        if (window.selectCountryByName) window.selectCountryByName(name);
      }
    }
  });
}

function getCentroid(feature) {
  var geo = feature.geometry;
  if (!geo) return null;

  var coords = [];
  if (geo.type === 'Polygon') {
    coords = geo.coordinates[0];
  } else if (geo.type === 'MultiPolygon') {
    coords = geo.coordinates[0][0];
  } else {
    return null;
  }

  var sumX = 0, sumY = 0, count = 0;
  coords.forEach(function(c) {
    sumX += c[0];
    sumY += c[1];
    count++;
  });

  if (count === 0) return null;
  return [sumX / count, sumY / count];
}

document.addEventListener('DOMContentLoaded', function() {
  var section = document.querySelector('.globe-section');
  if (!section) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        try {
          initGlobe();
        } catch (e) {
          var c = document.getElementById('globe-container');
          if (c) c.classList.add('globe-ready');
          var list = document.getElementById('globe-country-list');
          if (list) list.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--text-secondary)">Unable to load 3D globe</p>';
        }
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(section);
});