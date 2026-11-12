// Hero wordmark: seven independent 3D glyph stacks (see wm3() in scripts/shell.mjs), clean white faces
// over a shallow warm extrusion, over the production footage. The word opens as DIFFERENT, then the logo's
// own d and t dance past each other and trade places: TIFFEREND. Every 5 s it swaps back, and so on.
//   .g3      scroll beat (lift-off) + cursor springs (x / y / rotation / scale)
//   .g3__s   the DIFFERENT ⇄ TIFFEREND swap (xPercent / yPercent / rotation / z / scale)
//   .g3__p   waves and occasional single-letter gestures
//   .g3__in  slow organic idle drift, each property on its own clock
// Transforms only, on HTML elements: the compositor does the work.
import { env, $, $$ } from './env.js';

let swapsStarted = false; // the DIFFERENT ⇄ TIFFEREND cycle runs once per page load, whatever calls heroMotion

export async function heroMotion({ handedOff }) {
  const stage = $('[data-hero-mark]');
  if (!stage) return;
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  const hero = $('[data-hero]');
  const wm = $('[data-wm3]', stage);
  const outers = $$('.g3', wm);
  const pointers = $$('.g3__p', wm);
  const inners = $$('.g3__in', wm);
  const swaps = $$('.g3__s', wm);
  const sxOf = outers.map((o) => parseFloat(o.dataset.sx) || 0); // xPercent of each glyph in DIFFERENT
  const desktop = matchMedia('(min-width: 900px) and (hover: hover)').matches;
  const amp = desktop ? 1 : 0.6;

  if (env.reduced) return; // static logo: TIFFEREND, the poster instead of the film

  // ---- entrance: the word arrives as DIFFERENT. Set the swapped positions first, then the letters rise
  // into place from the centre out. With the loader's hand-off, the landed logo (TIFFEREND) steps down out
  // of the way first, so the opening always reads DIFFERENT → TIFFEREND.
  const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
  if (handedOff) intro.to(outers, { yPercent: 40, opacity: 0, duration: 0.38, ease: 'power2.in', stagger: { each: 0.03, from: 'center' } });
  intro.add(() => swaps.forEach((el, i) => gsap.set(el, { xPercent: sxOf[i] })))
    .fromTo(outers, { yPercent: 70, rotationX: -50, opacity: 0 }, { yPercent: 0, rotationX: 0, opacity: 1, duration: 1.5, stagger: { each: 0.07, from: 'center' }, immediateRender: !handedOff })
    .from(stage, { rotationY: -12, z: -160, duration: 2, ease: 'expo.out' }, handedOff ? 0.38 : 0);
  const settled = intro.duration();
  const R = gsap.utils.random;

  // ---- idle: every glyph floats on its own slow clock; small amplitudes, soft eases
  const idle = [];
  inners.forEach((el, i) => {
    const weight = 0.85 + (parseFloat(outers[i].style.width) / 100) * 1.6; // wider glyphs move slower
    const move = (vars, dMin, dMax) => idle.push(gsap.to(el, {
      ...vars, duration: () => R(dMin, dMax) * weight, ease: 'sine.inOut',
      repeat: -1, repeatRefresh: true, delay: settled * 0.6 + R(0, 1.2),
    }));
    move({ yPercent: () => R(-4.5, 4.5) * amp }, 2.6, 4.4);
    move({ xPercent: () => R(-1.2, 1.2) * amp }, 3.2, 5.2);
    move({ rotation: () => R(-2.6, 2.6) * amp }, 3, 4.8);
    move({ rotationY: () => R(-9, 9) * amp, rotationX: () => R(-5, 5) * amp }, 3.4, 5.6);
    move({ z: () => R(-24, 30) * amp }, 3.6, 6);
  });

  // ---- choreography on .g3__p: waves across the word, and now and then one letter's own gesture
  const atHero = () => document.body.classList.contains('at-hero');
  let swapping = false, nextSwap = Infinity; // set by the swap cycle below
  const free = (d) => !swapping && nextSwap - gsap.ticker.time > d + 0.3; // room for a d-second move before the next swap
  const wave = () => {
    gsap.delayedCall(R(7, 11), wave);
    if (!atHero() || !free(2)) return;
    const from = Math.random() < 0.5 ? 'start' : 'end';
    const st = { each: R(0.07, 0.1), from };
    const tilt = (Math.random() < 0.5 ? -1 : 1) * R(3, 5) * amp;
    gsap.timeline()
      .to(pointers, { yPercent: -9 * amp, xPercent: (i) => (i - 3) * 0.9 * amp, rotation: (i) => (i % 2 ? tilt : -tilt), rotationX: 10 * amp, duration: 0.55, ease: 'power2.out', stagger: st, overwrite: 'auto' })
      .to(pointers, { yPercent: 0, xPercent: 0, rotation: 0, rotationX: 0, duration: 1.4, ease: 'elastic.out(1, 0.55)', stagger: st }, 0.5);
  };
  const gestures = [
    (p) => gsap.timeline().to(p, { yPercent: -14 * amp, rotation: R(-7, 7), duration: 0.6, ease: 'power3.out' }).to(p, { yPercent: 0, rotation: 0, duration: 1.3, ease: 'elastic.out(1, 0.5)' }),  // lift + tilt
    (p) => gsap.timeline().to(p, { rotationX: -24 * amp, z: 60, duration: 0.5, ease: 'power2.out' }).to(p, { rotationX: 0, z: 0, duration: 1.2, ease: 'back.out(2)' }),                         // a nod
  ];
  const gesture = () => {
    gsap.delayedCall(R(4.5, 8), gesture);
    if (!atHero() || !free(1.9)) return;
    const i = Math.floor(Math.random() * pointers.length);
    if (gsap.isTweening(pointers[i])) return;
    gestures[Math.floor(Math.random() * gestures.length)](pointers[i]);
  };
  gsap.delayedCall(settled + 1.4, wave);
  gsap.delayedCall(settled + 4.5, gesture);

  // ---- DIFFERENT ⇄ TIFFEREND: the d and t detach, travel in opposite directions on arcs (one over the
  // word, one under, one passing in front of the other), lean into the move, cross, and land with a small
  // controlled settle; the letters between ease aside a touch as each passes. Swaps start every 5 s.
  const PERIOD = 5, SWAP = 1.7;
  let different = true, swapTl = null;
  const now = () => gsap.ticker.time;
  const xE = gsap.parseEase('back.inOut(1.1)'); // a small anticipation as they detach, a small overshoot as they land
  const arcE = gsap.parseEase('sine.inOut');
  const swap = () => {
    if (swapTl?.isActive()) return;
    const toDifferent = !different;
    const from = swaps.map((el) => gsap.getProperty(el, 'xPercent'));
    const to = sxOf.map((v) => (toDifferent ? v : 0));
    const sets = swaps.map((el) => ({
      x: gsap.quickSetter(el, 'xPercent'), y: gsap.quickSetter(el, 'yPercent'),
      r: gsap.quickSetter(el, 'rotation', 'deg'), z: gsap.quickSetter(el, 'z', 'px'), sc: gsap.quickSetter(el, 'scale'),
    }));
    const last = swaps.length - 1;
    // the travelling letter that is currently first goes over the word, the last one under it
    const over = toDifferent ? last : 0, under = toDifferent ? 0 : last;
    const q = { p: 0 };
    swapping = true; different = toDifferent;
    swapTl = gsap.timeline({ onComplete: () => { swapping = false; } })
      .to(q, {
        p: 1, duration: SWAP, ease: 'none',
        onUpdate: () => {
          const p = q.p, e = xE(p), a = Math.sin(Math.PI * arcE(p));
          swaps.forEach((el, i) => {
            const st = sets[i];
            if (i === over || i === under) {
              const dir = i === over ? -1 : 1; // over: up and toward the viewer; under: down and away
              st.x(from[i] + (to[i] - from[i]) * e);
              st.y(dir * 46 * a * amp);
              st.r(dir * -9 * Math.sin(Math.PI * p) * amp); // a lean into the turn, upright again on landing
              st.z(-dir * 140 * a);
              st.sc(1 + 0.05 * a);
            } else {
              // make room: a gentle slide toward the new centring, and a small give as a letter passes
              st.x(from[i] + (to[i] - from[i]) * arcE(p));
              st.y(Math.sin(Math.PI * p) * 3.5 * amp * (i % 2 ? 1 : -1));
            }
          });
        },
      })
      // landing: a quick, small squash and recovery on the two travellers
      .to([swaps[over], swaps[under]], { keyframes: { scaleY: [1, 0.95, 1.015, 1], scaleX: [1, 1.03, 0.995, 1] }, duration: 0.55, ease: 'power2.out' }, SWAP - 0.08);
  };
  const cycle = () => {
    nextSwap = now() + PERIOD;
    gsap.delayedCall(PERIOD, cycle);
    if (atHero() && !document.hidden) swap(); // off screen: hold the current word, keep the rhythm
  };
  const flipOne = () => {
    gsap.delayedCall(R(11, 15.8), flipOne);
    if (!atHero() || !free(1.4)) return;
    const p = pointers[Math.floor(Math.random() * pointers.length)];
    if (gsap.isTweening(p)) return;
    gsap.timeline().to(p, { rotationY: 360, duration: 1.4, ease: 'power3.inOut' }).set(p, { rotationY: 0 });
  };
  if (!swapsStarted) {
    swapsStarted = true;
    const first = settled + 0.9; // DIFFERENT holds a beat once it has landed, then becomes TIFFEREND
    nextSwap = now() + first;
    gsap.delayedCall(first, cycle);
    gsap.delayedCall(first + R(9, 12), flipOne);
  }

  // ---- cursor: nearby letters shift and tilt on springs; part of the push travels to neighbours;
  // speed adds a little. Clamped small so the word always reads, and it settles home.
  const sx = gsap.quickTo(stage, 'rotationX', { duration: 1.4, ease: 'power3.out' });
  const sy = gsap.quickTo(stage, 'rotationY', { duration: 1.4, ease: 'power3.out' });
  const spring = outers.map(() => ({ x: 0, y: 0, r: 0, s: 0, vx: 0, vy: 0, vr: 0, vs: 0, fx: 0, fy: 0, fr: 0, fs: 0 }));
  const setters = outers.map((o) => ({ x: gsap.quickSetter(o, 'x', 'px'), y: gsap.quickSetter(o, 'y', 'px'), r: gsap.quickSetter(o, 'rotation', 'deg'), sx: gsap.quickSetter(o, 'scaleX'), sy: gsap.quickSetter(o, 'scaleY') }));
  // Rest boxes (spring offset removed). Re-measured lazily: the entrance and the idle drift move them.
  let boxes = [], measured = 0;
  const measure = () => {
    measured = performance.now();
    boxes = swaps.map((o, i) => { const r = o.getBoundingClientRect(), s = spring[i]; return { x: r.left + r.width / 2 - s.x, y: r.top + r.height / 2 - s.y, w: r.width, h: r.height }; });
  };
  addEventListener('resize', () => { measured = 0; });
  const P = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: performance.now() };
  const onPointer = (e) => {
    const now = performance.now(), dt = Math.max(8, now - P.t);
    P.vx = ((e.clientX - P.x) / dt) * 16; P.vy = ((e.clientY - P.y) / dt) * 16; // px per frame
    if (Math.abs(P.vx) > 400) { P.vx = 0; P.vy = 0; } // first contact jump
    P.x = e.clientX; P.y = e.clientY; P.t = now;
    if (!atHero()) return;
    if (now - measured > 400) measure();
    if (e.pointerType === 'mouse') {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      sy(nx * 8); sx(-ny * 6);
    }
    const speed = Math.min(2, Math.hypot(P.vx, P.vy) / 18);
    boxes.forEach((b, i) => {
      const dx = b.x - e.clientX, dy = b.y - e.clientY;
      const reach = b.h * 0.75;
      const near = Math.exp(-(dx * dx + dy * dy) / (2 * reach * reach));
      if (near < 0.01) return;
      const f = near * (1 + speed * 0.8);
      const len = Math.hypot(dx, dy) || 1;
      const s = spring[i];
      s.fx += (dx / len) * f * b.w * 0.07 + P.vx * near * 0.12;   // a nudge away, a little drag along
      s.fy += (dy / len) * f * b.h * 0.06 + P.vy * near * 0.08;
      s.fr += (dx >= 0 ? 1 : -1) * f * 1.6 + P.vx * near * 0.05;
      s.fs += f * 0.02;
    });
    // the push travels on through the neighbours, softer each step
    for (let i = 0; i < 7; i++) {
      const s = spring[i];
      if (spring[i - 1]) { spring[i - 1].fy += s.fy * 0.25; spring[i - 1].fr -= s.fr * 0.2; }
      if (spring[i + 1]) { spring[i + 1].fy += s.fy * 0.25; spring[i + 1].fr -= s.fr * 0.2; }
    }
  };
  addEventListener('pointermove', onPointer, { passive: true });
  addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { P.x = e.clientX; P.y = e.clientY; P.vx = P.vy = 0; onPointer(e); } }, { passive: true });
  const STIFF = 120, DAMP = 14, K = 8; // gently underdamped: a small overshoot, then home
  const stepSprings = (dt) => {
    spring.forEach((s, i) => {
      s.vx += s.fx * K; s.vy += s.fy * K; s.vr += s.fr * K; s.vs += s.fs * K;
      s.fx = s.fy = s.fr = s.fs = 0;
      s.vx += (-STIFF * s.x - DAMP * s.vx) * dt; s.vy += (-STIFF * s.y - DAMP * s.vy) * dt;
      s.vr += (-STIFF * s.r - DAMP * s.vr) * dt; s.vs += (-STIFF * s.s - DAMP * s.vs) * dt;
      s.x += s.vx * dt; s.y += s.vy * dt; s.r += s.vr * dt; s.s += s.vs * dt;
      const b = boxes[i], mx = b ? b.w * 0.16 : 30, my = b ? b.h * 0.12 : 24; // readable: small excursions only
      s.x = Math.max(-mx, Math.min(mx, s.x)); s.y = Math.max(-my, Math.min(my, s.y));
      s.r = Math.max(-7, Math.min(7, s.r)); s.s = Math.max(-0.05, Math.min(0.07, s.s));
      const st = setters[i];
      st.x(s.x); st.y(s.y); st.r(s.r); st.sx(1 + s.s * 0.5); st.sy(1 + s.s);
    });
  };

  // ---- light: a small warm source runs along stretches of a letter's outline — calm glides and short
  // bursts, an occasional glint — then hops to another letter (often the one nearest the pointer) as a
  // spark on a small arc. Dash offsets keep accumulating, so nothing ever visibly resets.
  const spark = $('[data-hero-spark]');
  const pin = $('[data-hero-pin]');
  const lights = $$('.g3__light', wm).map((svg, i) => {
    // measure on an untouched copy of the outline (the shared path carries pathLength = 1)
    const src = document.getElementById(`wg${i}`);
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    probe.setAttribute('d', src ? src.getAttribute('d') : '');
    return { svg, i, probe, head: $('.lt--head', svg), tail: $('.lt--tail', svg), bloom: $('.lt--bloom', svg) };
  });
  if (spark && pin && lights.length) {
    const measureSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    measureSvg.setAttribute('aria-hidden', 'true');
    measureSvg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    lights.forEach((l) => measureSvg.appendChild(l.probe));
    document.body.appendChild(measureSvg);
    const L = { off: 0, glow: 1 };
    let cur = null;
    const paint = () => {
      if (!cur) return;
      cur.head.style.strokeDashoffset = -L.off;
      cur.tail.style.strokeDashoffset = -(L.off - 0.048);
      cur.bloom.style.strokeDashoffset = -(L.off - 0.009);
      cur.bloom.style.opacity = Math.min(1, L.glow);
      cur.head.style.strokeWidth = 8 * (0.8 + 0.2 * L.glow);
    };
    // where a fraction of the outline sits on screen, relative to the hero stage (ignores the 3D tilt)
    const at = (l, frac) => {
      const len = l.probe.getTotalLength();
      const p = l.probe.getPointAtLength((((frac % 1) + 1) % 1) * len);
      const vb = l.svg.viewBox.baseVal, r = l.svg.getBoundingClientRect(), pr = pin.getBoundingClientRect();
      return { x: r.left - pr.left + ((p.x - vb.x) / vb.width) * r.width, y: r.top - pr.top + ((p.y - vb.y) / vb.height) * r.height };
    };
    const pick = () => {
      const others = lights.filter((l) => l !== cur && !(swapping && (l.i === 0 || l.i === lights.length - 1)));
      if (P.x > -1e3 && boxes.length && Math.random() < 0.45) { // drawn toward the pointer
        let best = others[0], bd = Infinity;
        others.forEach((l) => { const b = boxes[l.i]; if (!b) return; const d = Math.hypot(b.x - P.x, b.y - P.y); if (d < bd) { bd = d; best = l; } });
        return best;
      }
      return others[Math.floor(Math.random() * others.length)];
    };
    const glide = () => {
      const tl = gsap.timeline({ onUpdate: paint, onComplete: visit });
      const energetic = Math.random() < 0.35;
      const n = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < n; k++) {
        const dist = R(0.07, 0.3) * (Math.random() < 0.22 ? -1 : 1);
        tl.to(L, { off: `+=${dist}`, duration: energetic ? R(0.28, 0.55) : R(0.9, 1.9), ease: energetic ? 'expo.inOut' : 'sine.inOut' });
        if (Math.random() < 0.4) tl.to(L, { glow: 2, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' }, '<40%'); // glint
        tl.to({}, { duration: R(0.05, energetic ? 0.2 : 0.6) });
      }
    };
    const arrive = (next, start) => {
      if (cur) { const prev = cur; gsap.to(prev.svg, { opacity: 0, duration: 0.15, onComplete: () => prev.svg.classList.remove('is-lit') }); }
      cur = next; L.off = start; L.glow = 1.6; paint();
      cur.svg.classList.add('is-lit');
      gsap.to(cur.svg, { opacity: 1, duration: 0.2 });
      gsap.to(L, { glow: 1, duration: 0.5, ease: 'power2.out' });
      glide();
    };
    const hop = (a, b, done) => {
      const lift = 26 + Math.abs(b.x - a.x) * 0.16;
      const mid = { x: (a.x + b.x) / 2, y: Math.min(a.y, b.y) - lift };
      const q = { t: 0 };
      gsap.set(spark, { x: a.x, y: a.y, opacity: 1, scale: 1 });
      gsap.to(q, {
        t: 1, duration: R(0.32, 0.5), ease: 'power2.inOut',
        onUpdate: () => { const t = q.t, u = 1 - t; gsap.set(spark, { x: u * u * a.x + 2 * u * t * mid.x + t * t * b.x, y: u * u * a.y + 2 * u * t * mid.y + t * t * b.y }); },
        onComplete: () => { gsap.to(spark, { opacity: 0, scale: 0.4, duration: 0.25 }); done(); },
      });
    };
    function visit() {
      if (!atHero()) { if (cur) gsap.to(cur.svg, { opacity: 0, duration: 0.2 }); return gsap.delayedCall(1.5, () => { cur = null; visit(); }); }
      const next = pick(), start = Math.random();
      if (!cur) return arrive(next, start);
      const a = at(cur, L.off + 0.006), b = at(next, start);
      gsap.delayedCall(Math.random() < 0.3 ? R(0.4, 1.4) : 0, () => hop(a, b, () => arrive(next, start))); // sometimes a calm pause first
    }
    gsap.delayedCall(settled + 3.2, visit);
  }

  // ---- render on the shared gsap ticker, only while the hero is on screen
  let onScreen = true;
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    idle.forEach((t) => (onScreen ? t.resume() : t.pause()));
  }).observe(hero);
  gsap.ticker.add((time, deltaMs) => {
    if (!onScreen) return;
    stepSprings(Math.min(0.033, (deltaMs || 16) / 1000));
  });

  // ---- scroll beat. scrub: true — Lenis already smooths the scroll; a second lag felt sticky.
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: true },
    });
    outers.forEach((o, i) => {
      tl.to(o, { yPercent: -130, rotationX: 60, z: 160, opacity: 0, ease: 'power2.in', duration: 0.42 }, 0.08 + i * 0.045);
    });
    tl.to(stage, { rotationX: 26, z: -220, ease: 'power1.in', duration: 1 }, 0)
      .fromTo('[data-hero-media]', { scale: 1.12 }, { scale: 1, duration: 1 }, 0)
      .to('[data-hero-foot]', { yPercent: 50, opacity: 0, duration: 0.3 }, 0)
      .to('.hero .vidctl', { opacity: 0, duration: 0.2 }, 0);
    return () => tl.kill();
  });
  mm.add('(max-width: 899px)', () => {
    const t = gsap.to('.hero__title', { yPercent: -70, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    return () => t.kill();
  });
}
