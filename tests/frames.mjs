// Viewport frames at story beats (pinned/sticky scenes need real scroll positions, not full-page shots).
// node tests/frames.mjs <path> <width> <height> <outPrefix> [--fresh] [--reduced]
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const [path = '', width = '1440', height = '900', out = 'frame'] = args.filter((a) => !a.startsWith('--'));
const fresh = args.includes('--fresh');
const browser = await chromium.launch({ channel: 'chrome' });
const mobile = +width < 768;
const ctx = await browser.newContext({ viewport: { width: +width, height: +height }, hasTouch: mobile, isMobile: mobile, reducedMotion: args.includes('--reduced') ? 'reduce' : 'no-preference' });
if (!fresh) await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`http://localhost:4173/${path}`, { waitUntil: 'load' });

const shot = async (name, wait = 900) => { await page.waitForTimeout(wait); await page.screenshot({ path: `${out}-${name}.jpg`, type: 'jpeg', quality: 72 }); };
const to = async (y) => { await page.evaluate((y) => window.scrollTo(0, y), y); };

if (fresh) {
  for (const t of [300, 1200, 1900, 2600, 3600]) { await page.waitForTimeout(t - (t > 300 ? [300, 1200, 1900, 2600][[1200, 1900, 2600, 3600].indexOf(t)] : 0)); await page.screenshot({ path: `${out}-load-${t}.jpg`, type: 'jpeg', quality: 72 }); }
} else {
  await shot('00-top', 2600);
}
// Beats: fractions of a section's scroll range, or a selector's top.
const beats = await page.evaluate(() => {
  const list = [];
  const H = innerHeight;
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  const hero = document.querySelector('[data-hero]');
  if (hero && hero.offsetHeight > H * 1.2) { list.push(['01-hero-40', top(hero) + (hero.offsetHeight - H) * 0.4]); list.push(['02-hero-85', top(hero) + (hero.offsetHeight - H) * 0.85]); }
  const add = (sel, name, frac = 0) => { const el = document.querySelector(sel); if (el) list.push([name, top(el) + (el.offsetHeight - H) * frac]); };
  add('.intro', '03-intro', 0.3);
  add('.tiles', '04-tiles', 0.05);
  add('.svc', '05-services', 0.1);
  add('.clients', '06-clients', 0);
  const hz = document.querySelector('[data-hz]');
  if (hz) { [0, 0.5, 1].forEach((f, i) => list.push([`07-studio-${i}`, top(hz) + Math.max(0, hz.offsetHeight - H) * f + (hz.offsetHeight > H * 1.2 ? 0 : -H * 0.1)])); }
  add('.tst', '09-testimonials', 0);
  add('.hct', '10-contact', 0);
  add('.wk__grid', '03-grid', 0);
  add('.pj__cover', '03-cover', 0);
  add('.ps--palette', '04-palette', 0);
  add('.proc', '05-proc', 0.35);
  add('.ab-story', '03-story', 0);
  add('.ftr__mark', '99-footer', 0);
  return list.map(([n, y]) => [n, Math.max(0, Math.round(y))]);
});
for (const [name, y] of beats) {
  // approach from slightly above so scrub/reveal triggers fire like a real scroll
  await to(Math.max(0, y - 300)); await page.waitForTimeout(250); await to(y);
  await shot(name, 1100);
}
console.log(JSON.stringify({ frames: beats.length + 1, errors }));
await browser.close();
