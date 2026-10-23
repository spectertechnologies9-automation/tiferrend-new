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
}
