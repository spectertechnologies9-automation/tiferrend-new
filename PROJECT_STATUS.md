# PROJECT_STATUS — Tifferend website (v2 redesign)

_Last updated: 24 Oct 2026. Fresh build in `Desktop/tifferend final/`. The previous build in `Desktop/tifferend/` was left untouched._

## 1. What was implemented

| Area | Status | Notes |
|---|---|---|
| Loader | ✅ Preserved | Rebuilt from the live site's own code: black dot-grain field, BRAND·DESIGN·IDENTITY·STORY·STRATEGY·CRAFT with ember dashes, extruded logo flip-in, 120px ember line, `sessionStorage` once per session. Shortened from 3.1s to ~2.4s. Skippable with any input. CSS failsafe at 6s. Skipped under reduced motion. |
| Hero (Mensch) | ✅ | Authentic "tifferend" wordmark (vector trace of the live PNG) floats in the sky of the real My Mithila film: chai pours past it. Black face with an ember extrusion derived from the loader. Typed service line, live tagline, scroll cue, pause button. Separate crops: portrait 540/720 for phones, 1080×760 wide crop for desktop. A `<picture>` poster is the LCP image. The loader logo flies into the hero mark on first visit. |
| Navigation + Info (Mensch) | ✅ | Desktop: Work/About/Contact left, logo centre (hidden over the hero), Sound + Info right. Mobile: logo + Info + Menu, each a native `<dialog>` bottom sheet (focus trap, Esc, closes on navigation). Info: about, services, client logos, enquiries, careers, social. |
| Client logos (Mensch) | ✅ | 14 real logos from the live site, as a white-silhouette marquee (JITO in colour). Pauses on hover/focus; static grid under reduced motion. |
| Selected Work (K&S) | ✅ | Exactly 4 edge-to-edge tiles, 2×2 at ≥900px, stacked on phones (3:2 tablet). Client + category on the image, black/white per data, no gradient/box/badge, whole tile is a link, per-tile crop for desktop and mobile. |
| Services (Bold & Beyond) | ✅ | Indexed list. Hover or keyboard focus swaps the background image. Click opens `work/?service=…`. Touch: first tap previews (image, line, "See N projects" link), second tap or the link opens the work. |
| Testimonials (Mellow) | ✅ component / ⚠ content | Thumbnail first, loads on click, native controls, WebVTT captions, one at a time, loading/error states. **No confirmed client testimonials exist**, so two clearly labelled sample slots use Tifferend's own footage (`showSampleTestimonials`). |
| Studio teaser + About | ✅ | Real BTS footage (Blender/AE work on the My Mithila film), story, mission, philosophy, values, careers. All copy verbatim from the live site. |
| Process (Mellow About) | ✅ | Understand / Create / Amplify (verbatim). Sticky image + ember progress rail on desktop, stacked with images on mobile. Outline numerals turn ember when active. |
| Contact (Mellow) | ✅ | Labels, types, autocomplete, inline + summary validation, honeypot. Honest submission: JSON POST to `formEndpoint` when set (success only on 2xx), otherwise a mailto hand-off that says nothing is sent until the visitor presses send. |
| Footer (Mensch + Mellow) | ✅ | CTA, Studio / Services / Social / Contact columns, Ask ChatGPT / Ask Claude links (PDF §09: only the public URL + a fixed prompt are passed), edge-to-edge wordmark revealed by a clip wipe. |
| Work page (Imagined) | ✅ | Scattered editorial grid with per-slot parallax on desktop, 2-column stagger on tablet, single column on phones. Filters are sticky on mobile, synced to `?service=`, with an empty state and a live-region count. |
| Project pages | ✅ | Generated per project from typed `sections`. Themed head (My Mithila uses its own palette). Draft notice for placeholders. Next-project link. My Mithila: film with captions, billboard, motifs, palette, cards/tote, storefront, 13 social posts, bamboo, outcome. |
| Sound | ✅ | Optional, off by default, synthesised UI ticks (no files), remembered per visitor. |
| Motion | ✅ | View Transitions between pages, word reveals, hero float/tilt/scroll drift, services crossfade. Lenis only for fine pointers without reduced motion; touch keeps native scroll. |
| GitHub Pages | ✅ config / ⏳ not deployed | See §8. |

## 2. Major design decisions

- **Hero concept:** "the wordmark floats in the sky of our own work". Mensch's floating object becomes the real logo, the sky is the studio's own CGI film, and the extrusion carries over from the loader. The black face keeps contrast on the pale sky; the white loader logo inverts to it during the hand-off.
- **Palette:** strictly the verified black / white / ember. Colour comes from the work imagery, as the brief asks. Project pages may adopt the client's palette.
- **Typography:** Lora 600 headlines plus Space Mono labels, matching the live site. Mellow's two-style section headings are a small ember-dash mono label plus a large Lora headline, and each reads on its own.
- **Routing:** real HTML file per route (no hash routing, no SPA fallback). Refresh and deep links work anywhere, and the pages work without JS.
- **Content-first data:** one data layer generates every page, so the team edits `src/data/*.js`, not HTML.
- **No Higgsfield credits spent:** the real My Mithila film supplied the hero, BTS and project footage. Generated footage would have been weaker, and inauthentic.

## 3. Files

New project, all created this session:
- Config: `package.json`, `package-lock.json` (seeded from the previous project's lock; see §9), `vite.config.js`, `.gitignore`, `.github/workflows/deploy.yml`, `.claude/launch.json`
- Generator: `scripts/build-pages.mjs`, `scripts/shell.mjs`, `scripts/pages.mjs`, `scripts/lib.mjs`
- Data: `src/data/{site,services,projects,clients,testimonials,studio,wordmark}.js`
- Code: `src/js/{main,env,loader,ui,home,work,about,contact,testimonials}.js`, `src/styles/main.css`
- Media: `public/media/brand/*` (logo PNG + vector), `public/media/clients/*.webp` (14), `public/media/work/*` (responsive WebP/JPEG), `public/media/video/*` (hero 540/720/wide, BTS, My Mithila film, posters, 3 WebVTT files), `public/robots.txt`, `public/.nojekyll`
- Tests: `tests/qa.mjs`, `tests/shoot.mjs`, `tests/qa-results.txt`
- Docs: `README.md`, `CLAUDE.md`, this file

## 4. Dependencies

Runtime: `gsap 3.15.0`, `lenis 1.3.27`, `@fontsource/lora 5.3.0`, `@fontsource/space-mono 5.3.0`. Dev: `vite 8.3.4`, `playwright ^1.56`. Lighthouse ran via `npx lighthouse@12.8.2` (not a project dependency). Media tools (sharp, potrace, ffmpeg-static) were used from a scratch folder and are not project dependencies.

## 5. Tests actually run (24 Oct 2026, production build served under `/tifferend/`)

`npm test` → **196 passed, 0 failed** (`tests/qa-results.txt`):
- **Chrome** (real Chrome channel), 10 widths (320–1920) × 7 pages: HTTP 200, no element past the viewport edge, no horizontal scroll, no broken images, no reveal left hidden, zero console or network errors.
- **Firefox and WebKit**, 375 + 1440 × 7 pages: same checks.
- All 3 engines:
  - Loader shows on first visit and hands off within 3.6s, then is skipped on repeat.
  - Hero film plays with the correct source per screen (Chrome/WebKit).
  - Menu opens, closes with Esc and navigates.
  - Service tap previews without navigating, and its link opens the filtered Work page.
  - Desktop service hover swaps the image, and a click filters Work.
  - Filters update the URL and results.
  - Tile → project → next project.
  - Testimonial plays, the previous one pauses, captions are attached.
  - Form shows its error summary, then the honest mailto hand-off message.
  - Skip link comes first.
  - AI link carries only the public URL.
  - Reduced motion: no loader, no split text, poster instead of video, static logos.
  - A project deep link loads directly.
  - The 404 page is styled under the sub-path.

Bugs the tests caught and fixed:
- On touch, tapping a service navigated straight away, because the focus handler pre-activated it.
- The Work empty state showed while marked `hidden`.
- Collapsed service rows kept empty height on mobile.
- The "← All work" link on themed heads failed contrast.

**Lighthouse 12.8** (localhost, so network figures are optimistic; mobile uses simulated throttling):

| Page | Mobile perf / a11y / BP / SEO | Mobile LCP | Desktop perf / a11y / BP / SEO |
|---|---|---|---|
| Home | 83 / 100 / 100 / 100 | 4.2 s | 98 / 100 / 100 / 92* |
| Work | 98 / 100 / 100 / 100 | 2.2 s | 99 / 100 / 100 / 92* |
| My Mithila | 92 / 100 / 100 / 100 | 3.0 s | 98 / 96* / 100 / 92* |
| About | 96 / 100 / 100 / 92* | 2.6 s | 99 / 100 / 100 / 92* |
| Contact | 99 / 100 / 100 / 91* | 1.7 s | 99 / 100 / 100 / 91* |

\* Measured before the robots.txt / 12px-label / contrast fixes. Home, Work and My Mithila (mobile) were re-measured after them and reached SEO 100 and a11y 100. The others weren't re-run.
Home mobile LCP is dominated by the preserved first-visit loader; repeat visits skip it.

**Visual review:** full-page screenshots of every page at 1440 and 390 were inspected by eye. Fixes from that review:
- Extrusion depth halved (it stair-stepped).
- Mobile wordmark moved into the sky band.
- My Mithila tile label moved to a clear area.
- Header no longer tints pink over themed heads.
- Swatch text colour now computed per swatch.
- Duplicate BTS video removed from the About strip.
- Footer CTA hidden on Contact.
- Carousel scroll-padding added.

**Not run:**
- Real iOS/Android devices.
- Safari proper (WebKit engine only).
- A screen-reader pass.
- Lighthouse on a deployed URL.
- A visual pass in the in-app browser after the pane stopped rendering; I used headless screenshots instead.

## 6. Mobile viewports tested
320, 360, 375, 390, 414, 430 (touch + mobile emulation), 768, 1024, 1440 and 1920 in Chrome. 375 and 1440 in Firefox and WebKit.

## 7. Production build
`npm ci && npm run build` succeeds (verified with a clean `npm ci`). JS: 9 KB core + 0.5–4 KB page chunks; GSAP 27 KB + ScrollTrigger 18 KB + Lenis 6 KB gzipped, loaded only where used. Hero film: 0.8 MB (phones) / 1.45 MB (desktop).

## 8. GitHub Pages
- **Configured:**
  - `.github/workflows/deploy.yml` uses the official actions: checkout v4, setup-node v4 with npm cache, configure-pages v5, `npm ci`, build, an output sanity check, upload-pages-artifact v3, deploy-pages v4.
  - Relative base for all pages; `SITE_BASE` comes from `configure-pages` for 404.html.
  - `.nojekyll` and `robots.txt` are in place.
  - All paths are lowercase, which matters on Linux.
- **Not deployed.** The project isn't a git repository yet, there's no remote, and the GitHub CLI isn't installed. No existing CNAME or custom-domain config was found to preserve.
- **Next step:**
  1. Create a repo.
  2. `git init && git add . && git commit && git branch -M main && git remote add origin <url> && git push -u origin main`.
  3. Set Settings → Pages → Source to **GitHub Actions**.
  4. Check the Actions run, open the URL, and run Lighthouse there.

## 9. Remaining issues and missing assets
1. **Real projects:**
   - Only My Mithila is verified.
   - Maison Luxe, Ember & Oak, Frame Collective, Noir Collective and The Grand are drafts carried over from the current site, with AI images and no confirmed client. Three of them fill homepage tiles.
   - Replace them before launch, or set `showDraftProjects: false` (that needs four verified `featured` projects).
   - Events & Production currently has only a draft project.
2. **Video testimonials:** none confirmed. The current site's text quotes are unconfirmed, and one contradicts the case study (it names "Ananya Rao" as founder; the case study and business card say Anant Alok).
3. **Agency photography / team / BTS stills:** only the My Mithila BTS footage exists. The About strip will take more via `studio.js`.
4. **Logos:**
   - IDH (the supplied PNG has a baked-in checkerboard).
   - A My Mithila logo for the strip.
   - An official vector Tifferend logo (the current one is a high-fidelity trace).
5. **Contact details:** phone, address, Instagram and LinkedIn aren't on the current site. Only email and X/Twitter are shown.
6. **Form endpoint:** not set, so submissions use mailto. Add a Formspree (or similar) URL to `site.formEndpoint`.
7. **`site.url`:** unknown until hosting is decided. og:url and og:image are omitted until it's set.
8. **Lockfile:** a fresh `npm install` hit an npm 10 bug ("reading 'edgesOut'") on this machine, so the lock was seeded from the previous project's lock (same versions). `npm ci` from it is verified.
9. **Usage rights:** confirm the My Mithila footage and imagery, and the bamboo photo (looks like stock), are cleared for portfolio use.
10. **Brief vs prompt URLs:** the PDF links mensch.club, boldandbeyond.in, mellowdesigns.co and auge-xp.com (the prompt listed other domains). I followed the PDF and the supplied screen recordings. Imagined = imagined.studio/tech, per the PDF.

## 10. Exact next steps
1. Push to GitHub and enable Pages (§8). Verify the live URL in a phone browser.
2. Send the studio the asset list in §9 (1–6). Add projects via `src/data/projects.js` (one entry plus images each).
3. When real testimonials arrive, add them to `testimonials.js` (video, poster, VTT). The sample slots disappear automatically.
4. Set `formEndpoint` and `site.url`, rebuild, then run Lighthouse on the live site.
5. Test on a real iPhone (Safari) and a mid-range Android.
