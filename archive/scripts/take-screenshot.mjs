import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
await page.goto('file:///Users/mafolsson/Desktop/DEMO-PROJECT%202/Whispering%20Lore/nav-mockups.html', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/nav-mockups.png', fullPage: true });
await browser.close();
