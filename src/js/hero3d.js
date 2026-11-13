// Hero. The large wordmark in the centre (wm3() in scripts/shell.mjs: seven extruded glyph stacks over the
// production footage) stays exactly as built — same markup, size, position and styling — but is STATIC
// since Nov 2026: the client asked for its animation to be switched off. No entrance, idle drift, waves,
// gestures, swap, cursor springs, travelling light or scroll lift-off; it reads TIFFEREND, as the logo does.
// The DIFFERENT ⇄ TIFFEREND letter exchange now lives only in the header logo (logoswap.js).
// The rest of the hero keeps its scroll beat on desktop: the film settles from a slight push-in while the
// copy and the video control step away (transforms and opacity only; nothing under reduced motion).
import { env, $ } from './env.js';

export async function heroMotion() {
  const hero = $('[data-hero]');
  if (!hero || env.reduced) return;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  // scrub: true — Lenis already smooths the scroll; a second lag felt sticky.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true },
    });
    tl.fromTo('[data-hero-media]', { scale: 1.12 }, { scale: 1, duration: 1 }, 0)
      .to('[data-hero-foot]', { yPercent: 50, opacity: 0, duration: 0.3 }, 0)
      .to('.hero .vidctl', { opacity: 0, duration: 0.2 }, 0);
    return () => tl.kill();
  });
}
