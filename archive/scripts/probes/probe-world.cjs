const { chromium } = require('@playwright/test');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const log = [];
  p.on('console', m => log.push(m.type() + ': ' + m.text()));
  p.on('requestfailed', r => log.push('REQFAIL ' + r.url() + ' ' + ((r.failure() || {}).errorText || '')));
  p.on('response', r => {
    const u = r.url();
    if (u.includes('data/sharded') || u.includes('datasets') || r.status() >= 400)
      log.push('HTTP ' + r.status() + ' ' + u.split('/').slice(-2).join('/'));
  });
  await p.goto('http://localhost:3000/world.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForTimeout(12000);
  const state = await p.evaluate(() => ({
    regionCards: document.querySelectorAll('.region-card--loaded').length,
    regionCardsTotal: document.querySelectorAll('.region-card').length,
    globe: !!document.querySelector('canvas'),
    bodySample: document.body.innerText.slice(0, 300),
  }));
  console.log(JSON.stringify({ state, log: log.slice(0, 40) }, null, 1));
  await b.close();
})();