// Live-site check (GitHub Pages): pages load without console/network errors, assets and fonts load,
// navigation and a project link work, a nested route survives a hard refresh, the 404 page is styled,
// and the hero's animated layers are running. node tests/live.mjs [baseUrl] [outPrefix]
import { chromium } from 'playwright';
const [base = 'https://spectertechnologies9-automation.github.io/tiferrend-new/', out = 'live'] = process.argv.slice(2);
const b = await chromium.launch({ channel: 'chrome' });
const res = {};
for (const [label, vp, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile });
  const p = await ctx.newPage();
  const errors = [], failed = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)));
  p.on('response', (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  await p.goto(base, { waitUntil: 'load' });
  await p.waitForTimeout(6500); // first visit: the loader runs, then hands off to the hero
  const r = await p.evaluate(() => ({
    title: document.title,
    css: [...document.styleSheets].some((s) => { try { return s.cssRules.length > 50; } catch { return false; } }),
    fontsLoaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family).filter((v, i, a) => a.indexOf(v) === i),
    heroGlyphs: document.querySelectorAll('.g3').length,
    astral: !!document.querySelector('[data-astral]') && getComputedStyle(document.querySelector('[data-astral]')).opacity,
    heroMoving: getComputedStyle(document.querySelector('.g3__in')).transform !== 'none',
    images: [...document.images].filter((i) => i.complete && i.naturalWidth > 0).length,
  }));
  await p.screenshot({ path: `${out}-${label}-home.png` });
  // navigation: Work, then a project, then a hard refresh of that nested route
  await p.goto(new URL('work/', base).href, { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  r.workTiles = await p.locator('.wk__item').count();
  await p.locator('a[href*="my-mithila"]').first().click();
  await p.waitForLoadState('load');
  await p.waitForTimeout(1200);
  r.projectUrl = p.url().replace(base, '/');
  await p.reload({ waitUntil: 'load' });
  r.projectAfterRefresh = await p.locator('h1').first().textContent();
  await p.screenshot({ path: `${out}-${label}-project.png` });
  const nf = await p.goto(new URL('no-such-page/', base).href, { waitUntil: 'load' });
  r.notFound = { status: nf.status(), styled: await p.evaluate(() => getComputedStyle(document.body).backgroundColor), h1: (await p.locator('h1').first().textContent())?.trim() };
  r.errors = errors; r.failed = failed.filter((f) => !f.includes('no-such-page'));
  res[label] = r;
  await ctx.close();
}
console.log(JSON.stringify(res, null, 1));
await b.close();
