// Interaction checks: Info panel scroll (wheel + touch), hero cursor split, footer dance. Frames to <out>-*.jpg.
// node tests/interact.mjs <outPrefix>   (needs `vite preview --port 4173`)
import { chromium } from 'playwright';

const [out = 'v5'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome' });
const res = {};
const errors = [];

// ---- desktop, short viewport: Info scroll by wheel
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 700 } });
  await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${out}-hero.jpg`, type: 'jpeg', quality: 80 });
  // cursor sweep across the wordmark
  const box = await page.locator('[data-hero-mark]').boundingBox();
  const y = box.y + box.height * 0.5;
  await page.mouse.move(box.x + 10, y);
  for (let i = 0; i <= 12; i++) await page.mouse.move(box.x + (box.width * i) / 12, y + Math.sin(i) * 30, { steps: 1 });
  await page.waitForTimeout(60);
  await page.screenshot({ path: `${out}-split.jpg`, type: 'jpeg', quality: 80 });
  res.splitPx = await page.evaluate(() => [...document.querySelectorAll('.g3')].map((g) => Math.round(new DOMMatrix(getComputedStyle(g).transform).m41)));
  await page.waitForTimeout(1600);
  res.splitRecovered = await page.evaluate(() => [...document.querySelectorAll('.g3')].map((g) => Math.round(new DOMMatrix(getComputedStyle(g).transform).m41)));
  // Info scroll
  const before = await page.evaluate(() => scrollY);
  await page.click('[data-open="info"]:visible');
  await page.waitForTimeout(900);
  const sc = page.locator('#info [data-ip-scroll]');
  const sb = await sc.boundingBox();
  await page.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2);
  const dims = await sc.evaluate((e) => ({ sh: e.scrollHeight, ch: e.clientHeight }));
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, 200); await page.waitForTimeout(16); }
  await page.waitForTimeout(400);
  const atBottom = await sc.evaluate((e) => e.scrollTop);
  await page.screenshot({ path: `${out}-info-bottom.jpg`, type: 'jpeg', quality: 80 });
  for (let i = 0; i < 30; i++) { await page.mouse.wheel(0, -200); await page.waitForTimeout(16); }
  await page.waitForTimeout(400);
  const atTop = await sc.evaluate((e) => e.scrollTop);
  const during = await page.evaluate(() => scrollY);
  await page.click('#info [data-close]');
  await page.waitForTimeout(500);
  res.info = { ...dims, maxScroll: dims.sh - dims.ch, atBottom, atTop, pageScrollBefore: before, pageScrollDuring: during,
    closed: await page.evaluate(() => !document.getElementById('info').open), pageScrollAfter: await page.evaluate(() => scrollY) };
  // footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2500);
  const fm = await page.locator('[data-ftr-mark]').boundingBox();
  await page.screenshot({ path: `${out}-footer-a.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: fm.y, width: 1440, height: fm.height } });
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `${out}-footer-b.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: fm.y, width: 1440, height: fm.height } });
  for (let i = 0; i <= 10; i++) await page.mouse.move(fm.x + (fm.width * i) / 10, fm.y + fm.height * 0.6, { steps: 1 });
  await page.waitForTimeout(80);
  await page.screenshot({ path: `${out}-footer-burst.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: fm.y, width: 1440, height: fm.height } });
  res.footerMoving = await page.evaluate(() => [...document.querySelectorAll('.ftr__wm .fgw')].map((g) => getComputedStyle(g).transform !== 'none'));
  await ctx.close();
}

// ---- mobile: Info scroll by touch
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 760 }, hasTouch: true, isMobile: true });
  await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await page.tap('[data-open="info"]:visible');
  await page.waitForTimeout(900);
  const sc = page.locator('#info [data-ip-scroll]');
  const sb = await sc.boundingBox();
  const cdp = await ctx.newCDPSession(page);
  const x = Math.round(sb.x + sb.width / 2);
  for (let k = 0; k < 2; k++) {
    let y = Math.round(sb.y + sb.height * 0.85);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 0; i < 20; i++) { y -= 20; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }); await page.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(400);
  const dims = await sc.evaluate((e) => ({ sh: e.scrollHeight, ch: e.clientHeight, top: e.scrollTop }));
  await page.screenshot({ path: `${out}-info-mobile.jpg`, type: 'jpeg', quality: 80 });
  res.infoMobile = { ...dims, maxScroll: dims.sh - dims.ch, pageScroll: await page.evaluate(() => scrollY) };
  await ctx.close();
}
console.log(JSON.stringify({ ...res, errors }, null, 1));
await browser.close();
