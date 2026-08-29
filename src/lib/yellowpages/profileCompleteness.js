// "Complete your profile" prompts — the LinkedIn-style incremental flow. The initial listing
// form only asks for the fields required to make a listing live and useful (name, phone,
// category, description); everything else is offered afterward, one nudge at a time, with a
// short reason it matters. See spec/theyellowpages.md's incremental-profile addition.

export const PROFILE_PROMPTS = [
  {
    key: 'photo',
    check: (l) => Boolean(l.logoUrl || l.photoUrl),
    label: 'Add a photo or logo',
    why: 'Listings with a photo stand out in the feed and get more views.',
    anchor: 'yp-photo-section',
  },
  {
    key: 'portfolioImages',
    check: (l) => (l.portfolioImages || []).length > 0,
    label: 'Show your work',
    why: 'A few photos of your work build trust before someone even calls.',
    anchor: 'yp-portfolio-section',
  },
  {
    key: 'location',
    check: (l) => Boolean(l.city || l.state || l.country),
    label: 'Add your location',
    why: "The directory is location-aware — without this, nearby members can't find you by area.",
    anchor: 'yp-city',
  },
  {
    key: 'assembly',
    check: (l) => Boolean(l.assemblySlug),
    label: 'Link your assembly',
    why: 'Helps members find and trust people from their own assembly first.',
    anchor: 'yp-assemblySlug',
  },
  {
    key: 'contactPerson',
    check: (l) => l.listingType === 'INDIVIDUAL' || Boolean(l.contactPersonName),
    label: 'Add a contact person',
    why: "Let people know exactly who they'll be speaking with.",
    anchor: 'yp-contactPersonName',
  },
  {
    key: 'servicesOffered',
    check: (l) => Boolean(l.servicesOffered),
    label: 'List your specific services',
    why: 'Being specific helps the right people find you in search.',
    anchor: 'yp-servicesOffered',
  },
  {
    key: 'onlinePresence',
    check: (l) => Boolean(l.website) || Object.values(l.socialLinks || {}).some(Boolean),
    label: 'Add a website or social link',
    why: 'Give people another way to check out your work before they reach out.',
    anchor: 'yp-website',
  },
  {
    key: 'certifications',
    check: (l) => Boolean(l.certifications),
    label: 'Add certifications or memberships',
    why: 'Certifications build extra trust with people who don’t know you yet.',
    anchor: 'yp-certifications',
  },
]

/** Returns the prompts for fields the listing is still missing, in priority order. */
export function getProfilePrompts(listing = {}) {
  return PROFILE_PROMPTS.filter((p) => !p.check(listing))
}

/** 0-100 — share of the optional "complete your profile" fields already filled in. */
export function getProfileCompleteness(listing = {}) {
  const total = PROFILE_PROMPTS.length
  const missing = getProfilePrompts(listing).length
  return Math.round(((total - missing) / total) * 100)
}
