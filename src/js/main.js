// Boot. Content is already in the HTML; everything here is progressive enhancement.
import { env } from './env.js';
import { runLoader } from './loader.js';
import { header, sheets, soundToggle, reveals, autoplayVideos, cursor, aiLinks, toTop, magnets } from './ui.js';

if ('scrollRestoration' in history && document.body.dataset.page === 'home') history.scrollRestoration = 'manual';

const pages = {
  home: () => import('./home.js'),
  work: () => import('./work.js'),
  about: () => import('./about.js'),
  contact: () => import('./contact.js'),
};

// Smooth scrolling only for mouse/trackpad users who haven't asked for reduced motion. Touch keeps native scrolling.
async function smooth() {
  if (env.reduced || !env.finePointer) return null;
  let mods;
  try {
    mods = await Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]);
  } catch { return null; } // chunk failed or the page is navigating away: native scroll is fine
  const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = mods;
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.16, smoothWheel: true, anchors: { offset: -80 } }); // 0.12 trailed input by ~700ms
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // Pause smooth scroll while a sheet is open so the dialog scrolls natively.
  new MutationObserver(() => (document.querySelector('dialog[open]') ? lenis.stop() : lenis.start())).observe(document.body, {
    subtree: true, attributes: true, attributeFilter: ['open'],
  });
  return lenis;
}

async function boot() {
  header();
  sheets();
  soundToggle();
  cursor();
  aiLinks();
  const loading = runLoader();
  // Nothing visible waits on a network import.
  reveals();
  autoplayVideos();
  // footer finale: load the choreography only when the footer approaches
  const ftr = document.querySelector('[data-ftr-mark]');
  if (ftr && !env.reduced) new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); import('./footerdance.js').then((d) => d.initFooterDance()).catch(() => {}); }, { rootMargin: '600px 0px' }).observe(ftr);
  magnets();
  // header logo reveal (fragment windows dot → bar → full), after the loader so the two never overlap
  if (!env.reduced) loading.then(() => import('./logoreveal.js')).then((m) => m.initLogoReveal()).catch(() => {});
  // fluid layer: liquid reveals, bends and ripples on real images and type (fluid.js)
  if (!env.reduced && !new URLSearchParams(location.search).has('nofluid')) import('./fluid.js').then((m) => m.initFluid()).catch(() => {}); // ?nofluid: diagnostics
  // cursor ripple: a thin liquid surface that bends content under the pointer (ripple.js)
  if (!env.reduced) import('./ripple.js').then((m) => m.initRipple()).catch(() => {});
  if (env.finePointer && !env.reduced) import('./trail.js').then(({ initTrail }) => initTrail()).catch(() => {});
  const lenis = await smooth();
  toTop(lenis);
  const load = pages[document.body.dataset.page];
  if (!load) return;
  try { (await load()).init({ lenis, loading }); } catch { /* page enhancements are optional; content is in the HTML */ }
}

boot();
