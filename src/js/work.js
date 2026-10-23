// Work page: service filters (synced to ?service=), scattered layout re-slotting, gentle parallax on desktop.
import { env, $, $$ } from './env.js';

export async function init() {
  const grid = $('[data-work-grid]');
  if (!grid) return;
  const items = $$('.wk__item', grid);
  const chips = $$('[data-filter]');
  const status = $('[data-work-status]');
  const empty = $('[data-work-empty]');
  const valid = new Set(chips.map((c) => c.dataset.filter));

  const apply = (slug, { animate = true, push = true } = {}) => {
    if (!valid.has(slug)) slug = 'all';
    chips.forEach((c) => {
      const on = c.dataset.filter === slug;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    const show = items.filter((it) => slug === 'all' || it.dataset.services.split(' ').includes(slug));
    const hide = items.filter((it) => !show.includes(it));
    const commit = () => {
      hide.forEach((it) => { it.hidden = true; it.classList.remove('is-hiding'); });
      show.forEach((it, i) => { it.hidden = false; it.setAttribute('style', `--slot:${i % 6}`); }); // CSS keys the scatter layout off this
      empty.hidden = show.length > 0;
      if (animate && !env.reduced) {
        show.forEach((it) => it.classList.add('is-hiding'));
        requestAnimationFrame(() => requestAnimationFrame(() => show.forEach((it) => it.classList.remove('is-hiding'))));
      }
      window.__workRefresh?.();
    };
    if (animate && !env.reduced) {
      [...hide, ...show].forEach((it) => !it.hidden && it.classList.add('is-hiding'));
      setTimeout(commit, 320);
    } else commit();

    const name = chips.find((c) => c.dataset.filter === slug)?.firstChild.textContent.trim();
    status.textContent = `${show.length} project${show.length === 1 ? '' : 's'}${slug === 'all' ? '' : ` in ${name}`}`;
    if (push) {
      const url = new URL(location.href);
      if (slug === 'all') url.searchParams.delete('service'); else url.searchParams.set('service', slug);
      history.replaceState(null, '', url);
    }
  };

  chips.forEach((c) => c.addEventListener('click', () => apply(c.dataset.filter)));
  const initial = new URLSearchParams(location.search).get('service') || 'all';
  apply(initial, { animate: false, push: false });
  if (initial !== 'all') chips.find((c) => c.dataset.filter === initial)?.scrollIntoView({ block: 'nearest', inline: 'center' });

  // Desktop parallax: alternate slots drift at different speeds (transform only).
  if (env.reduced || !window.matchMedia('(min-width: 900px)').matches) return;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);
  const speeds = [-6, 10, -3, 7, -9, 4];
  items.forEach((it) => {
    const frame = $('.wk__frame', it);
    gsap.fromTo(frame, { yPercent: 0 }, {
      yPercent: () => speeds[+getComputedStyle(it).getPropertyValue('--slot') || 0],
      ease: 'none',
      scrollTrigger: { trigger: it, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    });
  });
  window.__workRefresh = () => ScrollTrigger.refresh();
}
