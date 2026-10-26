// Homepage: hero film + 3D wordmark, statement light-up, tile reveals, services, pinned studio strip,
// process progress, testimonial players.
import { env, $, $$ } from './env.js';
import { sound } from './ui.js';
import { testimonials } from './testimonials.js';
import { heroMotion } from './hero3d.js';

/* ---------------------------------------------------------------- hero film: right source per screen, never blocks */
function heroVideo() {
  const v = $('[data-hero-video]');
  if (!v || env.reduced) return; // the poster <picture> stays
  const wide = matchMedia('(min-aspect-ratio: 1/1)').matches;
  v.src = !wide ? v.dataset.srcTall : innerWidth * devicePixelRatio > 1600 ? v.dataset.srcWide : v.dataset.srcMid;
  v.preload = 'auto';
  const play = () => v.play().catch(() => {});
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

  // Flow edge: a 13-point top edge, wavy at `base` (percent from the top), flat at 0. Same point count
  // at both ends so GSAP can interpolate the polygon.
  const wave = (base, amp = 7, phase = 0) => `polygon(${Array.from({ length: 13 }, (_, i) => {
    const x = (i / 12) * 100;
    return `${x.toFixed(2)}% ${base ? Math.max(0, base + amp * Math.sin((x / 100) * Math.PI * 2.4 + phase)).toFixed(2) : 0}%`;
  }).join(', ')}, 100% 100%, 0% 100%)`;

  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    // Selected work: each tile unmasks from the bottom while its image drifts against the scroll.
    $$('.tile').forEach((t, i) => {
      gsap.fromTo(t, { clipPath: wave(24, 8, i) }, {
        clipPath: wave(0), ease: 'power2.out',
        scrollTrigger: { trigger: t, start: 'top 95%', end: 'top 45%', scrub: 0.8 },
      });
      gsap.fromTo($('.tile__img', t), { yPercent: -5 }, {
        yPercent: 5, ease: 'none', scrollTrigger: { trigger: t, start: 'top bottom', end: 'bottom top', scrub: true },
      });
      gsap.from($('.tile__label', t), { y: 40, opacity: 0, duration: 1.1, ease: 'expo.out', delay: (i % 2) * 0.08, scrollTrigger: { trigger: t, start: 'top 70%' } });
    });

    // Studio strip: the section is as tall as the strip is wide; a sticky stage moves the track sideways.
    const hz = $('[data-hz]');
    const track = $('[data-hz-track]');
    if (hz && track) {
      const distance = () => Math.max(0, track.scrollWidth - innerWidth);
      const size = () => { hz.style.height = `${innerHeight + distance()}px`; };
      size();
      const tween = gsap.to(track, {
        x: () => -distance(), ease: 'none',
        scrollTrigger: { trigger: hz, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true, onRefreshInit: size },
      });
      $$('.hz__item', track).forEach((it, i) => {
        const fr = $('.hz__frame', it);
        fr.removeAttribute('data-flow'); // the scrubbed wave below replaces the CSS one (a CSS animation would win over it)
        gsap.set(fr, { clipPath: wave(100, 0) });
        gsap.to(fr, { ease: 'none', keyframes: { clipPath: [wave(100, 0), wave(55, 9, i), wave(0)] }, scrollTrigger: { trigger: it, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true } });
      });
      return () => { hz.style.height = ''; };
    }
  });
}

export async function init({ lenis, loading }) {
  heroVideo();
  typer();
  servicesBlock();
  marquee();
  testimonials();
  const handedOff = await loading;
  heroMotion({ handedOff }).catch((e) => console.warn('hero motion', e)); // content stays static if it fails
  scrollScenes().catch(() => {});
  if (!lenis) requestAnimationFrame(() => import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => ScrollTrigger.refresh()));
}
