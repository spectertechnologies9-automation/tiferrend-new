// Work page (after Imagined, imagined.studio/tech): two views of the same portfolio.
//   Canvas (default) — a full-screen white canvas: every project's cover plus confirmed pieces, scattered at
//     varied sizes on a tile that wraps endlessly in both directions. Drag (with inertia), scroll or use the
//     arrow keys to explore; it drifts slowly when left alone; focusing a piece brings it to the centre.
//   Index — a simplified list, one row per project (also the no-JS view, and what crawlers read).
// Service filters drive both views and sync to ?service=; the chosen view syncs to ?view= and is remembered.
// Positions use a seeded random, so the composition is the same on every visit. Transforms only, on the
// shared gsap ticker; reduced motion keeps the canvas but drops inertia, easing, drift and the intro.
import { env, $, $$ } from './env.js';

const VIEW_KEY = 'tifferend-work-view';
const store = {
  get() { try { return localStorage.getItem(VIEW_KEY); } catch { return null; } },
  set(v) { try { localStorage.setItem(VIEW_KEY, v); } catch { /* private mode: the URL still carries it */ } },
};

export async function init({ lenis } = {}) {
  const root = $('[data-work]');
  if (!root) return;
  const items = $$('.wk__item', root);
  const chips = $$('[data-filter]', root);
  const status = $('[data-work-status]', root);
  const empty = $('[data-work-empty]', root);
  const index = $('[data-wk-index]', root);
  const wc = $('[data-wc]', root);
  const views = $('[data-wk-views]', root);
  const valid = new Set(chips.map((c) => c.dataset.filter));
  const canvas = await buildCanvas(root).catch(() => null);

  // ---- filters (both views)
  let current = 'all';
  const apply = (slug, { push = true } = {}) => {
    if (!valid.has(slug)) slug = 'all';
    current = slug;
    chips.forEach((c) => {
      const on = c.dataset.filter === slug;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    const match = (el) => slug === 'all' || el.dataset.services.split(' ').includes(slug);
    let n = 0;
    items.forEach((it) => { it.hidden = !match(it); if (!it.hidden) n++; });
    empty.hidden = n > 0;
    canvas?.filter(match);
    const name = chips.find((c) => c.dataset.filter === slug)?.firstChild.textContent.trim();
    status.textContent = `${n} project${n === 1 ? '' : 's'}${slug === 'all' ? '' : ` in ${name}`}`;
    if (push) {
      const url = new URL(location.href);
      if (slug === 'all') url.searchParams.delete('service'); else url.searchParams.set('service', slug);
      history.replaceState(null, '', url);
    }
  };
  chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filter)));
  const params = new URLSearchParams(location.search);
  apply(params.get('service') || 'all', { push: false });

  // ---- views
  if (!canvas) return; // the Index stays, as without JS
  const buttons = $$('[data-view]', views);
  views.hidden = false;
  const setView = (v, { save = true } = {}) => {
    const onCanvas = v === 'canvas';
    root.classList.toggle('is-canvas', onCanvas);
    document.documentElement.classList.toggle('wk-canvas', onCanvas);
    wc.hidden = !onCanvas;
    index.hidden = onCanvas;
    buttons.forEach((b) => { const on = b.dataset.view === v; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on)); });
    if (onCanvas) { lenis?.stop(); canvas.start(); } else { canvas.stop(); lenis?.start(); scrollTo(0, 0); }
    if (save) {
      store.set(v);
      const url = new URL(location.href);
      if (v === 'index') url.searchParams.set('view', 'index'); else url.searchParams.delete('view');
      history.replaceState(null, '', url);
    }
  };
  buttons.forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
  setView(params.get('view') === 'index' ? 'index' : params.get('view') === 'canvas' ? 'canvas' : store.get() === 'index' ? 'index' : 'canvas', { save: false });
  if (current !== 'all') chips.find((c) => c.dataset.filter === current)?.scrollIntoView({ block: 'nearest', inline: 'center' });
}

/* ---------------------------------------------------------------- the canvas */
async function buildCanvas(root) {
  const wc = $('[data-wc]', root), world = $('[data-wc-world]', root), tpl = $('[data-wc-items]', root);
  if (!wc || !world || !tpl) return null;
  world.append(tpl.content.cloneNode(true));
  const els = $$('.wc__item', world);
  if (!els.length) return null;
  const { gsap } = await import('gsap');
  els.forEach((el) => { el.draggable = false; $$('img', el).forEach((im) => { im.draggable = false; }); });

  // seeded random (mulberry32): the same composition on every visit
  let seed = 20261117;
  const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ASPECTS = [4 / 5, 1, 3 / 4, 5 / 4, 1, 4 / 5, 16 / 11];
  const order = els.map((_, i) => i).sort(() => rnd() - 0.5); // cell order shuffled so a project's pieces spread out
  const it = els.map((el, i) => ({ el, a: ASPECTS[i % ASPECTS.length], cell: order[i], rx: rnd(), ry: rnd(), rs: rnd(), x: 0, y: 0, w: 0, h: 0 }));
  const CAP = 58; // caption block under each picture, px
  const T = { w: 0, h: 0 };
  let vw = 0, vh = 0;
  // Scatter placement (seeded, so it is the same on every visit): pieces are sized, the tile is sized to
  // hold them, then each piece is dropped at a random spot that overlaps no other piece (wrap included)
  // and not the centred statement. The first few go inside the opening view, so it is never empty.
  const hdrH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr-h')) || 72;
  const layout = () => {
    vw = wc.clientWidth || innerWidth; vh = wc.clientHeight || innerHeight;
    const phone = vw < 700;
    let s = 917; // a fresh seed per layout: deterministic
    const r = () => { s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const vis = it.filter((o) => !o.out).sort((p, q) => p.cell - q.cell);
    const base = phone ? Math.min(178, vw * 0.44) : Math.max(200, Math.min(330, vw * 0.2));
    vis.forEach((o) => { o.w = base * (0.72 + o.rs * 0.36); o.h = o.w / o.a + CAP; });
    const wMax = Math.max(...vis.map((o) => o.w), 1), hMax = Math.max(...vis.map((o) => o.h), 1);
    const PAD = phone ? 22 : 40;
    const need = vis.reduce((sum, o) => sum + (o.w + PAD) * (o.h + PAD), 0) * 2.1; // room to breathe
    // a piece must be fully off screen before it wraps, so the tile overhangs the screen by 2 × the largest piece
    T.w = Math.max(vw + 2 * wMax + 40, Math.sqrt(need * (vw / vh)));
    T.h = Math.max(vh + 2 * hMax + 40, need / T.w);
    const ox = (T.w - vw) / 2, oy = (T.h - vh) / 2; // where the screen sits on the tile at rest
    const top = hdrH() + (phone ? 64 : 76), bottom = phone ? 84 : 92;
    const view = { x: ox + 16, y: oy + top, w: vw - 32, h: vh - top - bottom };
    const title = { x: T.w / 2 - Math.min(380, vw * 0.42), y: T.h / 2 - (phone ? 60 : 80), w: Math.min(760, vw * 0.84), h: phone ? 120 : 160 };
    const hit = (a, b) => a.x < b.x + b.w + PAD && b.x < a.x + a.w + PAD && a.y < b.y + b.h + PAD && b.y < a.y + a.h + PAD;
    const hitWrap = (a, b) => [-T.w, 0, T.w].some((dx) => [-T.h, 0, T.h].some((dy) => hit(a, { x: b.x + dx, y: b.y + dy, w: b.w, h: b.h })));
    const placed = [];
    const inView = phone ? 3 : 6;
    vis.forEach((o, k) => {
      let box = null;
      for (let t = 0; t < 400 && !box; t++) {
        const area = k < inView && t < 300 ? view : { x: 0, y: 0, w: T.w, h: T.h };
        const b = { x: area.x + r() * Math.max(0, area.w - o.w), y: area.y + r() * Math.max(0, area.h - o.h), w: o.w, h: o.h };
        if (hit(b, title) || placed.some((p) => hitWrap(b, p))) continue;
        box = b;
      }
      box ||= { x: r() * (T.w - o.w), y: r() * (T.h - o.h), w: o.w, h: o.h }; // crowded: accept an overlap rather than fail
      placed.push(box);
      o.x = box.x; o.y = box.y;
      o.el.style.width = `${o.w.toFixed(0)}px`;
      o.el.style.setProperty('--a', o.a.toFixed(4));
    });
  };

  const cam = { x: 0, y: 0 }, goal = { x: 0, y: 0 }, vel = { x: 0, y: 0 };
  const mod = (a, n) => ((a % n) + n) % n;
  const pos = (o) => ({ x: mod(o.x - cam.x, T.w) - (T.w - vw) / 2, y: mod(o.y - cam.y, T.h) - (T.h - vh) / 2 });
  const render = () => { for (const o of it) { if (o.out) continue; const p = pos(o); o.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`; } };

  // ---- input
  const calm = env.reduced;
  let drag = null, moved = 0, lastInput = performance.now();
  const touch = () => { lastInput = performance.now(); };
  wc.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY }; moved = 0; vel.x = vel.y = 0; touch();
    wc.classList.add('is-drag');
  });
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    goal.x -= dx; goal.y -= dy;
    vel.x = vel.x * 0.5 - dx * 0.5; vel.y = vel.y * 0.5 - dy * 0.5; // recent velocity, smoothed
    touch();
  }, { passive: true });
  const release = () => { if (!drag) return; drag = null; wc.classList.remove('is-drag'); if (calm) vel.x = vel.y = 0; };
  addEventListener('pointerup', release);
  addEventListener('pointercancel', release);
  wc.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true); // a drag is not a click
  wc.addEventListener('wheel', (e) => {
    e.preventDefault();
    const k = e.deltaMode === 1 ? 32 : 1;
    goal.x += (e.shiftKey ? e.deltaY : e.deltaX) * k;
    goal.y += (e.shiftKey ? 0 : e.deltaY) * k;
    touch();
  }, { passive: false });
  wc.tabIndex = -1;
  addEventListener('keydown', (e) => {
    if (wc.hidden || e.target.closest?.('input, textarea, select, dialog')) return;
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!step) return;
    e.preventDefault();
    goal.x += step[0] * 160; goal.y += step[1] * 160; touch();
  });
  // keyboard focus on a piece brings it to the centre of the screen
  wc.addEventListener('focusin', (e) => {
    const o = it.find((x) => x.el === e.target.closest('.wc__item'));
    if (!o) return;
    const p = pos(o);
    goal.x += p.x + o.w / 2 - vw / 2; goal.y += p.y + o.h / 2 - vh / 2; vel.x = vel.y = 0; touch();
  });
  wc.addEventListener('scroll', () => { wc.scrollLeft = 0; wc.scrollTop = 0; }); // focus must not scroll the stage itself
  addEventListener('resize', () => { if (!wc.hidden) { layout(); render(); } });

  // ---- motion: the camera eases toward its goal; release carries on with decaying momentum; when left
  // alone the canvas drifts slowly, like the reference
  const tick = () => {
    if (!drag && !calm) {
      goal.x += vel.x; goal.y += vel.y;
      vel.x *= 0.92; vel.y *= 0.92;
      if (Math.abs(vel.x) < 0.02) vel.x = 0;
      if (Math.abs(vel.y) < 0.02) vel.y = 0;
      if (performance.now() - lastInput > 2600) { goal.x += 0.22; goal.y += 0.1; }
    }
    const k = calm ? 1 : 0.14;
    cam.x += (goal.x - cam.x) * k; cam.y += (goal.y - cam.y) * k;
    render();
  };

  let running = false, introduced = false;
  return {
    start() {
      if (running) return;
      running = true;
      layout(); render();
      gsap.ticker.add(tick);
      if (!introduced && !calm) {
        introduced = true;
        gsap.fromTo(world, { scale: 1.1, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5, ease: 'expo.out' });
        gsap.from(els.map((el) => el.firstElementChild), { yPercent: 14, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: 0.035, delay: 0.1 });
      }
    },
    stop() { if (!running) return; running = false; gsap.ticker.remove(tick); },
    // filtering recomposes the canvas from the matching pieces, back at the start, with the short settle
    filter(match) {
      let changed = false;
      it.forEach((o) => { const out = !match(o.el); if (out !== !!o.out) changed = true; o.out = out; o.el.classList.toggle('is-out', out); });
      if (!changed) return;
      cam.x = cam.y = goal.x = goal.y = vel.x = vel.y = 0;
      layout(); render();
      if (running && !calm) gsap.fromTo(it.filter((o) => !o.out).map((o) => o.el.firstElementChild), { yPercent: 10, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.04, overwrite: true });
    },
  };
}
