// Site-wide settings. Edit here; every page is regenerated from this file on build.

export const site = {
  name: 'Tifferend',
  title: 'Tifferend — Creative Branding Studio',
  description:
    'Tifferend builds brands through strategy, storytelling, and design. A full-service branding, marketing, and creative studio.',
  // Absolute production URL, no trailing slash. Canonical links, og:url / og:image, sitemap.xml and
  // robots.txt derive from it. Change it here if a custom domain is added (and add public/CNAME).
  url: 'https://spectertechnologies9-automation.github.io/tiferrend-new',
  email: 'hello@tifferend.com',
  careersUrl: 'https://forms.gle/hJoBoTJDMgsCnCJu9',
  tagline: 'Your brand’s creative partner.',
  subline: 'Bridging the gap between business and creativity.',
  brandLine: 'Create a difference, with a difference.',
  socials: [
    // Only channels verified on the current site. Add Instagram / LinkedIn when the studio confirms handles.
    { label: 'X / Twitter', href: 'https://x.com/tifferend' },
  ],

  // Enquiry form. Paste a Formspree (https://formspree.io/f/xxxx) or compatible JSON endpoint.
  // Empty = the form validates, then hands the message to the visitor's email app (and says so).
  formEndpoint: '',

  // Placeholder projects carried over from the current Lovable site. They are disclosed as drafts
  // on their own pages. Set to false once real case studies replace them.
  showDraftProjects: true,

  // Sample testimonial slots (clearly labelled) so the player can be reviewed before client films arrive.
  // Set to false to hide the section until testimonials.js has verified entries.
  showSampleTestimonials: true,

  // Mellow-style "Ask ChatGPT / Ask Claude" links. Only the public page URL and a fixed prompt are sent.
  aiSummaryLinks: true,
};

export const nav = [
  { label: 'Work', href: 'work/' },
  { label: 'About', href: 'about/' },
  { label: 'Contact', href: 'contact/' },
];

// Loader words, verbatim from the current site's preloader.
export const loaderWords = ['BRAND', 'DESIGN', 'IDENTITY', 'STORY', 'STRATEGY', 'CRAFT'];
