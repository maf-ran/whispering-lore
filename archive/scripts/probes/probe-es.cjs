const { chromium } = require('@playwright/test');
const BASE = process.argv[2] || 'http://localhost:3000';
(async () => {
  const b = await chromium.launch();
  const results = {};
  for (const page of ['index', 'bestiary', 'stories', 'items']) {
    const p = await b.newPage();
    const log = [];
    p.on('console', m => { if (m.type() === 'error') log.push('CONSOLE ' + m.text()); });
    p.on('response', r => {
      if (r.status() >= 400) log.push('HTTP ' + r.status() + ' ' + r.url());
    });
    const url = BASE + '/' + page + '.html?lang=es';
    const resp = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.waitForTimeout(8000);
    const lang = await p.evaluate(() => document.documentElement.lang);
    const nav = await p.evaluate(() =>
      Array.from(document.querySelectorAll('nav a, nav button, .nav a'))
        .map(a => a.textContent.trim()).filter(Boolean).slice(0, 8));
    const dataI18n = await p.evaluate(() => {
      const seen = new Set();
      document.querySelectorAll('[data-i18n]').forEach(el => seen.add(el.getAttribute('data-i18n')));
      return Array.from(seen).slice(0, 12);
    });
    const overlays = await p.evaluate(() => {
      const fetched = window.__sharedUtils && window.__sharedUtils._shimmer
        ? Object.keys(window.__sharedUtils._shimmer.overlays || {}) : null;
      return fetched;
    });
    const title = await p.title();
    results[page] = { status: resp && resp.status(), lang, title, nav, dataI18n: dataI18n.length, overlays, log };
    await p.close();
  }

  // deep-detail check: bestiary card for a south-american creature shows ES name
  const p = await b.newPage();
  await p.goto(BASE + '/bestiary.html?lang=es', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(8000);
  await p.evaluate(() => {
    const grid = document.getElementById('bestiary-grid');
    const all = Array.from(grid.querySelectorAll('.card'));
    const t = all.find(c => c.textContent && c.textContent.toLowerCase().includes('trauco'));
    if (t) t.click();
  });
  await p.waitForTimeout(3000);
  const detail = await p.evaluate(() => {
    const h = document.querySelector('#detail-view h2, .detail h2, [id*=detail] h2');
    return h ? h.textContent.trim() : null;
  });
  results.detail = { esNameShown: detail };
  await b.close();
  console.log(JSON.stringify(results, null, 1));
})();