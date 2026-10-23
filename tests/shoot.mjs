// Visual review helper: full-page screenshots, split into segments.
// node tests/shoot.mjs <path> <width> <height> <outPrefix> [browser]
import { chromium, firefox, webkit } from 'playwright';

const [path = '', width = '1440', height = '900', out = 'shot', engine = 'chromium'] = process.argv.slice(2);
const browser = await { chromium, firefox, webkit }[engine].launch();
const mobile = +width < 768;
const ctx = await browser.newContext({ viewport: { width: +width, height: +height }, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile && engine !== 'firefox' });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`http://localhost:4173/${path}`, { waitUntil: 'networkidle' });
// Walk the page so lazy media and reveals trigger.
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += +height * 0.6) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(140); }
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(900);
const h = await page.evaluate(() => document.documentElement.scrollHeight);
const seg = +height * 3;
let i = 0;
for (let y = 0; y < h; y += seg, i++) {
  await page.screenshot({ path: `${out}-${i}.jpg`, type: 'jpeg', quality: 70, fullPage: true, clip: { x: 0, y, width: +width, height: Math.min(seg, h - y) } });
}
const overflow = await page.evaluate(() => {
  const W = document.documentElement.clientWidth;
  return [...document.querySelectorAll('body *')].filter((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width || getComputedStyle(el).position === 'fixed') return false;
    if (el.closest('.marq, .tst__list, .strip__track, .wk__filters, .sheet, .loader, [aria-hidden="true"]')) return false;
    return r.right > W + 1 || r.left < -1;
  }).slice(0, 8).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${Math.round(el.getBoundingClientRect().left)}→${Math.round(el.getBoundingClientRect().right)}`);
});
console.log(JSON.stringify({ segments: i, height: h, errors, overflow }));
await browser.close();
