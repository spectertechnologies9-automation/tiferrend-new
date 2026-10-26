// Letter-flip timing: samples each hero glyph's Y rotation every 100 ms after load, on a first visit
// (loader) and a repeat visit (no loader), and the footer flip pair. node tests/flips.mjs
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const res = {};
for (const visit of ['first', 'repeat']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  if (visit === 'repeat') await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
  const p = await ctx.newPage();
  await p.goto('http://localhost:4173/');
  const t0 = Date.now();
  const turning = [];
  let loaderGoneAt = null;
  for (let k = 0; k < 90; k++) {
    const s = await p.evaluate(() => ({
      flip: [...document.querySelectorAll('.g3__p')].map((g) => Math.abs(new DOMMatrix(getComputedStyle(g).transform).m13) > 0.5 ? 1 : 0),
      loader: !!document.querySelector('[data-loader]') && document.documentElement.classList.contains('show-loader'),
    }));
    const t = (Date.now() - t0) / 1000;
    if (!s.loader && loaderGoneAt === null) loaderGoneAt = t;
    const n = s.flip.reduce((a, c) => a + c, 0);
    if (n) turning.push(`${t.toFixed(1)}:${n}`);
    await p.waitForTimeout(100);
  }
  res[visit] = { loaderGoneAt, turning: turning.join(' ') };
  await ctx.close();
}
console.log(JSON.stringify(res, null, 1));
await b.close();
