// Hero frames at 1440 and 390 (two moments each) plus a crop of the studio drawing; reports errors and failed requests.
// node tests/look.mjs <outPrefix>   (needs `vite preview --port 4173`)
import { chromium } from 'playwright';
const out = process.argv[2];
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h, m] of [[1440, 900, false], [390, 800, true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: m, isMobile: m });
  await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (c) => c.type() === 'error' && errs.push(c.text()));
  const bad = []; p.on('response', (r) => r.status() >= 400 && bad.push(r.url()));
  await p.goto('http://localhost:4173/'); await p.waitForTimeout(6500);
  await p.screenshot({ path: `${out}-${w}.png`, type: 'png' });
  const art = await p.locator('[data-hero-art]').boundingBox();
  await p.screenshot({ path: `${out}-${w}-art.png`, clip: { x: art.x - 30, y: art.y - 30, width: art.width + 60, height: art.height + 60 } });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `${out}-${w}-b.png`, type: 'png' });
  const mark = await p.locator('[data-hero-mark]').boundingBox();
  console.log(w, JSON.stringify({ art, mark, errs, bad }));
  await ctx.close();
}
await b.close();
