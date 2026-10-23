// About: process stages drive the sticky image and progress rail (desktop); active stage highlights everywhere.
import { $, $$ } from './env.js';

export function init() {
  const proc = $('[data-proc]');
  if (!proc) return;
  const stages = $$('.proc__stage', proc);
  const imgs = $$('.proc__img', proc);
  const bar = $('[data-proc-bar]', proc);
  const set = (i) => {
    stages.forEach((s, k) => s.classList.toggle('is-active', k === i));
    imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    if (bar) bar.parentElement.style.setProperty('--p', String((i + 1) / stages.length));
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && set(stages.indexOf(e.target))),
    { rootMargin: '-45% 0px -45% 0px' }
  );
  stages.forEach((s) => io.observe(s));
  set(0);
}
