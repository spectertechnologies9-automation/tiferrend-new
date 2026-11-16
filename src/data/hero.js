// HERO FILM — CLIENT ASSET SLOT
// The homepage hero shows only this film (client, Nov 2026: no large logo, no DIFFERENT text in the hero).
// The client is supplying two final versions: desktop 16:9 and mobile 9:16. To install them:
//   1. Put the files in public/media/video/, e.g. hero-desktop.mp4 (16:9, H.264, ~1920×1080, muted,
//      loop-ready) and hero-mobile.mp4 (9:16, ~1080×1920), plus a poster still for each (first frame, .jpg).
//   2. Point `desktop.src` / `mobile.src` and the posters at them below, set `status: 'final'`.
//      `desktop.uhd` (3840 px) and `desktop.light` (1280 px) are optional extra encodes; leave them null
//      and `src` is used everywhere.
//   3. Update the "Check build output" step in .github/workflows/deploy.yml to the new desktop file name.
// Landscape screens get the desktop film, portrait screens the mobile film; the choice is re-made if the
// screen rotates. Everything is muted, inline, looping, and only plays while the hero is on screen.
//
// Until then: INTERIM footage — a behind-the-scenes loop of a commercial shoot (Pexels 8089122 by Ron Lach,
// Pexels licence). It is not the client's film and must be replaced.
export const heroFilm = {
  status: 'interim', // 'interim' | 'final'
  desktop: {
    src: 'media/video/shoot-1080.mp4',
    uhd: 'media/video/shoot-2160.mp4',   // optional, only for screens over ~2600 device pixels across
    light: 'media/video/shoot-720.mp4',  // optional, for small landscape screens
    poster: 'media/video/shoot-poster-wide.jpg',
  },
  mobile: {
    src: 'media/video/shoot-tall.mp4',
    poster: 'media/video/shoot-poster-tall.jpg',
  },
};
