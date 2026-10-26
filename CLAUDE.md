# CLAUDE.md — Tifferend site

Durable rules for anyone (human or agent) working here.

## Architecture
- Static multi-page site: Vite 8 + vanilla ES modules. `scripts/build-pages.mjs` renders every page from `src/data/*` into root-level HTML (`index.html`, `work/…`, `about/`, `contact/`, `404.html`). Those files are generated and git-ignored: change data or `scripts/pages.mjs` / `scripts/shell.mjs`, never the generated HTML.
- `vite.config.js` runs the generator at startup; in dev, edits to `src/data` or `scripts` regenerate pages and reload.
- `base: './'` and `{{root}}`-relative links everywhere, so one build works under a GitHub Pages sub-path and on a domain root. Only `404.html` pins `<base href>` from `SITE_BASE` (set by CI).
- JS: `main.js` boots shared UI (`ui.js`, `loader.js`) and lazy-loads one page module (`home`, `work`, `about`, `contact`). GSAP/ScrollTrigger/Lenis are dynamic imports. Content must work without JS.
- CSS: one file, `src/styles/main.css`, desktop-first art direction with adaptations at 899 / 599px. Tokens at the top.
- Hero: `wm3()` in `scripts/shell.mjs` builds 7 per-glyph 3D stacks (`.g3` > `.g3__p` > `.g3__in`, SVG layers on `translateZ`). Glyph paths come from `WORDMARK_GLYPHS` ("iff" is one ligature in the artwork). `src/js/hero3d.js` drives it, and each nesting level owns its own transform channels so tweens never fight:
  - `.g3`: scroll beat (yPercent/rotationX/z/opacity) and cursor springs (x/y/rotation/scale).
  - `.g3__p`: waves, single-letter gestures, letter flips (one sequence as the loader lands, another 2.3 s later, then ~1 per 13 s).
  - `.g3__in`: idle motion. Each glyph also carries `.g3__light`: the travelling ember light (dashed strokes on the glyph's own path; `#wg{i}` paths have `pathLength="1"`).
- The letters are clean white faces over a shallow warm extrusion. The removed black "ink/venom" material must not come back.
- `src/js/astral.js` (WebGL2, shared `gsap.ticker`, paused off-screen): stars with a water swell and pointer ripple, ember motes, the wireframe artifact, streaks, and `objects.js` (floating studio tools as lit meshes). A pass that binds its own program must leave the next pass to re-bind; WebKit logs uniform calls on the wrong program.
- The hero studio drawing is SVG line art (`heroArt()` in `pages.mjs`, contour in `src/data/figure-outline.js`), drawn and traced in CSS.
- `src/js/fluid.js`: one WebGL2 context renders an image only while it reveals, bends with scroll, ripples on hover or swaps (services). Idle images are plain DOM. Texture uploads are queued (createImageBitmap, ≤1280 px, one per calm frame), and canvases are sized at idle; uploads or allocations mid-scroll cause long frames. Headings use `liquid()` (SVG feImage noise + feDisplacementMap; feTurbulence was too slow). Diagnostics: `?nofluid`.
- Cursor: the visible mark is the orange ember streak (`trail.js`, desktop only); the client explicitly wants this simple streak, so no fluid or smoke cursor effects. `src/js/ripple.js` adds faint refractive lenses under the pointer (Chromium only; `backdrop-filter: url(#rpN)`).
- The watery effect lives in `fluid.js`: images and headings, raised ×2 in session 7. Tune it there. Heading displacement scales with the font size (≈1.4 em); a fixed px value tears smaller headlines apart.
- Bulk edits by script: never put `$$` in a `String.replace` replacement (it collapses to `$`); use split/join.
- Header logo: `hdrMark()` in `shell.mjs` clips each glyph with rectangular windows. `src/js/logoreveal.js` morphs them dot → bar → full when the header logo appears (after the loader, or on leaving the homepage hero), on hover or focus, and rarely when idle. Without JS the windows cover the glyphs.
- Client logos live in the footer (a "Select clients" strip above the closing wordmark, after Mensch) on every page, not in a homepage section.
- Footer wordmark: `src/js/footerdance.js`, lazy-loaded near the footer, never under reduced motion. Each glyph is `<g class="fgw">` (waves, scatter, pointer springs) wrapping `<use class="fg">` (bounce). Keep those layers separate.
- Lenis `preventDefault`s wheel events while stopped (any open dialog stops it), so every scrollable overlay needs `data-lenis-prevent`. Scroll areas inside a sheet need a flex column with `min-height: 0`, not a grid row.
- Editorial contrast: the generator's `emph()` sets a headline's closing word in italic, unless the title carries explicit marks (`*italic*`, `**bold**`, `__underline__`, one per headline at most). `reveals()` splits only plain text plus `<em>`, `<strong>` and `<u>`. Media tagged `data-flow` reveals behind a wave edge (CSS keyframes). A GSAP-driven clip on the same element must remove `data-flow`, because the CSS animation would win.
- Pinned scenes use CSS `position: sticky` stages driven by GSAP ScrollTrigger scrubs (no ScrollTrigger `pin`), so Lenis and native scroll behave the same. Desktop-only scenes live in `gsap.matchMedia('(min-width: 900px)')`.
- One Lenis instance driven by `gsap.ticker` (no second rAF loop), only for fine pointers without reduced motion.

## Brand (verified 23 Oct 2026 on tifferend-brand-journey.lovable.app)
- Colours: `#000` bg, `#fff` fg, accent `#FF7F4D` (rendered `--accent`), loader ember `#FF734E`, border `#2E2E2E`, muted text `#8C8C8C`. Don't add unrelated colours; project pages may theme with the project's own palette (`theme` in projects.js).
- Fonts (client, Oct 2026): **PP Editorial Old** for headings, titles and editorial emphasis; **Suisse BP International** for body text.
  - Both are commercial and not yet licensed or installed. The `@font-face` slots use `local()` only; see `public/fonts/README.md` to add the woff2 files.
  - Until then the stacks fall back to self-hosted Lora (display) and Inter (text).
  - Display type is set at regular weight (400) with italic, bold (700) and ember-underline emphasis. Never ship unlicensed font files.
  - Space Mono only inside the preserved loader.
- Type rules: the scale at 1440 is xxl 89, xl 52, lg 34, statement 26, body 16–17, and section padding is `--sec` (72–136px). Keep imagery dominant; don't scale type back up.
  - No tracked uppercase monospace labels and no index numbers.
  - Fine rules only where a reference calls for them: service rows (Bold & Beyond) and Info panel rows (Mensch).
  - Square buttons; headlines held to two lines. The PDF §06 small label + large headline pair stays, set as a sentence-case ember label.
- Wordmark: the authentic lowercase "tifferend" logo, traced 1:1 to vector in `src/data/wordmark.js`. Never retype it in a font or substitute another mark. Replace the path only with an official vector from the studio.
- The loader is a rebuild of the live site's preloader (grain, six mono words with ember dashes, extruded logo flip-in, 120px ember line, once per session). Keep it. It must never wait on the network; the CSS failsafe hides it after 6s.

## Content integrity
- Only My Mithila is verified client work. Other projects are `draft: true` placeholders from the current site. They are disclosed on their pages and carry no metrics. Never add results, quotes or client relationships that the studio hasn't confirmed.
- Testimonials: only confirmed client films go in `testimonials.js`. Sample slots are labelled as samples.
- Placeholder AI images with garbled lettering from the old site are not used.

## Interaction rules
- Every hover interaction needs a touch and keyboard equivalent (services: keyboard focus previews; first tap previews, then a visible link opens the work).
- Animate transform/opacity only. Every reveal is gated on `.js:not(.reduced)`; reduced motion gets no loader, no split text, a poster instead of the hero film, and a static logo grid.
- Decorative autoplay video: muted, inline, plays only in view, always has a pause button.
- Forms never claim success without a 2xx from `site.formEndpoint`.

## Tools
- Taste skill: `skills-lock.json` records it; the installed files (`.agents/`, `.claude/skills/`) are git-ignored. Reinstall with `npx skills add https://github.com/Leonxlnx/taste-skill --skill design-taste-frontend`. Don't run its `assets.mjs` (it searches external image archives).
- React Bits is a React library; this site is vanilla, so techniques are ported (e.g. the magnetic buttons in `ui.js`), never installed.
- `tests/frames.mjs` captures viewport frames at story beats (use it for pinned scenes; full-page shots can't show them).

## Deployment
- GitHub Pages via Actions (`.github/workflows/deploy.yml`) from `main` of https://github.com/spectertechnologies9-automation/tiferrend-new. Live at https://spectertechnologies9-automation.github.io/tiferrend-new/. CI derives `SITE_BASE` from `configure-pages`.
- The workflow's "Check build output" step names real files: update it when renaming or removing media, or every deploy fails.
- Never force-push `main`; reconcile remote work with a merge.

## QA before declaring done
`npm run build` (locally on Windows/Git Bash: `MSYS_NO_PATHCONV=1 SITE_BASE=/tifferend/ npm run build` to also test the 404), then `npm test`. It serves `dist/` under `/tifferend/` and runs in Chrome (channel `chrome`, because bundled Chromium can't decode H.264), Firefox and WebKit. Record real results in `PROJECT_STATUS.md`. Stop any `vite preview` before building: Windows locks `dist/` media files.
