// Service domains. The slug is the Work-page filter (work/?service=<slug>) and the tag used in projects.js.
// There are no service pages: every service links to its filtered work.
// `image` is the background shown when the service is hovered / selected on the homepage.

export const services = [
  {
    slug: 'branding',
    name: 'Branding & Identity',
    short: 'Branding',
    line: 'Positioning, naming, identity systems and guidelines.',
    image: 'media/work/mm-cards',
    imageAlt: 'My Mithila business cards and stationery',
  },
  {
    slug: 'packaging',
    name: 'Packaging',
    short: 'Packaging',
    line: 'On-shelf systems, structure and print that sell before the product does.',
    image: 'media/work/mm-tote',
    imageAlt: 'My Mithila branded tote bag',
  },
  {
    slug: 'film',
    name: 'Photography & Film',
    short: 'Film',
    line: 'Brand films, product CGI, campaigns and art-directed shoots.',
    image: 'media/work/mm-pour',
    imageAlt: 'Still from the My Mithila brand film: chai pouring into a cup above a green field',
    jpg: true,
  },
  {
    slug: 'digital',
    name: 'Websites & Digital',
    short: 'Digital',
    line: 'Websites, e-commerce and digital experiences built to convert.',
    image: 'media/work/mm-storefront',
    imageAlt: 'My Mithila e-commerce storefront design',
  },
  {
    slug: 'social',
    name: 'Social Media',
    short: 'Social',
    line: 'Content systems, campaigns and growth across every platform.',
    image: 'media/work/mm-post-02',
    imageAlt: 'My Mithila social media post',
  },
  {
    slug: 'events',
    name: 'Events & Production',
    short: 'Events',
    line: 'Event identities, stage, on-ground production and coverage.',
    image: 'media/work/frame-collective',
    imageAlt: 'Film crew lighting a set (placeholder image from the current site)',
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
