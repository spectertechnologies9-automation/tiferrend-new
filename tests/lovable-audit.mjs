// Audit of the approved Lovable site: section-by-section frames, computed fonts and colours, headings,
// and the page structure. node tests/lovable-audit.mjs <outPrefix> [path] [width] [height]
import { chromium } from 'playwright';
const [out = 'lov', path = '', width = '1440', height = '900'] = process.argv.slice(2);
const base = 'https://tifferend-brand-journey.lovable.app/';
const b = await chromium.launch({ channel: 'chrome' });
const mobile = +width < 768;
const ctx = await b.newContext({ viewport: { width: +width, height: +height }, hasTouch: mobile, isMobile: mobile });
const p = await ctx.newPage();
await p.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(6000); // the preloader runs first
const info = await p.evaluate(() => {
  const cs = (el) => getComputedStyle(el);
  const body = document.body;
  const fams = new Set(), colors = {}, bgs = {};
  document.querySelectorAll('body *').forEach((el) => {
    const s = cs(el);
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
      fams.add(s.fontFamily.split(',')[0].trim());
      colors[s.color] = (colors[s.color] || 0) + 1;
    }
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgs[s.backgroundColor] = (bgs[s.backgroundColor] || 0) + 1;
  });
  const secs = [...document.querySelectorAll('section, header, footer, main > div')].filter((s) => s.getBoundingClientRect().height > 120).map((s) => {
    const r = s.getBoundingClientRect(), h = s.querySelector('h1,h2,h3');
    return { tag: s.tagName.toLowerCase(), id: s.id, cls: (s.className && s.className.toString().slice(0, 60)) || '', top: Math.round(r.top + scrollY), h: Math.round(r.height), bg: cs(s).backgroundColor, head: h ? `${h.textContent.trim().slice(0, 60)} [${cs(h).fontFamily.split(',')[0]} ${cs(h).fontSize} ${cs(h).fontWeight}]` : '' };
  });
  return {
    title: document.title, bodyBg: cs(body).backgroundColor, bodyColor: cs(body).color, bodyFont: cs(body).fontFamily,
    fonts: [...fams], loadedFonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.weight} ${f.style}`),
    topColors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 8), topBgs: Object.entries(bgs).sort((a, b) => b[1] - a[1]).slice(0, 8),
    height: document.documentElement.scrollHeight, secs,
    headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => `${h.tagName} ${h.textContent.trim().slice(0, 70)}`).slice(0, 40),
    nav: [...document.querySelectorAll('nav a, header a')].map((a) => `${a.textContent.trim()}→${a.getAttribute('href')}`).slice(0, 20),
  };
});
console.log(JSON.stringify(info, null, 1));
const H = info.height, step = +height;
for (let y = 0, i = 0; y < H; y += step, i++) {
  await p.evaluate((y) => window.scrollTo(0, y), y);
  await p.waitForTimeout(1000);
  await p.screenshot({ path: `${out}-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 60 });
  if (i > 30) break;
}
await b.close();
