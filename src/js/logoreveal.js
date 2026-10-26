// Header logo reveal (after Mellow's mark, rebuilt for the Tifferend wordmark): each glyph shows
// through a few rectangular windows. They start as scattered dots, stretch into vertical bars, then widen
// until the glyph is whole; the reverse dissolves it. Plays when the header logo appears (on load, or as
// the hero's own wordmark scrolls away on the homepage), on hover / focus, and now and then when idle.
// The link is usable throughout; without JS the windows already cover the glyphs.
import { env, $, $$ } from './env.js';

export async function initLogoReveal() {
  const logo = $('[data-hdr-logo]');
  if (!logo || env.reduced) return;
  const rects = $$('clipPath rect', logo);
  if (!rects.length) return;
  const { gsap } = await import('gsap');
  const R = gsap.utils.random;
  const D = 90; // dot size, wordmark units (the mark is 4260 wide)

  const full = (r) => ({ x: +r.dataset.x, y: -20, width: +r.dataset.w, height: 922 });
  const bar = (r) => { const w = +r.dataset.w, y0 = +r.dataset.y0, y1 = +r.dataset.y1, h = (y1 - y0) * R(0.45, 0.9); return { x: +r.dataset.x + w * R(0.3, 0.55), y: y0 + R(0, y1 - y0 - h), width: D, height: h }; };
  const dot = (r) => { const w = +r.dataset.w, y0 = +r.dataset.y0, y1 = +r.dataset.y1; return { x: +r.dataset.x + R(0, w - D), y: R(y0, y1 - D), width: D, height: D }; };
  const set = (r, v) => { r.setAttribute('x', v.x); r.setAttribute('y', v.y); r.setAttribute('width', v.width); r.setAttribute('height', v.height); };

  let tl = null;
  const reveal = (fromNothing = true) => {
    tl?.kill();
    tl = gsap.timeline();
    rects.forEach((r, i) => {
      const at = i * 0.018 + R(0, 0.08);
      if (fromNothing) set(r, { ...dot(r), width: 0, height: 0 });
      tl.to(r, { attr: dot(r), duration: 0.22, ease: 'power2.out' }, at)            // dots appear
        .to(r, { attr: bar(r), duration: 0.32, ease: 'power3.inOut' }, at + 0.26)  // stretch into bars
        .to(r, { attr: full(r), duration: 0.42, ease: 'expo.out' }, at + 0.62);    // open into the glyph
    });
    return tl;
  };
  const dissolveAndReform = () => {
    tl?.kill();
    tl = gsap.timeline({ onComplete: () => reveal(false) });
    rects.forEach((r, i) => {
      const at = i * 0.012;
      tl.to(r, { attr: bar(r), duration: 0.3, ease: 'power3.in' }, at)
        .to(r, { attr: dot(r), duration: 0.22, ease: 'power2.inOut' }, at + 0.3);
    });
  };

  // play when the logo becomes visible: on the homepage it hides while the hero wordmark is on screen
  const hidden = () => document.body.classList.contains('at-hero') && !!$('[data-hero]');
  if (hidden()) {
    rects.forEach((r) => set(r, { ...dot(r), width: 0, height: 0 }));
    let was = true;
    new MutationObserver(() => {
      const now = hidden();
      if (was && !now) reveal(true);
      else if (!was && now) rects.forEach((r) => { gsap.killTweensOf(r); set(r, { ...dot(r), width: 0, height: 0 }); });
      was = now;
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  } else {
    reveal(true);
  }
  logo.addEventListener('pointerenter', () => { if (!tl?.isActive()) dissolveAndReform(); });
  logo.addEventListener('focus', () => { if (!tl?.isActive()) dissolveAndReform(); });
  // an occasional, unhurried re-form while the page is idle and the logo is visible
  const idle = () => { gsap.delayedCall(R(14, 22), idle); if (!hidden() && !document.hidden && !tl?.isActive()) dissolveAndReform(); };
  gsap.delayedCall(R(14, 22), idle);
}
