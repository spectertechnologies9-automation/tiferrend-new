// Homepage: hero film (video only), services, studio, process, tile reveals, testimonial players.
import { env, $, $$ } from './env.js';
import { sound } from './ui.js';
import { testimonials } from './testimonials.js';
import { heroMotion } from './hero3d.js';

/* ---------------------------------------------------------------- hero film: right source per screen, never blocks */
// Sources come from src/data/hero.js (the client's 16:9 desktop and 9:16 mobile films): landscape screens
// get the desktop film (its optional 4K / light encodes where they help), portrait screens the mobile film.
function heroVideo() {
  const v = $('[data-hero-video]');
  if (!v || env.reduced) return; // the poster <picture> stays
  const landscape = matchMedia('(min-aspect-ratio: 1/1)');
  const pick = () => {
    const px = innerWidth * devicePixelRatio; // device pixels across: 4K only where the screen can show it
    const d = v.dataset;
    return !landscape.matches ? d.srcTall : px > 2600 && d.srcUhd ? d.srcUhd : px <= 1400 && d.srcMid ? d.srcMid : d.srcWide;
  };
  v.src = pick();
  v.preload = 'auto';
  const play = () => v.play().catch(() => {});
  // a rotated phone or resized window switches between the 9:16 and 16:9 films
  landscape.addEventListener('change', () => { const next = pick(); if (!v.currentSrc.endsWith(next.replace(/^.*\//, ''))) { v.src = next; if (v.dataset.userPaused !== '1') play(); } });
  v.addEventListener('canplay', play, { once: true });
  v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
  v.addEventListener('error', () => v.removeAttribute('src'), { once: true });
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (v.dataset.userPaused !== '1') play(); } else v.pause();
  }).observe(v);
  $('[data-hero] [data-vidctl]')?.addEventListener('click', () => { v.dataset.userPaused = v.paused ? '1' : '0'; });
}

/* ---------------------------------------------------------------- typed line (Mensch) */
function typer() {
  // Service line: words roll through a mask (out up, in from below) instead of being typed.
  const el = $('[data-type]');
  if (!el || env.reduced) return;
  const words = el.dataset.words.split('|');
  let i = 0;
  let cur = Object.assign(document.createElement('span'), { className: 'tw', textContent: words[0] });
  el.textContent = '';
  el.append(cur);
  const ease = 'cubic-bezier(0.77, 0, 0.175, 1)';
  setInterval(() => {
    if (document.hidden) return;
    i = (i + 1) % words.length;
    const next = Object.assign(document.createElement('span'), { className: 'tw', textContent: words[i] });
    el.append(next);
    cur.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-105%)', opacity: 0 }], { duration: 650, easing: ease, fill: 'forwards' }).onfinish = function () { this.effect.target.remove(); };
    next.animate([{ transform: 'translateY(105%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 750, easing: ease, delay: 90, fill: 'backwards' });
    cur = next;
  }, 2600);
}

/* ---------------------------------------------------------------- services (Bold & Beyond) */
function servicesBlock() {
  const root = $('[data-svc]');
  if (!root) return;
  const items = $$('.svc__item', root);
  const imgs = $$('.svc__img', root);
  let pointer = 'mouse';
  root.addEventListener('pointerdown', (e) => { pointer = e.pointerType; }, { passive: true });
  // client font review: ?svcfont=text sets the service names in the text face (see --svc-font in main.css)
  const font = new URLSearchParams(location.search).get('svcfont');
  if (font) document.documentElement.dataset.svcFont = font;
  // Bold & Beyond: the picture always fills the section. Hover, keyboard focus or a tap selects a service:
  // its picture crossfades in, its name turns italic white and its line + link open. The last one stays.
  let active = 0, tapped = -1;
  const set = (i) => {
    if (i === active) return;
    active = i;
    items.forEach((it, k) => it.classList.toggle('is-active', k === i));
    imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    sound.play('tick');
  };
  items.forEach((it, i) => {
    const link = $('.svc__link', it);
    // Hover previews only in the desktop layout, where a row's details sit beside it. Below 900px the
    // details expand inline, so hover would reflow the list under the pointer and flip rows back and forth.
    const wide = matchMedia('(min-width: 900px)');
    link.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse' && wide.matches) set(i); });
    link.addEventListener('focus', () => link.matches(':focus-visible') && set(i)); // keyboard only; taps are handled below
    // Touch: the first tap on a service previews it (picture, line and a visible link to the work); a second
    // tap on the same service opens the filtered Work page.
    link.addEventListener('click', (e) => {
      if (pointer !== 'mouse' && e.detail > 0 && tapped !== i) { e.preventDefault(); tapped = i; set(i); }
      pointer = 'mouse';
    });
  });
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    imgs.forEach((im) => { im.loading = 'eager'; });
    o.disconnect();
  }, { rootMargin: '600px 0px' }).observe(root);
}

function marquee() {
  const m = $('[data-marq]');
  if (!m) return;
  m.addEventListener('focusin', () => m.classList.add('is-paused'));
  m.addEventListener('focusout', () => m.classList.remove('is-paused'));
}

/* ---------------------------------------------------------------- how we work: the stage in focus */
// The stage crossing the middle of the screen becomes active: full strength, and (desktop) its picture
// crossfades in the sticky frame. An observer on a thin centre band works with Lenis and native scroll.
function processStory() {
  const root = $('[data-process]');
  if (!root) return;
  const steps = $$('.st__step', root), pics = $$('.st__pic', root);
  const show = (i) => {
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    pics.forEach((p, k) => p.classList.toggle('is-active', k === i));
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) show(+e.target.dataset.i); }), { rootMargin: '-48% 0px -48% 0px' });
  steps.forEach((s) => io.observe(s));
}

/* ---------------------------------------------------------------- scroll choreography (GSAP + ScrollTrigger) */
async function scrollScenes() {
  if (env.reduced) return;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  // Statement: each word lights as the line passes the middle of the screen.
  $$('[data-lightup]').forEach((el) => {
    // words light one by one; collage pieces (italic words, frames, marks) light with them
    const parts = [];
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) n.textContent.split(/\s+/).filter(Boolean).forEach((w) => parts.push(`<span class="lw">${w}</span>`));
      else if (n.nodeType === 1) { n.classList.add('lw'); parts.push(n.outerHTML); }
    });
    el.innerHTML = parts.join(' ');
    el.classList.add('is-lit');
    const words = $$('.lw', el);
    ScrollTrigger.create({
      trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true,
      onUpdate: (s) => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('on', i < n)); },
    });
  });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    // Selected work: each tile opens upward behind a straight edge while its picture settles from a slight
    // zoom and drifts against the scroll — a calm flow, no wavy edge (client, Nov 2026).
    $$('.tile').forEach((t, i) => {
      gsap.fromTo(t, { clipPath: 'inset(22% 0% 0% 0%)' }, {
        clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.out',
        scrollTrigger: { trigger: t, start: 'top 96%', end: 'top 50%', scrub: 0.8 },
      });
      gsap.fromTo($('.tile__img', t), { scale: 1.14 }, {
        scale: 1, ease: 'power2.out', scrollTrigger: { trigger: t, start: 'top 96%', end: 'top 40%', scrub: 0.8 },
      });
      gsap.fromTo($('.tile__img', t), { yPercent: -5 }, {
        yPercent: 5, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.from($('.tile__label', t), { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', delay: (i % 2) * 0.08, scrollTrigger: { trigger: t, start: 'top 70%' } });
    });

  });
}

export async function init({ lenis, loading }) {
  heroVideo();
  typer();
  servicesBlock();
  processStory();
  marquee();
  testimonials();
  await loading;
  heroMotion().catch((e) => console.warn('hero motion', e)); // content stays static if it fails
  scrollScenes().catch(() => {});
  if (!lenis) requestAnimationFrame(() => import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.refresh()));
}
