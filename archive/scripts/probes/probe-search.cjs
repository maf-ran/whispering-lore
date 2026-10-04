const { chromium } = require('@playwright/test');
const BASE = process.argv[2] || 'http://localhost:8123';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const fetched = [];
  const errors = [];
  p.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
  p.on('response', r => {
    if (r.status() >= 400) errors.push('HTTP ' + r.status() + ' ' + r.url());
    if (r.url().includes('/data/')) fetched.push(r.url().replace(BASE, ''));
  });
  await p.goto(BASE + '/search.html?q=troll', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(6000);
  const result = await p.evaluate(() => {
    const total = document.getElementById('search-status')?.textContent || '';
    const cards = Array.from(document.querySelectorAll('.search-result-card'));
    const names = cards.slice(0, 5).map(c => c.querySelector('h3')?.textContent);
    const globalArgs = !!window.__FULL_CREATURES || !!window.__FULL_STORIES || !!window.__ITEMS;
    return { total, count: cards.length, names, globalArgs };
  });
  console.log(JSON.stringify({ result, fetched: fetched.slice(0, 12), fetchedCount: fetched.length, errors }, null, 2));
  await b.close();
})();