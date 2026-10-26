// Hero motion review: N viewport frames at a fixed interval, for a contact sheet.
// node tests/heroclip.mjs <outPrefix> [count=8] [intervalMs=400] [width=1440] [height=900]
import { chromium } from 'playwright';

const [out = 'clip', count = '8', every = '400', width = '1440', height = '900'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: +width, height: +height } });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text()));
await page.goto('http://localhost:4173/', { waitUntil: 'load' });
await page.mouse.move(+width * 0.62, +height * 0.42);
await page.waitForTimeout(3200);
for (let i = 0; i < +count; i++) {
  await page.screenshot({ path: `${out}-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 70 });
  await page.waitForTimeout(+every);
}
console.log(JSON.stringify({ errors }));
await browser.close();
