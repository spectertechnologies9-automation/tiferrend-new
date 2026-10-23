// About-page content. Everything here is verbatim from the current site unless marked otherwise.

export const story = {
  heading: 'Create a difference, with a difference.',
  paragraphs: [
    'Tifferend began with a simple idea. Our founder Kunj honed his skills in commercial photography, brand design, and media production while freelancing. Recognizing the power of combining these disciplines, he expanded to include social media marketing — always focused on solving real business problems, not just creating pretty content.',
    'From those early days working with small budgets, Tifferend has grown to partner with a diverse range of brands — from local startups to established names.',
  ],
  mission:
    'To create a difference in everything we deliver — empowering businesses of all sizes to reach their full potential through accessible, high-quality media and marketing.',
};

export const philosophy = {
  heading: 'Building a brand is personal.',
  paragraphs: [
    'It’s not a deck. It’s not a campaign. It’s the thing you stayed up for, the thing you believed in before anyone else did. We don’t take that lightly.',
    'We come in without a blueprint because we actually believe every brand has something no one else does — that X-factor that makes it their own. Our job isn’t to fit you into a mold, it’s to find that thing, protect it, and build everything around it.',
  ],
  close: 'That’s not a process. That’s a philosophy.',
};

export const values = [
  { title: 'Customer-centric', text: 'Client success is our success. We put client needs first and strive to exceed expectations.' },
  { title: 'Staying updated', text: 'The digital landscape constantly evolves. We stay ahead so clients can focus on their core business.' },
  { title: 'Utmost creativity', text: 'We bring fresh ideas and a playful spirit to every project we take on.' },
  { title: 'Innovation', text: 'We embrace new technologies and techniques to find the most effective solutions.' },
];

// Process stages (verbatim). `outputs` are the services each stage leads into; extend `details`
// with confirmed specifics (timelines, workshops, deliverables) when the studio supplies them.
export const process = [
  {
    title: 'Understand',
    text: 'Research, audience insights, and strategic positioning form the foundation of every brand we build. We start by listening — to founders, customers, and the market — before we make a single design move.',
    outputs: ['Research', 'Audience insight', 'Positioning'],
    media: { type: 'image', src: 'media/work/mm-bts-1080.jpg', alt: 'Behind the scenes: building the My Mithila film in 3D software' },
  },
  {
    title: 'Create',
    text: 'Brand identity, storytelling, and design systems bring strategy to life with visual conviction. Every mark, word, and motion is engineered to belong unmistakably to you.',
    outputs: ['Identity', 'Storytelling', 'Design systems'],
    media: { type: 'image', src: 'media/work/mm-wordmark-1280.webp', alt: 'My Mithila wordmark and identity' },
  },
  {
    title: 'Amplify',
    text: 'Marketing campaigns, social media, and digital growth turn brands into cultural forces. We ship work that earns attention and compounds value long after launch.',
    outputs: ['Campaigns', 'Social', 'Digital growth'],
    media: { type: 'image', src: 'media/work/mm-billboard-1280.webp', alt: 'My Mithila billboard' },
  },
];

// Studio imagery. Only genuine Tifferend material. Add agency photography / team shots here as they arrive.
export const studioMedia = [
  { type: 'video', src: 'media/video/bts-720.mp4', poster: 'media/video/bts-poster.jpg', alt: 'Behind the scenes of the My Mithila brand film: simulation, 3D modelling and compositing', caption: 'In the edit — the My Mithila film, from simulation to grade' },
  { type: 'image', src: 'media/work/mm-bts-1080.jpg', alt: 'Shading the CGI cup in 3D software', caption: 'Look development' },
  { type: 'image', src: 'media/work/mm-cup-1080.jpg', alt: 'Final frame: CGI cup composited into a drone shot of a green field', caption: 'Final composite' },
  { type: 'image', src: 'media/work/mm-pour-1080.jpg', alt: 'Close-up of chai pouring into the cup, from the finished film', caption: 'The pour, in the grade' },
];
