# Tifferend — website

Static, mobile-first site for Tifferend, a creative branding studio. Vite + vanilla JS, GSAP and Lenis loaded only where used. Every route is a real HTML file, so it runs on GitHub Pages (or any static host) with working refreshes and deep links.

```bash
npm ci
npm run dev        # http://localhost:5173 (pages regenerate when src/data changes)
npm run build      # → dist/
npm run preview    # serves dist/ on :4173
npm test           # QA: 10 widths × 7 pages + interactions in Chrome, Firefox, WebKit (run after build)
```

## Updating content (no HTML editing)

Everything lives in `src/data/`. Each build regenerates every page from it.

| What | File | Notes |
|---|---|---|
| Projects + project pages | `projects.js` | Add an entry → `work/<slug>/` is created. `featured: 1–4` picks the homepage tiles. `services` puts it under each Work filter. Build each page from typed `sections` (text, image, pair, video, palette, grid, motifs, list). |
| Images | `public/media/work/` | Name variants `<name>-<width>.webp` (e.g. `-640`, `-1280`, `-1920`); reference by base name `media/work/<name>`. |
| Services / Work filters | `services.js` | Slug = filter (`work/?service=<slug>`). Background image for the homepage hover. |
| Client logos | `clients.js` + `public/media/clients/` | `tone: 'mono'` renders a white silhouette; `'color'` keeps colours. |
| Video testimonials | `testimonials.js` | Video + poster + WebVTT captions. Sample slots disappear once a real entry exists. |
| About, process, values | `studio.js` | |
| Email, socials, form endpoint, switches | `site.js` | `formEndpoint`, `showDraftProjects`, `showSampleTestimonials`, `url`. |

## Deploying to GitHub Pages

1. Create a GitHub repository and push this folder to `main`.
2. In the repository: **Settings → Pages → Source: GitHub Actions**.
3. The workflow in `.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`.
4. Custom domain: add it under Settings → Pages (GitHub writes the CNAME for Actions deployments), then set `site.url` in `src/data/site.js`.

The build uses relative URLs (`base: './'`), so the same output works at `https://<user>.github.io/<repo>/` and at a domain root. Only `404.html` needs the absolute path, which the workflow passes as `SITE_BASE`.

## Enquiry form

GitHub Pages has no server. Until `site.formEndpoint` is set, the form validates and then opens the visitor's email app with the message filled in. It tells them plainly that nothing has been sent until they press send there. To receive submissions directly, create a free form at Formspree (or a compatible JSON endpoint) and paste its URL into `formEndpoint`. No secret is needed in the frontend.
