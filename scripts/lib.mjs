// Shared rendering helpers for the static page generator.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Index of responsive variants: 'media/work/mm-cards' -> [{ w: 640, file }, ...]
let manifest;
function variants(base) {
  if (!manifest) {
    manifest = {};
    const dir = path.join(PUBLIC, 'media/work');
    for (const f of fs.readdirSync(dir)) {
      const m = f.match(/^(.*)-(\d+)\.(webp|jpg)$/);
      if (!m) continue;
      const key = `media/work/${m[1]}`;
      (manifest[key] ||= []).push({ w: +m[2], file: `media/work/${f}` });
    }
    for (const k in manifest) manifest[k].sort((a, b) => a.w - b.w);
  }
  return manifest[base];
}

export function largest(base, root = '') {
  const v = variants(base);
  return v ? root + v[v.length - 1].file : root + base;
}

// <img> with srcset from the manifest. `src` may also be a direct file path.
export function img(src, { alt = '', sizes = '100vw', cls = '', eager = false, style = '', attrs = '' } = {}) {
  const v = variants(src);
  const load = eager ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';
  const c = cls ? ` class="${cls}"` : '';
  const st = style ? ` style="${style}"` : '';
  if (!v) return `<img${c} src="{{root}}${src}" alt="${esc(alt)}" ${load} decoding="async"${st} ${attrs}>`;
  const set = v.map((x) => `{{root}}${x.file} ${x.w}w`).join(', ');
  const mid = v.find((x) => x.w >= 1000) || v[v.length - 1];
  return `<img${c} src="{{root}}${mid.file}" srcset="${set}" sizes="${sizes}" alt="${esc(alt)}" ${load} decoding="async"${st} ${attrs}>`;
}

// The brief's small category label (PDF §06): sentence case in the text face, paired with a large headline.
export const lbl = (t) => `<p class="lbl">${esc(t)}</p>`;

export const arrow = '<svg class="ico-arrow" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 13 13 3M5 3h8v8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
