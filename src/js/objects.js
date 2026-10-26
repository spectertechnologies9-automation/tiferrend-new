// Floating studio objects for the hero's astral layer: a camera, a phone showing a layout, a softbox and
// a fanned swatch deck — small lit meshes built from primitives, drawn into the astral WebGL context
// (no extra canvas or loop). Pearl white and silver under a soft key with a cool fill, an ember rim from
// the filament side, and an occasional warm glint sweeping across each object.

const VS = `#version 300 es
in vec3 aPos; in vec3 aNor; in float aMat;
uniform mat3 uR; uniform float uScale; uniform vec3 uPos; uniform float uAspect;
out vec3 vN; out vec3 vL; out float vMat; out float vZ;
void main(){
  vec3 w = uR * aPos * uScale;
  float z = w.z + 3.2;
  vec2 s = w.xy / z * 2.6;
  gl_Position = vec4(uPos.x + s.x / uAspect, uPos.y + s.y, clamp(w.z * .2 + .5, 0., 1.) * 2. - 1., 1.);
  vN = uR * aNor; vL = aPos; vMat = aMat; vZ = w.z;
}`;

const FS = `#version 300 es
precision mediump float;
in vec3 vN; in vec3 vL; in float vMat; in float vZ;
uniform float uT; uniform float uGlint; uniform float uFade; uniform vec2 uScreen;
out vec4 o;
vec3 swatch(float m){
  if (m < 5.5) return vec3(1., .5, .3);          // ember
  if (m < 6.5) return vec3(.86, .82, .74);       // bone
  if (m < 7.5) return vec3(.17, .17, .18);       // charcoal
  if (m < 8.5) return vec3(.24, .4, .44);        // slate teal
  return vec3(.62, .5, .3);                      // muted gold
}
void main(){
  vec3 n = normalize(vN);
  if (!gl_FrontFacing) n = -n;
  vec3 V = vec3(0., 0., -1.);
  vec3 key = normalize(vec3(-.35, .55, -.75));
  vec3 rimL = normalize(vec3(.85, -.15, .5));
  float m = vMat;
  vec3 base; float shin = 24., ks = .25, emit = 0.;
  vec3 ecol = vec3(0.);
  if (m < .5) { base = vec3(.92, .91, .88); shin = 36.; ks = .28; }              // pearl white body                                  // charcoal body
  else if (m < 1.5) { base = vec3(.76, .78, .8); shin = 60.; ks = .75; }         // silver        // brushed metal
  else if (m < 2.5) { base = vec3(.02, .025, .04); shin = 120.; ks = 1.2; }     // lens glass
  else if (m < 3.5) {                                                            // phone screen: a layout
    vec2 uv = vec2(vL.x / uScreen.x + .5, vL.y / uScreen.y + .5);
    float bar = step(.86, uv.y) * step(uv.y, .93) * step(.1, uv.x) * step(uv.x, .55);
    float hero = step(.48, uv.y) * step(uv.y, .8) * step(.08, uv.x) * step(uv.x, .92);
    float lines = step(.1, uv.x) * step(uv.x, .8) * step(.2, uv.y) * step(uv.y, .42) * step(.5, fract(uv.y * 14.));
    float dot2 = step(length((uv - vec2(.75, .64)) * vec2(1., 2.)), .1);
    base = vec3(.03, .035, .045);
    ecol = vec3(.8, .84, .9) * (bar * .55 + lines * .22) + vec3(.16, .2, .24) * hero + vec3(1., .5, .3) * dot2 * .9;
    emit = 1.; ks = .5; shin = 90.;
  }
  else if (m < 4.5) { base = vec3(.08); ecol = vec3(1., .86, .7) * .32; emit = 1.; }  // softbox diffuser
  else if (m < 9.5) { base = swatch(m) * .95; ks = .2; }
  else { base = vec3(.06); ecol = vec3(1., .45, .2) * .9; emit = 1.; }         // ember accent ring
  float dif = (dot(n, key) * .5 + .5) * .72 + max(dot(n, normalize(vec3(.6, -.2, -.5))), 0.) * .16 + .36; // wrapped key + cool fill + ambient: shaded, never flat
  vec3 h = normalize(key + V);
  float spec = pow(max(dot(n, h), 0.), shin) * ks;
  float rim = pow(1. - abs(dot(n, V)), 2.2) * max(dot(n, rimL) * .7 + .3, 0.);
  // a warm glint that sweeps across now and then
  vec3 gl = normalize(vec3(sin(uT * .9), .3, -.6));
  float glint = pow(max(dot(n, normalize(gl + V)), 0.), 80.) * uGlint;
  vec3 col = base * dif + vec3(.75, .8, .9) * spec + vec3(1., .5, .25) * (rim * .6 + glint * 1.2) + ecol * emit;
  float a = uFade;
  o = vec4(col * a, a);
}`;

// ---------------------------------------------------------------- mesh builders
function builder() {
  const v = [];
  const tri = (a, b, c, n, m) => v.push(...a, ...n, m, ...b, ...n, m, ...c, ...n, m);
  const quad = (a, b, c, d, m) => {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const l = Math.hypot(...n) || 1;
    const nn = n.map((x) => x / l);
    tri(a, b, c, nn, m); tri(a, c, d, nn, m);
  };
  const box = (cx, cy, cz, sx, sy, sz, m) => {
    const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
    quad([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], m); // front (−z, toward camera)
    quad([x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1], m);
    quad([x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1], m);
    quad([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], m);
    quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], m);
    quad([x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0], m);
  };
  // cylinder along −z from z0 (back) to z1 (front, z1 < z0), with caps
  const cyl = (cx, cy, z0, z1, r, m, seg = 28, capM = m) => {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const p = (a, z) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z];
      const n0 = [Math.cos(a0), Math.sin(a0), 0], n1 = [Math.cos(a1), Math.sin(a1), 0];
      v.push(...p(a0, z0), ...n0, m, ...p(a1, z0), ...n1, m, ...p(a1, z1), ...n1, m);
      v.push(...p(a0, z0), ...n0, m, ...p(a1, z1), ...n1, m, ...p(a0, z1), ...n0, m);
      tri([cx, cy, z1], p(a1, z1), p(a0, z1), [0, 0, -1], capM);
      tri([cx, cy, z0], p(a0, z0), p(a1, z0), [0, 0, 1], m);
    }
  };
  // vertical cylinder (along y)
  const pole = (cx, cz, y0, y1, r, m, seg = 14) => {
    for (let i = 0; i < seg; i++) {
      const a0 = (i / seg) * Math.PI * 2, a1 = ((i + 1) / seg) * Math.PI * 2;
      const p = (a, y) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
      const n0 = [Math.cos(a0), 0, Math.sin(a0)], n1 = [Math.cos(a1), 0, Math.sin(a1)];
      v.push(...p(a0, y0), ...n0, m, ...p(a1, y1), ...n1, m, ...p(a1, y0), ...n1, m);
      v.push(...p(a0, y0), ...n0, m, ...p(a0, y1), ...n0, m, ...p(a1, y1), ...n1, m);
    }
  };
  return { v, quad, box, cyl, pole };
}

function camera() {
  const b = builder();
  b.box(0, 0, 0, 1.5, 0.92, 0.62, 0);                 // body
  b.box(-0.58, -0.02, -0.14, 0.34, 0.86, 0.5, 0);     // grip
  b.box(0.12, 0.56, 0, 0.5, 0.26, 0.5, 0);            // viewfinder hump
  b.box(0.5, 0.5, 0, 0.18, 0.1, 0.18, 1);             // dial
  b.box(-0.45, 0.5, -0.05, 0.16, 0.06, 0.16, 1);      // shutter
  b.cyl(0.12, -0.02, -0.3, -0.62, 0.36, 1);           // lens mount (metal)
  b.cyl(0.12, -0.02, -0.62, -0.66, 0.375, 10);        // ember ring
  b.cyl(0.12, -0.02, -0.66, -1.0, 0.34, 0);           // barrel
  b.cyl(0.12, -0.02, -1.0, -1.04, 0.33, 1, 28, 2);    // front ring + glass
  return b.v;
}
function phone() {
  const b = builder();
  b.box(0, 0, 0, 0.72, 1.46, 0.08, 1);                // slab (silver frame)
  b.box(0, 0, -0.042, 0.66, 1.38, 0.004, 3);          // screen
  b.box(0.38, 0.28, 0, 0.02, 0.2, 0.05, 1);           // side key
  b.cyl(-0.18, 0.5, 0.06, 0.09, 0.09, 1, 18, 2);      // rear lens
  return b.v;
}
function softbox() {
  const b = builder();
  const back = 0.18, front = 0.62, d = 0.8;
  const P = (s, z) => [[-s, -s, z], [s, -s, z], [s, s, z], [-s, s, z]];
  const f = P(front, -d / 2), k = P(back, d / 2);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; b.quad(f[i], k[i], k[j], f[j], 0); }  // fabric walls
  b.quad(f[0], f[1], f[2], f[3], 4);                                                         // diffuser
  b.box(0, 0, d / 2 + 0.08, 0.3, 0.3, 0.16, 1);                                              // speedring
  b.pole(0, d / 2 + 0.08, -1.7, -0.15, 0.035, 1);                                            // stand
  b.box(0, -1.72, d / 2 + 0.08, 0.5, 0.03, 0.06, 1);                                         // foot
  return b.v;
}
function swatches() {
  const b = builder();
  for (let i = 0; i < 5; i++) {
    const a = (-0.5 + i * 0.25) * 0.9;                 // fan angle
    const c = Math.cos(a), s = Math.sin(a), z = -i * 0.025;
    const card = (x, y) => [x * c - y * s, x * s + y * c, z];
    const w = 0.19, h0 = 0.05, h1 = 1.25;
    b.quad(card(-w, h0), card(w, h0), card(w, h1), card(-w, h1), 5 + i); // single face, lit on both sides
  }
  b.cyl(0, 0.12, 0.04, -0.15, 0.06, 1, 16);           // rivet
  return b.v;
}

const rotm = (ax, ay, az) => {
  const [cx, sx, cy, sy, cz, sz] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay), Math.cos(az), Math.sin(az)];
  return new Float32Array([cy * cz, cy * sz, -sy, sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy, cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy]);
};

export function initObjects(gl, program, { lite = false } = {}) {
  const prog = program(gl, VS, FS);
  if (!prog) return null;
  const loc = (n) => gl.getUniformLocation(prog, n);
  const u = { R: loc('uR'), scale: loc('uScale'), pos: loc('uPos'), aspect: loc('uAspect'), t: loc('uT'), glint: loc('uGlint'), fade: loc('uFade'), screen: loc('uScreen') };
  const aPos = gl.getAttribLocation(prog, 'aPos'), aNor = gl.getAttribLocation(prog, 'aNor'), aMat = gl.getAttribLocation(prog, 'aMat');
  const mesh = (verts) => {
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const st = 7 * 4;
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, st, 0);
    gl.enableVertexAttribArray(aNor); gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, st, 12);
    gl.enableVertexAttribArray(aMat); gl.vertexAttribPointer(aMat, 1, gl.FLOAT, false, st, 24);
    return { vao, n: verts.length / 7 };
  };
  // placement in negative space (ndc), per layout; depth → scale, drift and parallax
  const all = [
    { m: mesh(camera()), wide: [-0.18, -0.5], narrow: [-0.42, -0.12], s: 0.125, depth: 0.8, spin: [0.18, 0.11, 0.07], phase: 0.3, base: [0.3, 0.95, 0.06] },
    { m: mesh(phone()), wide: [0.52, 0.66], narrow: [-0.55, 0.72], s: 0.16, depth: 1, spin: [0.12, 0.16, 0.09], phase: 1.7, base: [0.15, 0.55, -0.22] },
    { m: mesh(softbox()), wide: [0.06, 0.7], narrow: null, s: 0.085, depth: 0.45, spin: [0.08, 0.09, 0.05], phase: 3.1, base: [0.2, -0.75, 0] },
    { m: mesh(swatches()), wide: [0.36, -0.62], narrow: null, s: 0.12, depth: 0.65, spin: [0.14, 0.1, 0.12], phase: 4.4, base: [0.2, -0.15, 0.25] },
  ];
  const objs = lite ? all.filter((o) => o.narrow) : all;

  return {
    render(t, ptr, w, h, fade = 1) {
      const aspect = w / h, wide = aspect > 1;
      gl.useProgram(prog);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform1f(u.aspect, aspect);
      gl.uniform1f(u.t, t);
      gl.uniform1f(u.fade, fade);
      gl.uniform2f(u.screen, 0.66, 1.38);
      for (const o of objs) {
        const at = wide ? o.wide : o.narrow;
        if (!at) continue;
        const k = o.phase, T = t * 1.4; // ~40% livelier than the first pass
        const x = at[0] + 0.03 * Math.sin(T * 0.21 + k) + 0.012 * Math.sin(T * 0.53 + k * 2.3) + ptr.x * (0.02 + 0.06 * o.depth);
        const y = at[1] + 0.038 * Math.sin(T * 0.17 + k * 2) + 0.01 * Math.cos(T * 0.47 + k) + ptr.y * (0.016 + 0.05 * o.depth);
        // flourish: now and then one object turns once around, eased, seamless (0 and 2π are the same pose)
        const c = (t * 0.045 + k * 0.23) % 1;
        const fl = c > 0.9 ? (1 - Math.cos(((c - 0.9) / 0.1) * Math.PI)) * Math.PI : 0;
        const R = rotm(
          o.base[0] + 0.48 * Math.sin(T * o.spin[0] + k) - ptr.y * 0.3,
          o.base[1] + 0.78 * Math.sin(T * o.spin[1] + k) + ptr.x * 0.4 + fl, // tumble around a 3/4 view, never edge-on
          o.base[2] + 0.3 * Math.sin(T * o.spin[2] + k * 3),
        );
        gl.uniformMatrix3fv(u.R, false, R);
        gl.uniform1f(u.scale, o.s * 1.4 * (wide ? 1 : 1.2) * (0.75 + 0.25 * o.depth)); // 1.4× the first pass
        gl.uniform3f(u.pos, x, y, 0);
        gl.uniform1f(u.glint, Math.pow(Math.max(0, Math.sin(T * 0.31 + k * 1.9)), 12)); // now and then
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.bindVertexArray(o.m.vao);
        gl.drawArrays(gl.TRIANGLES, 0, o.m.n);
      }
      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.ONE, gl.ONE);
    },
  };
}
