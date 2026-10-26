// Astral layer: a live WebGL2 canvas between the background film and the wordmark.
//   stars      three depth layers drifting at different speeds + pointer parallax, fine twinkle; the
//              field moves like water: a slow swell along the wordmark band, rings from a moving pointer
//   embers     a few warm motes at three depths drifting on slow curves; some draw a fine curved
//              trail; each breathes in and out; kept clear of the hero copy and the navigation
//   streaks    occasional shooting particles (some ember), head bright, tail fading
//   artifact   a slowly turning wireframe sculpture (a twisted Möbius lattice of thin lines):
//              a design experiment suspended in the void, silver lines warmed by ember light
//   objects    floating studio tools (camera, phone, softbox, swatches): see objects.js
// Rendered from the shared gsap.ticker; additive blending; everything is transform-free GPU work.

import { initObjects } from './objects.js';

const STAR_VS = `#version 300 es
in vec4 aStar;            // x, y (0..1), depth (0..1), seed
uniform float uT; uniform vec2 uRes; uniform vec2 uPtr; uniform float uDpr; uniform vec3 uRip; uniform float uAspect;
out float vA; out float vWarm; out float vSize;
float h(float n){ return fract(sin(n * 91.345) * 47453.21); }
void main(){
  float d = aStar.z;
  vec2 p = aStar.xy + vec2(-uT * (.0015 + .009 * d * d), uT * .0008 * d) + uPtr * (.004 + .03 * d);
  p = fract(p);
  // water: a swell travels along the band the wordmark sits in, and rings run out from the pointer
  p.y += .0026 * sin(p.x * 9. + uT * .55) * exp(-pow((p.y - .56) * 4.5, 2.));
  vec2 dm = (p - uRip.xy) * vec2(uAspect, 1.);
  float dr = length(dm);
  p += dm / (dr + 1e-4) * vec2(1. / uAspect, 1.) * sin(dr * 36. - uT * 5.) * exp(-dr * 5.5) * .0125 * uRip.z;
  gl_Position = vec4(p * 2. - 1., 0., 1.);
  float big = step(.985, h(aStar.w));
  vSize = (0.7 + 2.2 * d * d + big * 3.5) * uDpr;
  gl_PointSize = vSize;
  vA = (.25 + .75 * d) * (.65 + .35 * sin(uT * (1.5 + 3. * h(aStar.w + 1.)) + aStar.w * 40.));
  vWarm = step(.93, h(aStar.w + 2.));
}`;
const STAR_FS = `#version 300 es
precision mediump float;
in float vA; in float vWarm; in float vSize; out vec4 o;
void main(){
  vec2 c = gl_PointCoord - .5;
  float r = length(c);
  float core = smoothstep(.5, .0, r);
  float cross = vSize > 4. ? (smoothstep(.06, 0., abs(c.x)) + smoothstep(.06, 0., abs(c.y))) * smoothstep(.5, .1, r) * .6 : 0.;
  vec3 col = mix(vec3(.86, .9, 1.), vec3(1., .55, .25), vWarm);
  float a = (core * core + cross) * vA;
  o = vec4(col * a, a);
}`;

// Embers: each vertex is one sample of one mote: (seed, depth, trail index k, trail length n).
// Position is analytic in time, so a trail is just the same mote sampled a little in the past.
const EMBER_VS = `#version 300 es
in vec4 aE;
uniform float uT; uniform vec2 uPtr; uniform float uDpr;
out float vA; out float vHead; out float vStar; out float vPulse;
float h(float n){ return fract(sin(n * 91.345) * 47453.21); }
void main(){
  float s = aE.x, d = aE.y, k = aE.z, n = max(aE.w, 1.);
  float star = step(.78, h(s + 7.));                                                  // ~1 in 5 leads: larger, brighter
  float pulse = pow(max(0., sin(uT * (.5 + .7 * h(s + 8.)) + s * 5.)), 24.);           // brief brightness pulses / glints
  float t = uT - k * .11 * (1.6 - d);
  vec2 vel = vec2(mix(-.010, .010, h(s + 2.)), mix(.003, .013, h(s + 3.))) * (.35 + .9 * d);
  vec2 p = vec2(h(s), h(s + 1.3)) + vel * t
         + vec2(sin(t * (.12 + .2 * h(s + 4.)) + s * 6.), cos(t * (.1 + .16 * h(s + 5.)) + s * 4.)) * .04 * (.5 + d)
         + uPtr * (.008 + .04 * d);
  p = fract(p);
  gl_Position = vec4(p * 2. - 1., 0., 1.);
  float edge = smoothstep(0., .07, p.x) * smoothstep(1., .93, p.x) * smoothstep(0., .07, p.y) * smoothstep(1., .93, p.y);
  float life = .3 + .7 * smoothstep(.15, .85, .5 + .5 * sin(uT * (.07 + .1 * h(s + 6.)) + s * 13.)); // breathe: dim, glow, dim (never gone)
  float copy = (1. - smoothstep(.36, .48, p.x)) * (1. - smoothstep(.24, .34, p.y));      // hero copy, lower left
  float nav = smoothstep(.88, .95, p.y);                                                  // navigation band
  float tail = 1. - k / n;
  vHead = step(k, .5);
  vStar = star; vPulse = pulse * vHead;
  vA = edge * life * (1. - copy) * (1. - nav) * tail * tail * (.7 + .3 * d) * (1. + .35 * star);
  // ≥45% over the previous sizes (trail 2.4 → 3.5, head 5–16 → 8.3–26); leads another ×1.45, pulses swell them
  gl_PointSize = mix(3.5, (8.3 + 18. * d) * (1. + .45 * star) * (1. + .3 * pulse), vHead) * uDpr;
}`;
const EMBER_FS = `#version 300 es
precision mediump float;
in float vA; in float vHead; in float vStar; in float vPulse; out vec4 o;
void main(){
  float r = length(gl_PointCoord - .5);
  float core = smoothstep(.17, .0, r);
  float halo = exp(-r * r * 12.) * (1.05 + .6 * vStar + .8 * vPulse) * vHead;   // soft orange halo, subtle falloff
  // warm amber core → orange halo; leads and pulses run hotter at the centre
  vec3 col = mix(vec3(1., .42, .16), vec3(1., .78 + .1 * vStar, .48 + .2 * vPulse), core);
  float a = (core * (1.2 + .5 * vStar + 1.2 * vPulse) + halo) * vA;
  o = vec4(col * a, min(a, 1.));
}`;

const LINE_VS = `#version 300 es
in vec4 aP;               // xyz (model space) + w = per-vertex alpha / tag
uniform mat4 uM; uniform float uAspect; uniform vec3 uPos; uniform float uScale;
out float vA; out float vLight; out float vDepth;
void main(){
  vec4 w = uM * vec4(aP.xyz, 1.);
  vec3 q = w.xyz * uScale;
  float z = q.z + 3.2;                   // camera distance
  vec2 s = q.xy / z * 2.6;
  gl_Position = vec4(uPos.x + s.x / uAspect, uPos.y + s.y, 0., 1.);
  vDepth = clamp((3.2 - q.z) / 4.4, 0., 1.);
  vec3 L = normalize(vec3(.8, -.6, .5));  // ember light from the filament (lower right)
  vLight = clamp(dot(normalize(w.xyz), L) * .5 + .5, 0., 1.);
  vA = aP.w;
}`;
const LINE_FS = `#version 300 es
precision mediump float;
in float vA; in float vLight; in float vDepth; uniform float uFade; out vec4 o;
void main(){
  vec3 silver = vec3(.72, .76, .84), ember = vec3(1., .5, .22);
  vec3 col = mix(silver * .55, ember, smoothstep(.45, 1., vLight));
  float a = vA * (.25 + .75 * vDepth) * uFade;
  o = vec4(col * a, a);
}`;

function program(gl, vs, fs) {
  const p = gl.createProgram();
  for (const [t, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]]) {
    const s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('astral shader', gl.getShaderInfoLog(s)); return null; }
    gl.attachShader(p, s);
  }
  gl.linkProgram(p);
  return gl.getProgramParameter(p, gl.LINK_STATUS) ? p : null;
}

// Möbius lattice: longitudinal lines across the band's width + transverse ribs.
function mobius() {
  const v = [];
  const U = 160, W = 7, R = 1, half = 0.42;
  const pt = (u, s) => {
    const a = u / 2;
    return [(R + s * Math.cos(a)) * Math.cos(u), (R + s * Math.cos(a)) * Math.sin(u) * 0.62, s * Math.sin(a) + 0.18 * Math.sin(3 * u)];
  };
  for (let j = 0; j < W; j++) {
    const s = -half + (2 * half * j) / (W - 1);
    const alpha = j === 0 || j === W - 1 ? 0.9 : 0.38;
    for (let i = 0; i < U; i++) {
      const u0 = (i / U) * Math.PI * 2, u1 = ((i + 1) / U) * Math.PI * 2;
      v.push(...pt(u0, s), alpha, ...pt(u1, s), alpha);
    }
  }
  for (let i = 0; i < U; i += 4) {
    const u = (i / U) * Math.PI * 2;
    v.push(...pt(u, -half), 0.22, ...pt(u, half), 0.22);
  }
  return new Float32Array(v);
}

const rot = (ax, ay, az) => {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay), Math.cos(az), Math.sin(az)];
  // Rz * Ry * Rx, column-major
  return new Float32Array([
    cy * cz, cy * sz, -sy, 0,
    sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy, 0,
    cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy, 0,
    0, 0, 0, 1,
  ]);
};

export function initAstral(canvas, { lite = false } = {}) {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: true });
  if (!gl) return null;
  const sp = program(gl, STAR_VS, STAR_FS), lp = program(gl, LINE_VS, LINE_FS), ep = program(gl, EMBER_VS, EMBER_FS);
  if (!sp || !lp || !ep) return null;

  const objects = initObjects(gl, program, { lite });

  // stars
  const N = lite ? 520 : 1400;
  const stars = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) stars.set([Math.random(), Math.random(), Math.pow(Math.random(), 1.8), Math.random() * 100], i * 4);
  const starVao = gl.createVertexArray();
  gl.bindVertexArray(starVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, stars, gl.STATIC_DRAW);
  const aStar = gl.getAttribLocation(sp, 'aStar');
  gl.enableVertexAttribArray(aStar);
  gl.vertexAttribPointer(aStar, 4, gl.FLOAT, false, 0, 0);

  // embers: sparse on purpose; a few of them trail
  const motes = lite ? 12 : 24, comets = lite ? 2 : 5, TRAIL = 14;
  const ev = [];
  for (let m = 0; m < motes; m++) {
    const seed = Math.random() * 100, depth = Math.pow(Math.random(), 1.4), n = m < comets ? TRAIL : 1;
    for (let k = 0; k < n; k++) ev.push(seed, depth, k, n);
  }
  const emberCount = ev.length / 4;
  const emberVao = gl.createVertexArray();
  gl.bindVertexArray(emberVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ev), gl.STATIC_DRAW);
  const aE = gl.getAttribLocation(ep, 'aE');
  gl.enableVertexAttribArray(aE);
  gl.vertexAttribPointer(aE, 4, gl.FLOAT, false, 0, 0);

  // artifact
  const mesh = mobius();
  const artVao = gl.createVertexArray();
  gl.bindVertexArray(artVao);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);
  const aP = gl.getAttribLocation(lp, 'aP');
  gl.enableVertexAttribArray(aP);
  gl.vertexAttribPointer(aP, 4, gl.FLOAT, false, 0, 0);

  // streaks (dynamic): up to 2 lines, 2 vertices each, using the line program in screen space
  const streakVao = gl.createVertexArray();
  gl.bindVertexArray(streakVao);
  const streakBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, streakBuf);
  gl.bufferData(gl.ARRAY_BUFFER, 2 * 2 * 4 * 4, gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(aP);
  gl.vertexAttribPointer(aP, 4, gl.FLOAT, false, 0, 0);

  const U = (p, n) => gl.getUniformLocation(p, n);
  const su = { t: U(sp, 'uT'), res: U(sp, 'uRes'), ptr: U(sp, 'uPtr'), dpr: U(sp, 'uDpr'), rip: U(sp, 'uRip'), aspect: U(sp, 'uAspect') };
  const eu = { t: U(ep, 'uT'), ptr: U(ep, 'uPtr'), dpr: U(ep, 'uDpr') };
  const lu = { m: U(lp, 'uM'), aspect: U(lp, 'uAspect'), pos: U(lp, 'uPos'), scale: U(lp, 'uScale'), fade: U(lp, 'uFade') };

  let w = 1, h = 1, dpr = 1;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, lite ? 1.25 : 1.5);
    w = Math.max(1, Math.round(r.width * dpr)); h = Math.max(1, Math.round(r.height * dpr));
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  resize();
  addEventListener('resize', resize);
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  // ripple source follows the pointer; its strength follows pointer speed and fades out
  const rip = { x: 0.5, y: 0.5, a: 0, ta: 0, lx: 0, ly: 0 };
  addEventListener('pointermove', (e) => {
    ptr.tx = e.clientX / innerWidth - 0.5; ptr.ty = 0.5 - e.clientY / innerHeight;
    const sp = Math.hypot(e.clientX - rip.lx, e.clientY - rip.ly); rip.lx = e.clientX; rip.ly = e.clientY;
    rip.x += (e.clientX / innerWidth - rip.x) * 0.25; rip.y += (1 - e.clientY / innerHeight - rip.y) * 0.25;
    rip.ta = Math.min(1, rip.ta + sp / 140);
  }, { passive: true });

  const streaks = [];
  let nextStreak = 2.5;
  const start = performance.now();

  return {
    render() {
      const t = (performance.now() - start) / 1000;
      ptr.x += (ptr.tx - ptr.x) * 0.04; ptr.y += (ptr.ty - ptr.y) * 0.04;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);

      gl.useProgram(sp);
      gl.uniform1f(su.t, t);
      gl.uniform2f(su.ptr, ptr.x, ptr.y);
      gl.uniform1f(su.dpr, dpr);
      rip.ta *= 0.97; rip.a += (rip.ta - rip.a) * 0.06;
      gl.uniform3f(su.rip, rip.x, rip.y, rip.a);
      gl.uniform1f(su.aspect, w / h);
      gl.bindVertexArray(starVao);
      gl.drawArrays(gl.POINTS, 0, N);

      gl.useProgram(ep);
      gl.uniform1f(eu.t, t);
      gl.uniform2f(eu.ptr, ptr.x, ptr.y);
      gl.uniform1f(eu.dpr, dpr);
      gl.bindVertexArray(emberVao);
      gl.drawArrays(gl.POINTS, 0, emberCount);

      // artifact: slow turn + drift; upper left on wide screens (the studio drawing owns the right), upper right on narrow ones
      gl.useProgram(lp);
      const aspect = w / h;
      gl.uniformMatrix4fv(lu.m, false, rot(0.9 + 0.25 * Math.sin(t * 0.11), t * 0.07, 0.35 + 0.12 * Math.sin(t * 0.08)));
      gl.uniform1f(lu.aspect, aspect);
      const wide = aspect > 1;
      // narrow screens: up in the empty sky above the wordmark, clear of the hero copy
      gl.uniform3f(lu.pos, (wide ? -0.68 : 0.3) + ptr.x * 0.05 + 0.02 * Math.sin(t * 0.13), (wide ? 0.64 : 0.62) + ptr.y * 0.04 + 0.025 * Math.sin(t * 0.17), 0);
      gl.uniform1f(lu.scale, wide ? 0.46 : 0.34);
      gl.uniform1f(lu.fade, wide ? 0.7 : 0.6);
      gl.bindVertexArray(artVao);
      gl.drawArrays(gl.LINES, 0, mesh.length / 4);

      objects?.render(t, ptr, w, h);

      // streaks: a rare faint shooting particle, sometimes ember
      if (t > nextStreak) {
        const y = Math.random() * 1.4 - 0.2, dir = Math.random() < 0.5 ? -1 : 1;
        streaks.push({ t0: t, x: dir > 0 ? -1.3 : 1.3, y, vx: dir * (1.3 + Math.random()), vy: -(0.25 + Math.random() * 0.35), life: 0.9 + Math.random() * 0.6, warm: Math.random() < 0.4 });
        nextStreak = t + 3.5 + Math.random() * 5.5;
      }
      const live = streaks.filter((s) => t - s.t0 < s.life);
      streaks.length = 0; streaks.push(...live);
      if (live.length) {
        const data = new Float32Array(2 * 2 * 4);
        live.slice(0, 2).forEach((s, i) => {
          const k = (t - s.t0) / s.life, hx = s.x + s.vx * k * 1.6, hy = s.y + s.vy * k * 1.6;
          const a = Math.sin(Math.PI * k) * (s.warm ? 0.9 : 0.7);
          // identity matrix + scale 1 + camera at z = -3.2 in the line shader: pass screen coords via z
          data.set([hx * 1.23, hy * 1.23, 0, a, (hx - s.vx * 0.12) * 1.23, (hy - s.vy * 0.12) * 1.23, 0, 0], i * 8);
        });
        gl.useProgram(lp); // the objects pass leaves its own program bound
        gl.uniformMatrix4fv(lu.m, false, rot(0, 0, 0));
        gl.uniform1f(lu.aspect, 1); // streak coordinates are already in screen space
        gl.uniform3f(lu.pos, 0, 0, 0);
        gl.uniform1f(lu.scale, 1);
        gl.uniform1f(lu.fade, 1);
        gl.bindVertexArray(streakVao);
        gl.bindBuffer(gl.ARRAY_BUFFER, streakBuf);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
        gl.drawArrays(gl.LINES, 0, Math.min(2, live.length) * 2);
      }
    },
  };
}
