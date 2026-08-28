// Type-aware portfolio section model. Drives (a) the detail-page section order, (b) the
// "nothing here yet — add …" placeholders shown when a section is empty, and (c) the
// owner "complete your portfolio" prompt modal. Generalises profileCompleteness.js's
// PROFILE_PROMPTS idea to the richer personal/business portfolio layouts.

export const isIndividual = (listing = {}) => listing.listingType === 'INDIVIDUAL'

const nonEmptyArray = (v) => Array.isArray(v) && v.length > 0

// Each section: key, label, `filled(listing)` predicate, `addLabel` (owner CTA / empty hint),
// `anchor` (id on the edit form to scroll to). `individual` / `business` gate visibility.
const SECTIONS = [
  {
    key: 'about',
    label: 'About',
    individual: true,
    business: true,
    filled: (l) => Boolean(l.resumeSummary || l.description),
    addLabel: 'Add a professional summary',
    anchor: 'yp-description',
  },
  {
    key: 'skills',
    label: 'Skills',
    individual: true,
    business: false,
    filled: (l) => nonEmptyArray(l.skills),
    addLabel: 'Add your skills',
    anchor: 'yp-skills',
  },
  {
    key: 'services',
    label: 'Products & Services',
    individual: false,
    business: true,
    filled: (l) => Boolean(l.servicesOffered),
    addLabel: 'List your products and services',
    anchor: 'yp-servicesOffered',
  },
  {
    key: 'experience',
    label: 'Experience',
    individual: true,
    business: false,
    filled: (l) => nonEmptyArray(l.experience),
    addLabel: 'Add your work experience',
    anchor: 'yp-experience',
  },
  {
    key: 'education',
    label: 'Education',
    individual: true,
    business: false,
    filled: (l) => nonEmptyArray(l.education),
    addLabel: 'Add your education',
    anchor: 'yp-education',
  },
  {
    key: 'projects',
    label: 'Projects',
    individual: true,
    business: true,
    filled: (l) => nonEmptyArray(l.projects),
    addLabel: 'Add a project or case study',
    anchor: 'yp-projects',
  },
  {
    key: 'team',
    label: 'Team',
    individual: false,
    business: true,
    filled: (l) => nonEmptyArray(l.team),
    addLabel: 'Add your team members',
    anchor: 'yp-team',
  },
  {
    key: 'gallery',
    label: 'Gallery',
    individual: true,
    business: true,
    filled: (l) => nonEmptyArray(l.portfolioImages),
    addLabel: 'Upload work samples or photos',
    anchor: 'yp-portfolio-section',
  },
  {
    key: 'languages',
    label: 'Languages',
    individual: true,
    business: false,
    filled: (l) => nonEmptyArray(l.languages),
    addLabel: 'Add the languages you speak',
    anchor: 'yp-languages',
  },
  {
    key: 'credentials',
    label: 'Credentials',
    individual: true,
    business: true,
    filled: (l) =>
      Boolean(l.certifications || l.licenseNumber || l.yearsInOperation != null),
    addLabel: 'Add certifications or licenses',
    anchor: 'yp-certifications',
  },
  {
    key: 'onlinePresence',
    label: 'Online Presence',
    individual: true,
    business: true,
    filled: (l) => Boolean(l.website) || Object.values(l.socialLinks || {}).some(Boolean),
    addLabel: 'Add a website or social links',
    anchor: 'yp-website',
  },
]

/** All sections that apply to this listing's type, each tagged with its filled state. */
export function portfolioSections(listing = {}) {
  const typeKey = isIndividual(listing) ? 'individual' : 'business'
  return SECTIONS.filter((s) => s[typeKey]).map((s) => ({
    key: s.key,
    label: s.label,
    addLabel: s.addLabel,
    anchor: s.anchor,
    filled: s.filled(listing),
  }))
}

/** Just the sections still empty, in priority order — used for the owner prompt modal. */
export function missingPortfolioSections(listing = {}) {
  return portfolioSections(listing).filter((s) => !s.filled)
}

/** 0-100 share of applicable sections that have content. */
export function portfolioCompleteness(listing = {}) {
  const sections = portfolioSections(listing)
  if (sections.length === 0) return 100
  const filled = sections.filter((s) => s.filled).length
  return Math.round((filled / sections.length) * 100)
}
