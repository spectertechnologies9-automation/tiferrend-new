// Generates every HTML page from src/data into the project root, ready for Vite.
// Runs automatically from vite.config.js (dev + build). Run by hand with `npm run pages`.
// Generated files (index.html, work/, about/, contact/, 404.html) are git-ignored: edit the data or
// scripts/pages.mjs instead.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './lib.mjs';

export async function buildPages() {
  // Cache-bust so dev regeneration picks up edited data modules.
  const v = `?t=${Date.now()}`;
  const { shell } = await import(pathToFileURL(path.join(ROOT, 'scripts/shell.mjs')).href + v);
  const pages = await import(pathToFileURL(path.join(ROOT, 'scripts/pages.mjs')).href + v);
  const base = process.env.SITE_BASE || '';

  const out = [
    { file: 'index.html', page: 'home', root: './', body: pages.home() },
    { file: 'work/index.html', page: 'work', root: '../', title: 'Work', description: 'Branding, packaging, film and digital work by Tifferend.', body: pages.work() },
    { file: 'about/index.html', page: 'about', root: '../', title: 'About', description: 'Tifferend is a creative branding studio: our story, how we work and what we value.', body: pages.about() },
    { file: 'contact/index.html', page: 'contact', root: '../', title: 'Contact', description: 'Start a project with Tifferend.', body: pages.contact() },
    // 404 is served for any missing path, so it pins its own base (set SITE_BASE in CI, e.g. "/tifferend/").
    { file: '404.html', page: '404', root: base ? '' : './', base: base || '', title: 'Page not found', body: pages.notFound() },
  ];
  for (const p of pages.projects) {
    out.push({
      file: `work/${p.slug}/index.html`,
      page: 'project',
      root: '../../',
      title: `${p.client} — ${p.category}`,
      description: p.summary,
      body: pages.project(p),
      bodyAttrs: p.theme ? `style="--p-bg:${p.theme.bg};--p-fg:${p.theme.fg};--p-accent:${p.theme.accent}" data-themed` : '',
    });
  }

  // Remove project pages that no longer exist in the data.
  const workDir = path.join(ROOT, 'work');
  if (fs.existsSync(workDir)) {
    const keep = new Set(pages.projects.map((p) => p.slug));
    for (const d of fs.readdirSync(workDir)) {
      const full = path.join(workDir, d);
      if (fs.statSync(full).isDirectory() && !keep.has(d)) fs.rmSync(full, { recursive: true });
    }
  }

  for (const o of out) {
    const file = path.join(ROOT, o.file);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, shell(o));
  }
  return Object.fromEntries(out.map((o) => [o.file.replace(/\/index\.html$|\.html$/, '').replace(/\//g, '-') || 'home', path.join(ROOT, o.file)]));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputs = await buildPages();
  console.log(`Generated ${Object.keys(inputs).length} pages:`, Object.keys(inputs).join(', '));
}
