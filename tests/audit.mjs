// Section audit: one viewport frame per section of a page, plus measured type sizes and section paddings.
// node tests/audit.mjs <outPrefix> [path] [width] [height]
import { chromium } from 'playwright';
const [out = 'audit', path = '', width = '1440', height = '900'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const mobile = +width < 768;
const ctx = await b.newContext({ viewport: { width: +width, height: +height }, hasTouch: mobile, isMobile: mobile });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const p = await ctx.newPage();
await p.goto(`http://localhost:4173/${path}`, { waitUntil: 'load' });
await p.waitForTimeout(2500);
const secs = await p.evaluate(() => [...document.querySelectorAll('main > section, main > div > section, main > *:not(script), footer')].map((s) => {
  const r = s.getBoundingClientRect(), cs = getComputedStyle(s);
  const h = s.querySelector('h1, h2');
  return { cls: s.className.split(' ')[0] || s.tagName, top: Math.round(r.top + scrollY), h: Math.round(r.height), pt: cs.paddingTop, pb: cs.paddingBottom, head: h ? `${h.textContent.trim().slice(0, 40)} @ ${getComputedStyle(h).fontSize}` : '' };
}));
console.log(JSON.stringify(secs, null, 0));
let i = 0;
for (const s of secs) {
  await p.evaluate((y) => window.scrollTo(0, y), s.top);
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${out}-${String(i++).padStart(2, '0')}-${s.cls}.jpg`, type: 'jpeg', quality: 60 });
}
await b.close();
