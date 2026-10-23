// Page shell: head, loader, header, dialogs, footer. Everything is relative to {{root}}.
import { site, nav, loaderWords } from '../src/data/site.js';
import { services } from '../src/data/services.js';
import { clients } from '../src/data/clients.js';
import { WORDMARK_PATH, WORDMARK_VIEWBOX } from '../src/data/wordmark.js';
import { esc, lbl, arrow } from './lib.mjs';

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

function loader() {
  const pos = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6'];
  return `<div class="loader" data-loader aria-hidden="true">
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
  <a class="hdr__logo" href="{{root}}" aria-label="Tifferend — home">${wm3d('wm3d--hdr')}</a>
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
  return `<dialog class="sheet sheet--info" id="info" aria-labelledby="info-title">
  <div class="sheet__panel">
    <div class="sheet__top"><h2 class="sheet__title" id="info-title">Info</h2><button class="sheet__close" type="button" data-close>Close</button></div>
    <div class="info">
      <section class="info__block"><h3 class="info__h">About</h3><p class="info__lead">${esc(site.tagline)} A full-service branding, marketing and creative studio — ${esc(site.subline.toLowerCase())}</p><a class="info__more" href="{{root}}about/">The studio ${arrow}</a></section>
      <section class="info__block"><h3 class="info__h">Services</h3><ul class="info__list">${serviceLinks()}</ul></section>
      <section class="info__block info__block--wide"><h3 class="info__h">Selected clients</h3><div class="info__logos">${logos}</div></section>
      <section class="info__block"><h3 class="info__h">Project enquiries</h3><a class="info__mail" href="mailto:${site.email}">${site.email}</a></section>
      <section class="info__block"><h3 class="info__h">Join the studio</h3><a class="info__more" href="${site.careersUrl}" target="_blank" rel="noopener">Open roles — apply ${arrow}</a></section>
      <section class="info__block"><h3 class="info__h">Social</h3><ul class="info__list">${site.socials.map((s) => `<li><a href="${s.href}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul></section>
    </div>
  </div>
</dialog>
<dialog class="sheet sheet--menu" id="menu" aria-label="Menu">
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

function footer() {
  const ai = site.aiSummaryLinks
    ? `<div class="ftr__ai" data-ai-wrap><p class="ftr__h">Summarise us with AI</p><div class="ftr__ai-row"><a class="btn btn--ghost" data-ai="chatgpt" href="https://chatgpt.com/" target="_blank" rel="noopener">Ask ChatGPT</a><a class="btn btn--ghost" data-ai="claude" href="https://claude.ai/new" target="_blank" rel="noopener">Ask Claude</a></div></div>`
    : '';
  return `<footer class="ftr" data-ftr>
  <div class="ftr__cta wrap">
    ${lbl('Start a project')}
    <h2 class="h-xl ftr__title" data-split>Let’s build something remarkable.</h2>
    <div class="ftr__cta-row"><a class="btn btn--ember" href="{{root}}contact/">Start a project ${arrow}</a><a class="ftr__mail" href="mailto:${site.email}">${site.email}</a></div>
  </div>
  <div class="ftr__cols wrap">
    <div><p class="ftr__h">Studio</p><ul><li><a href="{{root}}work/">Work</a></li><li><a href="{{root}}about/">About</a></li><li><a href="{{root}}contact/">Contact</a></li><li><a href="${site.careersUrl}" target="_blank" rel="noopener">Careers</a></li></ul></div>
    <div><p class="ftr__h">Services</p><ul>${serviceLinks()}</ul></div>
    <div><p class="ftr__h">Social</p><ul>${site.socials.map((s) => `<li><a href="${s.href}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join('')}</ul></div>
    <div><p class="ftr__h">Contact</p><ul><li><a href="mailto:${site.email}">${site.email}</a></li></ul>${ai}</div>
  </div>
  <div class="ftr__mark" data-ftr-mark>${wm('ftr__wm')}</div>
  <div class="ftr__legal wrap"><span>© 2026 Tifferend</span><span>${esc(site.brandLine)}</span><a href="#top" data-top>Back to top ↑</a></div>
</footer>`;
}

export function shell({ page, root, title, description, body, bodyAttrs = '', base = '' }) {
  const fullTitle = title ? `${title} — Tifferend` : site.title;
  const desc = description || site.description;
  const og = site.url
    ? `<meta property="og:url" content="${site.url}/${page === 'home' ? '' : page}"><meta property="og:image" content="${site.url}/media/work/mm-wordmark-1280.webp">`
    : '';
  const html = `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${base ? `<base href="${base}">` : ''}
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
<meta property="og:type" content="website"><meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(desc)}">${og}
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@tifferend">
<link rel="icon" href="${favicon}">
<script>(function(d){var h=d.documentElement;h.className=h.className.replace('no-js','js');try{var r=matchMedia('(prefers-reduced-motion: reduce)').matches;if(r)h.classList.add('reduced');else if(!sessionStorage.getItem('tifferend-loaded'))h.classList.add('show-loader')}catch(e){}})(document)</script>
<link rel="stylesheet" href="{{root}}src/styles/main.css">
</head>
<body data-page="${page}" ${bodyAttrs}>
<a class="skip" href="#main">Skip to content</a>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><symbol id="wm" viewBox="${WORDMARK_VIEWBOX}"><path fill="currentColor" d="${WORDMARK_PATH}"/></symbol></svg>
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
