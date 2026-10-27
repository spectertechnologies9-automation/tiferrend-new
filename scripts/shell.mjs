// Page shell: head, loader, header, dialogs, footer. Everything is relative to {{root}}.
import { site, nav, loaderWords } from '../src/data/site.js';
import { services } from '../src/data/services.js';
import { clients } from '../src/data/clients.js';
import { WORDMARK_VIEWBOX, WORDMARK_GLYPHS } from '../src/data/wordmark.js';
import { esc, lbl, arrow } from './lib.mjs';

// Glyph row: the wordmark as 7 independently animatable glyphs (<use> of the defs in the page sprite).
const glyphRow = (cls = 'gl') =>
  WORDMARK_GLYPHS.map((g, i) => `<use href="#wg${i}" class="${cls} ${cls}-${i}" data-cx="${g.cx}"/>`).join('');

// True-3D extruded wordmark for the hero. Every glyph is its own HTML stack of SVG layers on translateZ
// (the loader's extrusion, given real depth), so each letter can move independently on the compositor
// without repainting paths. Nesting: .g3 (scroll beat) > .g3__p (pointer) > .g3__in (idle motion).
const W = 4260, H = 882, PAD = 24;
export const wm3 = (layers = 8) =>
  `<span class="wm3" data-wm3 aria-hidden="true">${WORDMARK_GLYPHS.map((g, i) => {
    const x0 = g.x0 - PAD, w = g.x1 - g.x0 + PAD * 2;
    const box = `${x0} -${PAD} ${w} ${H + PAD * 2}`;
    const layer = (k) => `<svg class="g3__layer" style="--k:${k}" viewBox="${box}" focusable="false" overflow="visible"><use href="#wg${i}"/></svg>`;
    return `<span class="g3" data-g="${i}" style="left:${((x0 / W) * 100).toFixed(3)}%;width:${((w / W) * 100).toFixed(3)}%"><span class="g3__p"><span class="g3__in">${Array.from({ length: layers }, (_, k) => layer(layers - k)).join('')}<svg class="g3__face" viewBox="${box}" focusable="false" overflow="visible"><use href="#wg${i}"/></svg><svg class="g3__light" viewBox="${box}" focusable="false" overflow="visible"><use class="lt lt--bloom" href="#wg${i}"/><use class="lt lt--tail" href="#wg${i}"/><use class="lt lt--head" href="#wg${i}"/></svg></span></span></span>`;
  }).join('')}</span>`;

// Header mark: the flat wordmark, each glyph clipped by a few rectangular windows (columns across the
// glyph). Static, the windows cover the glyph; logoreveal.js morphs them dot → bar → full for the reveal.
export const hdrMark = () => {
  const clips = [], groups = [];
  WORDMARK_GLYPHS.forEach((g, i) => {
    const w = g.x1 - g.x0, n = Math.max(2, Math.round(w / 240)), cw = w / n;
    const rects = Array.from({ length: n }, (_, k) => `<rect x="${Math.round(g.x0 + k * cw - 2)}" y="-20" width="${Math.round(cw + 4)}" height="922" data-x="${Math.round(g.x0 + k * cw - 2)}" data-w="${Math.round(cw + 4)}" data-y0="${g.y0}" data-y1="${g.y1}"/>`).join('');
    clips.push(`<clipPath id="hc${i}" clipPathUnits="userSpaceOnUse">${rects}</clipPath>`);
    groups.push(`<use href="#wg${i}" clip-path="url(#hc${i})"/>`);
  });
  return `<svg class="hdr__wm" viewBox="${WORDMARK_VIEWBOX}" aria-hidden="true" focusable="false"><defs>${clips.join('')}</defs>${groups.join('')}</svg>`;
};

// Footer wordmark: each glyph wrapped in a group, so choreography layers (wrapper vs glyph) never collide.
export const glyphSvg = (cls) =>
  `<svg class="${cls}" viewBox="${WORDMARK_VIEWBOX}" aria-hidden="true" focusable="false" overflow="visible">${WORDMARK_GLYPHS.map((g, i) => `<g class="fgw"><use href="#wg${i}" class="fg fg-${i}"/></g>`).join('')}</svg>`;

const wm = (cls = '', label = '') =>
  `<svg class="${cls}" viewBox="${WORDMARK_VIEWBOX}" ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true" focusable="false"'}><use href="#wm"/></svg>`;
export { wm };

// The extruded wordmark from the original loader: six darker copies offset behind the face.
export const wm3d = (cls = '') =>
  `<span class="wm3d ${cls}" aria-hidden="true">${[6, 5, 4, 3, 2, 1]
    .map((n) => `<svg class="wm3d__layer" style="--n:${n}" viewBox="${WORDMARK_VIEWBOX}" focusable="false"><use href="#wm"/></svg>`)
    .join('')}<svg class="wm3d__face" viewBox="${WORDMARK_VIEWBOX}" focusable="false"><use href="#wm"/></svg></span>`;

const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#000"/><text x="31" y="47" font-family="Georgia,serif" font-weight="700" font-size="46" fill="#fff" text-anchor="middle">t</text><circle cx="48" cy="45" r="4" fill="#FF7F4D"/></svg>'
  );

// Structured data (JSON-LD): only facts already published on the site, nothing inferred (no address,
// ratings, reviews or founding date). The organisation everywhere; the site on the homepage; a project
// as CreativeWork when it is confirmed work (drafts are noindex and get none).
function structuredData(page, pageUrl, project) {
  if (!site.url) return '';
  const org = {
    '@type': 'Organization', '@id': `${site.url}/#org`, name: site.name, url: `${site.url}/`,
    logo: `${site.url}/media/brand/tifferend-logo.png`, email: site.email, slogan: site.brandLine,
    description: site.description,
    sameAs: site.socials.map((s) => s.href),
    knowsAbout: services.map((s) => s.name),
    makesOffer: services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.line } })),
  };
  const graph = [org];
  if (page === 'home') graph.push({ '@type': 'WebSite', '@id': `${site.url}/#site`, url: `${site.url}/`, name: site.name, publisher: { '@id': `${site.url}/#org` } });
  if (project && !project.draft && pageUrl) graph.push({ '@type': 'CreativeWork', name: `${project.client} — ${project.category}`, url: pageUrl, description: project.summary, dateCreated: String(project.year), creator: { '@id': `${site.url}/#org` } });
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>`;
}

function loader() {
  const pos = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'];
  return `<div class="loader dark" data-loader aria-hidden="true">
  <div class="loader__grain"></div>
  <div class="loader__words">${loaderWords.map((w, i) => `<span class="loader__word ${pos[i]}" style="--i:${i}"><span class="loader__dash"></span>${w}</span>`).join('')}</div>
  <div class="loader__logo" data-loader-logo>${wm3d('wm3d--loader')}</div>
  <div class="loader__line"></div>
</div>`;
}

function header(page) {
  const links = nav
    .map((n) => {
      const active = page === n.href.replace('/', '');
      return `<a class="hdr__link${active ? ' is-active' : ''}" href="{{root}}${n.href}"${active ? ' aria-current="page"' : ''}>${n.label}</a>`;
    })
    .join('');
  return `<header class="hdr" data-hdr>
  <nav class="hdr__nav" aria-label="Primary">${links}</nav>
  <a class="hdr__logo" href="{{root}}" aria-label="Tifferend — home" data-hdr-logo>${hdrMark()}</a>
  <div class="hdr__tools">
    <button class="hdr__sound" type="button" data-sound aria-pressed="false"><span class="hdr__sound-bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="hdr__sound-label">Sound off</span></button>
    <button class="hdr__btn" type="button" data-open="info" aria-haspopup="dialog" aria-controls="info">Info</button>
    <button class="hdr__btn hdr__menu" type="button" data-open="menu" aria-haspopup="dialog" aria-controls="menu">Menu</button>
  </div>
</header>`;
}

function serviceLinks(cls = '') {
  return services.map((s) => `<li><a class="${cls}" href="{{root}}work/?service=${s.slug}">${esc(s.name)}</a></li>`).join('');
}

function dialogs() {
  const logos = clients
    .slice(0, 8)
    .map((c) => `<img class="logo logo--${c.tone}" src="{{root}}media/clients/${c.file}.webp" alt="${esc(c.name)}" width="${c.w}" height="120" loading="lazy">`)
    .join('');
  // Info panel: a compact editorial sheet. Horizontal groups divided by fine rules, bold uppercase
  // headings, content unchanged (services, real client marks, studio email, careers form, socials).
  const svcItems = services
    .map((s) => `<li><a class="ip__svc" href="{{root}}work/?service=${s.slug}">${esc(s.name)}</a></li>`)
    .join('');
  return `<dialog class="sheet sheet--info" id="info" aria-labelledby="info-title" data-lenis-prevent>
  <div class="sheet__panel ip">
    <header class="ip__top">
      <h2 class="ip__title" id="info-title">Info</h2>
      <button class="ip__close" type="button" data-close aria-label="Close info"><span class="ip__x" aria-hidden="true"></span></button>
    </header>
    <div class="ip__scroll" data-ip-scroll>
      <section class="ip__row ip__in" style="--i:0"><h3 class="ip__k">About</h3><p class="ip__lead">${esc(site.tagline)} A full-service branding, marketing and creative studio — ${esc(site.subline.toLowerCase())} <a class="ip__link" href="{{root}}about/">The studio ${arrow}</a></p></section>
      <section class="ip__row ip__in" style="--i:1"><h3 class="ip__k">Services</h3><ul class="ip__svcs">${svcItems}</ul></section>
      <section class="ip__row ip__in" style="--i:2"><h3 class="ip__k">Select clients</h3><div class="ip__logos">${logos}</div></section>
      <section class="ip__row ip__row--pair ip__in" style="--i:3"><h3 class="ip__k">Project enquiries</h3><a class="ip__mail" href="mailto:${site.email}">${site.email}</a></section>
      <section class="ip__row ip__row--pair ip__in" style="--i:4"><h3 class="ip__k">Join the studio</h3><a class="ip__link" href="${site.careersUrl}" target="_blank" rel="noopener">Open roles — apply ${arrow}</a></section>
      <section class="ip__row ip__row--social ip__in" style="--i:5"><h3 class="ip__k">Social</h3><ul class="ip__social">${site.socials.map((s) => `<li><a class="ip__link" href="${s.href}" target="_blank" rel="noopener">${esc(s.label)} ${arrow}</a></li>`).join('')}</ul></section>
    </div>
  </div>
</dialog>
<dialog class="sheet sheet--menu" id="menu" aria-label="Menu" data-lenis-prevent>
  <div class="sheet__panel">
    <div class="sheet__top"><span class="sheet__title">Menu</span><button class="sheet__close" type="button" data-close>Close</button></div>
    <nav class="menu__nav" aria-label="Mobile">
      <a href="{{root}}">Home</a>${nav.map((n) => `<a href="{{root}}${n.href}">${n.label}</a>`).join('')}
    </nav>
    <div class="menu__foot">
      <a class="menu__mail" href="mailto:${site.email}">${site.email}</a>
      <div class="menu__row"><button class="menu__chip" type="button" data-open="info">Studio info</button><button class="menu__chip" type="button" data-sound aria-pressed="false"><span class="hdr__sound-label">Sound off</span></button></div>
    </div>
  </div>
</dialog>`;
}

// Client marks (Mensch presents them as a strip above the closing wordmark): real logos only.
export const clientRow = (decorative = false) => clients
  .map((c) => `<li class="marq__item"><img class="logo logo--${c.tone}" src="{{root}}media/clients/${c.file}.webp" alt="${decorative ? '' : esc(c.name)}" width="${c.w}" height="120" loading="lazy" decoding="async"></li>`)
  .join('');

function footer() {
  const ai = site.aiSummaryLinks
    ? `<div class="ftr__ai" data-ai-wrap><p class="ftr__h">Summarise us with AI</p><div class="ftr__ai-row"><a class="btn btn--ghost" data-ai="chatgpt" href="https://chatgpt.com/" target="_blank" rel="noopener">Ask ChatGPT</a><a class="btn btn--ghost" data-ai="claude" href="https://claude.ai/new" target="_blank" rel="noopener">Ask Claude</a></div></div>`
    : '';
  return `<footer class="ftr dark" data-ftr>
  <div class="ftr__cta wrap">
    ${lbl('Start a project')}
    <h2 class="h-xl ftr__title" data-split>Let’s build something remarkable.</h2>
    <div class="ftr__cta-row"><a class="btn btn--ember" href="{{root}}contact/">Start a project ${arrow}</a><a class="ftr__mail" href="mailto:${site.email}">${site.email}</a></div>
  </div>
  <nav class="ftr__cols wrap" aria-label="Site map">
    <div><p class="ftr__h">Studio</p><ul><li><a href="{{root}}work/">Work</a></li><li><a href="{{root}}about/">About</a></li><li><a href="{{root}}about/#process">Process</a></li><li><a href="${site.careersUrl}" target="_blank" rel="noopener">Careers</a></li></ul></div>
    <div><p class="ftr__h">Services</p><ul>${serviceLinks()}</ul></div>
    <div><p class="ftr__h">Connect</p><ul><li><a href="{{root}}contact/">Start a project</a></li><li><a href="mailto:${site.email}">${site.email}</a></li>${site.socials.map((s) => `<li><a href="${s.href}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul></div>
    <div>${ai}</div>
  </nav>
  <section class="ftr__clients" aria-labelledby="ftr-clients">
    <p class="ftr__h wrap" id="ftr-clients">Select clients</p>
    <div class="marq" data-marq><ul class="marq__track">${clientRow()}</ul><ul class="marq__track" aria-hidden="true">${clientRow(true)}</ul></div>
  </section>
  <div class="ftr__mark" data-ftr-mark>
    <video class="ftr__film" data-autoplay muted playsinline loop preload="none" poster="{{root}}media/video/studio-poster-1280.jpg" data-src="{{root}}media/video/studio-720.mp4" aria-hidden="true" tabindex="-1"></video>
    ${glyphSvg('ftr__wm')}
    <button class="vidctl" type="button" data-vidctl aria-label="Pause video" aria-pressed="false"><span class="vidctl__i" aria-hidden="true"></span></button>
  </div>
  <div class="ftr__legal wrap"><span>© 2026 Tifferend</span><span>${esc(site.brandLine)}</span><a href="#top" data-top>Back to top ↑</a></div>
</footer>`;
}

export function shell({ page, path: urlPath, noindex = false, project, root, title, description, body, bodyAttrs = '', base = '' }) {
  const fullTitle = title ? `${title} — Tifferend` : site.title;
  const desc = description || site.description;
  const pageUrl = site.url && urlPath !== undefined ? `${site.url}/${urlPath}` : '';
  const og = site.url
    ? `${pageUrl ? `<link rel="canonical" href="${pageUrl}"><meta property="og:url" content="${pageUrl}">` : ''}<meta property="og:image" content="${site.url}/media/brand/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="The Tifferend wordmark"><meta name="twitter:image" content="${site.url}/media/brand/og-image.jpg">`
    : '';
  const html = `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${base ? `<base href="${base}">` : ''}
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#ffffff">
<meta name="color-scheme" content="light">
${noindex ? '<meta name="robots" content="noindex, follow">\n' : ''}<meta property="og:type" content="website"><meta property="og:site_name" content="Tifferend"><meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(desc)}">${og}
${structuredData(page, pageUrl, project)}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@tifferend">
<link rel="icon" href="${favicon}">
<script>(function(d){var h=d.documentElement;h.className=h.className.replace('no-js','js');try{var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(r)h.classList.add('reduced');else if(!sessionStorage.getItem('tifferend-loaded'))h.classList.add('show-loader')}catch(e){}})(document)</script>
<link rel="stylesheet" href="{{root}}src/styles/main.css">
</head>
<body data-page="${page}" ${bodyAttrs}>
<a class="skip" href="#main">Skip to content</a>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="wm" viewBox="${WORDMARK_VIEWBOX}">${WORDMARK_GLYPHS.map((_, i) => `<use href="#wg${i}"/>`).join('')}</symbol><defs>${WORDMARK_GLYPHS.map((g, i) => `<path id="wg${i}" fill="currentColor" pathLength="1" d="${g.d}"/>`).join('')}</defs></svg>
${loader()}
${header(page)}
<main id="main" tabindex="-1">
${body}
</main>
${footer()}
${dialogs()}
<div class="cursor" data-cursor aria-hidden="true"><span>View</span></div>
<script type="module" src="{{root}}src/js/main.js"></script>
</body>
</html>
`;
  return html.replaceAll('{{root}}', root);
}
