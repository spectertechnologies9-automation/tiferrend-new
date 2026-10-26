# PROJECT_STATUS — Tifferend website

_Last updated: 25 Oct 2026 (session 7: client feedback — hierarchy, typography, testimonials, flow). Build in `Desktop/tifferend final/`._

## Session 7: client feedback pass (read this first)

**References inspected** (contact sheets, plus fine frames around transitions):
- **Brief PDF** (in the WhatsApp recording): its section reference map assigns Mensch to the hero, Info and client logos, Kingdom & Sparrow to the 2×2 work tiles, and Bold & Beyond to the services hover backgrounds.
- **Mensch:** a 3D mark that grows grass while a red ribbon flies around it; a cursor-driven fluid smear of the cloud background; horizontal testimonial cards; client logos above a giant wordmark.
- **Mellow:** the header logo assembles from rectangular fragments (dots → bars → word) and breaks apart again; horizontal 16:9 video testimonials with arrows; a sitemap footer.
- **Bold & Beyond:** light rows of names with thumbnails on hover; generous spacing at small sizes.
- **AUGE:** studied in session 6.

**Spacing and hierarchy (priority 1)**
- New type scale at 1440: section heads 86 → 52 px, page titles 200 → 89 px, statement 36 → 26 px, labels 15 → 13.5 px.
- Display type goes from 620–650 weight to 400, with italic / bold / ember-underline emphasis.
- Section padding `--sec` reduced from up to 220 px to 72–136 px. The homepage measured about 2,000 px shorter.
- Services rebuilt as Bold & Beyond rows: editorial-size names on fine rules, the active row shows its line and link, and the full-bleed background still changes on hover (liquid swap).
- Remaining heavy display rules normalised: menu, work list, project titles, swatches, About process numerals.

**Typography (client fonts)**
- PP Editorial Old (headings) and Suisse BP International (body) are wired into the font stacks through `local()`-only `@font-face` slots.
- **No font files exist in the project or on this machine; both need web licences.** See `public/fonts/README.md`.
- The live site currently renders the fallbacks, Lora and Inter. The new families can't be claimed as implemented until licensed files are added and checked.
- **Headline emphasis:** `rich()` markup now supports *italic*, **bold** and __underline__; for example "Work that gets __remembered__." and "Brands we've helped come **alive**." The word reveal keeps all three.
- **Editorial quote:** the intro statement (serif, selective italics, small inline My Mithila frames) gains hanging ember quotation marks, after the client's screenshot. The copy is unchanged.

**Header logo (priority 2):** a new Mellow-style fragment reveal on Tifferend's own wordmark (`hdrMark()` + `logoreveal.js`).
- Each glyph's windows morph dot → bar → full.
- It runs after the loader, on leaving the homepage hero, on hover or focus, and rarely when idle.
- Verified: windows width 0 over the hero, then 4737 (the full mark) after the reveal. The loader is unchanged.

**Hero (priority 3), decision: refine; no showreel, no grass**
- **Showreel ruled out:** the only real footage is portrait (the 35 s My Mithila film and the BTS clip, 720×1266), so a widescreen showreel isn't possible without new landscape edits.
- **Grass ruled out:** convincing grass needs a 3D instanced-grass system and a green palette outside the brand colours.
- **What changed:** the dated typewriter service line became a masked word roll in the display italic. The 3D wordmark and its motion are kept.
- This needs client approval if they still want a showreel or a tactile reveal.

**Work grid (priority 4):** every tile label sits bottom-left at an editorial size (1.45 rem client name, 13 px kind of work) over a soft floor shade. The per-tile alignment variants were removed. Links and content are unchanged.

**Sections (priority 5)**
- Removed the homepage "Understand. Create. Amplify." block and its JS and CSS.
- The About page keeps the useful stage content, retitled "Process / How we work." with smaller numerals. **The new headline wording needs client approval.**
- The footer CTA ("Let's build something remarkable.") is hidden on home and contact, where an enquiry form already ends the page.
- The homepage clients section moved into the footer as a Mensch-style "Select clients" strip on every page, so the logos aren't shown twice.

**Testimonials (priority 6):** a horizontal track of 16:9 cards.
- Native swipe, trackpad and shift-wheel with snap (`data-lenis-prevent-horizontal` so Lenis passes horizontal gestures through).
- Prev/next buttons that disable at the ends, arrow keys, one film plays at a time, and a film pauses when scrolled out of view.
- **Only sample slots exist, and both clips are portrait.** They're letterboxed over a blurred copy of their poster, not cropped. No testimonial content was invented.

**Flowing animation (priority 7)**
- **Why it wasn't visible:**
  - Nothing since the first commit has been deployed, so the client's site has none of the fluid work.
  - The ripple lenses render only in Chromium and were held at 10–20% intensity on request.
  - The image and heading effects fire only on hover, while scrolling, or once at reveal.
  - The reference (Mensch) is a cursor-driven fluid smear, which the site lacked.
- **Fix (revised):** a smoke fluid simulation was tried first, but the client rejected it in favour of the original orange streak. The watery effect was instead strengthened ×2 where it lives: `fluid.js`, covering images and headings site-wide (see Client follow-ups).
- Verified (`tests/client6.mjs`): the smoke canvas is gone, the orange streak draws while the pointer moves and clears at rest, no console errors.

**Footer (priority 8):** the sitemap now has Studio (Work, About, Process, Careers), Services and Connect (Start a project, email, X), plus the AI summary links, the client strip and the dancing wordmark.

**Client follow-ups:**
- The client clarified that the "old cursor effect" is the simple orange streak (`trail.js`), and that +100% applies to the site-wide watery effect, not the cursor.
- **Removed:** the smoke fluid simulation (`fluidsim.js` deleted). The streak is the visible cursor mark, and the faint Chromium-only lenses are unchanged.
- **Doubled in `fluid.js`:**
  - scroll bend (0.07 → 0.14)
  - hover ripple and flow (0.0089 / 0.0125 → 0.0178 / 0.025)
  - reveal and swap displacement and chromatic split
  - footer signature liquid (55 → 110)
  - Heading liquid is now 2× the earlier strength *relative to letter height* (≈1.4 em). A raw ×2 of the px value tore the new, smaller 52 px headlines into fragments; verified in frames.
- **Verified:** streak draws while moving (322 px) and clears at rest; heading reveal is watery at 0.35 s, rippling at 0.7 s and crisp by 1.5 s; tile hover visibly warps with a colour split.

**Tests actually run (25 Oct 2026, `/tifferend/` production build)**
- `npm test`: the first run failed 20 checks, all one bug of mine: the portrait backdrop's poster `url()` sat in a CSS custom property, which resolves against the stylesheet and 404'd. After moving it to an inline element: **199 passed, 0 failed** (Chrome, Firefox, WebKit), saved to `tests/qa-results.txt`. Rerun after the cursor and fluid changes (smoke removed, watery effect ×2): **199 passed, 0 failed**.
- `tests/client6.mjs` (new):
  - Header logo windows 0 over the hero, 4737 once revealed.
  - Flow on while moving, asleep at rest.
  - Next button advances the track by 573 px.
  - Trackpad swipe moved it 573 px in a settled run; it reads 0 when the smooth page scroll hasn't settled before measuring (a test-timing flake, confirmed with an event log).
  - No console errors.
- `tests/interact.mjs`: Info scroll by wheel (0 → 28 max → 0, page unmoved) and touch (max 46); cursor springs recover; footer moving; no errors.
- `tests/fluid.mjs`: headings and footer liquefy; tiles bend while scrolling and then idle; project and about reveals on; next-project ripple on. The services swap was confirmed separately (24 of 24 frames on). The testimonial reveal is now 0 by design, since portrait samples are excluded.
- `tests/scrollperf.mjs`: p50 16.7 ms, p95 17.0–17.1 ms, max 50 ms, 3–7 frames over 25 ms (the same profile as session 6).
- Visual audits (`tests/audit.mjs`, new): home, about, work, contact and a project page at 1440, home at 390.

**Needs client decision / input**
1. Licensed PP Editorial Old and Suisse BP Intl web fonts, or approval to keep the fallbacks.
2. Whether a showreel is wanted, which needs landscape footage; the hero stays refined, not replaced.
3. The About process headline "How we work." (replaces the disliked slogan).
4. Real client testimonial films; landscape fills the new 16:9 cards.
5. The watery effect at 2×: heading reveals are strongly liquid for about 0.5 s, then crisp. Confirm the strength with the client.
6. **Deployment:** nothing since the first commit has been pushed, so the live site shows none of sessions 2–7. Commit and push to show the client.

**Next steps:** a client review of a pushed build; install the fonts when licensed; swap the samples for real testimonials; tune fluid strength if asked.

## Session 6: clean logo, fluid motion, ripple, Info redesign, hero objects

**Logos**
- The black ink material is removed from both wordmarks (`ink.js` deleted). The hero is clean white faces over a shallower warm extrusion.
- **Hero motion** (`hero3d.js`): small idle drift, waves every 7–11 s, occasional single-letter lift or nod, and readable cursor springs (excursion clamped to 16% of a letter's width).
- **Flips:** one coordinated sequence as the loader lands, another 2.3 s later, then about 1 per 13.4 s (was about 1 per 19 s).
  - Measured with `tests/flips.mjs`: first visit at 3.2 s and 5.5 s (loader gone at 2.6 s); repeat visit at 1.8 s and 4.0 s.
  - A module flag prevents duplicate sequences.
- **Footer** (`footerdance.js`): restrained hops, waves and breathe-apart moments, plus a one-time drop-in signature with a liquid filter.
  - Flips are `scaleX` 1 → −1 → 1 on the wrap layer, because SVG can't turn in 3D. A pair plays on first view, then a few runs now and then.
  - Pointer response is reduced and clamped.

**Hero**
- **Embers** in the astral layer: ~24 motes at three depths, 5 of them trailing.
  - +45–65% over the first size, with amber cores, orange halos and a lead/follower hierarchy.
  - Brief pulses; never shown over the hero copy or nav.
- **Starfield:** a water swell along the wordmark band plus pointer ripples.
- **Studio drawing:** SVG line art replaces the photo figure. The contour is traced from the earlier render's alpha channel (`src/data/figure-outline.js`). It has viewfinder brackets, a focus reticle, an ember rim and a tracing spark, all CSS-drawn.
- **Floating objects** (`objects.js`, inside the astral WebGL context): a camera, a phone with a layout, a softbox and a swatch fan.
  - Pearl and silver materials, ember rim, warm glints, tumbling around three-quarter views, an occasional flourish turn, and pointer parallax.
  - Scale is 1.4× the first pass and motion about 1.4× faster.
  - Phones get the camera and phone only.
  - No Higgsfield was used (about 0.25 credits left).
- **Travelling light** on the wordmark: dashed strokes on each glyph's own path (`.g3__light`), calm glides and bursts, glints, and spark hops between letters, biased toward the pointer. Measured with `tests/light.mjs`: it visited 5 letters with a hop between each.

**Fluid layer** (`fluid.js`), from a frame study of the AUGE recording (wave-warped type, velocity-bent panels, liquid chromatic ripples):
- **Images:** a WebGL liquid reveal (project images, about strip, testimonial posters), a scroll-velocity bend (tiles, studio strip, covers, next project), a hover ripple, and a liquid swap between services previews. Idle images are plain DOM.
- **Headings:** liquefied on arrival with an SVG feImage-noise displacement.
- **Measured with `tests/fluid.mjs`:** heading and footer filters applied; 4 tiles bend while scrolling, then idle; services swap on; reveals on (project 3, about 3, testimonials 2); next-project ripple on; no errors. The tile ripple was confirmed separately.

**Cursor ripple** (`ripple.js`): refractive lenses (`backdrop-filter: url(#rpN)`, Chromium) under the pointer and along its path.
- Strength was raised twice: +37%, then +30% (maximum 16 → 22 → 29 px). The image-hover and starfield ripple were scaled the same way.
- On touch, a ring where the finger lands.
- Measured with `tests/ripple.mjs`: lenses appear while moving (hero, services, footer) and are 0 at rest. Pixels change under the cursor.

**Info panel**
- Redesigned as a compact editorial sheet: teal wash, dark translucent card, thin light outline, rule-separated rows, bold uppercase headings.
- Rows: About, Services (dotted flowing line), Select clients, Project enquiries, Join the studio, Social. All content is real.
- **The reference screenshot mentioned in the brief was never attached;** the design follows its written description.
- Scroll verified (`tests/interact.mjs`): 1440×700 wheel reaches the max and back with the page unmoved; 390 touch reaches the max.

**Performance**
- Measured with `tests/scrollperf.mjs` (Chrome; a CSS-isolation argument was added).
- The fluid layer first caused 66–117 ms frames. The causes were synchronous texture uploads, mid-scroll canvas allocation and feTurbulence on headings.
- Fixes: queued createImageBitmap uploads, in-view-only drawing, idle canvas sizing and feImage noise.
- Now: p50 16.7 ms, p95 17.1 ms, max 50 ms, with 3–5 frames over 25 ms around the end of the hero. With `?nofluid` the max is 33 ms, so a little cost remains.

**Bugs found and fixed this session**
- Three `$$`→`$` collapses from scripted edits: footer import, hero import, and the `home.js` studio-strip reveal.
- Uniforms set on the wrong WebGL program after the objects pass (caught by WebKit QA).
- An orphaned service separator dot when the list wraps.

**QA:** `npm test` scored **199 passed, 0 failed** (Chrome, Firefox, WebKit, on a `/tifferend/` build). The run before the WebGL fix scored 198/199.

**Not done or not verified**
- The cursor ripple renders only in Chromium; in other browsers the lenses stay inert, while the WebGL ripples still work there.
- A real-device check on phones.
- Footer flip timing wasn't measured, only seen in frames.
- Nothing committed.

## Session 5: final refinement (AUGE language, cursor split, footer dance, Info scroll)

**Info panel scroll (fixed and verified):**
- **Cause 1:** a stopped Lenis `preventDefault`s every wheel event, and the open dialog stops it. Both sheets now carry `data-lenis-prevent`, so Lenis stays global.
- **Cause 2:** a grid `max-height` never constrained the `1fr` row. `.ip` is now a flex column and `.ip__scroll` has `min-height: 0` and `overscroll-behavior: contain`.
- **Verified with `tests/interact.mjs`:**
  - 1440×700 wheel: the panel scrolls 0 → 243 (max) → 0, and page `scrollY` stays at 0 throughout and after closing.
  - 390×760 touch drag: the panel scrolls 0 → 483 (max) with the page unmoved.
  - Close works.

**Hero:**
- **Cursor split:** spring physics per letter on `.g3` x/y/rotation/scale, set in `hero3d.js`.
  - Push depends on distance and pointer speed, with drag along the pointer's direction.
  - Neighbours pass on 28% of each impulse.
  - The springs are underdamped (overshoot), with excursions clamped. A tap triggers the same split on touch.
  - Measured: a sweep displaced letters by up to ±75 px, and they returned to 0 within 1.6 s.
  - Two fixes: the impulse was double-scaled by `dt` (letters moved 2–4 px), and boxes are now re-measured lazily because the entrance moved them.
- **Ink:** reworked into one continuous, mostly solid black flow (domain-warped field, folds, specular riding the flow, occasional ember). Visually checked at 1440.
- **Editorial figure:** a Higgsfield `gpt_image_2_5` transparent cut-out, `media/img/figure.webp` (35 KB).
  - Placement: right of centre, behind the wordmark (z-index below the title).
  - Grading: darkened, ember rim drop-shadow, feet dissolved by a mask.
  - Motion: fades in, drifts against the pointer, and lifts away on scroll.
  - On phones it sits at the right edge at 60% opacity.
  - The wireframe artifact moved to the upper left on desktop so it doesn't clash.

**Footer wordmark:** `src/js/footerdance.js`, lazy-loaded near the footer and skipped under reduced motion. The old CSS hover displacement (`footerMark`) was removed.
- **Bounce:** each letter has its own bounce timeline (anticipation, jump and twist, `bounce.out` landing).
- **Phases:** unruly stretches alternate with near-still coherent ones, separated by waves or groups scattering and reassembling elastically.
- **Pointer:** a spring burst cascades to neighbours, and a fast swipe throws letters. A tap on touch triggers a wave.
- **Layers:** `<g class="fgw">` (wave/scatter/pointer) wraps `<use class="fg">` (bounce), so the channels never overwrite each other.
- **Clipping:** the mark gained 0.3× headroom so jumps aren't clipped permanently. The bottom crop is unchanged.

**AUGE language, applied selectively, with copy unchanged:**
- **Italic contrast:** each headline's closing word sets in italic (`emph()` in `pages.mjs`; a trailing particle takes its verb along). Italic words drop in from above while upright words rise.
- **Statement collage:** a few italic words, two inline My Mithila frames (cup, billboard) and ✦ ↳ marks. They light word by word with the text.
- **Flow reveals:** tiles, studio-strip frames, project images, pairs, testimonial media and the about strip reveal behind a rising wave edge. Desktop tiles and strip frames use scrubbed GSAP polygons; elsewhere CSS keyframes on `[data-flow]`.
- **Services:** the active line turns italic (fine pointers only). Weight is not animated: that reflowed the row and broke the tap-to-preview test.
- Lora italic is now self-hosted (`@fontsource-variable/lora/wght-italic.css`).

**Tests actually run (25 Oct 2026, production build, `SITE_BASE=/tifferend/`):**
- `npm test`: **199 passed, 0 failed** (Chrome, Firefox, WebKit). Saved to `tests/qa-results.txt`.
  - The first run crashed on the services tap test (see the weight note above). After the fix it passed in full.
- `tests/scrollperf.mjs` (Chrome): 150 frames, p50 16.7 ms, p95 16.9 ms, max 17.3 ms, 0 frames over 25 ms, catch-up after input 550 ms. This run is vsync-locked; session 4's 7 ms median measured a different quantity on another run, so the numbers aren't directly comparable.
- `tests/interact.mjs`: Info scroll (wheel and touch), cursor split and recovery, footer dance moving, no page errors.
- Visual checks: hero (1440 and 390), split mid-sweep, footer frames and burst, intro collage, services, tiles, testimonials.

**Higgsfield spend:** 1.5 credits (figure). About 0.25 credits remain, so no further generations are possible.

**Not done or not verified:**
- A real-device check on mid-range phones (ink, 3D, footer dance).
- Firefox and WebKit were covered only by the QA suite; the visual checks were Chrome only.
- Nothing committed.

## Session 4 — living hero + glass Info panel

**Changed (hero, wordmark, background, transition, Info panel only):**
- **Wordmark:** rebuilt as 7 per-glyph HTML 3D stacks (`wm3()` in `scripts/shell.mjs`), so letters move independently on the compositor. In `src/js/hero3d.js`:
  - A calm/energetic phase cycle.
  - Per-property organic idle motion (position, Y/X rotation, depth, squash-and-stretch, skew) with overshoot eases.
  - Waves that part, twist and push letters, then snap back elastically.
  - Pointer lean.
- **Ink inside the letters:** `src/js/ink.js` renders one WebGL2 strip with a tile per glyph in glyph-local space, copied into a canvas inside each glyph and clipped by a CSS mask of that glyph's vector path. It cannot spill. Visually verified at 1440 and 1920 and on a phone.
  - Glossy domain-warped ink with silver glints and orange reflections.
  - A white margin keeps every silhouette readable.
  - A fine ember edge line.
  - Ink reacts to each letter's motion.
- **Background:**
  - **Film:** a Higgsfield starfield (GPT Image 2.5 still, then Cinema Studio v2 Std 8s), crossfaded into a seamless 6.5s loop: `media/video/cosmos-*`.
  - **Live layer:** `src/js/astral.js` (WebGL2) draws three-depth parallax stars, rare shooting particles, and a slowly turning wireframe Möbius-lattice sculpture (silver lines, ember-lit). It sits low right on desktop and above the wordmark on phones.
  - Ink, stars and sculpture all render on the shared `gsap.ticker` and pause off-screen.
- **Transition:**
  - Measured cause: the per-frame SVG glyph repaints (33 ms median frame, every frame late, versus 6.9 ms on a control page), plus an animated full-screen grain and a 0.6 s scrub stacked on Lenis.
  - Fixes: compositor-only glyph transforms, static grain, `scrub: true`, a 180vh hero, Lenis lerp 0.12 → 0.16.
  - Result in `tests/scrollperf.mjs` (Chrome, real GPU): median 7.0 ms, p95 ~21 ms, 8–10 long frames in ~250; catch-up after input 750 → 550–600 ms.
- **Info panel:** dark glass redesign (markup in `scripts/shell.mjs`, styles under `.sheet--info` / `.ip__*`). Same content, editorial layout, staggered open/close, round close control, masked scroll. Because backdrop-filter can't blur the 3D wordmark, the hero mark and copy fade back while it's open.
- **Removed:** the earlier surround-"venom" effect and the astral-landscape video, both superseded within this session.
- **Higgsfield spend this session:** 2.75 (astral stills) + ~26 (astral video; billed more than its 15-credit preflight) + 2.75 (starfield stills) + 8 (starfield video). The balance is ~1.75 credits, so a 1080p Pro starfield wasn't affordable. The film is 720p and the code layer supplies the crisp stars.
- **New test tools:** `tests/scrollperf.mjs`, `tests/heroclip.mjs`, `tests/infoshot.mjs`. Diagnostic URL flag: `?noink`.
- **QA:** final `npm test`, run per engine on a `/tifferend/` sub-path build, scored **199/199** (Chrome 109, Firefox 45, WebKit 45; saved in `tests/qa-results.txt`). The first combined run hit a one-off 30 s page-load timeout that didn't reproduce in any engine.
- **Not done:** real-device check of the ink/3D hero on mid-range phones; nothing committed yet.

## Session 3 — desktop-first cinematic redesign

### What changed
| Area | Change |
|---|---|
| Hero | **Coffee footage removed** from the hero, as the brief asked. The new background is Tifferend's own dark studio still (the live careers hero: an empty room, one ember lamp, an orange chair), animated into a seamless 10s loop with Higgsfield. The authentic wordmark is now a **true-3D object**: SVG layers on `translateZ` in a preserve-3d stage, with a warm extrusion that shifts as it turns. The motion is a GSAP timeline: the loader hands its logo off and the stack grows into depth (or, on repeat visits, glyphs rise through the stack); then an idle turn and drift, pointer tilt on desktop, and a scroll beat on a 210vh sticky hero where the word lifts off letter by letter (spacing intact), tilts back into the room, and the room pushes in. Copy sits lower-left (typed service line + tagline), the scroll cue lower-right. |
| Wordmark | Split into its 7 real glyph units (`WORDMARK_GLYPHS`: "iff" is one ligature in the artwork) for character-level animation. The full logo symbol is built from the glyphs (no duplicate path data). |
| Typography | Lora Variable (display, set 620–650 at −0.035em) + Inter Variable (text/UI), both faces the live site already loads. Space Mono is gone except inside the preserved loader. Removed: tracked uppercase monospace labels, `(01)` service indexes, tile index numbers, "Stage 01 of 03" labels, hairline dividers, soft radii. Labels (PDF §06) are now sentence-case ember text. Five type sizes. Headlines held to two lines (Work: "Every project, by domain."). Metric-matched Georgia fallbacks stop font-load reflow. |
| Homepage | Now carries all ten PDF sections: hero → statement lit word by word on scroll → 4 tiles (clip-path unmask + inner parallax) → services → clients → **About/Studio as a pinned horizontal strip** (real BTS footage and stills) → **numbered process** (stroke numerals fill in sequence) → testimonials → **enquiry form** → footer. |
| Footer | Mensch treatment: a giant bottom-cropped wordmark over the dark studio film; the glyphs part around the cursor. Mellow column organisation kept. |
| Motion extras | Ember dash trail after the cursor (the Mensch wandering marks, rebuilt from the loader's ember dash; desktop only, stops when idle). Magnetic buttons (React Bits' Magnet idea, written in vanilla JS). Info panel blurs the page behind on desktop. Page transitions: clip-path wipe (View Transitions API). |
| Robustness | Reveals can no longer stay hidden after a fast fling or anchor jump: an observer only reports state changes, so a frame-throttled scroll sweep catches skipped elements (found by QA). Boot no longer waits on any network import before revealing content, and dynamic-import failures are caught. |
| Phones | Lighter profile: 5 of 10 depth layers, a single-element entrance, half-amplitude idle, no pinning (the studio strip becomes a swipe row), no trail. The idle animation pauses whenever the hero is off-screen, on every device. |

### Tools: used, installed, unavailable
- **Used:** GSAP 3.15 + ScrollTrigger (all timelines, scrubs, `matchMedia`), Lenis 1.3 (one instance on `gsap.ticker`, fine pointers only), Playwright (real Chrome, Firefox, WebKit), Higgsfield, Lighthouse 12.8 via npx.
- **Installed:** the Taste skill (`design-taste-frontend`; you approved it). Its security scan showed 1 medium alert; on review, the only network code is `assets.mjs`, which queries open image archives, and it was not run. Its house rules drove the typography clean-up. The installed files are git-ignored; `skills-lock.json` records it.
- **Higgsfield:** your Basic plan refused Kling 3.0 (it needs Plus) even though its price preflight passed; nothing was charged. I used Cinema Studio Video v2 Pro instead (**15 credits**, within the 17.5 you approved; balance 56.25 → 41.25). The output is clean (no text or artefacts) and the loop is seamless, but its motion is very subtle (the lamp breathing), so GSAP adds a slow push-in on top.
- **React Bits:** not installed. It's a React library and the site is vanilla JS, so adding React for one effect wasn't justified. I ported the Magnet technique.
- **Figma MCP:** not configured in this environment, and no Figma file was supplied. No design file was inspected.
- **Emil Kowalski's principles:** applied as easing/duration tokens (`--ease-out` cubic-bezier(.23,1,.32,1), 180ms UI feedback), press-scale on buttons, and underline wipes on links.
- **Hero screenshot:** the brief mentions a supplied hero composition screenshot, but none was attached. I used the Mensch screen recording as the composition reference.

### Extra reference video (sent mid-task)
It's the same Mensch capture as before (`(58) WhatsApp … 22-39-05.mp4`). Studied frame by frame, it gave four adopted ideas: the turning 3D hero object, the wandering mark trail, the dimmed and blurred Info backdrop, and the cropped giant footer wordmark whose letters part. Not adopted: the light testimonial cards (Mellow governs testimonials) and the sky/foliage palette.

### Tests run (session 3)
- `npm test` on a `/tifferend/` sub-path build: see `tests/qa-results.txt` and §5 below for the run count.
- Story-beat frames (`tests/frames.mjs`) inspected at 1440 and 390 for every page. Fixes from that review:
  - Glyph parting read as "tiff erend", so it was replaced by the left-to-right lift-off.
  - The leftover letters spelled "end", so the stagger was tightened.
  - The 'd' collided with the header.
  - Tile labels sat under the header.
  - Process numerals filled in unison.
  - The footer pause button covered the 'd'.
  - The Work headline ran to three lines.
  - The About hero had an empty block above the headline.
- **Lighthouse** (localhost):

  | Page | Mobile perf / a11y / BP / SEO | Mobile LCP | Desktop perf / a11y / BP / SEO |
  |---|---|---|---|
  | Home | 82 / 100 / 100 / 100 | 4.5 s (first visit includes the preserved loader) | 98 / 100 / 100 / 100 |
  | Work | 95 / 100 / 100 / 100 | 2.6 s | 99 / 100 / 100 / 100 |

  Fixed along the way: statement contrast (1.5:1, then 4.4:1, now 5.3:1), Work CLS 0.219 → 0.011 (fallback metrics), mobile home TBT 360 ms → 0 ms (lighter phone profile).
- **Not run:** real devices, Safari proper, a screen-reader pass, the deployed URL.

### Files (session 3)
- **New:** `src/js/hero3d.js`, `src/js/trail.js`, `tests/frames.mjs`, `public/media/video/studio-{1080,720,tall}.mp4`, `studio-poster-{wide,1280,tall}.jpg`, `skills-lock.json`
- **Changed:**
  - `scripts/{shell,pages,lib}.mjs`
  - `src/data/wordmark.js` (glyphs)
  - `src/styles/main.css` (rewritten)
  - `src/js/{main,ui,home,loader,contact}.js`
  - `tests/{qa,shoot}.mjs`, `package.json` / lock, `.gitignore`, `CLAUDE.md`
- **Removed:** `public/media/video/hero-720.mp4`, `hero-wide.mp4`, `hero-wide-poster.jpg` (the coffee hero; `hero-540.mp4` and `hero-poster.jpg` remain for testimonial sample slot 02). `@fontsource/lora` (static) replaced by the variable packages.
- **Dependencies:** +`@fontsource-variable/inter` 5.2.8, +`@fontsource-variable/lora` 5.2.8, −`@fontsource/lora`.

### Still open (in addition to §9 below)
1. **The hero video's motion is subtle.** If you want visible camera movement, a Plus-plan Kling generation or a second Cinema Studio pass (about 15 credits) with stronger motion wording are the options.
2. Deployment is still not done: there's no GitHub remote yet (see §8).
3. Real-device check of the 3D hero on mid-range Android and iOS Safari (preserve-3d with many SVG layers is the riskiest piece).

---

_Session 2 notes follow._

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
