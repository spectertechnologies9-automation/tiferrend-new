// QA suite. Serves dist/ under a sub-path (like a GitHub Pages project site) and checks layout + interactions.
//   npm run build && npm test                 (all engines)
//   node tests/qa.mjs chromium                (one engine)
// Build with SITE_BASE=/tifferend/ to also verify the 404 page under the sub-path.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const DIST = path.resolve('dist');
const BASE = '/tifferend/';
const PORT = 4180;
const ORIGIN = `http://localhost:${PORT}`;
const engines = process.argv[2] ? [process.argv[2]] : ['chromium', 'firefox', 'webkit'];
const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1440, 1920];
const PAGES = ['', 'work/', 'work/?service=film', 'work/my-mithila/', 'work/maison-luxe/', 'about/', 'contact/'];
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.vtt': 'text/vtt', '.woff2': 'font/woff2', '.woff': 'font/woff' };

// Static server with Range support (video) and a GitHub-Pages-style 404.
const server = http.createServer((req, res) => {
  const url = new URL(req.url, ORIGIN);
  if (!url.pathname.startsWith(BASE)) { res.writeHead(404); return res.end(); }
  let p = path.join(DIST, decodeURIComponent(url.pathname.slice(BASE.length)));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404, { 'Content-Type': 'text/html' }); return res.end(fs.readFileSync(path.join(DIST, '404.html'))); }
  const size = fs.statSync(p).size;
  const type = types[path.extname(p)] || 'application/octet-stream';
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range) {
    const start = +range[1] || 0, end = range[2] ? +range[2] : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    return fs.createReadStream(p, { start, end }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(PORT, r));

let pass = 0, fail = 0;
const results = [];
const ok = (name, cond, info = '') => { (cond ? pass++ : fail++); results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${info ? `  — ${info}` : ''}`); };

async function context(browser, width, { reduced = false, fresh = false, engine } = {}) {
  const mobile = width < 768;
  const ctx = await browser.newContext({
    viewport: { width, height: mobile ? 800 : 900 },
    hasTouch: mobile,
    isMobile: mobile && engine !== 'firefox',
    reducedMotion: reduced ? 'reduce' : 'no-preference',
  });
  if (!fresh) await ctx.addInitScript(() => { try { sessionStorage.setItem('tifferend-loaded', '1'); } catch {} });
  return ctx;
}

function watch(page) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errs.push(`console: ${m.text()}`));
  page.on('response', (r) => r.status() >= 400 && !r.url().includes('/nope') && errs.push(`${r.status()} ${r.url()}`));
  page.on('requestfailed', (r) => {
    const f = r.failure()?.errorText || '';
    if (!/ABORTED|cancel|NS_BINDING_ABORTED|Load request cancelled/i.test(f)) errs.push(`failed ${r.url()} ${f}`);
  });
  return errs;
}

// Re-measures each step: pinned sections size themselves after GSAP loads and lengthen the page.
async function walk(page, h) {
  for (let y = 0; y < (await page.evaluate(() => document.documentElement.scrollHeight)); y += h * 0.7) {
    await page.evaluate((y) => window.scrollTo(0, y), y);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(500);
}

const layoutCheck = () => {
  const W = document.documentElement.clientWidth;
  const skip = '.marq, .tst__list, .strip__track, .hz__track, .wk__filters, dialog, .loader, .hdr, .cursor, .skip, [aria-hidden="true"], .sr-only';
  // An element only counts if no ancestor clips it (overflow hidden/clip) within the viewport.
  // Clipped if any ancestor that clips overflow lies inside the viewport (e.g. a pinned stage).
  const clipped = (el) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const o = getComputedStyle(a);
      if (/(hidden|clip)/.test(o.overflowX + o.overflow)) {
        const r = a.getBoundingClientRect();
        if (r.left >= -1 && r.right <= W + 1) return true;
      }
    }
    return false;
  };
  const over = [...document.querySelectorAll('body *')].filter((el) => {
    if (el.closest(skip)) return false;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    return (r.right > W + 1 || r.left < -1) && !clipped(el);
  }).map((el) => `${el.tagName.toLowerCase()}.${el.className}`.slice(0, 60));
  const hiddenEls = [...document.querySelectorAll('[data-rv], [data-split].is-split')].filter((el) => el.getClientRects().length && !el.classList.contains('is-in'));
  const hidden = hiddenEls.length;
  const hiddenWhat = hiddenEls.slice(0, 3).map((el) => `${el.textContent.trim().slice(0, 24)}@${Math.round(el.getBoundingClientRect().top + scrollY)}/${document.documentElement.scrollHeight}`);
  const badImgs = [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map((i) => i.src).slice(0, 3);
  const scrollX = document.documentElement.scrollWidth > window.innerWidth + 1;
  const tinyTargets = [...document.querySelectorAll('main a, main button, header a, header button, footer a')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width && r.height && r.height < 32 && getComputedStyle(el).display !== 'inline';
  }).length;
  return { over: [...new Set(over)].slice(0, 5), hidden, hiddenWhat, badImgs, scrollX, tinyTargets };
};

for (const engine of engines) {
  // Real Chrome for the Chromium pass: Playwright's bundled Chromium has no H.264 decoder.
  const browser = await { chromium, firefox, webkit }[engine].launch(engine === 'chromium' ? { channel: 'chrome' } : {});
  const widths = engine === 'chromium' ? WIDTHS : [375, 1440];

  /* ---------- layout at every width ---------- */
  for (const w of widths) {
    const ctx = await context(browser, w, { engine });
    const page = await ctx.newPage();
    const errs = watch(page);
    for (const p of PAGES) {
      const res = await page.goto(`${ORIGIN}${BASE}${p}`, { waitUntil: 'load' });
      await walk(page, w < 768 ? 800 : 900);
      const r = await page.evaluate(layoutCheck);
      ok(`[${engine} ${w}] /${p} status 200, layout clean`, res.status() === 200 && !r.over.length && !r.scrollX && !r.badImgs.length && r.hidden === 0,
        JSON.stringify({ status: res.status(), ...r }));
    }
    ok(`[${engine} ${w}] no console / network errors`, errs.length === 0, errs.slice(0, 4).join(' | '));
    await ctx.close();
  }

  /* ---------- loader + hero (fresh session) ---------- */
  for (const w of [390, 1440]) {
    const ctx = await context(browser, w, { fresh: true, engine });
    const page = await ctx.newPage();
    const errs = watch(page);
    await page.goto(`${ORIGIN}${BASE}`);
    const shown = await page.evaluate(() => getComputedStyle(document.querySelector('[data-loader]')).display !== 'none');
    await page.waitForTimeout(3600);
    const gone = await page.evaluate(() => !document.querySelector('[data-loader]') && !document.documentElement.classList.contains('show-loader'));
    const mark = await page.evaluate(() => getComputedStyle(document.querySelector('[data-hero-mark]')).opacity);
    const vid = await page.evaluate(() => { const v = document.querySelector('[data-hero-video]'); return { src: v.currentSrc.split('/').pop(), paused: v.paused, t: v.currentTime }; });
    ok(`[${engine} ${w}] loader shows on first visit, hands off within 3.6s`, shown && gone && parseFloat(mark) > 0.95, JSON.stringify({ shown, gone, mark }));
    ok(`[${engine} ${w}] hero film plays (right source)`, !vid.paused && vid.t > 0 && (w < 768 ? /cosmos-tall/.test(vid.src) : /cosmos-720/.test(vid.src)), JSON.stringify(vid));
    await page.reload();
    const skipped = await page.evaluate(() => !document.documentElement.classList.contains('show-loader'));
    ok(`[${engine} ${w}] loader skipped on repeat visit`, skipped);
    ok(`[${engine} ${w}] loader run has no errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  /* ---------- mobile interactions ---------- */
  {
    const ctx = await context(browser, 390, { engine });
    const page = await ctx.newPage();
    await page.goto(`${ORIGIN}${BASE}`);
    // Menu sheet
    await page.click('.hdr__menu');
    await page.waitForTimeout(400);
    const menuOpen = await page.evaluate(() => document.getElementById('menu').open);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const menuClosed = await page.evaluate(() => !document.getElementById('menu').open);
    ok(`[${engine} 390] menu opens and closes with Esc`, menuOpen && menuClosed);
    await page.click('.hdr__menu');
    await page.waitForTimeout(300);
    await page.click('#menu .menu__nav a[href*="work"]');
    await page.waitForURL(/\/work\/$/);
    ok(`[${engine} 390] menu link navigates`, page.url().endsWith('/work/'));
    // Services tap-to-preview
    await page.goto(`${ORIGIN}${BASE}`);
    const link = page.locator('.svc__item').nth(2).locator('.svc__link');
    await link.scrollIntoViewIfNeeded();
    await link.tap();
    await page.waitForTimeout(400);
    const stayed = !page.url().includes('service=');
    const active = await page.evaluate(() => document.querySelectorAll('.svc__item')[2].classList.contains('is-active') && document.querySelectorAll('.svc__img')[2].classList.contains('is-active'));
    ok(`[${engine} 390] first tap previews a service (no navigation)`, stayed && active, JSON.stringify({ stayed, active, url: page.url() }));
    await page.locator('.svc__item').nth(2).locator('.svc__go').click();
    await page.waitForURL(/service=film/);
    await page.waitForSelector('[data-filter="film"][aria-pressed="true"]', { timeout: 5000 }).catch(() => {});
    const pressed = await page.getAttribute('[data-filter="film"]', 'aria-pressed');
    ok(`[${engine} 390] service opens filtered Work`, pressed === 'true');
    await ctx.close();
  }

  /* ---------- desktop interactions ---------- */
  {
    const ctx = await context(browser, 1440, { engine });
    const page = await ctx.newPage();
    const errs = watch(page);
    await page.goto(`${ORIGIN}${BASE}`);
    // Info panel
    await page.click('.hdr__btn[data-open="info"]');
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => { const d = document.getElementById('info'); return d.open && d.textContent.includes('hello@tifferend.com'); });
    await page.click('#info [data-close]');
    await page.waitForTimeout(500);
    ok(`[${engine} 1440] Info panel opens with studio info and closes`, info && !(await page.evaluate(() => document.getElementById('info').open)));
    // Services hover + click
    const svc = page.locator('.svc__item').nth(3).locator('.svc__link');
    await svc.scrollIntoViewIfNeeded();
    await svc.hover();
    await page.waitForTimeout(300);
    const bg = await page.evaluate(() => document.querySelectorAll('.svc__img')[3].classList.contains('is-active'));
    ok(`[${engine} 1440] hovering a service changes the background`, bg);
    await svc.click();
    await page.waitForURL(/service=digital/);
    await page.waitForSelector('[data-filter="digital"][aria-pressed="true"]');
    const shown = await page.evaluate(() => [...document.querySelectorAll('.wk__item')].filter((i) => !i.hidden).map((i) => i.dataset.services.includes('digital')));
    ok(`[${engine} 1440] service click opens Work filtered to that domain`, shown.length > 0 && shown.every(Boolean), `visible=${shown.length}`);
    // Filter buttons
    await page.click('[data-filter="events"]');
    await page.waitForTimeout(700);
    const ev = await page.evaluate(() => ({ url: location.search, n: [...document.querySelectorAll('.wk__item')].filter((i) => !i.hidden).length, empty: document.querySelector('[data-work-empty]').hidden }));
    ok(`[${engine} 1440] Work filter updates URL and results`, ev.url === '?service=events' && ev.n === 1 && ev.empty, JSON.stringify(ev));
    await page.click('[data-filter="all"]');
    await page.waitForTimeout(700);
    ok(`[${engine} 1440] "All" restores every project`, (await page.evaluate(() => [...document.querySelectorAll('.wk__item')].filter((i) => !i.hidden).length)) === (await page.locator('.wk__item').count()));
    // Tile → project page → next project
    await page.goto(`${ORIGIN}${BASE}`);
    await page.locator('.tile').first().click();
    await page.waitForURL(/work\/my-mithila\/$/);
    ok(`[${engine} 1440] selected-work tile opens its project page`, (await page.title()).includes('My Mithila'));
    await page.locator('.pj__next').click();
    await page.waitForURL(/work\/maison-luxe\/$/);
    ok(`[${engine} 1440] next-project link works`, true);
    // Testimonials: one at a time
    await page.goto(`${ORIGIN}${BASE}`);
    const plays = page.locator('[data-tst-play]');
    if (await plays.count() >= 2) {
      await plays.nth(0).scrollIntoViewIfNeeded();
      await plays.nth(0).click();
      await page.waitForTimeout(1200);
      await plays.nth(1).click();
      await page.waitForTimeout(1200);
      const st = await page.evaluate(() => [...document.querySelectorAll('.tst__video')].map((v) => ({ paused: v.paused, tracks: v.textTracks.length })));
      ok(`[${engine} 1440] testimonial plays on click, previous pauses, captions attached`, st[0].paused && !st[1].paused && st.every((s) => s.tracks > 0), JSON.stringify(st));
    }
    // Contact form
    await page.goto(`${ORIGIN}${BASE}contact/`);
    await page.click('[data-submit]');
    const val = await page.evaluate(() => ({ summary: !document.querySelector('[data-form-errors]').hidden, invalid: document.querySelectorAll('[aria-invalid="true"]').length, focus: document.activeElement.matches('[data-form-errors]') }));
    ok(`[${engine} 1440] empty submit shows error summary and flags fields`, val.summary && val.invalid === 3 && val.focus, JSON.stringify(val));
    await page.fill('#f-name', 'Test Person');
    await page.fill('#f-email', 'test@example.com');
    await page.fill('#f-msg', 'We need a new identity for a tea brand.');
    // Capture the mailto hand-off instead of letting the test browser try to open a mail client.
    await page.evaluate(() => { window.__mailto = ''; window.__openMail = (u) => { window.__mailto = u; }; });
    await page.click('[data-submit]');
    await page.waitForTimeout(400);
    const mailto = await page.evaluate(() => window.__mailto);
    ok(`[${engine} 1440] mailto hand-off carries the message`, mailto.startsWith('mailto:hello@tifferend.com') && decodeURIComponent(mailto).includes('tea brand'), mailto.slice(0, 60));
    const msg = await page.evaluate(() => document.querySelector('[data-form-status]').textContent);
    ok(`[${engine} 1440] valid submit (no endpoint) hands off to email app and says so honestly`, /isn’t sent until you press send/.test(msg), msg.slice(0, 90));
    // Keyboard: skip link first
    await page.goto(`${ORIGIN}${BASE}about/`);
    // WebKit, like Safari, skips links on Tab unless the user enables it, so check document order there.
    if (engine === 'webkit') {
      ok(`[${engine} 1440] skip link is the first focusable element`, await page.evaluate(() => document.querySelector('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').classList.contains('skip')));
    } else {
      await page.keyboard.press('Tab');
      ok(`[${engine} 1440] skip link is first tab stop`, await page.evaluate(() => document.activeElement.classList.contains('skip')));
    }
    // AI links carry only the site URL + prompt
    const ai = await page.getAttribute('[data-ai="claude"]', 'href');
    ok(`[${engine} 1440] AI summary link points at claude.ai with the public URL only`, ai.startsWith('https://claude.ai/new?q=') && decodeURIComponent(ai).includes(`${ORIGIN}${BASE}`), decodeURIComponent(ai).slice(0, 80));
    ok(`[${engine} 1440] interactions ran without errors`, errs.length === 0, errs.join(' | '));
    await ctx.close();
  }

  /* ---------- reduced motion ---------- */
  {
    const ctx = await context(browser, 390, { reduced: true, fresh: true, engine });
    const page = await ctx.newPage();
    await page.goto(`${ORIGIN}${BASE}`);
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => ({
      loader: getComputedStyle(document.querySelector('[data-loader]')).display,
      split: document.querySelectorAll('.is-split').length,
      video: document.querySelector('[data-hero-video]').getAttribute('src'),
      marquee: getComputedStyle(document.querySelector('.marq__track')).animationName,
    }));
    ok(`[${engine} 390] reduced motion: no loader, no split/hidden text, poster instead of film, static logos`, r.loader === 'none' && r.split === 0 && !r.video && r.marquee === 'none', JSON.stringify(r));
    await ctx.close();
  }

  /* ---------- deep links and 404 ---------- */
  {
    const ctx = await context(browser, 1024, { engine });
    const page = await ctx.newPage();
    const res = await page.goto(`${ORIGIN}${BASE}work/the-grand/`);
    ok(`[${engine}] deep link to a project loads directly`, res.status() === 200 && (await page.title()).includes('The Grand'));
    const nf = await page.goto(`${ORIGIN}${BASE}work/nope/deeper/`);
    await page.waitForTimeout(300);
    // styled = the stylesheet loaded under the sub-path: the design tokens resolve and the body uses our font stack
    const styled = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() !== '' && /Suisse|Inter/.test(getComputedStyle(document.body).fontFamily) && !!document.querySelector('.nf'));
    ok(`[${engine}] 404 page renders styled under the sub-path`, nf.status() === 404 && styled, `styled=${styled}`);
    await ctx.close();
  }
  await browser.close();
}

server.close();
console.log(results.join('\n'));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
