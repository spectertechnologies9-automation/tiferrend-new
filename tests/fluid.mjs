// Fluid layer checks: services swap, scroll bend, hover ripple, liquid headings, project/about reveals,
// footer signature. Captures mid-effect frames to <out>-*.jpg.   node tests/fluid.mjs <outPrefix>
import { chromium } from 'playwright';

const [out = 'fl'] = process.argv.slice(2);
const O = 'http://localhost:4173/';
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' || /fluid shader/.test(m.text())) errors.push(m.text()); });
const res = {};
const on = (sel) => page.evaluate((s) => [...document.querySelectorAll(s)].filter((c) => c.classList.contains('is-on')).length, sel);
const shot = (n) => page.screenshot({ path: `${out}-${n}.jpg`, type: 'jpeg', quality: 80 });
const to = (sel, off = 0) => page.locator(sel).first().evaluate((e, off) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY + off), off);

await page.goto(O, { waitUntil: 'load' });
await page.waitForTimeout(2500);
res.canvases = await page.evaluate(() => document.querySelectorAll('.fl-cv').length);

// liquid heading: filter set while the heading arrives
await to('#intro', -500); await page.waitForTimeout(200);
await to('#intro', -120); await page.waitForTimeout(250);
res.headingFilter = await page.evaluate(() => document.querySelector('.intro__title').style.filter);
await shot('heading');

// scroll bend on the work tiles
await to('.tile', -300); await page.waitForTimeout(1200);
await page.mouse.move(700, 450);
for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 260); await page.waitForTimeout(30); }
res.bendOn = await on('.tile .fl-cv');
await shot('bend');
await page.waitForTimeout(1500);
res.bendOff = await on('.tile .fl-cv');

// hover ripple on a tile
const tb = await page.locator('.tile').nth(1).boundingBox();
await page.mouse.move(tb.x + tb.width * 0.3, tb.y + tb.height * 0.4);
for (let i = 0; i < 8; i++) { await page.mouse.move(tb.x + tb.width * (0.3 + i * 0.05), tb.y + tb.height * 0.45); await page.waitForTimeout(40); }
res.rippleOn = await on('.tile .fl-cv');
await shot('ripple');

// services: liquid swap between previews
await to('.svc', 0); await page.waitForTimeout(1300);
await page.hover('.svc__link >> nth=3');
await page.waitForTimeout(380);
res.swapOn = await on('.svc__bg .fl-cv');
await shot('swap');
await page.waitForTimeout(1300);
res.swapOff = await on('.svc__bg .fl-cv');

// testimonial poster reveal
await to('[data-tst]', -900); await page.waitForTimeout(300);
await to('[data-tst]', -350); await page.waitForTimeout(450);
res.tstRevealOn = await on('.tst__media .fl-cv');
await shot('tst');

// footer signature: wordmark liquefies as it drops in
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(900);
res.footerFilter = await page.evaluate(() => document.querySelector('.ftr__wm').style.filter);
await shot('footer');

// project page: image reveals on scroll
await page.goto(`${O}work/my-mithila/`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
const frames = await page.locator('.ps__frame').count();
await page.locator('.ps__frame').nth(1).evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.7));
await page.waitForTimeout(600);
res.projectFrames = frames;
res.projectRevealOn = await on('.ps__frame .fl-cv');
await shot('project');
await page.waitForTimeout(2200);
res.projectHiddenAfter = await page.evaluate(() => document.querySelectorAll('.ps__frame img.fl-hide').length);
// next-project panel ripple
await page.locator('.pj__next').scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
const nb = await page.locator('.pj__next').boundingBox();
for (let i = 0; i < 8; i++) { await page.mouse.move(nb.x + nb.width * (0.3 + i * 0.05), nb.y + nb.height * 0.5); await page.waitForTimeout(40); }
res.nextRippleOn = await on('.pj__next .fl-cv');
await shot('next');

// about page strip
await page.goto(`${O}about/`, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.locator('.strip__item').first().evaluate((e) => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - innerHeight * 0.75));
await page.waitForTimeout(550);
res.aboutRevealOn = await on('.strip__item .fl-cv');
await shot('about');

console.log(JSON.stringify({ ...res, errors }, null, 1));
await browser.close();
