// Footer wordmark: the closing signature. Same motion language as the hero, a little more playful:
// the letters drop in once, then hop and tilt on their own small rhythms, with an occasional wave or a
// gentle breath apart and back. The pointer (or a finger) nudges letters on springs that pass part
// of the push to neighbours; everything settles back into the logo.
// Channels: choreography tweens xPercent / yPercent / rotation / scale; pointer springs use x / y /
// skewX — separate transform components, so they never overwrite each other.
import { $, $$ } from './env.js';
import { liquid } from './fluid.js';

export async function initFooterDance() {
  const mark = $('[data-ftr-mark]');
  const svg = $('.ftr__wm', mark);
  if (!mark || !svg) return;
  const { gsap } = await import('gsap');
  const glyphs = $$('.fg', svg);   // bounce layer
  const wraps = $$('.fgw', svg);   // wave / scatter / pointer layer
  const R = gsap.utils.random;
  gsap.set([...glyphs, ...wraps], { transformOrigin: '50% 100%' });

  // ---- idle hop: every letter on its own rhythm, small and springy
  const bounce = glyphs.map((g, i) => gsap.timeline({ repeat: -1, repeatRefresh: true, repeatDelay: R(1.2, 3.6), delay: 1.6 + i * 0.21 })
    .to(g, { scaleY: 0.94, scaleX: 1.03, duration: 0.18, ease: 'power2.in' })                                        // anticipation
    .to(g, { scaleY: 1.04, scaleX: 0.98, yPercent: () => -R(5, 11), rotation: () => R(-6, 6), duration: 0.38, ease: 'power2.out' }) // hop + tilt
    .to(g, { scaleY: 1, scaleX: 1, yPercent: 0, rotation: 0, duration: 0.75, ease: 'bounce.out' })                  // land
    .to(g, { scaleY: 0.97, duration: 0.09, yoyo: true, repeat: 1, ease: 'sine.inOut' }));                           // settle

  // ---- phases: lively ↔ calm
  const all = gsap.timeline();
  bounce.forEach((b) => all.add(b, 0));
  const cycle = () => {
    gsap.timeline({ onComplete: cycle })
      .to(all, { timeScale: R(0.95, 1.2), duration: 0.8, ease: 'power2.out' })
      .to({}, { duration: R(4, 6) })                                                // lively
      .add(() => (Math.random() < 0.5 ? breathe() : wave()))
      .to(all, { timeScale: 0.3, duration: 1, ease: 'power2.inOut' }, '+=0.8')     // calm
      .to({}, { duration: R(2, 3.2) });
  };

  // ---- a wave across the word
  const wave = () => {
    const from = Math.random() < 0.5 ? 'start' : 'end';
    gsap.timeline()
      .to(wraps, { yPercent: -16, rotation: (i) => (i % 2 ? 5 : -5), scaleY: 1.05, duration: 0.4, ease: 'power3.out', stagger: { each: 0.08, from }, overwrite: 'auto' })
      .to(wraps, { yPercent: 0, rotation: 0, scaleY: 1, duration: 1.2, ease: 'elastic.out(1, 0.45)', stagger: { each: 0.08, from } }, 0.36);
  };

  // ---- the word breathes apart from a point, then closes back into the logo
  const breathe = () => {
    const split = Math.floor(R(2, 5));
    gsap.timeline()
      .to(wraps, {
        xPercent: (i) => (i < split ? -1 : 1) * (2 + Math.abs(i - split + 0.5) * 1.6),
        yPercent: () => -R(2, 8), rotation: () => R(-6, 6), duration: 0.7, ease: 'power3.out', stagger: 0.03, overwrite: 'auto',
      })
      .to(wraps, { xPercent: 0, yPercent: 0, rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.5)', stagger: { each: 0.05, from: 'center' } }, '+=0.25');
  };

  // ---- flips: SVG can't turn in 3D, so a flip is scaleX 1 → −1 → 1 (a card turning edge-on). A pair on
  // first view (after the drop-in, then 2.3 s later), then occasional flips of a run of letters.
  const flipRun = (targets, from = 'start') => gsap.to(targets, { keyframes: { scaleX: [1, -1, 1], ease: 'sine.inOut' }, duration: 1, ease: 'power2.inOut', stagger: { each: 0.06, from } });
  const flipSome = () => {
    gsap.delayedCall(R(8.5, 12.5), flipSome);
    if (!onScreen) return;
    const a = Math.floor(R(0, 5)), n = Math.floor(R(1, 4));
    flipRun(wraps.slice(a, a + n), Math.random() < 0.5 ? 'start' : 'end'); // wraps own scaleX; the bounce layer keeps its own
  };
  let onScreen = false;

  // ---- signature: the first time the footer shows, the letters drop into place one by one
  const signature = () => (liquid(svg, { scale: 110, duration: 2.4, delay: 0.2 }), gsap.from(wraps, { yPercent: -70, rotation: () => R(-14, 14), opacity: 0, duration: 1.1, ease: 'bounce.out', stagger: 0.09, delay: 0.25 }));

  // ---- pointer burst: springs with cascade (x/y in SVG user units, skewX)
  const s = glyphs.map(() => ({ x: 0, y: 0, k: 0, vx: 0, vy: 0, vk: 0 }));
  const set = wraps.map((g) => ({ x: gsap.quickSetter(g, 'x'), y: gsap.quickSetter(g, 'y'), k: gsap.quickSetter(g, 'skewX', 'deg') }));
  const P = { x: 0, y: 0, t: 0 };
  const onMove = (e) => {
    const now = performance.now(), dt = Math.max(8, now - P.t);
    const vx = P.t ? ((e.clientX - P.x) / dt) * 16 : 0, vy = P.t ? ((e.clientY - P.y) / dt) * 16 : 0;
    P.x = e.clientX; P.y = e.clientY; P.t = now;
    const r = svg.getBoundingClientRect();
    const unit = 4260 / r.width;                                   // px → SVG user units
    const speed = Math.min(3, Math.hypot(vx, vy) / 12);
    glyphs.forEach((g, i) => {
      const b = g.getBoundingClientRect();
      const dx = b.left + b.width / 2 - e.clientX, dy = b.top + b.height / 2 - e.clientY;
      const near = Math.exp(-(dx * dx + dy * dy) / (2 * (b.height * 0.8) ** 2));
      if (near < 0.02) return;
      const f = near * (1 + speed * 0.9);
      const len = Math.hypot(dx, dy) || 1;
      const kick = { x: ((dx / len) * f * b.width * 0.12 + vx * near * 0.25) * unit, y: ((dy / len) * f * b.height * 0.08 + vy * near * 0.15) * unit, k: (dx >= 0 ? 1 : -1) * f * 5 };
      [i - 1, i, i + 1].forEach((j, n) => {                         // cascade to neighbours
        if (!s[j]) return;
        const w = n === 1 ? 1 : 0.35;
        s[j].vx += kick.x * w * 0.5; s[j].vy += kick.y * w * 0.5; s[j].vk += kick.k * w * 0.5;
      });
      if (speed > 1.6 && near > 0.4 && !gsap.isTweening(wraps[i])) gsap.to(wraps[i], { yPercent: -R(4, 8), rotation: R(-5, 5), duration: 0.3, ease: 'power2.out', yoyo: true, repeat: 1 }); // a quick swipe gets a hop
    });
  };
  mark.addEventListener('pointermove', onMove, { passive: true });
  mark.addEventListener('pointerdown', (e) => { P.t = 0; onMove(e); if (e.pointerType !== 'mouse') wave(); }, { passive: true });

  const step = (_, deltaMs) => {
    const dt = Math.min(0.033, (deltaMs || 16) / 1000);
    s.forEach((p, i) => {
      p.vx += (-120 * p.x - 13 * p.vx) * dt; p.vy += (-120 * p.y - 13 * p.vy) * dt; p.vk += (-120 * p.k - 13 * p.vk) * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.k += p.vk * dt;
      p.x = Math.max(-150, Math.min(150, p.x)); p.y = Math.max(-100, Math.min(70, p.y)); p.k = Math.max(-8, Math.min(8, p.k)); // stays readable
      set[i].x(p.x); set[i].y(p.y); set[i].k(p.k);
    });
  };

  // ---- only run while the footer is on screen
  let started = false;
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (e.isIntersecting) {
      if (!started) {
        started = true; signature(); gsap.delayedCall(2.4, cycle);
        gsap.delayedCall(1.7, () => flipRun(wraps, 'start'));
        gsap.delayedCall(4, () => flipRun(wraps, 'end'));
        gsap.delayedCall(4 + R(7, 9), flipSome);
      }
      all.resume(); gsap.ticker.add(step);
    } else { all.pause(); gsap.ticker.remove(step); }
  }, { rootMargin: '80px 0px' }).observe(mark);
}
