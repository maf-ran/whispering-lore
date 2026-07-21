/* ═══════════════════════════════════════════
   Whispering Lore — Shared JavaScript
   Fog interaction · Scroll animations · Navigation
   ═══════════════════════════════════════════ */

;(function () {

async function updateGlobalStats() {
  try {
    const sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
    if (!sh || !sh.manifest) return;

    const cStats = sh.getTotals('creatures');
    const sStats = sh.getTotals('stories');

    if (!cStats || !sStats) return;

    const creatureCount = cStats.total;
    const storyCount = sStats.total;
    const countries = Object.keys(cStats.countries).length;
    const regions = Object.keys(cStats.regions).length;

    const formatNum = (n) => n.toLocaleString();

    const elCreatures = document.getElementById('stat-creatures');
    if (elCreatures) elCreatures.textContent = formatNum(creatureCount);

    const elStories = document.getElementById('stat-stories');
    if (elStories) elStories.textContent = formatNum(storyCount);

    const elCountries = document.getElementById('stat-countries');
    if (elCountries) elCountries.textContent = formatNum(countries);

    const elRegions = document.getElementById('stat-regions');
    if (elRegions) elRegions.textContent = formatNum(regions);

  } catch (e) {
    console.error('Failed to update global stats:', e);
  }
}
  'use strict'

  /* ── Active nav link ── */
  function initActiveNav () {
    const page = window.location.pathname.split('/').pop() || 'index.html'
    document.querySelectorAll('nav a').forEach(function (a) {
      var href = a.getAttribute('href')
      if (href === page || (page === '' && href === 'index.html')) {
        a.classList.add('active')
      }
    })
  }

  /* ── Smooth scroll for anchor links ── */
  function initSmoothScroll () {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'))
        if (target) {
          e.preventDefault()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    })
  }

async function updateLatestAdditions() {
    const grid = document.getElementById('latest-grid');
    if (!grid) return;
 
    try {
      const sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
      let creatures = [], stories = [];

      if (sh) {
        await new Promise((resolve) => {
          sh.loadAllShards('creatures', (err, c) => {
            creatures = c || [];
            sh.loadAllShards('stories', (err2, s) => {
              stories = s || [];
              resolve();
            });
          });
        });
      } else {
        const [cRes, sRes] = await Promise.all([
          fetch('data/datasets/creatures.json').then(r => r.json()).catch(() => []),
          fetch('data/datasets/stories.json').then(r => r.json()).catch(() => [])
        ]);
        creatures = cRes;
        stories = sRes;
      }
 
      // Combine and sort by date_added, fallback to array index (reverse)
      const all = [
        ...creatures.map((c, i) => ({ name: c.name, desc: c.description, date: c.date_added || 'Recent', type: 'Creature', index: creatures.length - i })),
        ...stories.map((s, i) => ({ name: s.title, desc: s.summary || (s.content ? s.content.substring(0, 120) + '...' : ''), date: s.date_added || 'Recent', type: 'Story', index: stories.length - i }))
      ].sort((a, b) => {
        if (a.date !== b.date) {
          if (a.date === 'Recent') return 1;
          if (b.date === 'Recent') return -1;
          return b.date > a.date ? 1 : -1;
        }
        return a.index - b.index;
      }).slice(0, 3);
 
       grid.innerHTML = all.map(item => `
        <div class="latest-item">
          <div class="latest-date"><span class="crimson-dot"></span> ${window.__sharedUtils.escapeXml(item.date)}</div>
          <h3>${window.__sharedUtils.escapeXml(item.name)}</h3>
          <p>${window.__sharedUtils.escapeXml(item.desc)}</p>
        </div>
      `).join('');
 
    } catch (e) {
      console.error('Failed to update latest additions:', e);
    }
  }


  /* ── Mouse-follow fog interaction (desktop only) ── */
  function initFogFollow () {
    var layers = document.querySelectorAll('.fog-layer')
    if (!layers.length) return

    var isDesktop = window.matchMedia('(min-width: 768px)').matches
    if (!isDesktop) return

    var centerX = 0.5
    var centerY = 0.5
    var currentX = 0.5
    var currentY = 0.5

    document.addEventListener('mousemove', function (e) {
      centerX = e.clientX / window.innerWidth
      centerY = e.clientY / window.innerHeight
    })

    function animateFog () {
      currentX += (centerX - currentX) * 0.03
      currentY += (centerY - currentY) * 0.03
      var offsetX = (currentX - 0.5) * 8
      var offsetY = (currentY - 0.5) * 6
      layers.forEach(function (layer, i) {
        var factor = (i + 1) * 0.5
        layer.style.transform =
          'translate(' + (offsetX * factor) + 'px, ' + (offsetY * factor) + 'px) scale(1.02)'
      })
      requestAnimationFrame(animateFog)
    }
    animateFog()
  }

  /* ── Gold particles (hero dust effect) ── */
  var goldParticleInterval = null
  function initGoldParticles () {
    var hero = document.querySelector('.hero') || document.querySelector('.page-hero')
    if (!hero) return
    if (!window.matchMedia('(min-width: 768px)').matches) return

    function createParticle () {
      var particle = document.createElement('div')
      particle.className = 'crimson-particle'
      var x = Math.random() * 100
      var y = Math.random() * 100
      var dx = (Math.random() - 0.5) * 100
      var dy = -(Math.random() * 140 + 60)
      particle.style.left = x + '%'
      particle.style.top = y + '%'
      particle.style.setProperty('--dx', dx + 'px')
      particle.style.setProperty('--dy', dy + 'px')
      var size = Math.random() * 5 + 2
      particle.style.width = size + 'px'
      particle.style.height = size + 'px'
      particle.style.animationDuration = (Math.random() * 3 + 3) + 's'
      hero.appendChild(particle)
      setTimeout(function () { particle.remove() }, 6000)
    }

    var interval = setInterval(createParticle, 260)
    createParticle()
    createParticle()
    createParticle()

    /* Store interval on window so it can be cleaned up */
    goldParticleInterval = interval
  }

  function cleanupGoldParticles () {
    if (goldParticleInterval) {
      clearInterval(goldParticleInterval)
      goldParticleInterval = null
    }
  }

  /* ── Scroll-triggered card reveal (IntersectionObserver) ── */
  function initScrollReveal () {
    var cards = document.querySelectorAll('.card, .latest-item')
    if (!cards.length) return

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

      cards.forEach(function (card) { observer.observe(card) })
    } else {
      /* Fallback: show all immediately */
      cards.forEach(function (card) { card.classList.add('visible') })
    }
  }

  /* ── Random navigation buttons ── */
  function initRandomButtons() {
    var btnCreature = document.getElementById('btn-random-creature');
    var btnStory = document.getElementById('btn-random-story');
    var btnSurprise = document.getElementById('btn-surprise-me');

    function getRandomSlug(type) {
      var sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
      if (!sh) return null;
      var items = sh.getAllItems && sh.getAllItems(type);
      if (items && items.length) {
        return items[Math.floor(Math.random() * items.length)].slug;
      }
      return null;
    }

    function navigateTo(type) {
      var slug = getRandomSlug(type);
      if (!slug) return;
      var page = type === 'creatures' ? 'bestiary.html?creature=' : 'stories.html?story=';
      window.location.href = page + encodeURIComponent(slug);
    }

    if (btnCreature) {
      btnCreature.addEventListener('click', function() {
        navigateTo('creatures');
      });
    }

    if (btnStory) {
      btnStory.addEventListener('click', function() {
        navigateTo('stories');
      });
    }

    if (btnSurprise) {
      btnSurprise.addEventListener('click', function() {
        var pick = Math.random() < 0.5 ? 'creatures' : 'stories';
        navigateTo(pick);
      });
    }
  }

  function initScrollToTop () {
    var btn = document.getElementById('scroll-to-top')
    if (!btn) return
    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 400)
    }, { passive: true })
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  /* ── Init all ── */
  async function init () {
    initActiveNav()
    initSmoothScroll()
    if (document.querySelector('.hero') || document.querySelector('.page-hero')) {
      initGoldParticles()
    }
    if (document.querySelector('.fog-layer')) {
      initFogFollow()
    }
    initScrollToTop()
    initRandomButtons()
    
    try {
      const sh = window.__sharedUtils && window.__sharedUtils.Shimmer;
      if (sh) {
        await sh.loadManifest();
      }
      updateGlobalStats()
    } catch (e) {
      console.error('Manifest load failed:', e);
    }
    
    await updateLatestAdditions()
    var isDetail = window.location.search.indexOf('creature=') !== -1
    if (!isDetail) {
      initScrollReveal()
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()