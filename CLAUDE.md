# CLAUDE.md — Tifferend site

Durable rules for anyone (human or agent) working here.

## Architecture
- Static multi-page site: Vite 8 + vanilla ES modules. `scripts/build-pages.mjs` renders every page from `src/data/*` into root-level HTML (`index.html`, `work/…`, `about/`, `contact/`, `404.html`). Those files are generated and git-ignored: change data or `scripts/pages.mjs` / `scripts/shell.mjs`, never the generated HTML.
- `vite.config.js` runs the generator at startup; in dev, edits to `src/data` or `scripts` regenerate pages and reload.
- `base: './'` and `{{root}}`-relative links everywhere, so one build works under a GitHub Pages sub-path and on a domain root. Only `404.html` pins `<base href>` from `SITE_BASE` (set by CI).
- JS: `main.js` boots shared UI (`ui.js`, `loader.js`) and lazy-loads one page module (`home`, `work`, `about`, `contact`). GSAP/ScrollTrigger/Lenis are dynamic imports. Content must work without JS.
- CSS: one file, `src/styles/main.css`, desktop-first art direction with adaptations at 899 / 599px. Tokens at the top.
- Hero background: real behind-the-scenes footage of a commercial shoot (Pexels 8089122 by Ron Lach, 4K source, Pexels licence), cut to a 12 s seamless loop as `media/video/shoot-{2160,1080,720,tall}.mp4` plus posters, under `.hero__shade`. `heroVideo()` in `home.js` picks the file by device pixels (2160 only above 2600 px across). The old astral starfield, floating objects and studio line drawing were retired (they're in git history).
- Hero logo (client, Nov 2026): the large centre wordmark stays exactly as built — `wm3()` in `scripts/shell.mjs`, 7 per-glyph 3D stacks (`.g3` > `.g3__s` > `.g3__p` > `.g3__in`, SVG layers on `translateZ`), same size, position and styling — but it is STATIC. `src/js/hero3d.js` no longer animates it (no entrance, idle, waves, swap, cursor springs, ember light or scroll lift-off); it only runs the hero's non-logo scroll beat (film push-in, copy and video control fading). The loader still lands on it. Never remove or move it; never re-animate it without the client asking.
  - The t and the i stem are one contour in the artwork, so wherever the t must move alone, glyph 0 is split by `T_CLIP` / `I_CLIP` (wordmark.js) and the i stem renders with glyph 1. `DIFFERENT_SHIFT` holds each glyph's offset in DIFFERENT, measured from rasterised outlines; re-measure if the logo vector is replaced.
- Header logo D/T swap (client-approved): `src/js/logoswap.js` exchanges the header logo's own t and d on shallow arcs every 5 s (TIFFEREND ⇄ DIFFERENT, continuous loop; reduced motion: static). Each glyph is a `<g class="hs">` in `hdrMark()` carrying `data-sx/cx/cy`; logoswap writes only that group's transform attribute (wordmark units). The header logo is always visible, over the hero too.
- The letters are clean white faces over a shallow warm extrusion. The removed black "ink/venom" material must not come back.
- `src/js/fluid.js`: one WebGL2 context renders an image only while it reveals or bends with scroll; idle images are plain DOM. No pointer-driven ripples (removed with the liquid cursor). A reveal that is reached mid-scroll uploads its texture immediately (uploads otherwise wait for calm scrolling; before Nov 2026 such reveals timed out and popped in, which is why the flow "didn't appear"). Registered: studio mosaic, Work grid, careers, project imagery, About strip, testimonial posters; tiles and covers bend. The services exchange (`SVC_FLOW`) is off: Bold & Beyond crossfades. Texture uploads are queued (createImageBitmap, ≤1280 px); canvases are sized at idle. Headings use `liquid()` (SVG feImage noise + feDisplacementMap). Diagnostics: `?nofluid`.
- Cursor: native cursor plus the orange ember streak (`trail.js`, desktop only, client-approved). The liquid lenses around the pointer (`ripple.js`) were removed at the client's request ("the liquid thing around the cursor isn't looking good"); don't add fluid, blob or distortion cursor effects.
- The watery effect lives in `fluid.js` (reveals, scroll bends, headings). Heading displacement scales with the font size (≈1.4 em); a fixed px value tears smaller headlines apart.
- Bulk edits by script: never put `$$` in a `String.replace` replacement (it collapses to `$`); use split/join.
- Header logo reveal: `hdrMark()` in `shell.mjs` clips each glyph with rectangular windows. `src/js/logoreveal.js` morphs them dot → bar → full after the loader, on hover or focus, and rarely when idle. It animates only the clip rects, the swap only the glyph groups, so they never fight. Without JS the windows cover the glyphs.
- Client logos: on the homepage a "Select clients" strip sits right after the hero (client request, matching the Lovable order), and the footer copy is hidden there. Other pages show the strip in the footer, above the closing wordmark. Careers (`careersBlock()`) is the last section before the footer on home and About.
- Homepage order (redesign, Nov 2026): hero (locked) · clients (`#intro`, the hero's Scroll target) · Selected work (4 tiles, 2×2, edge to edge, no gaps; client + category bottom-left on the picture, no gradient or box) · Services (Bold & Beyond: one full-bleed photograph per service, a small ember DM Mono label on the left, the names stacked tightly on the right in the display face — selected white italic, the rest faded — no numbers, no rules; hover/focus/first tap crossfades the photograph and shows the line + link under the list; click opens `work/?service=…`; no service pages) · Studio `#studio` (philosophy + quote, real BTS mosaic, Process `#process` as 01/02/03 steps) · client films · enquiry · careers · footer. "Understand, Create, Amplify" lives only as the numbered process steps.
- The hero is locked: `node tests/hero-guard.mjs check` (with `vite preview --port 4173` on a fresh build) must report `unchanged: true` after any change. It fingerprints the hero markup, `hero3d.js`, hero CSS rules and geometry, and compares static screenshots in `tests/hero-baseline/` (baseline re-saved Nov 2026 with the static logo; only `hero3d.js` differed from the animated original).
- SEO: `site.url` drives canonical, og:url and og:image (`media/brand/og-image.jpg`), and the JSON-LD (`structuredData()` in `shell.mjs`). Structured data uses only published facts. `build-pages.mjs` generates `public/sitemap.xml` and `robots.txt` (git-ignored) from indexable pages; draft projects and the 404 page are noindex.
- Footer wordmark: `src/js/footerdance.js`, lazy-loaded near the footer, never under reduced motion. Each glyph is `<g class="fgw">` (waves, scatter, pointer springs) wrapping `<use class="fg">` (bounce). Keep those layers separate.
- Lenis `preventDefault`s wheel events while stopped (any open dialog stops it), so every scrollable overlay needs `data-lenis-prevent`. Scroll areas inside a sheet need a flex column with `min-height: 0`, not a grid row.
- Editorial contrast: the generator's `emph()` sets a headline's closing word in italic, unless the title carries explicit marks (`*italic*`, `**bold**`, `__underline__`, one per headline at most). `reveals()` splits only plain text plus `<em>`, `<strong>` and `<u>`. Media tagged `data-flow` reveals behind a wave edge (CSS keyframes). A GSAP-driven clip on the same element must remove `data-flow`, because the CSS animation would win.
- Pinned scenes use CSS `position: sticky` stages driven by GSAP ScrollTrigger scrubs (no ScrollTrigger `pin`), so Lenis and native scroll behave the same. Desktop-only scenes live in `gsap.matchMedia('(min-width: 900px)')`.
- One Lenis instance driven by `gsap.ticker` (no second rAF loop), only for fine pointers without reduced motion.

## Brand (verified 23 Oct 2026 on tifferend-brand-journey.lovable.app)
- Colours (client direction, Oct 2026): **predominantly white**. Page `--bg #fff`, text `--fg #0b0b0b`, brand accent `#FF7F4D` for fills and large marks, `--ember-text #c24d1c` for small orange text and focus rings on white (AA), and `--on-accent` black text on orange fills. Dark "stages" use the original palette through the `.dark` class (hero, services, footer, loader, next-project panel), which re-declares the tokens. Use the semantic tokens (`--bg`, `--fg`, `--text`, `--soft`, `--mute`, `--line`, `--surface`); never hard-code white for text outside a `.dark` stage or imagery. Mono client logos render black on white and white inside `.dark`. Don't add unrelated colours; project pages may theme with the project's own palette (`theme` in projects.js).
- Fonts (client, Oct 2026): **PP Editorial Old** for headings, titles and editorial emphasis; **Suisse BP International** for body text; **DM Mono** (OFL, self-hosted via `@fontsource/dm-mono`, `--f-meta`) for labels, numbering and metadata.
  - Both are commercial and not yet licensed or installed. The `@font-face` slots use `local()` only; see `public/fonts/README.md` to add the woff2 files.
  - Until then the stacks fall back to self-hosted Lora (display) and Inter (text).
  - Display type is set at regular weight (400) with italic, bold (700) and ember-underline emphasis. Never ship unlicensed font files.
  - Space Mono only inside the preserved loader.
- Type and space (client: "more negative space, zoom out slightly", Oct 2026):
  - Scale at 1440: xxl 75, xl 45, lg 29, statement 22, body 16–17.
  - `--sec` 80–176px, `--gutter` 20–88px, content `--max` 1480px.
  - Homepage Selected work tiles run edge to edge with no gaps (Kingdom & Sparrow); the Work page grid stays inside the margins.
  - Keep imagery dominant and body text at 16px or more; don't scale type back up.
  - Labels (`.lbl`, ember) and metadata (`.meta`, muted) are DM Mono 11.5px uppercase, single line. Numbers only where they order something (services, process steps).
  - Fine rules only where a reference calls for them: service rows (Bold & Beyond) and Info panel rows (Mensch).
  - Square buttons; headlines held to two lines. The PDF §06 small label + large headline pair stays, the label in DM Mono.
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
