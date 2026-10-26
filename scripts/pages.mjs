// Page bodies, rendered from src/data. Markup is complete without JavaScript; JS only enhances.
import { site } from '../src/data/site.js';
import { services, serviceBySlug } from '../src/data/services.js';
import { projects as allProjects } from '../src/data/projects.js';
import { clients } from '../src/data/clients.js';
import { testimonials, sampleTestimonials } from '../src/data/testimonials.js';
import { story, philosophy, values, process, studioMedia } from '../src/data/studio.js';
import { esc, img, lbl, arrow, largest } from './lib.mjs';
import { wm3 } from './shell.mjs';
import { FIGURE } from '../src/data/figure-outline.js';

export const projects = allProjects.filter((p) => site.showDraftProjects || !p.draft);
const pad = (n) => String(n).padStart(2, '0');
// Black or white text for a swatch, by relative luminance.
const textOn = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? '#000' : '#fff';
};
const svcNames = (p) => p.services.map((s) => serviceBySlug[s]?.short).filter(Boolean).join(', ');
const countFor = (slug) => projects.filter((p) => p.services.includes(slug)).length;

// AUGE-style contrast: the closing word of a headline sets in italic. Copy is unchanged.
// Explicit emphasis in a headline: *italic*, **bold**, __underline__ (used sparingly, one per headline).
const rich = (s) => s.replace(/__(.+?)__/g, '<u>$1</u>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
const emph = (t) => {
  const s = esc(t);
  if (/(\*|__)\S/.test(s)) return rich(s);
  const weak = /(\S+\s+(?:on|from|in|of|to|up|it|for))([.!?,…]*)$/; // a trailing particle takes its verb along
  return weak.test(s) ? s.replace(weak, '<em>$1</em>$2') : s.replace(/(\S+?)([.!?,…]*)$/, '<em>$1</em>$2');
};
const head = (label, title, { tag = 'h2', id = '', extra = '' } = {}) =>
  `<header class="sec-head">${lbl(label)}<${tag} class="h-xl"${id ? ` id="${id}"` : ''} data-split>${emph(title)}</${tag}>${extra}</header>`;

/* ---------------------------------------------------------------- HOME */

// The hero: a dark astral environment (generated for this composition, looped) with the authentic
// wordmark as per-glyph 3D stacks with living ink clipped inside each letter, and a scroll lift-off.
// Studio artifact floating in the hero: a model outline framed by a viewfinder, with a focus reticle and
// two construction lines. Fine strokes, ember only on the rim light and one corner. Decorative.
function heroArt() {
  const { outline, inner } = FIGURE;
  const bracket = (x, y, sx, sy, cls = '') => `<path class="art__br${cls}" pathLength="1" d="M${x} ${y + sy * 64}V${y}H${x + sx * 64}"/>`;
  return `<div class="hero__art" data-hero-art aria-hidden="true"><svg viewBox="-140 -80 620 1160" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g class="art__con"><circle cx="169" cy="470" r="300" pathLength="1"/><path d="M-130 62H470" pathLength="1"/></g>
      <g class="art__frame">${bracket(-100, -40, 1, 1)}${bracket(438, -40, -1, 1, ' art__br--hot')}${bracket(438, 1045, -1, -1)}${bracket(-100, 1045, 1, -1)}</g>
      <g class="art__fig"><path d="${outline}" pathLength="1"/>${inner.map((d) => `<path class="art__in" d="${d}" pathLength="1"/>`).join('')}</g>
      <path class="art__rim" d="${outline}" pathLength="1"/>
      <path class="art__trace" d="${outline}" pathLength="1"/>
      <g class="art__focus"><circle cx="190" cy="66" r="54"/><path d="M190 4v18M190 110v18M128 66h18M234 66h18M184 66h12M190 60v12"/></g>
    </svg></div>`;
}

function hero() {
  return `<section class="hero" data-hero aria-labelledby="hero-title">
  <div class="hero__pin" data-hero-pin>
    <div class="hero__media" data-hero-media>
      <picture class="hero__poster">
        <source media="(min-aspect-ratio: 1/1)" srcset="{{root}}media/video/cosmos-poster-wide.jpg">
        <img src="{{root}}media/video/cosmos-poster-tall.jpg" alt="" fetchpriority="high" decoding="async">
      </picture>
      <video class="hero__video" data-hero-video muted playsinline loop preload="none" aria-hidden="true" tabindex="-1"
        data-src-tall="{{root}}media/video/cosmos-tall.mp4" data-src-wide="{{root}}media/video/cosmos-720.mp4" data-src-mid="{{root}}media/video/cosmos-720.mp4"></video>
    </div>
    <div class="hero__grain" aria-hidden="true"></div>
    <canvas class="hero__astral" data-astral aria-hidden="true"></canvas>
    ${heroArt()}
    <span class="hero__spark" data-hero-spark aria-hidden="true"></span>
    <h1 class="hero__title" id="hero-title"><span class="sr-only">Tifferend — creative branding studio</span><span class="hero__mark" data-hero-mark>${wm3()}</span></h1>
    <div class="hero__foot" data-hero-foot>
      <div class="hero__copy">
        <p class="hero__type" aria-hidden="true"><span class="hero__roll" data-type data-words="Brand identity.|Packaging.|Brand films.|Websites.|Social.">Brand identity.</span></p>
        <p class="hero__sub">${esc(site.tagline)} ${esc(site.subline)}</p>
      </div>
      <a class="hero__scroll" href="#intro" aria-label="Scroll to content"><span class="hero__scroll-line" aria-hidden="true"></span>Scroll</a>
    </div>
    <button class="vidctl" type="button" data-vidctl aria-label="Pause background video" aria-pressed="false"><span class="vidctl__i" aria-hidden="true"></span></button>
  </div>
</section>`;
}

// Statement collage: a few words turn italic, real My Mithila frames and marks sit inline (decorative).
// The words themselves are the original copy, in order.
const pic = (src) => `<span class="cl cl--pic" aria-hidden="true"><img src="{{root}}media/work/${src}" alt="" loading="lazy" decoding="async"></span>`;
const mark = (s) => `<span class="cl cl--mark" aria-hidden="true">${s}</span>`;
function collage(text) {
  const italic = new Set(['blueprint', 'X-factor', 'protect', 'everything']);
  const after = { brand: pic('mm-cup-640.jpg'), 'mold,': pic('mm-billboard-640.webp'), 'thing,': mark('✦'), and: mark('↳') };
  const used = new Set();
  return text.split(/\s+/).map((w) => {
    const word = italic.has(w) ? `<em>${esc(w)}</em>` : esc(w);
    if (!after[w] || used.has(w)) return word;
    used.add(w);
    return `${word} ${after[w]}`;
  }).join(' ');
}
// Statement lit word by word as it scrolls past (AUGE-style), not a fade-up.
function intro() {
  return `<section class="intro wrap" id="intro">
  ${lbl('The philosophy')}
  <h2 class="h-xl intro__title" data-split>${emph(philosophy.heading)}</h2>
  <p class="statement intro__body" data-lightup><span class="q q--open" aria-hidden="true">“</span>${collage(philosophy.paragraphs[1])}<span class="q q--close" aria-hidden="true">”</span></p>
  <a class="link-arrow intro__link" href="{{root}}about/">${esc(philosophy.close)} ${arrow}</a>
</section>`;
}

function tile(p, i) {
  const t = p.tile || {};
  return `<a class="tile" href="{{root}}work/${p.slug}/" style="--focus:${t.focus || '50% 50%'};--mfocus:${t.mobileFocus || t.focus || '50% 50%'}" data-cursor-label="View">
  ${img(p.cover, { alt: p.coverAlt, sizes: '(min-width: 900px) 50vw, 100vw', cls: 'tile__img', eager: false })}
  <span class="tile__label"><span class="tile__client">${esc(p.client)}</span><span class="tile__cat">${esc(p.category)}</span></span>
</a>`;
}

function selected() {
  const four = projects.filter((p) => p.featured).sort((a, b) => a.featured - b.featured).slice(0, 4);
  return `<section class="sel" id="work" aria-labelledby="sel-title">
  <div class="wrap">${head('Selected work', 'Work that gets __remembered__.', { id: 'sel-title', extra: `<a class="link-arrow sec-head__link" href="{{root}}work/">All work ${arrow}</a>` })}</div>
  <div class="tiles">${four.map(tile).join('')}</div>
</section>`;
}

function servicesBlock() {
  const imgs = services
    .map((s, i) => img(s.image, { alt: '', sizes: '100vw', cls: `svc__img${i === 0 ? ' is-active' : ''}`, attrs: `data-i="${i}"` }))
    .join('');
  const rows = services
    .map((s, i) => {
      const n = countFor(s.slug);
      return `<li class="svc__item${i === 0 ? ' is-active' : ''}" data-i="${i}">
      <a class="svc__link" href="{{root}}work/?service=${s.slug}" data-i="${i}" aria-describedby="svc-line-${i}">
        <span class="svc__name">${esc(s.name)}</span>
      </a>
      <div class="svc__meta"><div class="svc__meta-in"><p class="svc__line" id="svc-line-${i}">${esc(s.line)}</p><a class="svc__go" href="{{root}}work/?service=${s.slug}" tabindex="-1">${n ? `See ${n} project${n > 1 ? 's' : ''}` : 'See work'} ${arrow}</a></div></div>
    </li>`;
    })
    .join('');
  return `<section class="svc" data-svc aria-labelledby="svc-title">
  <div class="svc__bg" aria-hidden="true">${imgs}<div class="svc__dim"></div></div>
  <div class="svc__inner wrap">
    ${head('Services', 'Every way a brand is seen.', { id: 'svc-title' })}
    <p class="svc__hint" aria-hidden="true"><span class="svc__hint-fine">Hover a service to preview, click to see the work.</span><span class="svc__hint-touch">Tap a service to preview, tap again for the work.</span></p>
    <ol class="svc__list">${rows}</ol>
  </div>
</section>`;
}

function testimonialsBlock() {
  const list = testimonials.length ? testimonials : site.showSampleTestimonials ? sampleTestimonials : [];
  if (!list.length) return '';
  const cards = list
    .map(
      (t, i) => `<li class="tst__card${t.sample ? ' tst__card--sample' : ''}${t.portrait ? ' tst__card--portrait' : ''}">
    <div class="tst__media" data-tst data-flow>${t.portrait ? `<span class="tst__bg" aria-hidden="true" style="background-image:url('{{root}}${t.poster}')"></span>` : ''}
      <video class="tst__video" preload="none" playsinline poster="{{root}}${t.poster}" data-src="{{root}}${t.video}" aria-label="${esc(`${t.name}, ${t.role}`)}">
        <track kind="captions" srclang="en" label="English" src="{{root}}${t.captions}" default>
      </video>
      <button class="tst__play" type="button" data-tst-play aria-label="Play film: ${esc(t.name)}"><span class="tst__play-i" aria-hidden="true"></span><span class="tst__play-t">Play</span></button>
      <p class="tst__state" data-tst-state role="status"></p>
    </div>
    <div class="tst__who">${t.logo ? `<img class="logo logo--mono tst__logo" src="{{root}}${t.logo}" alt="" loading="lazy">` : ''}<p class="tst__name">${esc(t.name)}</p><p class="tst__role">${esc(t.role)}${t.company ? ` · ${esc(t.company)}` : ''}</p>${t.quote ? `<p class="tst__quote">“${esc(t.quote)}”</p>` : ''}</div>
  </li>`
    )
    .join('');
  // A horizontal track of landscape (16:9) films: swipe / trackpad, arrow buttons and keys, one plays at a time.
  const nav = list.length > 1 ? `<div class="tst__nav"><button class="tst__btn" type="button" data-tst-prev aria-label="Previous film"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M14 8H2M7 3 2 8l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button><button class="tst__btn" type="button" data-tst-next aria-label="Next film"><svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M2 8h12M9 3l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div>` : '';
  return `<section class="tst" aria-labelledby="tst-title">
  <div class="wrap tst__head">${head('Client films', 'In their words.', { id: 'tst-title' })}${nav}</div>
  ${list[0].sample ? '<p class="note wrap tst__note">Sample slots using Tifferend’s own footage, shown in its original portrait format. Client testimonial films will replace them.</p>' : ''}
  <ul class="tst__list" data-tst-track data-lenis-prevent-horizontal tabindex="0" aria-label="Client films, scroll sideways">${cards}</ul>
</section>`;
}

// About / studio (PDF: predominantly visual, real BTS). Desktop: pinned, scrolls sideways. Phones: swipe.
function studioBlock() {
  const items = studioMedia
    .map((m) =>
      m.type === 'video'
        ? `<figure class="hz__item hz__item--video"><div class="hz__frame" data-flow><video data-autoplay muted playsinline loop preload="none" poster="{{root}}${m.poster}" data-src="{{root}}${m.src}" aria-label="${esc(m.alt)}"></video><button class="vidctl" type="button" data-vidctl aria-label="Pause video" aria-pressed="false"><span class="vidctl__i" aria-hidden="true"></span></button></div><figcaption>${esc(m.caption)}</figcaption></figure>`
        : `<figure class="hz__item"><div class="hz__frame" data-flow>${img(m.src.replace(/-(1080|1280)\.(jpg|webp)$/, ''), { alt: m.alt, sizes: '(min-width: 900px) 34vw, 80vw' })}</div><figcaption>${esc(m.caption)}</figcaption></figure>`
    )
    .join('');
  return `<section class="hz" data-hz aria-labelledby="hz-title">
  <div class="hz__pin" data-hz-pin>
    <div class="hz__track" data-hz-track>
      <div class="hz__intro">
        ${lbl('The studio')}
        <h2 class="h-xl" id="hz-title" data-split>Made <em>in-house</em>.</h2>
        <p class="body-l">Strategy, design, film and digital sit in one room, so the idea survives every format. This is the My Mithila film being made, from simulation to grade.</p>
        <a class="link-arrow" href="{{root}}about/">Inside the studio ${arrow}</a>
      </div>
      ${items}
    </div>
  </div>
</section>`;
}

// Process / how we work (PDF: numbered stages; verbatim from the current site).
function contactBlock() {
  return `<section class="hct wrap" id="contact" aria-labelledby="hct-title">
  <div class="hct__intro">
    ${lbl('Project enquiry')}
    <h2 class="h-xl" id="hct-title" data-split>Let’s build something <em>remarkable</em>.</h2>
    <p class="body-l">Tell us about the brand, the problem and the timing. We reply to every enquiry.</p>
    <a class="hct__mail" href="mailto:${site.email}">${site.email}</a>
  </div>
  ${enquiryForm()}
</section>`;
}

export function home() {
  return [hero(), intro(), selected(), servicesBlock(), studioBlock(), testimonialsBlock(), contactBlock()].join('\n');
}

/* ---------------------------------------------------------------- WORK */

export function work() {
  const filters = [`<button class="chip is-active" type="button" data-filter="all" aria-pressed="true">All <sup>${projects.length}</sup></button>`]
    .concat(services.map((s) => `<button class="chip" type="button" data-filter="${s.slug}" aria-pressed="false">${esc(s.name)} <sup>${countFor(s.slug)}</sup></button>`))
    .join('');
  const items = projects
    .map(
      (p, i) => `<li class="wk__item" data-services="${p.services.join(' ')}" style="--slot:${i % 6}">
    <a class="wk__link" href="{{root}}work/${p.slug}/" data-cursor-label="View">
      <span class="wk__frame">${img(p.cover, { alt: p.coverAlt, sizes: '(min-width: 900px) 34vw, (min-width: 600px) 50vw, 100vw', cls: 'wk__img', eager: i === 0, style: `object-position:${p.tile?.focus || '50% 50%'}` })}</span>
      <span class="wk__cap"><span class="wk__client">${esc(p.client)}</span><span class="wk__meta">${esc(svcNames(p))}</span><span class="wk__meta">${p.year}${p.draft ? ' · Draft' : ''}</span></span>
    </a>
  </li>`
    )
    .join('');
  return `<section class="wk" data-work>
  <div class="wk__head wrap">
    ${lbl('Work')}
    <h1 class="h-xxl wk__title" data-split>Every project, by <em>domain</em>.</h1>
    <p class="body-l wk__lede">Identity, packaging, film and digital, for brands that want to be remembered. Filter by what you need.</p>
  </div>
  <div class="wk__filters wrap" role="group" aria-label="Filter work by service">${filters}</div>
  <p class="sr-only" aria-live="polite" data-work-status></p>
  <ul class="wk__grid wrap" data-work-grid>${items}</ul>
  <div class="wk__empty wrap" data-work-empty hidden><p class="body-l">No published projects in this domain yet.</p><a class="link-arrow" href="{{root}}contact/">Talk to us about it ${arrow}</a></div>
</section>`;
}

/* ---------------------------------------------------------------- PROJECT */

function section(s) {
  switch (s.type) {
    case 'text':
      return `<section class="ps ps--text wrap">${lbl(s.label)}<div><h2 class="h-lg" data-split>${emph(s.heading)}</h2>${s.body.map((b) => `<p class="body-l">${esc(b)}</p>`).join('')}</div></section>`;
    case 'image':
      return `<figure class="ps ps--image${s.bleed ? ' ps--bleed' : ' wrap'}"><div class="ps__frame" data-flow style="aspect-ratio:${s.ratio || 'auto'}">${img(s.src, { alt: s.alt, sizes: s.bleed ? '100vw' : '(min-width: 1200px) 1100px, 100vw' })}</div></figure>`;
    case 'pair':
      return `<div class="ps ps--pair wrap">${s.items.map((it) => `<figure class="ps__frame" data-flow>${img(it.src, { alt: it.alt, sizes: '(min-width: 900px) 50vw, 100vw' })}</figure>`).join('')}</div>`;
    case 'video':
      return `<section class="ps ps--video wrap${s.portrait ? ' ps--portrait' : ''}">
  <div class="ps__vtext">${lbl(s.label || 'Film')}<h2 class="h-lg" data-split>${emph(s.heading || '')}</h2><p class="note">Plays with sound when you press play. Captions available.</p></div>
  <div class="ps__vframe"><video controls playsinline preload="none" poster="{{root}}${s.poster}" aria-label="${esc(s.alt)}"><source src="{{root}}${s.src}" type="video/mp4"><track kind="captions" srclang="en" label="English" src="{{root}}${s.captions}"></video></div>
</section>`;
    case 'palette':
      return `<section class="ps ps--palette" aria-label="Colour palette">${s.colors
        .map((c) => `<div class="sw" style="--c:${c.hex};--t:${textOn(c.hex)}"><span class="sw__name">${esc(c.name)}</span><span class="sw__meta">${esc(c.role)} · ${c.hex}</span></div>`)
        .join('')}</section>`;
    case 'grid':
      return `<section class="ps ps--grid wrap">${lbl(s.label)}<h2 class="h-lg" data-split>${emph(s.heading)}</h2><ul class="ps__grid">${s.items
        .map((it) => `<li>${img(it.src, { alt: it.alt, sizes: '(min-width: 900px) 25vw, 50vw' })}</li>`)
        .join('')}</ul></section>`;
    case 'motifs':
      return `<section class="ps ps--motifs wrap">${lbl(s.label)}<div><h2 class="h-lg" data-split>${emph(s.heading)}</h2>${(s.body || []).map((b) => `<p class="body-l">${esc(b)}</p>`).join('')}<ul class="motifs">${s.items
        .map((it) => `<li><img src="{{root}}${it.src}" alt="${esc(it.alt)}" loading="lazy" width="256" height="256"></li>`)
        .join('')}</ul></div></section>`;
    case 'list':
      return `<section class="ps ps--text wrap">${lbl(s.label)}<div><h2 class="h-md">${esc(s.heading)}</h2><ul class="plist">${s.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></section>`;
    default:
      return '';
  }
}

export function project(p) {
  const idx = projects.indexOf(p);
  const next = projects[(idx + 1) % projects.length];
  const facts = p.facts || [['Client', p.client], ['Year', p.year], ['Services', svcNames(p)]];
  const svcLinks = p.services.map((s) => `<a class="chip chip--link" href="{{root}}work/?service=${s}">${esc(serviceBySlug[s].name)}</a>`).join('');
  return `<article class="pj">
  <header class="pj__head wrap">
    <a class="pj__back" href="{{root}}work/">← All work</a>
    ${lbl(`${p.category} · ${p.year}`)}
    <h1 class="h-xxl pj__client" data-split>${esc(p.client)}</h1>
    <p class="pj__title">${esc(p.title)}</p>
  </header>
  <figure class="pj__cover">${img(p.cover, { alt: p.coverAlt, sizes: '100vw', eager: true, style: `object-position:${p.tile?.focus || '50% 50%'}` })}</figure>
  <section class="pj__intro wrap">
    <dl class="pj__facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div><p class="body-l">${esc(p.summary)}</p><div class="pj__svcs">${svcLinks}</div></div>
  </section>
  ${p.draft ? `<aside class="pj__draft wrap" role="note"><p class="lbl">Draft</p><p>This project is carried over from Tifferend’s current site while the full case study is prepared. Images and scope are as published there; results will be added once confirmed.</p></aside>` : ''}
  ${p.sections.map(section).join('\n')}
  <a class="pj__next" href="{{root}}work/${next.slug}/" data-cursor-label="Next">
    ${img(next.cover, { alt: '', sizes: '100vw', cls: 'pj__next-img' })}
    <span class="pj__next-txt"><span class="lbl">Next project</span><span class="h-xl">${esc(next.client)}</span></span>
  </a>
</article>`;
}

/* ---------------------------------------------------------------- ABOUT */

export function about() {
  // The first item (the BTS film) is the page's hero video; the strip shows the rest.
  const media = studioMedia
    .slice(1)
    .map((m) =>
      m.type === 'video'
        ? `<figure class="strip__item strip__item--video" data-flow><video data-autoplay muted playsinline loop preload="none" poster="{{root}}${m.poster}" data-src="{{root}}${m.src}" aria-label="${esc(m.alt)}"></video><button class="vidctl" type="button" data-vidctl aria-label="Pause video" aria-pressed="false"><span class="vidctl__i" aria-hidden="true"></span></button><figcaption>${esc(m.caption)}</figcaption></figure>`
        : `<figure class="strip__item" data-flow>${img(m.src.replace(/-1080\.jpg$/, ''), { alt: m.alt, sizes: '(min-width: 900px) 30vw, 80vw' })}<figcaption>${esc(m.caption)}</figcaption></figure>`
    )
    .join('');
  const stages = process
    .map(
      (s, i) => `<li class="proc__stage" data-stage="${i}">
      <div class="proc__media-m">${img(s.media.src.replace(/-(1080|1280)\.(jpg|webp)$/, ''), { alt: s.media.alt, sizes: '100vw' })}</div>
      <p class="proc__num" aria-hidden="true">${pad(i + 1)}</p>
      <div class="proc__body"><h3 class="h-lg">${esc(s.title)}</h3><p class="body-l">${esc(s.text)}</p><ul class="proc__out">${s.outputs.map((o) => `<li>${esc(o)}</li>`).join('')}</ul></div>
    </li>`
    )
    .join('');
  const stageMedia = process
    .map((s, i) => img(s.media.src.replace(/-(1080|1280)\.(jpg|webp)$/, ''), { alt: '', sizes: '45vw', cls: `proc__img${i === 0 ? ' is-active' : ''}`, attrs: `data-i="${i}"` }))
    .join('');
  return `<section class="ab-hero">
  <div class="ab-hero__text wrap">${lbl('About Tifferend')}<h1 class="h-xl ab-hero__title" data-split>${emph(story.heading)}</h1></div>
  <div class="ab-hero__media">
    <video class="ab-hero__video" data-autoplay muted playsinline loop preload="none" poster="{{root}}${studioMedia[0].poster}" data-src="{{root}}${studioMedia[0].src}" aria-label="${esc(studioMedia[0].alt)}"></video>
    <button class="vidctl" type="button" data-vidctl aria-label="Pause video" aria-pressed="false"><span class="vidctl__i" aria-hidden="true"></span></button>
  </div>
</section>
<section class="ab-story wrap">
  ${lbl('Our story')}
  <div class="ab-story__body">${story.paragraphs.map((p) => `<p class="body-l">${esc(p)}</p>`).join('')}</div>
  <blockquote class="ab-story__mission"><p class="lbl">Our mission</p><p class="h-md">${esc(story.mission)}</p></blockquote>
</section>
<section class="strip" aria-label="Inside the studio"><div class="strip__track">${media}</div></section>
<section class="philo wrap">
  ${lbl('The philosophy')}
  <h2 class="h-xl" data-split>${emph(philosophy.heading)}</h2>
  <div class="philo__cols">${philosophy.paragraphs.map((p) => `<p class="body-l">${esc(p)}</p>`).join('')}<p class="h-md philo__close">${esc(philosophy.close)}</p></div>
</section>
<section class="proc" id="process" data-proc aria-labelledby="proc-title">
  <div class="wrap">${head('Process', 'How we work.', { id: 'proc-title' })}</div>
  <div class="proc__layout wrap">
    <div class="proc__sticky" aria-hidden="true"><div class="proc__frame">${stageMedia}</div><div class="proc__rail"><span data-proc-bar></span></div></div>
    <ol class="proc__stages">${stages}</ol>
  </div>
</section>
<section class="vals wrap">
  ${head('What we value', 'Four things we won’t compromise on.')}
  <ul class="vals__list">${values.map((v, i) => `<li><h3 class="h-md">${esc(v.title)}</h3><p>${esc(v.text)}</p></li>`).join('')}</ul>
</section>
<section class="join wrap">
  ${lbl('Careers')}
  <h2 class="h-xl" data-split>Let’s do things <em>tifferendly</em>.</h2>
  <p class="body-l">Content, film, design and strategy roles open now.</p>
  <a class="btn btn--ember" href="${site.careersUrl}" target="_blank" rel="noopener">See roles &amp; apply ${arrow}</a>
</section>`;
}

/* ---------------------------------------------------------------- CONTACT */

// One enquiry form, used on the homepage and the Contact page (ids are unique per page).
function enquiryForm() {
  const svcBoxes = services
    .map((s) => `<label class="pick"><input type="checkbox" name="services" value="${esc(s.name)}"><span>${esc(s.name)}</span></label>`)
    .join('');
  return `<form class="form" data-form novalidate data-endpoint="${esc(site.formEndpoint)}" data-email="${site.email}" aria-describedby="form-note">
    <div class="form__errors" data-form-errors tabindex="-1" hidden></div>
    <div class="field"><label for="f-name">Name <span aria-hidden="true">*</span></label><input id="f-name" name="name" type="text" autocomplete="name" required aria-describedby="f-name-err"><p class="field__err" id="f-name-err"></p></div>
    <div class="field"><label for="f-email">Email <span aria-hidden="true">*</span></label><input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" required aria-describedby="f-email-err"><p class="field__err" id="f-email-err"></p></div>
    <div class="field field--half"><label for="f-company">Company</label><input id="f-company" name="company" type="text" autocomplete="organization"></div>
    <div class="field field--half"><label for="f-phone">Phone</label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel"></div>
    <fieldset class="field"><legend>What do you need?</legend><div class="picks">${svcBoxes}</div></fieldset>
    <div class="field"><label for="f-when">Timeline</label><select id="f-when" name="timeline"><option value="">Choose one (optional)</option><option>As soon as possible</option><option>Within 1–3 months</option><option>3 months or later</option><option>Just exploring</option></select></div>
    <div class="field"><label for="f-msg">Tell us about the project <span aria-hidden="true">*</span></label><textarea id="f-msg" name="message" rows="5" required minlength="10" aria-describedby="f-msg-err"></textarea><p class="field__err" id="f-msg-err"></p></div>
    <input class="hp" type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
    <div class="form__foot">
      <button class="btn btn--ember form__submit" type="submit" data-submit><span data-submit-label>Send enquiry</span> ${arrow}</button>
      <p class="note" id="form-note">${site.formEndpoint ? 'We’ll confirm here once your message is received.' : 'Sending opens your email app with the message ready to go.'}</p>
    </div>
    <div class="form__status" data-form-status role="status" aria-live="polite"></div>
  </form>`;
}


export function contact() {
  return `<section class="ct wrap">
  <div class="ct__intro">
    ${lbl('Contact')}
    <h1 class="h-xxl" data-split>Let’s <u>talk</u>.</h1>
    <p class="body-l">Tell us about the brand, the problem and the timing. We reply to every enquiry.</p>
    <dl class="ct__lines">
      <div><dt>Start a project</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
      <div><dt>Join the team</dt><dd><a href="${site.careersUrl}" target="_blank" rel="noopener">Open roles — apply</a></dd></div>
      <div><dt>Social</dt><dd>${site.socials.map((s) => `<a href="${s.href}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join('')}</dd></div>
    </dl>
  </div>
  ${enquiryForm()}
</section>`;
}

export function notFound() {
  return `<section class="nf wrap">${lbl('404')}<h1 class="h-xxl">This page wandered off.</h1><p class="body-l">The link may be old. The work is still here.</p><div class="nf__row"><a class="btn btn--ember" href="./">Back home ${arrow}</a><a class="link-arrow" href="work/">See the work ${arrow}</a></div></section>`;
}
