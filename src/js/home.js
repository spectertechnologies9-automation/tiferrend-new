// Homepage: hero film + floating wordmark, typed line, services backgrounds, testimonial players.
import { env, $, $$ } from './env.js';
import { sound } from './ui.js';
import { testimonials } from './testimonials.js';

/* ---------------------------------------------------------------- hero film: right source for the screen, never blocks */
function heroVideo() {
  const v = $('[data-hero-video]');
  if (!v) return;
  const wide = window.matchMedia('(min-aspect-ratio: 1/1)').matches;
  const small = window.innerWidth < 480 && !wide;
  if (env.reduced) return; // the poster <picture> stays
  v.src = wide ? v.dataset.srcWide : small ? v.dataset.srcSmall : v.dataset.srcTall;
  v.preload = 'auto';
  const play = () => v.play().catch(() => {});
  v.addEventListener('canplay', play, { once: true });
  v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
  v.addEventListener('error', () => v.removeAttribute('src'), { once: true }); // poster stays
  // Pause when off-screen to save battery.
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (v.dataset.userPaused !== '1') play(); } else v.pause();
  }).observe(v);
  $('[data-hero] [data-vidctl]')?.addEventListener('click', () => { v.dataset.userPaused = v.paused ? '1' : '0'; });
}

/* ---------------------------------------------------------------- wordmark: float, pointer tilt (desktop), scroll drift */
async function heroMotion(lenis) {
  const mark = $('[data-hero-mark]');
  if (!mark || env.reduced) return;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  const wrap = mark.parentElement; // h1: positioned; mark: animated
  gsap.set(wrap, { transformPerspective: 1200 });
  gsap.to(mark, { yPercent: -7, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
  gsap.to(mark, { rotationZ: -1.2, duration: 4.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });

  if (env.finePointer) {
    const rx = gsap.quickTo(mark, 'rotationX', { duration: 1.1, ease: 'power3.out' });
    const ry = gsap.quickTo(mark, 'rotationY', { duration: 1.1, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => {
      if (document.body.classList.contains('at-hero')) {
        ry(((e.clientX / innerWidth) - 0.5) * 16);
        rx(-((e.clientY / innerHeight) - 0.5) * 10);
      }
    }, { passive: true });
  }

  // Scroll: the wordmark drifts up and shrinks slightly, the film settles. Transform/opacity only.
  const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } });
  tl.to(wrap, { yPercent: -60, scale: 0.86, ease: 'none' }, 0)
    .fromTo('[data-hero-video]', { scale: 1.08 }, { scale: 1, ease: 'none' }, 0)
    .to('.hero__foot', { yPercent: -40, opacity: 0, ease: 'none' }, 0);
  if (!lenis) ScrollTrigger.refresh();
}

/* ---------------------------------------------------------------- typed line (Mensch) */
function typer() {
  const el = $('[data-type]');
  if (!el || env.reduced) return;
  const words = el.dataset.words.split('|');
  let i = 0;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const run = async () => {
    for (;;) {
      await wait(2200);
      const cur = words[i];
      for (let n = cur.length; n >= 0; n--) { el.textContent = cur.slice(0, n); await wait(28); }
      i = (i + 1) % words.length;
      const next = words[i];
      for (let n = 1; n <= next.length; n++) { el.textContent = next.slice(0, n); await wait(55); }
    }
  };
  run();
}

/* ---------------------------------------------------------------- services (Bold & Beyond) */
function servicesBlock() {
  const root = $('[data-svc]');
  if (!root) return;
  const items = $$('.svc__item', root);
  const imgs = $$('.svc__img', root);
  let pointer = 'mouse';
  root.addEventListener('pointerdown', (e) => { pointer = e.pointerType; }, { passive: true });
  let active = 0;
  const set = (i) => {
    if (i === active) return;
    active = i;
    items.forEach((it, k) => it.classList.toggle('is-active', k === i));
    imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    sound.play('tick');
  };
  items.forEach((it, i) => {
    const link = $('.svc__link', it);
    link.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') set(i); });
    link.addEventListener('focus', () => link.matches(':focus-visible') && set(i)); // keyboard only; taps are handled below
    // Touch: first tap previews (image + route to the work), second tap opens the filtered Work page.
    link.addEventListener('click', (e) => {
      if (pointer !== 'mouse' && e.detail > 0 && active !== i) { e.preventDefault(); set(i); }
      pointer = 'mouse';
    });
  });
  // Preload the other backgrounds once the section is near.
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    imgs.forEach((im) => { im.loading = 'eager'; });
    o.disconnect();
  }, { rootMargin: '600px 0px' }).observe(root);
}

/* ---------------------------------------------------------------- marquee: pause while keyboard focus is inside */
function marquee() {
  const m = $('[data-marq]');
  if (!m) return;
  m.addEventListener('focusin', () => m.classList.add('is-paused'));
  m.addEventListener('focusout', () => m.classList.remove('is-paused'));
}

export async function init({ lenis, loading }) {
  heroVideo();
  typer();
  servicesBlock();
  marquee();
  testimonials();
  await loading;
  heroMotion(lenis);
}
