// Environment flags, read once.
const mq = (q) => window.matchMedia(q);

export const env = {
  reduced: mq('(prefers-reduced-motion: reduce)').matches,
  finePointer: mq('(hover: hover) and (pointer: fine)').matches,
  desktop: mq('(min-width: 900px)').matches,
};

// Relative path from the current page to the site root (pages sit 0–2 folders deep).
export const root = () => {
  const depth = { home: 0, 404: 0, work: 1, about: 1, contact: 1, project: 2 }[document.body.dataset.page] ?? 0;
  return depth ? '../'.repeat(depth) : './';
};

export const $ = (s, el = document) => el.querySelector(s);
export const $$ = (s, el = document) => [...el.querySelectorAll(s)];
