// Session 7 checks: the orange cursor streak (trail.js) draws while moving and clears at rest, header logo reveal runs when leaving the
// hero, testimonial track scrolls by trackpad and buttons, no console errors. node tests/client6.mjs <out>
import { chromium } from 'playwright';
const [out = 'c6'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(e.message));
p.on('console', (m) => (m.type() === 'error' || /flow shader|hero motion/.test(m.text())) && errors.push(m.text().slice(0, 200)));
await p.goto('http://localhost:4173/', { waitUntil: 'load' });
await p.waitForTimeout(2500);
const res = {};
res.flowCanvasGone = await p.evaluate(() => !document.querySelector('canvas.flow'));
const inked = () => p.evaluate(() => { const c = document.querySelector('canvas.trail'); if (!c) return -1; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return n; });

// header reveal: logo windows collapsed over the hero, open after leaving it
const rectW = () => p.evaluate(() => [...document.querySelectorAll('[data-hdr-logo] clipPath rect')].reduce((a, r) => a + +r.getAttribute('width'), 0));
res.logoAtHero = Math.round(await rectW());
await p.evaluate(() => window.scrollTo(0, innerHeight * 1.4));
await p.waitForTimeout(250);
res.logoMid = Math.round(await rectW());
await p.screenshot({ path: `${out}-logo-mid.png`, clip: { x: 560, y: 10, width: 320, height: 60 } });
await p.waitForTimeout(1600);
res.logoDone = Math.round(await rectW());
await p.screenshot({ path: `${out}-logo-done.png`, clip: { x: 560, y: 10, width: 320, height: 60 } });

// streak: move over the intro, then rest
await p.locator('#intro').evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 100));
await p.waitForTimeout(800);
for (let i = 0; i < 40; i++) { const t = i / 40; await p.mouse.move(300 + 800 * t, 450 + Math.sin(t * 9) * 160); await p.waitForTimeout(16); }
res.trailPixelsWhileMoving = await inked();
await p.waitForTimeout(250);
await p.screenshot({ path: `${out}-trail.png` });
await p.waitForTimeout(5500);
res.trailPixelsAtRest = await inked();

// testimonials: trackpad (horizontal wheel) and buttons
await p.locator('[data-tst-track]').evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 260));
await p.waitForTimeout(2200); // let the smooth scroll settle before measuring the track
const tb = await p.locator('[data-tst-track]').boundingBox();
await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2);
const sl = () => p.evaluate(() => Math.round(document.querySelector('[data-tst-track]').scrollLeft));
res.trackStart = await sl();
for (let i = 0; i < 12; i++) { await p.mouse.wheel(110, 0); await p.waitForTimeout(25); } // about one card's width: shorter swipes snap back
await p.waitForTimeout(900);
res.trackAfterTrackpad = await sl();
await p.evaluate(() => document.querySelector('[data-tst-track]').scrollTo({ left: 0 }));
await p.waitForTimeout(500);
await p.click('[data-tst-next]');
await p.waitForTimeout(900);
res.trackAfterNext = await sl();
res.prevDisabledAtStartThenEnabled = await p.evaluate(() => document.querySelector('[data-tst-prev]').disabled);
await p.screenshot({ path: `${out}-tst.png` });
console.log(JSON.stringify({ ...res, errors }, null, 1));
await b.close();
