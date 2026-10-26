// Cursor ripple: refractive "lenses" (fixed, pointer-events: none) carry a backdrop-filter that points at
// an SVG displacement filter; a ring-shaped normal map bends whatever lies beneath them — type, images,
// the hero — without touching the DOM. Chromium only; elsewhere they stay inert.
//   head    rides under the pointer; its strength follows pointer speed and fades when it rests
//   rings   drop along the path, widen and dissipate (faster movement → slightly stronger rings)
// Idle cost is zero: lenses are hidden. Touch: a soft ring where the finger lands. Reduced motion: off.
// (The visible cursor mark is the orange streak in trail.js.)
import { env } from './env.js';

const SIZE = 240;          // lens diameter, px
const RINGS = 6;           // pooled trailing rings
const MAX_DISP = 29;       // px at full strength (16 → +37% → +30%); the head stays well below this

// Normal map: concentric, softly decaying rings. R/G = displacement direction × amplitude (128 = none).
function rippleMap() {
  const n = 192, c = document.createElement('canvas');
  c.width = c.height = n;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(n, n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const dx = (x + 0.5) / n * 2 - 1, dy = (y + 0.5) / n * 2 - 1;
      const r = Math.hypot(dx, dy);
      const amp = r < 1 ? Math.sin(r * Math.PI * 2.6) * Math.pow(1 - r, 1.6) * Math.min(1, r * 6) : 0;
      const i = (y * n + x) * 4;
      img.data[i] = 128 + 127 * (r ? dx / r : 0) * amp;
      img.data[i + 1] = 128 + 127 * (r ? dy / r : 0) * amp;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}

export async function initRipple() {
  if (env.reduced) return;
  if (!(window.CSS && CSS.supports('backdrop-filter', 'url(#a)'))) return;
  const { gsap } = await import('gsap');

  const ns = 'http://www.w3.org/2000/svg';
  const map = rippleMap();
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  svg.innerHTML = Array.from({ length: RINGS + 1 }, (_, i) => `<filter id="rp${i}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feImage href="${map}" x="0" y="0" width="${SIZE}" height="${SIZE}" preserveAspectRatio="none" result="m"/>
    <feDisplacementMap in="SourceGraphic" in2="m" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('');
  document.body.appendChild(svg);

  const lens = (i) => {
    const el = document.createElement('div');
    el.className = 'rp';
    el.setAttribute('aria-hidden', 'true');
    el.style.backdropFilter = el.style.webkitBackdropFilter = `url(#rp${i})`;
    document.body.appendChild(el);
    return { el, disp: svg.querySelector(`#rp${i} feDisplacementMap`), k: 0 };
  };
  const setK = (l, k) => {
    l.k = k;
    l.disp.setAttribute('scale', k.toFixed(2));
    l.el.style.visibility = k > 0.05 ? 'visible' : 'hidden';
  };

  // ---- head: follows the pointer smoothly
  const head = lens(RINGS);
  const hx = gsap.quickTo(head.el, 'x', { duration: 0.35, ease: 'power3.out' });
  const hy = gsap.quickTo(head.el, 'y', { duration: 0.35, ease: 'power3.out' });
  gsap.set(head.el, { xPercent: -50, yPercent: -50, scale: 0.8 });
  setK(head, 0);
  let headTarget = 0;

  // ---- rings: pooled, reused oldest-first
  const rings = Array.from({ length: RINGS }, (_, i) => lens(i));
  rings.forEach((r) => { gsap.set(r.el, { xPercent: -50, yPercent: -50 }); setK(r, 0); });
  let next = 0;
  const drop = (x, y, strength) => {
    const r = rings[next++ % RINGS];
    gsap.killTweensOf(r.el); gsap.killTweensOf(r);
    gsap.set(r.el, { x, y, scale: 0.35, opacity: 1 });
    const s = { k: MAX_DISP * strength };
    setK(r, s.k);
    gsap.to(r.el, { scale: 1.25, duration: 1.3, ease: 'power2.out' });
    gsap.to(s, { k: 0, duration: 1.3, ease: 'power2.out', onUpdate: () => setK(r, s.k) });
  };

  // ---- pointer: one passive listener for the whole page
  let lx = 0, ly = 0, lt = 0, dropX = 0, dropY = 0, dropT = 0, inside = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const now = performance.now();
    const dt = Math.max(8, now - lt);
    const speed = lt ? Math.hypot(e.clientX - lx, e.clientY - ly) / dt : 0; // px per ms
    lx = e.clientX; ly = e.clientY; lt = now;
    if (!inside) { inside = true; gsap.set(head.el, { x: lx, y: ly }); }
    hx(lx); hy(ly);
    headTarget = Math.min(MAX_DISP * 0.45, headTarget + speed * 2.2);
    const moved = Math.hypot(lx - dropX, ly - dropY);
    if (moved > 90 || (moved > 24 && now - dropT > 140)) {
      dropX = lx; dropY = ly; dropT = now;
      drop(lx, ly, Math.max(0.22, Math.min(1, speed / 2.2)));
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { inside = false; headTarget = 0; });
  addEventListener('blur', () => { headTarget = 0; });
  addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') drop(e.clientX, e.clientY, 0.6); }, { passive: true });

  // head strength eases toward its target and decays when the pointer rests (shared ticker, no own loop)
  gsap.ticker.add(() => {
    headTarget *= 0.92;
    const k = head.k + (headTarget - head.k) * 0.18;
    if (Math.abs(k - head.k) > 0.01 || (k < 0.05 && head.k >= 0.05)) setK(head, k < 0.05 ? 0 : k);
  });
}
