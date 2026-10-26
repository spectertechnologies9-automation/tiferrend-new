// Info panel review: open it over the hero, capture mid-open and settled frames, hover a service.
// node tests/infoshot.mjs <outPrefix> [width] [height]
import { chromium } from 'playwright';

const [out = 'info', width = '1440', height = '900'] = process.argv.slice(2);
const mobile = +width < 768;
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: +width, height: +height }, hasTouch: mobile, isMobile: mobile });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto('http://localhost:4173/', { waitUntil: 'load' });
await page.waitForTimeout(2500);
await page.click('[data-open="info"]:visible');
await page.waitForTimeout(160);
await page.screenshot({ path: `${out}-opening.jpg`, type: 'jpeg', quality: 75 });
await page.waitForTimeout(900);
if (!mobile) await page.hover('.ip__svc >> nth=2');
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}-open.jpg`, type: 'jpeg', quality: 80 });
await page.click('#info [data-close]');
await page.waitForTimeout(450);
const closed = await page.evaluate(() => !document.getElementById('info').open);
console.log(JSON.stringify({ closed, errors }));
await browser.close();
