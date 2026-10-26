// Ember trail: a chain of short dashes (the loader's ember dash) that snakes after the cursor, like the
// marks that wander across Mensch's site. Desktop fine pointers only, never with reduced motion.
// It only animates while the pointer moves, then fades out and stops its frame loop.
const COUNT = 18;
const COLOR = '#ff7f4d';

export function initTrail() {
  const c = document.createElement('canvas');
  c.className = 'trail';
  c.setAttribute('aria-hidden', 'true');
  document.body.append(c);
  const ctx = c.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  const size = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  addEventListener('resize', size);

  const pts = Array.from({ length: COUNT }, () => ({ x: -100, y: -100 }));
  const target = { x: -100, y: -100 };
  let alpha = 0, last = 0, raf = 0, idle = true;

  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    target.x = e.clientX; target.y = e.clientY; last = performance.now();
    if (idle) { pts.forEach((p) => { p.x = target.x; p.y = target.y; }); idle = false; }
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });

  function tick(now) {
    raf = 0;
    const moving = now - last < 1600;
    alpha += ((moving ? 1 : 0) - alpha) * 0.08;
    // Head follows the pointer; each link follows the one ahead with a little lag (a soft chain).
    pts[0].x += (target.x - pts[0].x) * 0.35;
    pts[0].y += (target.y - pts[0].y) * 0.35;
    for (let i = 1; i < COUNT; i++) {
      pts[i].x += (pts[i - 1].x - pts[i].x) * 0.42;
      pts[i].y += (pts[i - 1].y - pts[i].y) * 0.42;
    }
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = COLOR;
    ctx.lineCap = 'round';
    for (let i = 1; i < COUNT; i++) {
      const a = pts[i - 1], b = pts[i];
      const dx = a.x - b.x, dy = a.y - b.y;
      const len = Math.hypot(dx, dy);
      if (len < 0.5) continue;
      const k = 1 - i / COUNT;
      ctx.globalAlpha = alpha * k * 0.9;
      ctx.lineWidth = 1 + k * 1.6;
      // A dash centred on the link, oriented along the chain.
      const ux = dx / len, uy = dy / len, half = Math.min(len * 0.45, 7);
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      ctx.beginPath();
      ctx.moveTo(mx - ux * half, my - uy * half);
      ctx.lineTo(mx + ux * half, my + uy * half);
      ctx.stroke();
    }
    if (alpha > 0.01 || moving) raf = requestAnimationFrame(tick);
    else { ctx.clearRect(0, 0, w, h); idle = true; }
  }
}
