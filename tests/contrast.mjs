// Contrast spot check: computes WCAG ratios for representative text on its actual background, on
// several pages. node tests/contrast.mjs   (needs `vite preview --port 4173`)
import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript(() => sessionStorage.setItem('tifferend-loaded', '1'));
const p = await ctx.newPage();
const rows = [];
for (const path of ['', 'work/', 'about/', 'contact/']) {
  await p.goto(`http://localhost:4173/${path}`, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  rows.push(...await p.evaluate((path) => {
    const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; const v = rgb(c); if (v.length >= 3 && (v[3] === undefined || v[3] > 0.9)) return v.slice(0, 3); } return [255, 255, 255]; };
    const sel = ['.lbl', '.body-l', '.note', '.h-xl', '.wk__meta', '.field label', '.ftr__h', '.ftr__cols a', '.svc__line', '.pick span', '.chip', '.link-arrow', '.hdr__link'];
    const out = [];
    for (const s of sel) {
      const el = [...document.querySelectorAll(s)].find((e) => e.offsetParent && e.textContent.trim());
      if (!el) continue;
      const cs = getComputedStyle(el), fg = rgb(cs.color).slice(0, 3), bg = bgOf(el);
      const [a, c] = [lum(fg) + 0.05, lum(bg) + 0.05];
      out.push({ path: path || 'home', sel: s, size: cs.fontSize, ratio: +(Math.max(a, c) / Math.min(a, c)).toFixed(2) });
    }
    return out;
  }, path));
}
const low = rows.filter((r) => r.ratio < 4.5 && parseFloat(r.size) < 24);
console.log(JSON.stringify({ checked: rows.length, belowAA: low, all: rows.map((r) => `${r.path} ${r.sel} ${r.ratio}`) }, null, 1));
await b.close();
