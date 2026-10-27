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
    { file: 'index.html', page: 'home', path: '', root: './', body: pages.home() },
    { file: 'work/index.html', page: 'work', path: 'work/', root: '../', title: 'Work', description: 'Branding, packaging, film and digital work by Tifferend.', body: pages.work() },
    { file: 'about/index.html', page: 'about', path: 'about/', root: '../', title: 'About', description: 'Tifferend is a creative branding studio: our story, how we work and what we value.', body: pages.about() },
    { file: 'contact/index.html', page: 'contact', path: 'contact/', root: '../', title: 'Contact', description: 'Start a project with Tifferend.', body: pages.contact() },
    // 404 is served for any missing path, so it pins its own base (set SITE_BASE in CI, e.g. "/tifferend/").
    { file: '404.html', page: '404', noindex: true, root: base ? '' : './', base: base || '', title: 'Page not found', body: pages.notFound() },
  ];
  for (const p of pages.projects) {
    out.push({
      file: `work/${p.slug}/index.html`,
      page: 'project',
      path: `work/${p.slug}/`,
      noindex: !!p.draft, // placeholder projects stay out of search until the case study is confirmed
      project: p,
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
  writeSeoFiles(out);
  return Object.fromEntries(out.map((o) => [o.file.replace(/\/index\.html$|\.html$/, '').replace(/\//g, '-') || 'home', path.join(ROOT, o.file)]));
}

// sitemap.xml + robots.txt into public/ (git-ignored, copied by Vite): indexable pages only.
async function writeSeoFiles(out) {
  const { site } = await import(pathToFileURL(path.join(ROOT, 'src/data/site.js')).href + `?t=${Date.now()}`);
  const sitemap = path.join(ROOT, 'public/sitemap.xml'), robots = path.join(ROOT, 'public/robots.txt');
  if (!site.url) { for (const f of [sitemap, robots]) fs.rmSync(f, { force: true }); return; }
  const day = new Date().toISOString().slice(0, 10);
  const urls = out.filter((o) => o.path !== undefined && !o.noindex).map((o) => `  <url><loc>${site.url}/${o.path}</loc><lastmod>${day}</lastmod></url>`);
  fs.writeFileSync(sitemap, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
  fs.writeFileSync(robots, `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputs = await buildPages();
  console.log(`Generated ${Object.keys(inputs).length} pages:`, Object.keys(inputs).join(', '));
}
