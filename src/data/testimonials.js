// Client video testimonials. Only add entries the client has confirmed in writing.
//
// {
//   name: 'Full name', role: 'Founder', company: 'Brand', logo: 'media/clients/brand.webp' (optional),
//   video: 'media/video/testimonial-brand.mp4',       // H.264, 720p, faststart
//   poster: 'media/video/testimonial-brand.jpg',      // thumbnail, loads first
//   captions: 'media/video/testimonial-brand.vtt',    // WebVTT, required for accessibility
//   quote: 'One short line shown under the thumbnail (optional)',
//   portrait: true,                                   // only for vertical footage: shown letterboxed in the 16:9 frame
// }
//
// The quotes on the current site are unconfirmed (one contradicts the My Mithila case study), so none are used.

export const testimonials = [];

// Labelled sample slots, shown only while site.showSampleTestimonials is true and the list above is empty.
// They use genuine Tifferend footage and say plainly that they are not client statements.
export const sampleTestimonials = [
  {
    name: 'Client film slot 01',
    role: 'Sample — replace with a client testimonial',
    company: 'Footage: My Mithila brand film, behind the scenes',
    video: 'media/video/bts-720.mp4',
    poster: 'media/video/bts-poster.jpg',
    captions: 'media/video/sample-01.vtt',
    sample: true,
    portrait: true, // 720 × 1266
  },
  {
    name: 'Client film slot 02',
    role: 'Sample — replace with a client testimonial',
    company: 'Footage: My Mithila brand film',
    video: 'media/video/hero-540.mp4',
    poster: 'media/video/hero-poster.jpg',
    captions: 'media/video/sample-02.vtt',
    sample: true,
    portrait: true, // 540 × 950
  },
];
