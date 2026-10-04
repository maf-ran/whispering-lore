const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const log = [];
  p.on('console', m => log.push(m.type() + ': ' + m.text()));
  p.on('requestfailed', r => log.push('REQFAIL ' + r.url() + ' ' + (r.failure() || {}).errorText));
  p.on('response', r => {
    if (r.url().includes('data/sharded') || r.url().includes('i18n') || r.status() >= 400)
      log.push('HTTP ' + r.status() + ' ' + r.url());
  });
  await p.goto('http://localhost:3000/bestiary.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(15000);
  const state = await p.evaluate(async () => {
    const shards = window.__sharedUtils && window.__sharedUtils._shimmer ? window.__sharedUtils._shimmer.shards : null;
    return {
      cards: document.querySelectorAll('#bestiary-grid .card').length,
      emptyVisible: !!(document.getElementById('no-results') && getComputedStyle(document.getElementById('no-results')).display !== 'none'),
      shardKeys: shards ? Object.keys(shards) : null,
      total: document.querySelector('#result-count, .count, [id*=count]') ? document.querySelector('#result-count, .count, [id*=count]').textContent : null,
    };
  });
  console.log(JSON.stringify({ state, log: log.slice(0, 40) }, null, 1));
  await b.close();
})();