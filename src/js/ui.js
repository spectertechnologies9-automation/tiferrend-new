// Shared interface: header state, Info / menu sheets, sound, reveals, decorative video, cursor label, AI links.
import { env, $, $$, root } from './env.js';

/* ---------------------------------------------------------------- header */
export function header() {
  // Themed project heads: the header takes the project colours instead of the difference blend.
  const themed = $('[data-themed] .pj__head');
  if (themed) {
    new IntersectionObserver(([e]) => document.body.classList.toggle('at-theme', e.isIntersecting), {
      rootMargin: '0px 0px -100% 0px',
    }).observe(themed);
  }
  const hero = $('[data-hero]');
  if (!hero) return;
  document.body.classList.add('at-hero');
  new IntersectionObserver(([e]) => document.body.classList.toggle('at-hero', e.intersectionRatio > 0.35), {
    threshold: [0, 0.35, 1],
  }).observe(hero);
}

/* ---------------------------------------------------------------- sheets (native <dialog>: focus trap, Esc, inert page) */
export function sheets() {
  const close = (d) => {
    if (!d.open || d.classList.contains('is-closing')) return;
    if (env.reduced) return d.close();
    d.classList.add('is-closing');
    setTimeout(() => { d.classList.remove('is-closing'); d.close(); }, 280);
  };
  $$('dialog.sheet').forEach((d) => {
    d.addEventListener('cancel', (e) => { e.preventDefault(); close(d); });
    // backdrop-filter can't blur 3D-transformed layers (the hero wordmark), so the page marks itself
    d.addEventListener('close', () => document.body.classList.remove(`${d.id}-open`));
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('[data-close]')) close(d);
      if (e.target.closest('a[href]')) close(d); // navigating closes the sheet
    });
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (!btn) return;
    const d = document.getElementById(btn.dataset.open);
    if (!d) return;
    $$('dialog.sheet[open]').forEach((o) => o !== d && o.close());
    d.showModal();
    document.body.classList.add(`${d.id}-open`);
    sound.play('open');
  });
}

/* ---------------------------------------------------------------- sound (optional, starts muted, synthesised: no files) */
export const sound = {
  on: false,
  ctx: null,
  play(kind = 'tick') {
    if (!this.on) return;
    try {
      this.ctx ||= new (window.AudioContext || window.webkitAudioContext)();
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const f = { tick: 1320, open: 660, toggle: 880 }[kind] || 1000;
      o.type = 'sine';
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.09);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(this.ctx.destination);
      o.start(t);
      o.stop(t + 0.14);
    } catch {}
  },
};

export function soundToggle() {
  const btns = $$('[data-sound]');
  let stored = false;
  try { stored = localStorage.getItem('tifferend-sound') === 'on'; } catch {}
  const set = (on) => {
    sound.on = on;
    btns.forEach((b) => {
      b.setAttribute('aria-pressed', String(on));
      const l = $('.hdr__sound-label', b);
      if (l) l.textContent = on ? 'Sound on' : 'Sound off';
    });
    try { localStorage.setItem('tifferend-sound', on ? 'on' : 'off'); } catch {}
  };
  set(stored);
  btns.forEach((b) => b.addEventListener('click', () => { set(!sound.on); sound.play('toggle'); }));
  if (env.finePointer) {
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('a, button, .tile');
      if (t && !t.contains(e.relatedTarget)) sound.play('tick');
    });
  }
}

/* ---------------------------------------------------------------- reveals */
export function reveals() {
  const els = $$('[data-split], [data-rv], [data-ftr-mark], [data-flow]');
  if (env.reduced) return;
  $$('[data-split]').forEach((el) => {
    const marks = ['EM', 'STRONG', 'U'];
    if ([...el.children].some((c) => !marks.includes(c.tagName))) return; // plain text plus emphasis only
    // words keep their emphasis (italic / bold / underline); emphasised words rise from the other side
    const words = [];
    el.childNodes.forEach((n) => {
      const tag = n.nodeType === 1 ? n.tagName.toLowerCase() : '';
      n.textContent.split(/\s+/).forEach((w, k) => {
        if (k) words.push(' ');
        if (w) words.push({ w, tag });
      });
    });
    let i = 0;
    el.innerHTML = words
      .map((t) => (t === ' ' ? ' ' : `<span class="w${t.tag ? ' w--i' : ''}"><span style="--wi:${i++}">${t.tag ? `<${t.tag}>${t.w}</${t.tag}>` : t.w}</span></span>`))
      .join('').replace(/\s+/g, ' ').trim();
    el.classList.add('is-split');
  });
  const pending = new Set(els);
  const show = (el) => { el.classList.add('is-in'); io.unobserve(el); pending.delete(el); };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting || e.boundingClientRect.top < 0) show(e.target);
    }),
    { rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => io.observe(el));
  // An observer only reports state changes, so a jump from "below the screen" straight to "above it"
  // (a fast fling, an anchor link) reports nothing. Catch those on scroll, once per frame, until done.
  let raf = 0;
  const sweep = () => {
    raf = 0;
    const limit = innerHeight * 0.92;
    pending.forEach((el) => { if (el.getBoundingClientRect().top < limit) show(el); });
    if (!pending.size) removeEventListener('scroll', onScroll);
  };
  const onScroll = () => { if (!raf) raf = requestAnimationFrame(sweep); };
  addEventListener('scroll', onScroll, { passive: true });
}

/* ---------------------------------------------------------------- decorative autoplay video: in view only, with pause control */
export function autoplayVideos() {
  const vids = $$('video[data-autoplay]');
  const userPaused = new WeakSet();
  const io = new IntersectionObserver((entries) =>
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) {
        if (!v.src) { v.src = v.dataset.src; }
        if (!env.reduced && !userPaused.has(v)) v.play().catch(() => {});
      } else if (!v.paused) v.pause();
    }), { rootMargin: '120px 0px' });
  vids.forEach((v) => io.observe(v));
  wireVidctl(userPaused);
}

export function wireVidctl(userPaused = new WeakSet()) {
  $$('[data-vidctl]').forEach((btn) => {
    const v = btn.parentElement.querySelector('video');
    if (!v) return;
    const sync = () => {
      const paused = v.paused;
      btn.setAttribute('aria-pressed', String(paused));
      btn.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${btn.closest('[data-hero]') ? 'background ' : ''}video`);
    };
    v.addEventListener('play', sync);
    v.addEventListener('pause', sync);
    btn.addEventListener('click', () => {
      if (v.paused) { userPaused.delete(v); if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); }
      else { userPaused.add(v); v.pause(); }
    });
    sync();
  });
  return userPaused;
}

/* ---------------------------------------------------------------- cursor label (fine pointers only) */
export function cursor() {
  const c = $('[data-cursor]');
  if (!c || !env.finePointer) return;
  const label = $('span', c);
  let x = 0, y = 0, raf = 0;
  const move = () => { c.style.transform = `translate3d(${x}px, ${y}px, 0)`; raf = 0; };
  window.addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(move);
    const t = e.target.closest('[data-cursor-label]');
    c.classList.toggle('is-on', !!t);
    if (t) label.textContent = t.dataset.cursorLabel;
  }, { passive: true });
  document.addEventListener('pointerleave', () => c.classList.remove('is-on'));
}

/* ---------------------------------------------------------------- AI summary links (Mellow, PDF §09) */
export function aiLinks() {
  const links = $$('[data-ai]');
  if (!links.length) return;
  // Only the public site URL and this fixed prompt leave the page.
  const url = new URL(root(), location.href).href;
  const prompt = `Visit ${url} — the website of Tifferend, a creative branding studio. Summarise what Tifferend does, the work they have published and how they approach projects, and suggest what to ask them on a first call.`;
  const q = encodeURIComponent(prompt);
  links.forEach((a) => {
    a.href = a.dataset.ai === 'claude' ? `https://claude.ai/new?q=${q}` : `https://chatgpt.com/?q=${q}`;
  });
}

/* ---------------------------------------------------------------- magnetic buttons (technique after React Bits "Magnet", rewritten in vanilla JS) */
export function magnets() {
  if (env.reduced || !env.finePointer) return;
  $$('.btn, .tst__play-i').forEach((el) => {
    const strength = el.classList.contains('btn') ? 0.28 : 0.18;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * strength}px, ${(e.clientY - (r.top + r.height / 2)) * strength}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ---------------------------------------------------------------- back to top */
export function toTop(lenis) {
  $$('[data-top]').forEach((a) =>
    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (lenis) lenis.scrollTo(0); else window.scrollTo({ top: 0, behavior: env.reduced ? 'auto' : 'smooth' });
      $('#main')?.focus({ preventScroll: true });
    })
  );
}
