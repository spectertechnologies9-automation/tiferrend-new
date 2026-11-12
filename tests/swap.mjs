// DIFFERENT ⇄ TIFFEREND check: samples the first/last glyph swap offsets every 100 ms, reports each swap's
// start time and direction (so the 5 s period can be checked), whether the two travellers overlap any
// letter once landed, and captures frames. node tests/swap.mjs <outPrefix> [width] [height] [seconds]
import { chromium } from 'playwright';
const [out = 'swap', W = '1440', H = '900', SECS = '22'] = process.argv.slice(2);
const mobile = +W < 768;
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: +W, height: +H }, hasTouch: mobile, isMobile: mobile });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(m.text().slice(0, 160)));
await p.goto('http://localhost:4173/', { waitUntil: 'load' });
const t0 = Date.now();
const samples = [];
const shots = { different: false, mid: false, tifferend: false, back: false };
let lastState = null, swaps = [], overlapIssues = 0;
while (Date.now() - t0 < +SECS * 1000) {
  const s = await p.evaluate(() => {
    const el = [...document.querySelectorAll('.g3__s')];
    if (!el.length) return null;
    const x = (i) => parseFloat((el[i].style.transform.match(/translate\(([-\d.]+)%/) || [0, 0])[1]); // xPercent
    const target = (i) => parseFloat(el[i].closest('.g3').dataset.sx);
    const faces = [...document.querySelectorAll('.g3__face')].map((f) => { const r = f.getBoundingClientRect(); return [r.left, r.right]; });
    const vis = +getComputedStyle(document.querySelector('.g3')).opacity;
    return { k: x(0) / target(0), faces, vis };
  });
  const t = (Date.now() - t0) / 1000;
  if (s) {
    // state by where glyph 0 (the t) is: near 0 = TIFFEREND, far right = DIFFERENT, between = moving
    const state = s.k > 0.97 ? 'D' : s.k < 0.03 ? 'T' : 'm'; // share of the t's way to its DIFFERENT slot
    samples.push(`${t.toFixed(1)}:${state}`);
    if (lastState && state === 'm' && lastState !== 'm') swaps.push({ t: +t.toFixed(1), from: lastState });
    // landed: the t (glyph 0) and d (6) must not overlap their new neighbours' faces by more than a sliver
    if (state !== 'm' && s.vis > 0.95) {
      const order = state === 'T' ? [0, 1, 2, 3, 4, 5, 6] : [6, 1, 2, 3, 4, 5, 0];
      for (let i = 0; i < order.length - 1; i++) { const a = s.faces[order[i]], c = s.faces[order[i + 1]]; if (a[1] - c[0] > (c[1] - c[0]) * 0.6) overlapIssues++; }
    }
    lastState = state;
    const want = state === 'D' && s.vis > 0.95 && !shots.different ? 'different' : state === 'm' && !shots.mid && swaps.length === 1 ? 'mid' : state === 'T' && swaps.length >= 1 && !shots.tifferend ? 'tifferend' : state === 'm' && swaps.length === 2 && !shots.back ? 'back' : null;
    if (want) { shots[want] = true; await p.screenshot({ path: `${out}-${W}-${want}.png` }); }
  }
  await p.waitForTimeout(100);
}
const gaps = swaps.slice(1).map((s, i) => +(s.t - swaps[i].t).toFixed(1));
console.log(JSON.stringify({ swaps, intervals: gaps, overlapIssues, errors, timeline: samples.filter((_, i) => i % 5 === 0).join(' ') }, null, 1));
await b.close();
