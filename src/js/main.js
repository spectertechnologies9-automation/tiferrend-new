// Boot. Content is already in the HTML; everything here is progressive enhancement.
import { env } from './env.js';
import { runLoader } from './loader.js';
import { header, sheets, soundToggle, reveals, autoplayVideos, cursor, aiLinks, toTop } from './ui.js';

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
  const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, anchors: { offset: -80 } });
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
  const lenis = await smooth();
  toTop(lenis);
  reveals();
  autoplayVideos();
  const load = pages[document.body.dataset.page];
  if (load) (await load()).init({ lenis, loading });
}

boot();
