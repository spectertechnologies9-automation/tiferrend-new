// The original Tifferend preloader (rebuilt from the live site), first visit per session only.
// On the homepage the extruded logo flies into the hero wordmark instead of fading out.
// Never waits on network: it runs its own short timeline, can be skipped with any input,
// and a CSS failsafe hides it after 6s even if this script never runs.
import { $ } from './env.js';

const KEY = 'tifferend-loaded';
const LAND = 1450; // logo-in animation lands at 1.4s

export function runLoader() {
  const el = $('[data-loader]');
  const html = document.documentElement;
  if (!el || !html.classList.contains('show-loader')) return Promise.resolve();

  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      try { sessionStorage.setItem(KEY, '1'); } catch {}
      html.classList.remove('show-loader');
      el.remove();
      resolve();
    };

    const out = () => {
      clearTimeout(timer);
      removeSkip();
      const target = $('[data-hero-mark]');
      const logo = $('[data-loader-logo]', el);
      if (!target || !logo) {
        el.classList.add('is-out');
        setTimeout(finish, 700);
        return;
      }
      // Hand-off: move the loader logo onto the hero wordmark, invert it to the hero colours.
      el.classList.add('is-handoff'); // cancels the CSS entry animation before measuring
      const a = logo.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      const s = b.width / a.width;
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      target.style.opacity = '0';
      logo.classList.add('wm3d-to-hero');
      const anim = logo.animate(
        [{ transform: 'none' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})` }],
        { duration: 1000, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }
      );
      const land = () => {
        target.style.opacity = '';
        document.dispatchEvent(new CustomEvent('hero:landed'));
        finish();
      };
      anim.onfinish = land;
      setTimeout(land, 1300);
    };

    const timer = setTimeout(out, LAND);
    const skip = () => { if (!done) out(); };
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    const removeSkip = () => events.forEach((e) => window.removeEventListener(e, skip));
    events.forEach((e) => window.addEventListener(e, skip, { once: true, passive: true }));
  });
}
