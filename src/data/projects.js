// Projects. Each entry becomes work/<slug>/index.html on build, appears on the Work page under every
// service it lists, and can be featured on the homepage (exactly four `featured` entries are shown).
//
// Images are referenced by base name (e.g. 'media/work/mm-cards'); the build picks up every
// '<base>-<width>.webp|jpg' file in public/media/work and writes a responsive srcset.
//
// tile: how the homepage tile is art-directed.
//   tone: 'light' (white lettering) | 'dark' (black lettering) — choose by the image, never add a scrim.
//   align: where the label sits: 'top-left' | 'bottom-left' | 'top-right' | 'bottom-right'.
//   focus: CSS object-position for the crop; mobileFocus for the stacked phone crop.
//
// sections: the project page, top to bottom. Available types:
//   { type: 'text', label, heading, body: [paragraphs] }
//   { type: 'image', src, alt, ratio, bleed }               // bleed: true = edge to edge
//   { type: 'pair', items: [{ src, alt }, { src, alt }] }
//   { type: 'video', src, poster, alt, captions, portrait }
//   { type: 'palette', colors: [{ name, hex, role }] }
//   { type: 'grid', label, heading, items: [{ src, alt }] }  // social posts, contact sheets
//   { type: 'motifs', items: [{ src, alt }] }
//   { type: 'list', label, heading, items: [strings] }
//
// draft: true marks placeholder projects carried over from the current site. Their pages say so,
// they are hidden when site.showDraftProjects is false, and they carry no invented results.

export const projects = [
  {
    slug: 'my-mithila',
    client: 'My Mithila',
    title: 'Baby steps, greener strides.',
    summary: 'A sustainable living brand rooted in Mithila art — identity, packaging, e-commerce and a CGI brand film.',
    year: '2024',
    services: ['branding', 'packaging', 'digital', 'social', 'film'],
    category: 'Rebrand & Packaging',
    cover: 'media/work/mm-wordmark',
    coverAlt: 'My Mithila wordmark in mustard yellow on forest green',
    featured: 1,
    tile: { tone: 'light', align: 'top-right', focus: '0% 50%', mobileFocus: '18% 50%' },
    theme: { bg: '#0E5A2E', fg: '#F4EFE6', accent: '#F5C518' },
    facts: [
      ['Client', 'My Mithila'],
      ['Founder', 'Anant Alok'],
      ['Year', '2024'],
      ['Scope', 'Positioning, identity, packaging, e-commerce, print, social, brand film'],
    ],
    sections: [
      {
        type: 'text',
        label: 'The brief',
        heading: 'Make sustainable living feel warm.',
        body: [
          'My Mithila set out to make sustainable living approachable for everyday Indian households — but the category felt either preachy or premium-coded, with no warmth and no cultural anchor.',
        ],
      },
      { type: 'video', src: 'media/video/mymithila-film-720.mp4', poster: 'media/video/mymithila-film-poster.jpg', alt: 'My Mithila brand film: a CGI kulhad-style cup fills with chai above a green field, then the storefront and logo', captions: 'media/video/mymithila-film.vtt', portrait: true, label: 'Brand film', heading: 'Chai, poured over the fields it came from.' },
      {
        type: 'text',
        label: 'The idea',
        heading: 'One human idea: small daily switches.',
        body: [
          'We positioned My Mithila around a single, human idea: ‘Baby Steps, Greener Strides.’ A gentle, founder-led brand that celebrates small daily switches — sippers, bottles, kitchenware — rooted in the geometry and warmth of Mithila art.',
        ],
      },
      { type: 'image', src: 'media/work/mm-billboard', alt: 'My Mithila outdoor billboard', bleed: true, ratio: '1920/773' },
      {
        type: 'motifs',
        label: 'Kit of parts',
        heading: 'Triangle, circle, leaf, water.',
        body: ['The Mithila-inspired motifs became a kit-of-parts that flexes across product tags, social, and on-pack storytelling.'],
        items: [
          { src: 'media/work/mm-motif-mountain.webp', alt: 'Mountain motif' },
          { src: 'media/work/mm-motif-sun.webp', alt: 'Sun motif' },
          { src: 'media/work/mm-motif-water.webp', alt: 'Water motif' },
          { src: 'media/work/mm-motif-leaf.webp', alt: 'Leaf motif' },
        ],
      },
      {
        type: 'palette',
        colors: [
          { name: 'Mountain Forest', hex: '#0E5A2E', role: 'Primary' },
          { name: 'Sun Mustard', hex: '#F5C518', role: 'Accent' },
          { name: 'Water Bone', hex: '#F4EFE6', role: 'Canvas' },
          { name: 'Leaf Ink', hex: '#0A1F12', role: 'Voice' },
        ],
      },
      {
        type: 'pair',
        items: [
          { src: 'media/work/mm-cards', alt: 'My Mithila business cards' },
          { src: 'media/work/mm-tote', alt: 'My Mithila tote bag' },
        ],
      },
      {
        type: 'text',
        label: 'Execution',
        heading: 'From logomark to storefront.',
        body: [
          'Built a full identity system from logomark to packaging, business collateral, and an e-commerce storefront, anchored by a deep forest green and a sunlit mustard yellow.',
        ],
      },
      { type: 'image', src: 'media/work/mm-storefront', alt: 'My Mithila e-commerce storefront', ratio: '1600/1477' },
      {
        type: 'grid',
        label: 'Social',
        heading: 'Thirteen posts, one voice.',
        items: Array.from({ length: 13 }, (_, i) => ({ src: `media/work/mm-post-${String(i + 1).padStart(2, '0')}`, alt: `My Mithila social post ${i + 1}` })),
      },
      { type: 'image', src: 'media/work/mm-bamboo', alt: 'Bamboo, the material behind the range', ratio: '1600/1477' },
      {
        type: 'text',
        label: 'Outcome',
        heading: 'Instantly recognisable, built to scale.',
        body: [
          'My Mithila launched with a cohesive D2C identity across web, print and social — instantly recognisable, founder-credible, and built to scale category-by-category as new products roll out.',
        ],
      },
    ],
  },

  // ---- Drafts: names, images and deliverables carried over from the current site. No invented results. ----
  {
    slug: 'maison-luxe',
    client: 'Maison Luxe',
    title: 'Packaging that speaks before the product.',
    summary: 'Packaging design across a full product line.',
    year: '2023',
    services: ['packaging', 'branding'],
    category: 'Packaging',
    cover: 'media/work/maison-luxe',
    coverAlt: 'Neutral-toned cosmetic packaging on black marble',
    featured: 2,
    draft: true,
    tile: { tone: 'light', align: 'top-left', focus: '50% 60%', mobileFocus: '50% 60%' },
    sections: [{ type: 'list', label: 'Deliverables', heading: 'Scope listed on the current site', items: ['Packaging design', 'Brand systems', 'Creative direction', 'Campaign visuals'] }],
  },
  {
    slug: 'ember-oak',
    client: 'Ember & Oak',
    title: 'A dining experience worth remembering.',
    summary: 'Identity and launch for a flagship restaurant.',
    year: '2023',
    services: ['branding', 'digital'],
    category: 'Hospitality Identity',
    cover: 'media/work/ember-oak',
    coverAlt: 'Warm-lit restaurant interior with wooden slat walls',
    featured: 3,
    draft: true,
    tile: { tone: 'light', align: 'bottom-left', focus: '50% 50%', mobileFocus: '40% 50%' },
    sections: [{ type: 'list', label: 'Deliverables', heading: 'Scope listed on the current site', items: ['Brand positioning', 'Visual identity', 'Website design', 'Campaign strategy'] }],
  },
  {
    slug: 'frame-collective',
    client: 'Frame Collective',
    title: 'Cinematic storytelling for a global audience.',
    summary: 'Visual language for a documentary series.',
    year: '2024',
    services: ['film', 'events'],
    category: 'Film Production',
    cover: 'media/work/frame-collective',
    coverAlt: 'Film crew around a camera under a single studio light',
    featured: 4,
    draft: true,
    tile: { tone: 'light', align: 'top-right', focus: '50% 40%', mobileFocus: '55% 40%' },
    sections: [{ type: 'list', label: 'Deliverables', heading: 'Scope listed on the current site', items: ['Film production', 'Creative direction', 'Colour grading', 'Motion graphics'] }],
  },
  {
    slug: 'noir-collective',
    client: 'Noir Collective',
    title: 'Redefining menswear with bold identity.',
    summary: 'Monochrome identity and campaign for a menswear label.',
    year: '2024',
    services: ['branding', 'film', 'digital'],
    category: 'Fashion Identity',
    cover: 'media/work/noir-collective',
    coverAlt: 'Monochrome portrait of a man in a black leather jacket',
    draft: true,
    tile: { tone: 'light', align: 'bottom-left', focus: '50% 30%' },
    sections: [{ type: 'list', label: 'Deliverables', heading: 'Scope listed on the current site', items: ['Visual identity', 'Creative direction', 'Campaign photography', 'Website design'] }],
  },
  {
    slug: 'the-grand',
    client: 'The Grand',
    title: 'Luxury redefined through timeless design.',
    summary: 'Heritage brand refresh for a historic hotel.',
    year: '2023',
    services: ['branding', 'film', 'digital'],
    category: 'Hospitality Refresh',
    cover: 'media/work/the-grand',
    coverAlt: 'Marble and gold hotel lobby with a chandelier',
    draft: true,
    tile: { tone: 'light', align: 'bottom-left', focus: '50% 50%' },
    sections: [{ type: 'list', label: 'Deliverables', heading: 'Scope listed on the current site', items: ['Visual identity', 'Brand systems', 'Commercial photography', 'Website design'] }],
  },
];
