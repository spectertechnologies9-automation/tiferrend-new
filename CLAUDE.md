# CLAUDE.md — Tifferend site

Durable rules for anyone (human or agent) working here.

## Architecture
- Static multi-page site: Vite 8 + vanilla ES modules. `scripts/build-pages.mjs` renders every page from `src/data/*` into root-level HTML (`index.html`, `work/…`, `about/`, `contact/`, `404.html`). Those files are generated and git-ignored: change data or `scripts/pages.mjs` / `scripts/shell.mjs`, never the generated HTML.
- `vite.config.js` runs the generator at startup; in dev, edits to `src/data` or `scripts` regenerate pages and reload.
- `base: './'` and `{{root}}`-relative links everywhere, so one build works under a GitHub Pages sub-path and on a domain root. Only `404.html` pins `<base href>` from `SITE_BASE` (set by CI).
- JS: `main.js` boots shared UI (`ui.js`, `loader.js`) and lazy-loads one page module (`home`, `work`, `about`, `contact`). GSAP/ScrollTrigger/Lenis are dynamic imports. Content must work without JS.
- CSS: one file, `src/styles/main.css`, mobile first (600 / 900 / 1280). Tokens at the top.

## Brand (verified 23 Oct 2026 on tifferend-brand-journey.lovable.app)
- Colours: `#000` bg, `#fff` fg, accent `#FF7F4D` (rendered `--accent`), loader ember `#FF734E`, border `#2E2E2E`, muted text `#8C8C8C`. Don't add unrelated colours; project pages may theme with the project's own palette (`theme` in projects.js).
- Fonts: Lora (400/600) display, Space Mono (400/700) UI. Self-hosted via @fontsource.
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

## QA before declaring done
`npm run build` (locally on Windows/Git Bash: `MSYS_NO_PATHCONV=1 SITE_BASE=/tifferend/ npm run build` to also test the 404), then `npm test`. It serves `dist/` under `/tifferend/` and runs in Chrome (channel `chrome`, because bundled Chromium can't decode H.264), Firefox and WebKit. Record real results in `PROJECT_STATUS.md`. Stop any `vite preview` before building: Windows locks `dist/` media files.
