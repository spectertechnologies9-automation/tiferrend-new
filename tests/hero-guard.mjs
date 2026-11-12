// Hero guard: the hero is locked. Records (save) or compares (check) the hero's generated markup,
// hero3d.js, the hero rules in main.css, computed geometry/fonts of hero elements, and static
// (reduced-motion) screenshots at 1440 and 390. Needs `vite preview --port 4173` and a fresh build.
//   node tests/hero-guard.mjs save | check
import { chromium } from 'playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';
const mode = process.argv[2] || 'check';
const dir = 'tests/hero-baseline/';
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex').slice(0, 16);
const html = fs.readFileSync('dist/index.html', 'utf8');
const heroHtml = (html.match(/<section class="hero[\s\S]*?<\/section>/) || [''])[0].replace(/assets\/[\w.-]+/g, 'asset');
// hero rules: selectors that start with a hero class (a .vidctl placed inside another section is not the hero's)
const heroRules = (text) => text.split('\n').filter((l) => /^\s*(\.(hero|g3|wm3|lt)\b|\.hero__|\.vidctl\b|\.info-open \.hero|\.reduced \.(g3|hero)|\.js:not\(\.reduced\) \.hero)/.test(l)).join('\n');
const css = heroRules(fs.readFileSync('src/styles/main.css', 'utf8'));
if (process.argv[3]) { console.log(hash(heroRules(fs.readFileSync(process.argv[3], 'utf8'))), heroRules(fs.readFileSync(process.argv[3], 'utf8')).split('\n').length); process.exit(0); } // fingerprint another stylesheet
const facts = { heroHtml: hash(heroHtml), hero3d: hash(fs.readFileSync('src/js/hero3d.js', 'utf8')), heroCss: hash(css) };
const b = await chromium.launch({ channel: 'chrome' });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', isMobile: w < 768, hasTouch: w < 768 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:4173/', { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  facts[`geo${w}`] = await p.evaluate(() => [...document.querySelectorAll('.hero, .hero__title, .wm3, .g3, .hero__type, .hero__sub, .hero__scroll, .hero .vidctl, .hero__poster img')].map((e) => {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return [e.className.baseVal ?? e.className, Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), cs.fontFamily.split(',')[0], cs.fontSize, cs.color].join('|');
  }));
  await p.screenshot({ path: `${dir}${mode === 'save' ? 'base' : 'now'}-${w}.png` });
  await ctx.close();
}
await b.close();
const file = `${dir}facts.json`;
if (mode === 'save') { fs.writeFileSync(file, JSON.stringify(facts, null, 1)); console.log('saved hero baseline'); }
else {
  const base = JSON.parse(fs.readFileSync(file, 'utf8'));
  const diffs = Object.keys(base).filter((k) => JSON.stringify(base[k]) !== JSON.stringify(facts[k]));
  console.log(JSON.stringify({ unchanged: diffs.length === 0, diffs, detail: diffs.map((k) => ({ k, base: base[k], now: facts[k] })) }, null, 1));
}
