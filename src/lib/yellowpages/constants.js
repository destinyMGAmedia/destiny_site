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
