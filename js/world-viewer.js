;(function () {
  'use strict'

  let CREATURES = window.__CREATURES_DATA || []
  let STORIES = window.__STORIES_DATA || []
  let _dataReady = false

  window.__COUNTRY_CREATURE_COUNTS = window.__COUNTRY_CREATURE_COUNTS || {}
  window.__REGION_COUNTS = window.__REGION_COUNTS || {}

  function xhrFallbackLoad(callback) {
    const fetchJSON =
      window.__sharedUtils && window.__sharedUtils.fetchJSON
    function loadJSON(url, cb) {
      if (!fetchJSON) {
        cb([])
        return
      }
      fetchJSON(url).then(cb).catch(function () {
        cb([])
      })
    }
    loadJSON('data/datasets/creatures.json', function (creatures) {
      loadJSON('data/datasets/stories.json', function (stories) {
        if (creatures && creatures.length) {
          CREATURES = creatures
          window.__FULL_CREATURES = creatures
        }
        if (stories && stories.length) {
          STORIES = stories
          window.__FULL_STORIES = stories
        }
        _dataReady = true
        callback()
      })
    })
  }

  const REGION_MAP = {
    Norse: 'Nordic & Germanic',
    Norwegian: 'Nordic & Germanic',
    Swedish: 'Nordic & Germanic',
    'Swedish, Sami': 'Nordic & Germanic',
    Icelandic: 'Nordic & Germanic',
    Faroese: 'Nordic & Germanic',
    Danish: 'Nordic & Germanic',
    Finnish: 'Nordic & Germanic',
    Sami: 'Nordic & Germanic',
    'Finnish, Sami': 'Nordic & Germanic',
    German: 'Nordic & Germanic',
    Germanic: 'Nordic & Germanic',
    Austrian: 'Nordic & Germanic',
    Swiss: 'Nordic & Germanic',
    Dutch: 'Nordic & Germanic',
    Flemish: 'Nordic & Germanic',
    Belgian: 'Nordic & Germanic',
    Trøndelag: 'Nordic & Germanic',
    Åland: 'Nordic & Germanic',
    'West Nordic': 'Nordic & Germanic',
    European: 'Nordic & Germanic',
    Nordic: 'Nordic & Germanic',

    Japanese: 'East Asia',
    Chinese: 'East Asia',
    Korean: 'East Asia',
    Mongolian: 'East Asia',
    Tibetan: 'East Asia',
    Vietnamese: 'East Asia',
    'Southeast Asian': 'East Asia',
    Filipino: 'East Asia',
    Indonesian: 'East Asia',
    Malaysian: 'East Asia',
    Thai: 'East Asia',
    Burmese: 'East Asia',
    Cambodian: 'East Asia',
    Taiwanese: 'East Asia',
    Ryukyuan: 'East Asia',
    Ainu: 'East Asia',
    Hmong: 'East Asia',
    'East Asian': 'East Asia',
    Pacific: 'East Asia',

    'West African': 'Africa & Diaspora',
    'West Africa': 'Africa & Diaspora',
    'East African': 'Africa & Diaspora',
    'East Africa': 'Africa & Diaspora',
    'Southern African': 'Africa & Diaspora',
    'Central African': 'Africa & Diaspora',
    'Central Africa': 'Africa & Diaspora',
    African: 'Africa & Diaspora',
    'North African': 'Africa & Diaspora',
    'Northeast African': 'Africa & Diaspora',
    Egyptian: 'Africa & Diaspora',
    Ethiopian: 'Africa & Diaspora',
    Somalian: 'Africa & Diaspora',
    Yoruba: 'Africa & Diaspora',
    Ewe: 'Africa & Diaspora',
    Ghanaian: 'Africa & Diaspora',
    'South African': 'Africa & Diaspora',
    Congolese: 'Africa & Diaspora',
    Angolan: 'Africa & Diaspora',
    Malian: 'Africa & Diaspora',
    Nigerian: 'Africa & Diaspora',
    Tuareg: 'Africa & Diaspora',
    Berber: 'Africa & Diaspora',
    Hausa: 'Africa & Diaspora',

    Scottish: 'British Isles & Celtic',
    Irish: 'British Isles & Celtic',
    Welsh: 'British Isles & Celtic',
    Cornish: 'British Isles & Celtic',
    English: 'British Isles & Celtic',
    Manx: 'British Isles & Celtic',
    Shetland: 'British Isles & Celtic',
    Orkney: 'British Isles & Celtic',
    Hebridean: 'British Isles & Celtic',
    British: 'British Isles & Celtic',
    'Anglo-Saxon': 'British Isles & Celtic',
    Pictish: 'British Isles & Celtic',
    Brythonic: 'British Isles & Celtic',
    Gaelic: 'British Isles & Celtic',
    Celtic: 'British Isles & Celtic',

    Indian: 'South Asia',
    'South Asian': 'South Asia',
    Tamil: 'South Asia',
    Bengali: 'South Asia',
    Pakistani: 'South Asia',
    'Sri Lankan': 'South Asia',
    Nepalese: 'South Asia',
    Bhutanese: 'South Asia',
    Maldivian: 'South Asia',
    Hindu: 'South Asia',
    Buddhist: 'South Asia',
    'Central Asian': 'South Asia',

    Slavic: 'Slavic & Baltic',
    Polish: 'Slavic & Baltic',
    Czech: 'Slavic & Baltic',
    Slovak: 'Slavic & Baltic',
    Russian: 'Slavic & Baltic',
    'East Slavic': 'Slavic & Baltic',
    Ukrainian: 'Slavic & Baltic',
    Belarusian: 'Slavic & Baltic',
    Lithuanian: 'Slavic & Baltic',
    Latvian: 'Slavic & Baltic',
    Estonian: 'Slavic & Baltic',
    Croatian: 'Slavic & Baltic',
    Serbian: 'Slavic & Baltic',
    Bosnian: 'Slavic & Baltic',
    Slovenian: 'Slavic & Baltic',
    Bulgarian: 'Slavic & Baltic',
    Romanian: 'Slavic & Baltic',
    Hungarian: 'Slavic & Baltic',
    Macedonian: 'Slavic & Baltic',
    Montenegrin: 'Slavic & Baltic',
    Albanian: 'Slavic & Baltic',
    'South Slavic': 'Slavic & Baltic',
    Sorbian: 'Slavic & Baltic',
    Kashubian: 'Slavic & Baltic',
    Rusyn: 'Slavic & Baltic',
    Cossack: 'Slavic & Baltic',
    Baltic: 'Slavic & Baltic',
    Balkan: 'Slavic & Baltic',
    Caucasus: 'Slavic & Baltic',

    Greek: 'Mediterranean & Middle East',
    Italian: 'Mediterranean & Middle East',
    Spanish: 'Mediterranean & Middle East',
    Portuguese: 'Mediterranean & Middle East',
    French: 'Mediterranean & Middle East',
    Maltese: 'Mediterranean & Middle East',
    Cypriot: 'Mediterranean & Middle East',
    Turkish: 'Mediterranean & Middle East',
    Armenian: 'Mediterranean & Middle East',
    Persian: 'Mediterranean & Middle East',
    Arabic: 'Mediterranean & Middle East',
    Israeli: 'Mediterranean & Middle East',
    Jewish: 'Mediterranean & Middle East',
    Kurdish: 'Mediterranean & Middle East',
    Iranian: 'Mediterranean & Middle East',
    Iraqi: 'Mediterranean & Middle East',
    Syrian: 'Mediterranean & Middle East',
    Lebanese: 'Mediterranean & Middle East',
    Jordanian: 'Mediterranean & Middle East',
    Saudi: 'Mediterranean & Middle East',
    Yemeni: 'Mediterranean & Middle East',
    Arabian: 'Mediterranean & Middle East',
    Phoenician: 'Mediterranean & Middle East',
    Roman: 'Mediterranean & Middle East',
    Sardinian: 'Mediterranean & Middle East',
    Sicilian: 'Mediterranean & Middle East',
    Corsican: 'Mediterranean & Middle East',
    Occitan: 'Mediterranean & Middle East',
    Basque: 'Mediterranean & Middle East',
    Catalan: 'Mediterranean & Middle East',
    Galician: 'Mediterranean & Middle East',
    Andalusian: 'Mediterranean & Middle East',
    Carthaginian: 'Mediterranean & Middle East',
    Minoan: 'Mediterranean & Middle East',
    Etruscan: 'Mediterranean & Middle East',
    Mediterranean: 'Mediterranean & Middle East',
    'Middle Eastern': 'Mediterranean & Middle East',

    'South American': 'The Americas',
    Mesoamerican: 'The Americas',
    Andean: 'The Americas',
    Amazonian: 'The Americas',
    Patagonian: 'The Americas',
    Plains: 'The Americas',
    'Northwest Coast': 'The Americas',
    'Great Basin': 'The Americas',
    Southeast: 'The Americas',
    Northeast: 'The Americas',
    Southwest: 'The Americas',
    California: 'The Americas',
    'Great Lakes': 'The Americas',
    Arctic: 'The Americas',
    Subarctic: 'The Americas',
    Plateau: 'The Americas',
    Caribbean: 'The Americas',
    'Central American': 'The Americas',
    'North American': 'The Americas',
    Inuit: 'The Americas',
    Aleut: 'The Americas',
    Yupik: 'The Americas',
    Dene: 'The Americas',
    Algonquian: 'The Americas',
    Iroquoian: 'The Americas',
    Siouan: 'The Americas',
    Muskogean: 'The Americas',
    Salishan: 'The Americas',
    Athabaskan: 'The Americas',
    Tlingit: 'The Americas',
    Haida: 'The Americas',
    Cherokee: 'The Americas',
    Navajo: 'The Americas',
    Apache: 'The Americas',
    Puebloan: 'The Americas',
    Olmec: 'The Americas',
    Maya: 'The Americas',
    Aztec: 'The Americas',
    Inca: 'The Americas',
    Mapuche: 'The Americas',
    Tupi: 'The Americas',
    Guarani: 'The Americas',
    Arawak: 'The Americas',
    Taíno: 'The Americas',
    'Afro-Caribbean': 'The Americas',
    'African American': 'The Americas',
    Métis: 'The Americas',
  }

  const FALLBACK_MAP = {
    'Nordic & Germanic': [
      'Norway',
      'Sweden',
      'Denmark',
      'Iceland',
      'Finland',
      'Germany',
      'Austria',
      'Switzerland',
      'Netherlands',
      'Faroe Islands',
      'Greenland',
      'Åland',
      'Svalbard',
    ],
    'East Asia': [
      'Japan',
      'China',
      'South Korea',
      'North Korea',
      'Taiwan',
      'Mongolia',
      'Vietnam',
      'Laos',
      'Cambodia',
      'Thailand',
      'Myanmar',
      'Philippines',
      'Indonesia',
      'Malaysia',
      'Singapore',
      'Brunei',
      'East Timor',
    ],
    'Africa & Diaspora': [
      'South Africa',
      'Nigeria',
      'Ghana',
      'Kenya',
      'Ethiopia',
      'Egypt',
      'Tanzania',
      'Zimbabwe',
      'Mali',
      'Senegal',
      'Togo',
      'Benin',
      'Ivory Coast',
      'Congo',
      'Democratic Republic of Congo',
      'Cameroon',
      'Angola',
      'Morocco',
      'Algeria',
      'Tunisia',
      'Uganda',
      'Rwanda',
      'Sudan',
      'Somalia',
      'Mozambique',
      'Madagascar',
      'Malawi',
      'Zambia',
      'Eritrea',
      'Chad',
      'Niger',
      'Burkina Faso',
      'Guinea',
      'Sierra Leone',
      'Liberia',
      'Mauritania',
      'Botswana',
      'Namibia',
      'Lesotho',
      'Swaziland',
      'Eswatini',
      'Gabon',
      'Central African Republic',
      'Burundi',
      'Djibouti',
      'Libya',
      'Western Sahara',
      'Mauritius',
      'Seychelles',
      'Comoros',
    ],
    'British Isles & Celtic': [
      'United Kingdom',
      'Ireland',
      'Scotland',
      'Wales',
      'England',
      'Northern Ireland',
      'Isle of Man',
      'Cornwall',
    ],
    'South Asia': [
      'India',
      'Pakistan',
      'Bangladesh',
      'Sri Lanka',
      'Nepal',
      'Bhutan',
      'Maldives',
      'Tibet',
    ],
    'Slavic & Baltic': [
      'Russia',
      'Ukraine',
      'Belarus',
      'Poland',
      'Czech Republic',
      'Slovakia',
      'Hungary',
      'Romania',
      'Bulgaria',
      'Serbia',
      'Croatia',
      'Bosnia',
      'Slovenia',
      'Montenegro',
      'Macedonia',
      'Albania',
      'Lithuania',
      'Latvia',
      'Estonia',
      'Moldova',
    ],
    'Mediterranean & Middle East': [
      'Italy',
      'Greece',
      'Spain',
      'Portugal',
      'France',
      'Malta',
      'Cyprus',
      'Turkey',
      'Israel',
      'Iran',
      'Iraq',
      'Syria',
      'Lebanon',
      'Jordan',
      'Saudi Arabia',
      'Yemen',
      'Oman',
      'UAE',
      'Qatar',
      'Bahrain',
      'Kuwait',
      'Armenia',
      'Georgia',
      'Azerbaijan',
      'Afghanistan',
      'Turkmenistan',
      'Uzbekistan',
      'Tajikistan',
      'Kyrgyzstan',
      'Kazakhstan',
      'Palestine',
      'Monaco',
      'San Marino',
      'Vatican',
      'Andorra',
    ],
    'The Americas': [
      'United States',
      'USA',
      'Canada',
      'Mexico',
      'Brazil',
      'Argentina',
      'Chile',
      'Peru',
      'Colombia',
      'Venezuela',
      'Ecuador',
      'Bolivia',
      'Paraguay',
      'Uruguay',
      'Guyana',
      'Suriname',
      'French Guiana',
      'Panama',
      'Costa Rica',
      'Nicaragua',
      'Honduras',
      'El Salvador',
      'Guatemala',
      'Belize',
      'Cuba',
      'Jamaica',
      'Haiti',
      'Dominican Republic',
      'Puerto Rico',
      'Bahamas',
      'Trinidad',
      'Barbados',
      'Saint Lucia',
      'Saint Vincent',
      'Grenada',
      'Dominica',
      'Antigua',
      'Saint Kitts',
      'Barbuda',
    ],
  }

  const CANONICAL_TO_GLYPH = {
    'Nordic & Germanic': 'Nordic',
    'British Isles & Celtic': 'Celtic',
    'Africa & Diaspora': 'Sub-Saharan Africa',
    'The Americas': 'default',
    'Mediterranean & Middle East': 'Middle East',
    'Slavic & Baltic': 'European',
    'East Asia': 'East Asia',
  }

  const CANONICAL_REGIONS = [
    { id: 'nordic', name: 'Nordic & Germanic', cssClass: 'region-nordic' },
    { id: 'east-asia', name: 'East Asia', cssClass: 'region-east-asia' },
    { id: 'africa', name: 'Africa & Diaspora', cssClass: 'region-africa' },
    { id: 'celtic', name: 'British Isles & Celtic', cssClass: 'region-celtic' },
    { id: 'south-asia', name: 'South Asia', cssClass: 'region-south-asia' },
    { id: 'slavic', name: 'Slavic & Baltic', cssClass: 'region-slavic' },
    {
      id: 'mediterranean',
      name: 'Mediterranean & Middle East',
      cssClass: 'region-mediterranean',
    },
    { id: 'americas', name: 'The Americas', cssClass: 'region-americas' },
  ]

  function classifyRegion(creature) {
    const r = creature.region || ''
    if (REGION_MAP[r]) return REGION_MAP[r]

    const c =
      (creature.culture || '') +
      ' ' +
      (creature.mythology || '') +
      ' ' +
      (creature.country || '') +
      ' ' +
      (creature.type || '')
    for (const key in REGION_MAP) {
      if (c.indexOf(key) !== -1) return REGION_MAP[key]
    }

    for (const region in FALLBACK_MAP) {
      const countries = FALLBACK_MAP[region]
      for (let i = 0; i < countries.length; i++) {
        if (c.indexOf(countries[i]) !== -1) return region
      }
    }

    return 'Unclassified'
  }

  function classifyStoryRegion(story) {
    const reg = story.region || ''
    const REGION_MAP_STORIES = {
      Norse: 'Nordic & Germanic',
      Swedish: 'Nordic & Germanic',
      German: 'Nordic & Germanic',
      Danish: 'Nordic & Germanic',
      Irish: 'British Isles & Celtic',
      Scottish: 'British Isles & Celtic',
      English: 'British Isles & Celtic',
      Russian: 'Slavic & Baltic',
      Polish: 'Slavic & Baltic',
      Czech: 'Slavic & Baltic',
      French: 'Mediterranean & Middle East',
      Italian: 'Mediterranean & Middle East',
      Spanish: 'Mediterranean & Middle East',
      Portuguese: 'Mediterranean & Middle East',
      Greek: 'Mediterranean & Middle East',
      Finnish: 'Nordic & Germanic',
      Dutch: 'Nordic & Germanic',
      Japanese: 'East Asia',
      Chinese: 'East Asia',
      Vietnamese: 'East Asia',
      Indian: 'South Asia',
      Arabic: 'Mediterranean & Middle East',
      Turkish: 'Mediterranean & Middle East',
      African: 'Africa & Diaspora',
      'West African': 'Africa & Diaspora',
      'East African': 'Africa & Diaspora',
      Egyptian: 'Africa & Diaspora',
      'Native American': 'The Americas',
      Mesoamerican: 'The Americas',
      'South American': 'The Americas',
      Caribbean: 'The Americas',
      Inuit: 'The Americas',
      Slavic: 'Slavic & Baltic',
      Germanic: 'Nordic & Germanic',
      Nordic: 'Nordic & Germanic',
      'Northern Sweden': 'Nordic & Germanic',
      Jämtland: 'Nordic & Germanic',
      Icelandic: 'Nordic & Germanic',
      Faroese: 'Nordic & Germanic',
    }

    if (REGION_MAP_STORIES[reg]) return REGION_MAP_STORIES[reg]

    const c =
      (story.country || '') +
      ' ' +
      (story.culture || '') +
      ' ' +
      (story.type || '')
    for (const key in REGION_MAP) {
      if (c.indexOf(key) !== -1) return REGION_MAP[key]
    }
    for (const region in FALLBACK_MAP) {
      const countries = FALLBACK_MAP[region]
      for (let i = 0; i < countries.length; i++) {
        if (c.indexOf(countries[i]) !== -1) return region
      }
    }

    return 'Unclassified'
  }

  function computeRegionCounts() {
    const creatureCounts = {}
    const storyCounts = {}
    const countryCreatureCounts = {}

    CANONICAL_REGIONS.forEach(function (r) {
      creatureCounts[r.name] = 0
      storyCounts[r.name] = 0
    })

    CREATURES.forEach(function (c) {
      const region = classifyRegion(c)
      creatureCounts[region] = (creatureCounts[region] || 0) + 1

      const country = c.country || c.mythology || ''
      const ctryKey = country.trim()
      if (ctryKey) {
        const parts = ctryKey.split(/[,/]/)
        parts.forEach(function (p) {
          const trimmed = p.trim()
          if (trimmed && trimmed.length < 40) {
            countryCreatureCounts[trimmed] =
              (countryCreatureCounts[trimmed] || 0) + 1
          }
        })
      }
    })

    STORIES.forEach(function (s) {
      const region = classifyStoryRegion(s)
      storyCounts[region] = (storyCounts[region] || 0) + 1
    })

    return {
      creatureCounts: creatureCounts,
      storyCounts: storyCounts,
      countryCreatureCounts: countryCreatureCounts,
    }
  }

  const REGION_DESCRIPTIONS = {
    'Nordic & Germanic':
      'From the icy fjords of Norway to the deep forests of Germany — trolls, valkyries, and the world-tree Yggdrasil shape a mythos of frost and fire.',
    'East Asia':
      "Japan's yōkai, China's celestial dragons, and Korea's dokkaebi — a rich tapestry of spirits, ancestors, and elemental beings.",
    'Africa & Diaspora':
      "Anansi's trickster tales, the Mwindo epic, and the spirit pantheons of West Africa — carried across the Atlantic to the Caribbean and Americas.",
    'British Isles & Celtic':
      'Banshees, selkies, and the Tuatha Dé Danann — the misty isles hold some of the oldest and most haunting folklore in the world.',
    'South Asia':
      'Nagas, rakshasas, and the devas of Hindu, Buddhist, and Jain mythology — a mythic universe of cosmic cycles and divine beings.',
    'Slavic & Baltic':
      "Baba Yaga in her chicken-legged hut, the water spirits of the rusalka, and the household domovoi — Eastern Europe's enduring folk soul.",
    'Mediterranean & Middle East':
      'Greek cyclopes, Roman lares, Egyptian gods, and Arabian djinn — the cradle of civilization is also the cradle of its most enduring myths.',
    'The Americas':
      'Wendigos, thunderbirds, and the skin-walkers of Indigenous North America — alongside the chupacabra and other cryptids of Latin America.',
  }

  function renderRegionCards(data) {
    const container = document.getElementById('region-list')
    if (!container) return

    container.innerHTML = ''

    CANONICAL_REGIONS.forEach(function (reg) {
      const name = reg.name
      const creatureCount = data.creatureCounts[name] || 0
      const storyCount = data.storyCounts[name] || 0
      const desc = REGION_DESCRIPTIONS[name] || ''

      const card = document.createElement('div')
      card.className = 'region-card region-card--loaded'

      const creaturePct = Math.round((creatureCount / CREATURES.length) * 100)

      const getGlyph =
        window.__sharedUtils &&
        window.__sharedUtils.RegionGlyphs &&
        window.__sharedUtils.RegionGlyphs.getGlyph
      const glyphKey = CANONICAL_TO_GLYPH[name] || 'default'
      const glyphPath = getGlyph ? getGlyph(glyphKey) : ''
      const svgHtml = glyphPath
        ? '<svg class="region-glyph" viewBox="0 0 32 32" width="48" height="48" aria-hidden="true"><path d="' +
          window.__sharedUtils.escapeXml(glyphPath) +
          '" fill="currentColor" opacity="0.3"/></svg>'
        : ''

      card.innerHTML =
        '<span class="accent-line"></span>' +
        svgHtml +
        '<h3>' +
        window.__sharedUtils.escapeXml(name) +
        '</h3>' +
        '<p>' +
        window.__sharedUtils.escapeXml(desc) +
        '</p>' +
        '<span class="region-count">' +
        '<span class="region-count-num">' +
        creatureCount +
        '</span> creatures &middot; ' +
        '<span class="region-story-num">' +
        storyCount +
        '</span> stories ' +
        '<span class="region-pct">(' +
        creaturePct +
        '% of compendium)</span>' +
        '</span>'

      card.style.cursor = 'pointer'
      card.addEventListener('click', function () {
        window.location.href =
          'bestiary.html?region=' + encodeURIComponent(name)
      })

      container.appendChild(card)
    })
  }

  function updateGlobeData(data) {
    window.__COUNTRY_CREATURE_COUNTS = data.countryCreatureCounts
    window.__REGION_COUNTS = data.creatureCounts
    if (typeof window.refreshGlobeDots === 'function') {
      window.refreshGlobeDots()
    }
  }

  function renderHotspots(data) {
    const container = document.getElementById('hotspots-container')
    if (!container) return

    const sorted = Object.entries(data.countryCreatureCounts)
      .filter(function (e) {
        return e[1] >= 5
      })
      .sort(function (a, b) {
        return b[1] - a[1]
      })
      .slice(0, 12)

    if (!sorted.length) {
      container.innerHTML =
        '<p class="loading-text">Not enough country data yet — explore the bestiary to help build this map!</p>'
      return
    }

    const maxCount = sorted[0][1]
    container.innerHTML = ''

    sorted.forEach(function (entry, i) {
      const name = entry[0]
      const count = entry[1]
      const pct = (count / maxCount) * 100

      const item = document.createElement('div')
      item.className = 'hotspot-item'
      item.innerHTML =
        '<span class="hotspot-rank">#' +
        (i + 1) +
        '</span>' +
        '<span class="hotspot-name">' +
        window.__sharedUtils.escapeXml(name) +
        '</span>' +
        '<span class="hotspot-count">' +
        count +
        ' creature' +
        (count !== 1 ? 's' : '') +
        '</span>' +
        '<div class="hotspot-bar" style="width:' +
        pct +
        '%"></div>'

      item.addEventListener('click', function () {
        window.location.href =
          'bestiary.html?country=' + encodeURIComponent(name)
      })

      container.appendChild(item)
    })
  }

  function updateHeroStats() {
    const statEls = document.querySelectorAll('.hero-stat-num')
    if (statEls.length >= 3) {
      window.__sharedUtils.animateNumber(statEls[0], CREATURES.length, 1400)
      window.__sharedUtils.animateNumber(
        statEls[1],
        STORIES.length || 343,
        1400
      )
    }
  }

  function init() {
    const heroSection = document.querySelector('.page-hero')
    if (!heroSection) return

    const data = computeRegionCounts()
    renderRegionCards(data)
    renderHotspots(data)
    updateGlobeData(data)
    updateHeroStats()

    if (typeof window.renderCountryList === 'function') {
      window.renderCountryList()
    }
  }

  function onReady() {
    xhrFallbackLoad(function () {
      init()
    })
  }

  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    setTimeout(onReady, 100)
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(onReady, 100)
    })
  }
})()
