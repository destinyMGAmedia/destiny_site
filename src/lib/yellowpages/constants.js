// Shared constants for The Yellow Pages — kept framework-agnostic (no Node/Edge-only APIs)
// so this can be imported from API routes, pages, and components alike.

export const LISTING_TYPES = ['INDIVIDUAL', 'BUSINESS']

export const PREFERRED_CONTACTS = ['PHONE', 'WHATSAPP', 'EMAIL']

// Mirrors the YellowPagesCategory enum in prisma/schema.prisma — keep in sync.
export const CATEGORIES = [
  { value: 'TOURISM_TRAVEL', label: 'Tourism & Travel' },
  { value: 'CONSTRUCTION_REAL_ESTATE', label: 'Construction & Real Estate' },
  { value: 'EDUCATION_TRAINING', label: 'Education & Training' },
  { value: 'FINANCE_INSURANCE', label: 'Finance & Insurance' },
  { value: 'HEALTH_WELLNESS', label: 'Health & Wellness' },
  { value: 'FOOD_HOSPITALITY', label: 'Food & Hospitality' },
  { value: 'TECHNOLOGY_IT', label: 'Technology & IT' },
  { value: 'CREATIVE_MEDIA', label: 'Creative & Media' },
  { value: 'FASHION_BEAUTY', label: 'Fashion & Beauty' },
  { value: 'LEGAL_PROFESSIONAL_SERVICES', label: 'Legal & Professional Services' },
  { value: 'TRANSPORT_LOGISTICS', label: 'Transport & Logistics' },
  { value: 'RETAIL_ECOMMERCE', label: 'Retail & E-Commerce' },
  { value: 'HOME_SERVICES_TRADES', label: 'Home Services & Trades' },
  { value: 'AGRICULTURE_FOOD_PRODUCTION', label: 'Agriculture & Food Production' },
  { value: 'EVENTS_ENTERTAINMENT', label: 'Events & Entertainment' },
  { value: 'OTHER', label: 'Other' },
]

export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value)

export function categoryLabel(value) {
  return CATEGORIES.find((c) => c.value === value)?.label || value
}

export const SOCIAL_LINK_KEYS = ['facebook', 'instagram', 'linkedin', 'tiktok', 'twitter', 'youtube']

export const MAX_DESCRIPTION_CHARS = 1200 // ~150 words

export const LISTINGS_PAGE_SIZE = 12

// Work/personal photos shown in the timeline feed — images only, no video.
export const MAX_PORTFOLIO_IMAGES = 6

// Portfolio structured-section caps (stored as JSON columns on YellowPagesListing).
export const MAX_SKILLS = 30
export const MAX_LANGUAGES = 15
export const MAX_EXPERIENCE = 20
export const MAX_EDUCATION = 15
export const MAX_PROJECTS = 20
export const MAX_TEAM = 30
export const MAX_EDIT_CONTACTS = 10
export const MAX_HEADLINE_CHARS = 160
export const MAX_SUMMARY_CHARS = 2000

// Owner-edit OTP flow.
export const OTP_TTL_MINUTES = 10
export const OTP_MAX_ATTEMPTS = 5
export const OTP_CODE_LENGTH = 6
// How long a verified OTP (its row id, used as an opaque edit token) stays usable for PATCHes.
export const EDIT_TOKEN_WINDOW_MINUTES = 30
// Max unconsumed OTPs per (listing, contact) within the trailing hour before we 429.
export const OTP_RATE_LIMIT_PER_HOUR = 5

// Per-listing-type UI label overrides for fields that mean different things to a person vs a business.
export const FIELD_LABELS = {
  INDIVIDUAL: {
    name: 'Your Name',
    photoUrl: 'Profile Photo',
    logoUrl: null, // hidden for individuals
    servicesOffered: 'Skills',
    description: 'Bio',
    portfolioImages: 'Work Samples',
    yearsInOperation: 'Years of Experience',
  },
  BUSINESS: {
    name: 'Business / Organization Name',
    photoUrl: 'Professional Photo',
    logoUrl: 'Business Logo',
    servicesOffered: 'Products / Services',
    description: 'About the Business',
    portfolioImages: 'Portfolio / Gallery',
    yearsInOperation: 'Years in Operation',
  },
}

export function fieldLabel(listingType, field, fallback) {
  const forType = FIELD_LABELS[listingType] || FIELD_LABELS.BUSINESS
  const value = forType[field]
  return value === undefined ? fallback : value
}
