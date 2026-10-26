// Cursor ripple checks: lenses appear under a moving pointer, displace pixels, and go idle at rest.
// node tests/ripple.mjs <outPrefix>
import { chromium } from 'playwright';

const [out = 'rp'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
await p.goto('http://localhost:4173/', { waitUntil: 'load' });
await p.waitForTimeout(2500);
const res = { supported: await p.evaluate(() => CSS.supports('backdrop-filter', 'url(#a)')) };
const live = () => p.evaluate(() => [...document.querySelectorAll('.rp')].filter((r) => getComputedStyle(r).visibility === 'visible').length);
const sweep = async (y, steps, pause) => { for (let i = 0; i <= steps; i++) { await p.mouse.move(200 + (1040 * i) / steps, y + Math.sin(i / 2) * 20); await p.waitForTimeout(pause); } };

for (const [name, sel, off] of [['intro', '#intro', -150], ['svc', '.svc', 200], ['footer', '.ftr__cols', -300]]) {
  await p.locator(sel).first().evaluate((e, off) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + off), off);
  await p.mouse.move(5, 5); await p.waitForTimeout(1800);
  const idle = await p.screenshot({ clip: { x: 0, y: 200, width: 1440, height: 500 } });
  res[`${name}IdleLenses`] = await live();
  await sweep(450, 14, 45);          // fast pass
  res[`${name}FastLenses`] = await live();
  const moving = await p.screenshot({ clip: { x: 0, y: 200, width: 1440, height: 500 } });
  await p.screenshot({ path: `${out}-${name}-fast.png` });
  await sweep(450, 40, 30);          // slow pass
  res[`${name}SlowLenses`] = await live();
  await p.screenshot({ path: `${out}-${name}-slow.png` });
  await p.waitForTimeout(2200);
  res[`${name}RestLenses`] = await live();
  // pixel difference between idle and moving frames (rough evidence of displacement)
  res[`${name}DiffBytes`] = Buffer.compare(idle, moving) !== 0;
}
console.log(JSON.stringify({ ...res, errors }, null, 1));
await b.close();
