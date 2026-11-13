// Header logo: TIFFEREND ⇄ DIFFERENT (client-approved, Nov 2026). The logo's own t and d detach and trade
// places on shallow arcs — one passes over the word, the other under it — leaning into the move and landing
// with a small, controlled settle, while the letters between ease aside to keep the word centred. The swap
// repeats every 5 s, so the mark alternates between the two words in a continuous loop.
// Each glyph is a <g class="hs"> in the header SVG (hdrMark() in scripts/shell.mjs); this module only
// writes those groups' transform attributes, in wordmark units, so it never touches the reveal windows
// (logoreveal.js animates the clip rects inside). Amplitudes are kept small: the logo stays legible and
// clickable throughout. Reduced motion: the static logo.
import { env, $, $$ } from './env.js';

const PERIOD = 5;   // seconds between swap starts
const SWAP = 1.5;   // seconds of travel
const LIFT = 230;   // arc height, wordmark units (the glyphs are ~880 tall): about a quarter of a letter
const LEAN = 8;     // degrees
const GIVE = 22;    // how far the letters between dip as a traveller passes

export async function initLogoSwap() {
  const logo = $('[data-hdr-logo]');
  if (!logo || env.reduced) return;
  const gs = $$('.hs', logo);
  if (gs.length !== 7) return;
  const { gsap } = await import('gsap');

  const glyphs = gs.map((g) => ({ g, sx: +g.dataset.sx || 0, cx: +g.dataset.cx || 0, cy: +g.dataset.cy || 0, x: 0, y: 0, r: 0, kx: 1, ky: 1 }));
  const paint = (s) => s.g.setAttribute('transform',
    `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)}) rotate(${s.r.toFixed(2)} ${s.cx} ${s.cy}) translate(${s.cx} ${s.cy}) scale(${s.kx.toFixed(4)} ${s.ky.toFixed(4)}) translate(${-s.cx} ${-s.cy})`);

  const xE = gsap.parseEase('back.inOut(1.15)'); // a little anticipation on leaving, a little overshoot on landing
  const arcE = gsap.parseEase('sine.inOut');
  let different = false, tl = null; // the header opens as the logo itself

  const swap = () => {
    if (tl?.isActive()) return;
    const toDifferent = !different;
    const from = glyphs.map((s) => s.x);
    const to = glyphs.map((s) => (toDifferent ? s.sx : 0));
    const last = glyphs.length - 1;
    const over = toDifferent ? last : 0, under = toDifferent ? 0 : last; // one arcs over the word, one under
    const q = { p: 0 };
    different = toDifferent;
    tl = gsap.timeline()
      .to(q, {
        p: 1, duration: SWAP, ease: 'none',
        onUpdate: () => {
          const p = q.p, e = xE(p), a = Math.sin(Math.PI * arcE(p)), bell = Math.sin(Math.PI * p);
          glyphs.forEach((s, i) => {
            if (i === over || i === under) {
              const dir = i === over ? -1 : 1;
              s.x = from[i] + (to[i] - from[i]) * e;
              s.y = dir * LIFT * a;
              s.r = dir * -LEAN * bell;           // leans into the turn, upright again on landing
              s.kx = s.ky = 1 + (i === over ? 0.05 : -0.05) * a; // the one passing over reads nearer
            } else {
              s.x = from[i] + (to[i] - from[i]) * arcE(p);
              s.y = bell * GIVE * (i % 2 ? 1 : -1);
            }
            paint(s);
          });
        },
      })
      // landing: a quick, small squash and recovery on the two travellers
      .to([glyphs[over], glyphs[under]], {
        keyframes: { ky: [1, 0.94, 1.02, 1], kx: [1, 1.035, 0.995, 1] }, duration: 0.5, ease: 'power2.out',
        onUpdate: () => { paint(glyphs[over]); paint(glyphs[under]); },
      }, SWAP - 0.06);
  };

  const cycle = () => {
    gsap.delayedCall(PERIOD, cycle);
    if (!document.hidden) swap(); // in a background tab: hold the current word, keep the rhythm
  };
  gsap.delayedCall(2.4, cycle); // let the logo settle (or finish its reveal) before the first exchange
}
