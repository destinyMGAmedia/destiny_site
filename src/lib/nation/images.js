// Section imagery for the Destiny Nation site — free-to-use Unsplash License photos,
// one per layer/page, chosen to fit each section's theme rather than the hero's purple palette.
export const NATION_IMAGES = {
  hero: {
    url: 'https://images.unsplash.com/photo-1755148500050-2f789060fa8c',
    alt: 'City skyline at dusk',
    credit: 'Ahmed Nishaath',
    creditUrl: 'https://unsplash.com/photos/city-skyline-at-dusk-with-purple-sky-ze5CxlC3Q3I',
  },
  internalGates: {
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca',
    alt: 'Hands stacked together in unity',
    credit: 'Hannah Busing',
    creditUrl: 'https://unsplash.com/photos/Zyx1bK9mqmA',
  },
  influenceGates: {
    url: 'https://images.unsplash.com/photo-1622675363311-3e1904dc1885',
    alt: 'A diverse group of professionals in a meeting',
    credit: 'Mapbox',
    creditUrl: 'https://unsplash.com/photos/ZT5v0puBjZI',
  },
  legacyProjects: {
    url: 'https://images.unsplash.com/photo-1771189957040-3a4f9b78812c',
    alt: 'Close-up of an electronic circuit board',
    credit: 'Jakub Pabis',
    creditUrl: 'https://unsplash.com/photos/i5Ugf0xc22Q',
  },
  partner: {
    url: 'https://images.unsplash.com/photo-1681505531034-8d67054e07f6',
    alt: 'Two people shaking hands over a signed agreement',
    credit: 'Amina Atar',
    creditUrl: 'https://unsplash.com/photos/4mEyvORkbN0',
  },
}

export function imgUrl(key, { w = 1600, q = 75 } = {}) {
  return `${NATION_IMAGES[key].url}?auto=format&fit=crop&w=${w}&q=${q}`
}
