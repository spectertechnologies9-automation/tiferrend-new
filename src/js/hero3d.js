// Hero motion. The hero shows only the film (client, Nov 2026): the large centre wordmark and its
// animation were removed, and the DIFFERENT ⇄ TIFFEREND letter exchange lives in the header logo
// (logoswap.js). What remains is the hero's scroll beat on desktop: the film settles from a slight
// push-in while the copy and the video control step away (transforms and opacity only; none under
// reduced motion).
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
