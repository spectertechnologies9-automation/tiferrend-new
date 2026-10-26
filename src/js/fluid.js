// Fluid layer: the site's watery visual language, applied to real content.
//
// Images. One shared WebGL2 context renders a registered image only while it is *active*, then copies
// the frame into a 2D canvas laid exactly over the <img> (same box, same transform, same filter):
//   reveal   a liquid front rises through the image, bending and splitting colour at its edge
//   bend     the picture bows with scroll velocity, like a sheet moving through water
//   ripple   on hover, rings run out from the pointer with a slight chromatic split
//   swap     two images exchange through a flowing threshold (services background)
// When nothing is moving, the canvas is hidden and the plain <img> shows: idle cost is zero.
//
// Type. SVG turbulence + displacement filters liquefy headings (and the footer wordmark) for the length
// of their reveal, then come off again. Filters never touch the 3D hero (they would flatten it).
//
// Everything runs on the shared gsap.ticker. Reduced motion: never initialised.
import { env, $$ } from './env.js';

const VS = `#version 300 es
in vec2 aP; out vec2 vUv;
void main(){ vUv = aP; gl_Position = vec4(aP.x * 2. - 1., 1. - aP.y * 2., 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
in vec2 vUv; out vec4 o;
uniform sampler2D uA, uB;
uniform vec4 uMapA, uMapB;        // cover mapping: texUv = uv * xy + zw
uniform float uT, uReveal, uHover, uVel, uSwap, uAspect, uSeed;
uniform vec2 uMouse;
float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), u.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), u.x), u.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return v; }
vec3 sampleRGB(sampler2D s, vec4 m, vec2 uv, vec2 ca){
  vec2 t = uv * m.xy + m.zw;
  return vec3(texture(s, clamp(t + ca, 0., 1.)).r, texture(s, clamp(t, 0., 1.)).g, texture(s, clamp(t - ca, 0., 1.)).b);
}
void main(){
  vec2 uv = vUv;
  float t = uT;
  // bend: the sheet bows along the direction of travel
  uv.y -= sin(uv.x * 3.14159) * uVel * .14; // ×2 on client request (session 7)
  vec2 q = uv * vec2(uAspect, 1.) * 2.4 + uSeed;
  float n1 = fbm(q + vec2(0., t * .22)), n2 = fbm(q * 1.3 + vec2(t * .17, 3.1));
  vec2 flow = vec2(n1, n2) - .5;
  // ripple rings from the pointer
  vec2 dm = (uv - uMouse) * vec2(uAspect, 1.);
  float d = length(dm);
  float rip = sin(d * 34. - t * 6.5) * exp(-d * 4.5) * uHover;
  vec2 disp = dm / (d + 1e-4) * rip * .0178 + flow * (.025 * uHover + .06 * abs(uVel)); // ×2 on client request
  // reveal: a liquid front rising from the bottom edge
  float field = (1. - vUv.y) * .8 + n1 * .45;
  float front = uReveal * 1.45 - .2;
  float band = 1. - smoothstep(0., .2, abs(field - front));
  float alpha = smoothstep(front + .015, front - .03, field);
  disp += vec2(flow.x * .16, -.14) * band * (1. - uReveal);
  // swap: the same kind of front, travelling across the frame
  float sfield = vUv.x * .7 + (1. - vUv.y) * .2 + n2 * .5;
  float sfront = uSwap * 1.5 - .25;
  float sband = 1. - smoothstep(0., .22, abs(sfield - sfront));
  float sw = smoothstep(sfront + .02, sfront - .04, sfield);
  disp += flow * .18 * sband * step(.001, uSwap) * step(uSwap, .999);
  vec2 dir = normalize(flow + 1e-4);
  vec2 ca = dir * (.0012 + .02 * band * (1. - uReveal) + .008 * abs(uVel) + .00426 * uHover + .016 * sband);
  vec3 a = sampleRGB(uA, uMapA, uv + disp, ca);
  vec3 col = a;
  if (uSwap > 0.) col = mix(a, sampleRGB(uB, uMapB, uv + disp, ca), sw);
  o = vec4(col * alpha, alpha);
}`;

// ---------------------------------------------------------------- type: SVG liquid filters
// The displacement source is a pre-rendered smooth-noise image (feImage), not feTurbulence: turbulence is
// generated on the CPU per frame and cost a 70–80 ms frame on a heading-sized area.
let defs = null;
const FILTERS = 4;
let nextFilter = 0;
function noiseMap() {
  const W = 512, H = 128, gx = 18, gy = 6, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d'), img = ctx.createImageData(W, H);
  const grid = (seed) => Array.from({ length: (gx + 1) * (gy + 1) }, (_, i) => { const v = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453; return v - Math.floor(v); });
  const R = grid(1), G = grid(2);
  const at = (g, x, y) => {
    const fx = (x / W) * gx, fy = (y / H) * gy, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty), k = (i, j) => g[(iy + j) * (gx + 1) + ix + i];
    return (k(0, 0) * (1 - sx) + k(1, 0) * sx) * (1 - sy) + (k(0, 1) * (1 - sx) + k(1, 1) * sx) * sy;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    img.data[i] = at(R, x, y) * 255; img.data[i + 1] = at(G, x, y) * 255; img.data[i + 2] = 128; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL();
}
function ensureDefs() {
  if (defs) return;
  const ns = 'http://www.w3.org/2000/svg';
  const map = noiseMap();
  defs = document.createElementNS(ns, 'svg');
  defs.setAttribute('aria-hidden', 'true');
  defs.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  defs.innerHTML = Array.from({ length: FILTERS }, (_, i) => `<filter id="liq${i}" x="-8%" y="-30%" width="116%" height="160%" color-interpolation-filters="sRGB">
    <feImage href="${map}" x="0" y="0" width="100" height="100" preserveAspectRatio="none" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>`).join('');
  document.body.appendChild(defs);
}

// Liquefy an element for one reveal: displacement eases from `scale` to 0 while the noise drifts.
export async function liquid(el, { scale = 70, duration = 1.6, delay = 0 } = {}) {
  if (env.reduced || !el) return;
  const { gsap } = await import('gsap');
  ensureDefs();
  const i = nextFilter++ % FILTERS;
  const f = defs.querySelector(`#liq${i}`);
  const disp = f.querySelector('feDisplacementMap'), im = f.querySelector('feImage');
  // the noise covers the element's filter region (user space = the element's box, in px)
  const w = el.offsetWidth || el.getBoundingClientRect().width, h = el.offsetHeight || el.getBoundingClientRect().height;
  im.setAttribute('width', (w * 1.6).toFixed(0)); im.setAttribute('height', (h * 1.6).toFixed(0));
  im.setAttribute('y', (-h * 0.3).toFixed(0));
  const s = { k: scale, x: -w * 0.1 };
  el.style.filter = `url(#liq${i})`;
  gsap.fromTo(s, { k: scale, x: -w * 0.1 }, {
    k: 0, x: -w * 0.45, duration, delay, ease: 'power3.out',
    onUpdate: () => { disp.setAttribute('scale', s.k.toFixed(2)); im.setAttribute('x', s.x.toFixed(1)); }, // the noise drifts as it calms
    onComplete: () => { if (el.style.filter.includes(`liq${i}`)) el.style.filter = ''; },
  });
}

// ---------------------------------------------------------------- images: shared WebGL engine
export async function initFluid() {
  if (env.reduced) return;
  const { gsap } = await import('gsap');
  const fine = env.finePointer && matchMedia('(min-width: 900px)').matches;

  // headings liquefy as they arrive (their word reveal runs underneath)
  const headIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting && e.boundingClientRect.top > 0) return;
    headIO.unobserve(e.target);
    // displacement scales with the type: ×2 the earlier strength relative to letter height (≈1.4 em).
    // A fixed px value would grow relative to smaller headlines and tear the letters apart.
    const em = parseFloat(getComputedStyle(e.target).fontSize) || 40;
    liquid(e.target, { scale: Math.min(150, em * 1.4), duration: 2 });
  }), { rootMargin: '0px 0px -8% 0px' });
  $$('.h-xl[data-split], .h-xxl[data-split], .h-lg[data-split], .statement').forEach((el) => headIO.observe(el));

  const glc = document.createElement('canvas');
  const gl = glc.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return;
  const prog = gl.createProgram();
  for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('fluid shader', gl.getShaderInfoLog(s)); return; }
    gl.attachShader(prog, s);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  // a finely subdivided strip is unnecessary: displacement happens per pixel in UV space
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(prog, 'aP');
  gl.enableVertexAttribArray(aP);
  gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uA', 'uB', 'uMapA', 'uMapB', 'uT', 'uReveal', 'uHover', 'uVel', 'uSwap', 'uAspect', 'uSeed', 'uMouse'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
  gl.uniform1i(U.uA, 0); gl.uniform1i(U.uB, 1);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

  // texture cache (small LRU: large photos are several MB of GPU memory each)
  const cache = new Map();
  const uploads = [];
  const texture = (src) => {
    if (!src) return null;
    const hit = cache.get(src);
    if (hit) { cache.delete(src); cache.set(src, hit); return hit; }
    const entry = { tex: null, w: 0, h: 0 };
    const im = new Image();
    im.decoding = 'async';
    // decode + downscale off the main thread, then upload one texture per frame while scrolling is calm:
    // a synchronous upload of a full-size photo cost 50–100 ms frames mid-scroll
    im.onload = () => {
      const w = Math.min(im.naturalWidth, 1280), h = Math.round(im.naturalHeight * (w / im.naturalWidth));
      const ready = (src) => uploads.push({ entry, src, w: im.naturalWidth, h: im.naturalHeight });
      if (window.createImageBitmap) createImageBitmap(im, { resizeWidth: w, resizeHeight: h, resizeQuality: 'medium' }).then(ready, () => ready(im));
      else ready(im);
    };
    im.src = src;
    cache.set(src, entry);
    while (cache.size > 10) { const [k, v] = cache.entries().next().value; if (v.tex) gl.deleteTexture(v.tex); cache.delete(k); }
    return entry;
  };
  const srcOf = (img) => (img.tagName === 'VIDEO' ? img.getAttribute('poster') : img.currentSrc || img.src) || '';

  // object-fit: cover + object-position → uv transform
  const coverMap = (tex, w, h, pos) => {
    const ra = w / h, rt = tex.w / tex.h;
    let sx = 1, sy = 1;
    if (rt > ra) sx = ra / rt; else sy = rt / ra;
    return [sx, sy, (1 - sx) * pos[0], (1 - sy) * pos[1]];
  };
  const objPos = (img) => {
    const p = getComputedStyle(img).objectPosition.split(' ').map((v) => (v.endsWith('%') ? parseFloat(v) / 100 : 0.5));
    return [p[0] ?? 0.5, p[1] ?? 0.5];
  };

  const items = [];
  const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 600 }) : setTimeout(fn, 120));
  const size = (it) => {
    const box = it.cover || it.img;
    const cw = Math.min(2048, Math.round(box.offsetWidth * PX)), ch = Math.min(2048, Math.round(box.offsetHeight * PX));
    if (cw && ch && (it.cv.width !== cw || it.cv.height !== ch)) { it.cv.width = cw; it.cv.height = ch; }
  };
  const PX = Math.min(devicePixelRatio || 1, 1.5);
  const add = (img, host, modes) => {
    if (!img || !host || items.some((it) => it.img === img)) return null;
    const cv = document.createElement('canvas');
    cv.className = 'fl-cv';
    host.classList.add('fl-host');
    cv.setAttribute('aria-hidden', 'true');
    img.after(cv);
    const it = { img, host, cv, ctx: cv.getContext('2d'), modes, reveal: 1, hover: 0, mouse: [0.5, 0.5], swap: 0, from: null, to: null, seed: Math.random() * 10, visible: false, on: false, hidden: false };
    items.push(it);
    if (modes.hover && fine) {
      host.addEventListener('pointerenter', () => gsap.to(it, { hover: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' }));
      host.addEventListener('pointerleave', () => gsap.to(it, { hover: 0, duration: 1.1, ease: 'power2.inOut', overwrite: 'auto' }));
      host.addEventListener('pointermove', (e) => {
        const r = img.getBoundingClientRect();
        it.mouse = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
      }, { passive: true });
    }
    if (modes.reveal) {
      const below = host.getBoundingClientRect().top > innerHeight;
      if (below) { it.reveal = 0; img.classList.add('fl-hide'); it.hidden = true; }
      revealIO.observe(host);
    }
    visIO.observe(host); viewIO.observe(host);
    return it;
  };
  const visIO = new IntersectionObserver((es) => es.forEach((e) => {
    items.forEach((it) => {
      if (it.host !== e.target || !e.isIntersecting) return;
      texture(srcOf(it.img));
      idle(() => size(it)); // allocate its canvas before it is needed, not mid-scroll
    });
  }), { rootMargin: '50% 0px' });
  const viewIO = new IntersectionObserver((es) => es.forEach((e) => {
    items.forEach((it) => { if (it.host === e.target) it.visible = e.isIntersecting; });
  }));
  const revealIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    revealIO.unobserve(e.target);
    items.forEach((it) => {
      if (it.host !== e.target || !it.hidden) return;
      const tex = texture(srcOf(it.img));
      const start = () => gsap.to(it, { reveal: 1, duration: 1.35, ease: 'power2.inOut', onComplete: () => { it.img.classList.remove('fl-hide'); it.hidden = false; } });
      if (tex?.tex) start();
      else { // not decoded yet: give it a moment, otherwise show the plain image
        let tries = 0;
        const wait = () => { if (tex?.tex) start(); else if (++tries < 12) setTimeout(wait, 50); else { it.reveal = 1; it.img.classList.remove('fl-hide'); it.hidden = false; } };
        wait();
      }
    });
  }), { threshold: 0.05 });

  // ---- registry: which content gets which behaviour (intensity varies with the content)
  const reg = (hostSel, imgSel, modes) => $$(hostSel).forEach((host) => {
    const img = typeof imgSel === 'function' ? imgSel(host) : host.querySelector(imgSel);
    if (!img || (img.tagName === 'VIDEO' && !img.getAttribute('poster'))) return;
    if (modes.reveal) host.removeAttribute('data-flow'); // the GL reveal replaces the CSS wave
    add(img, host, modes);
  });
  reg('.tile', '.tile__img', { hover: true, bend: true });                         // work tiles: ripple + bend (the scrubbed wave clip stays)
  reg('.hz__frame', 'img', { hover: true, bend: true });                           // studio strip
  reg('.ps__frame', 'img', { reveal: true, hover: true, bend: true });              // project imagery
  reg('.pj__cover', 'img', { hover: true, bend: true });
  reg('.pj__next', '.pj__next-img', { hover: true, bend: true });                    // next-project panel
  reg('.strip__item:not(.strip__item--video)', 'img', { reveal: true, hover: true, bend: true }); // about strip
  reg('.tst__card:not(.tst__card--portrait) .tst__media', 'video', { reveal: true, hover: true }); // testimonial posters, off once playing; portrait samples are letterboxed and a cover-mapped GL copy would crop them

  // services: the full-bleed preview exchanges images through the liquid front
  const svcBg = document.querySelector('.svc__bg');
  if (svcBg) {
    const imgs = [...svcBg.querySelectorAll('.svc__img')];
    const last = imgs[imgs.length - 1];
    const it = add(last, svcBg, { swap: true });
    if (it) {
      it.cover = svcBg;
      let cur = imgs.find((im) => im.classList.contains('is-active')) || imgs[0];
      imgs.forEach((im) => texture(srcOf(im)));
      new MutationObserver(() => {
        const next = imgs.find((im) => im.classList.contains('is-active'));
        if (!next || next === cur) return;
        const a = texture(srcOf(cur)), b = texture(srcOf(next));
        cur = next;
        if (!a?.tex || !b?.tex) return; // not decoded yet: the CSS crossfade underneath covers it
        it.from = a; it.to = b;
        gsap.fromTo(it, { swap: 0.0001 }, { swap: 1, duration: 1.15, ease: 'power2.inOut', overwrite: 'auto', onComplete: () => { it.swap = 0; } });
      }).observe(svcBg, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }
  }

  // ---- scroll velocity (works with Lenis and native scroll alike)
  let lastY = scrollY, vel = 0;
  // sized once up front: growing a WebGL drawing buffer mid-scroll is a long frame
  let glW = Math.min(2048, Math.round(innerWidth * PX)), glH = Math.min(2048, Math.round(innerHeight * PX));
  glc.width = glW; glc.height = glH;
  const start = performance.now();

  const draw = (it, t) => {
    const img = it.img;
    const box = it.cover || img;
    const w = box.offsetWidth, h = box.offsetHeight;
    if (!w || !h) return false;
    const cw = Math.min(2048, Math.round(w * PX)), ch = Math.min(2048, Math.round(h * PX));
    if (cw > glW || ch > glH) { glW = Math.max(glW, cw); glH = Math.max(glH, ch); glc.width = glW; glc.height = glH; }
    if (it.cv.width !== cw || it.cv.height !== ch) { it.cv.width = cw; it.cv.height = ch; }
    // lay the canvas over the image: same box, transform and filter
    const s = it.cv.style;
    if (!it.cover) {
      s.left = `${img.offsetLeft}px`; s.top = `${img.offsetTop}px`;
      const cs = getComputedStyle(img);
      s.transform = cs.transform; s.scale = cs.scale; s.translate = cs.translate; s.filter = cs.filter; // hover zooms use the scale property
    }
    s.width = `${w}px`; s.height = `${h}px`;
    let A, B = null, mapA, mapB = [1, 1, 0, 0];
    if (it.modes.swap) {
      A = it.from; B = it.to;
      if (!A?.tex || !B?.tex) return false;
      mapA = coverMap(A, w, h, [0.5, 0.5]); mapB = coverMap(B, w, h, [0.5, 0.5]);
    } else {
      A = texture(srcOf(img));
      if (!A?.tex) return false;
      mapA = coverMap(A, w, h, objPos(img));
    }
    gl.viewport(0, glH - ch, cw, ch);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, A.tex);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, (B || A).tex);
    gl.uniform4fv(U.uMapA, mapA); gl.uniform4fv(U.uMapB, mapB);
    gl.uniform1f(U.uT, t); gl.uniform1f(U.uReveal, it.reveal); gl.uniform1f(U.uHover, it.hover);
    gl.uniform1f(U.uVel, it.modes.bend ? vel : 0); gl.uniform1f(U.uSwap, it.swap);
    gl.uniform1f(U.uAspect, w / h); gl.uniform1f(U.uSeed, it.seed); gl.uniform2f(U.uMouse, it.mouse[0], it.mouse[1]);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    it.ctx.clearRect(0, 0, cw, ch);
    it.ctx.drawImage(glc, 0, 0, cw, ch, 0, 0, cw, ch); // viewport sits at the canvas's top-left in image space
    return true;
  };

  let calm = 0;
  const upload = () => {
    if (!uploads.length) return;
    calm = Math.abs(vel) < 0.03 ? calm + 1 : 0;
    if (calm < 3 && uploads.length < 6) return; // wait for a quiet moment unless a backlog builds
    const u = uploads.shift();
    u.entry.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, u.entry.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, u.src);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    u.entry.w = u.w; u.entry.h = u.h;
    u.src.close?.();
  };

  gsap.ticker.add(() => {
    const y = scrollY;
    const v = Math.max(-1, Math.min(1, ((y - lastY) / Math.max(1, innerHeight)) * 9));
    lastY = y;
    vel += (v - vel) * 0.12;
    if (Math.abs(vel) < 0.002) vel = 0;
    upload();
    const t = (performance.now() - start) / 1000;
    for (const it of items) {
      const playing = it.host.classList.contains('is-started') || it.host.classList.contains('is-playing');
      const active = it.visible && !playing && (
        (it.modes.reveal && it.reveal < 1) || it.hover > 0.004 || (it.modes.swap && it.swap > 0) || (it.modes.bend && fine && Math.abs(vel) > 0.025));
      const ok = active && draw(it, t);
      if (ok !== it.on) { it.on = ok; it.cv.classList.toggle('is-on', ok); }
      if (!ok && it.hidden && it.reveal >= 1) { it.img.classList.remove('fl-hide'); it.hidden = false; }
    }
  });
}
