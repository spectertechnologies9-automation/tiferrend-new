// Testimonial players: thumbnail first, video loads on click, one plays at a time, native controls + captions.
import { $, $$ } from './env.js';

export function testimonials() {
  const players = $$('[data-tst]');
  if (!players.length) return;
  const videos = players.map((p) => $('video', p));

  players.forEach((p) => {
    const v = $('video', p);
    const btn = $('[data-tst-play]', p);
    const state = $('[data-tst-state]', p);
    btn.addEventListener('click', () => {
      if (!v.src) { v.src = v.dataset.src; state.textContent = 'Loading…'; }
      v.controls = true;
      p.classList.add('is-started');
      v.play().then(() => v.focus({ preventScroll: true })).catch(() => {
        state.textContent = 'This film couldn’t play. Try again or use the controls.';
        p.classList.remove('is-started');
      });
    });
    v.addEventListener('playing', () => { state.textContent = ''; p.classList.add('is-playing'); });
    v.addEventListener('waiting', () => { state.textContent = 'Loading…'; });
    v.addEventListener('pause', () => p.classList.remove('is-playing'));
    v.addEventListener('error', () => {
      state.textContent = 'This film is unavailable right now.';
      p.classList.remove('is-started', 'is-playing');
    });
    // Only one at a time.
    v.addEventListener('play', () => videos.forEach((o) => o !== v && !o.paused && o.pause()));
  });

  // Horizontal track: buttons step one film, arrow keys work when the track has focus, a film that
  // leaves the view pauses, and the buttons disable at the ends.
  const track = $('[data-tst-track]');
  if (!track) return;
  const prev = $('[data-tst-prev]'), next = $('[data-tst-next]');
  const step = () => (track.querySelector('.tst__card')?.getBoundingClientRect().width || track.clientWidth) + parseFloat(getComputedStyle(track).columnGap || 0);
  const go = (dir) => track.scrollBy({ left: dir * step(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  prev?.addEventListener('click', () => go(-1));
  next?.addEventListener('click', () => go(1));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
  const ends = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    if (prev) prev.disabled = track.scrollLeft <= 2;
    if (next) next.disabled = track.scrollLeft >= max;
  };
  track.addEventListener('scroll', ends, { passive: true });
  addEventListener('resize', ends);
  ends();
  const io = new IntersectionObserver((es) => es.forEach((e) => { const v = $('video', e.target); if (!e.isIntersecting && v && !v.paused) v.pause(); }), { root: track, threshold: 0.4 });
  players.forEach((p) => io.observe(p));
}
