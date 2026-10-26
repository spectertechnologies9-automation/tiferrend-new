// Hero scroll smoothness probe: real wheel input from the top through the hero into the next section.
// Records every animation frame (duration, scrollY) and how far the page trails the input.
//   node tests/scrollperf.mjs [url] [label] [css]   (css: optional style injected after load, to isolate a cost)
import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4173/';
const label = process.argv[3] || 'run';
const css = process.argv[4] || '';
const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu-vsync-throttling'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'load' });
if (css) await page.addStyleTag({ content: css });
await page.waitForTimeout(3500); // let the hero entrance finish
await page.mouse.move(720, 450);

await page.evaluate(() => {
  window.__frames = [];
  let last = performance.now();
  const tick = (t) => { window.__frames.push([t - last, scrollY]); last = t; if (window.__frames.length < 2000) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
});
const heroEnd = await page.evaluate(() => { const h = document.querySelector('[data-hero]'); return h ? h.offsetTop + h.offsetHeight : 1890; });
// ~ a brisk trackpad/mouse scroll: 100px every 16ms until well past the hero.
let sent = 0;
const t0 = Date.now();
while (sent < heroEnd + 400) { await page.mouse.wheel(0, 100); sent += 100; await page.waitForTimeout(16); }
const inputMs = Date.now() - t0;
// how long until the page catches up (scroll stops moving)
let settle = 0, prev = -1, still = 0;
while (still < 6 && settle < 4000) { const y = await page.evaluate(() => scrollY); still = Math.abs(y - prev) < 1 ? still + 1 : 0; prev = y; await page.waitForTimeout(50); settle += 50; }
const frames = await page.evaluate(() => window.__frames.slice(2));
const d = frames.map((f) => f[0]).sort((a, b) => a - b);
const pct = (p) => d[Math.min(d.length - 1, Math.floor(d.length * p))].toFixed(1);
const long = frames.filter((f) => f[0] > 25).length;
const longAt = frames.filter((f) => f[0] > 25).map((f) => `${Math.round(f[0])}ms@${Math.round(f[1])}`).join(' ');
console.log(JSON.stringify({ label, frames: frames.length, p50: pct(0.5), p95: pct(0.95), max: d[d.length - 1].toFixed(1), over25ms: long, longAt, inputMs, catchUpAfterInputMs: settle - 300, heroEnd }));
await browser.close();
