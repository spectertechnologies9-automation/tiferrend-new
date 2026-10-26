// Hero light: which glyph is lit over time, hops (spark visible), and frames. node tests/light.mjs <out>
import { chromium } from 'playwright';
const [out = 'lt'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text().slice(0, 200)));
await p.goto('http://localhost:4173/');
await p.mouse.move(700, 400);
const seq = [];
let shots = 0;
for (let k = 0; k < 120; k++) {
  const s = await p.evaluate(() => ({
    lit: [...document.querySelectorAll('.g3__light')].findIndex((l) => l.classList.contains('is-lit') && +getComputedStyle(l).opacity > 0.5),
    spark: +getComputedStyle(document.querySelector('[data-hero-spark]')).opacity,
  }));
  seq.push(s.spark > 0.5 ? '*' : s.lit >= 0 ? String(s.lit) : '.');
  if (k > 40 && shots < 3 && (s.spark > 0.5 || (s.lit >= 0 && k % 17 === 0))) await p.screenshot({ path: `${out}-${shots++}.png` });
  await p.waitForTimeout(100);
}
console.log(JSON.stringify({ timeline: seq.join(''), errors }));
await b.close();
