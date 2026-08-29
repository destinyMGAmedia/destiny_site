import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  LISTING_TYPES,
  PREFERRED_CONTACTS,
  CATEGORIES,
  CATEGORY_VALUES,
  categoryLabel,
  SOCIAL_LINK_KEYS,
  MAX_DESCRIPTION_CHARS,
  LISTINGS_PAGE_SIZE,
} from './constants'

describe('LISTING_TYPES', () => {
  it('contains exactly INDIVIDUAL and BUSINESS', () => {
    expect(LISTING_TYPES).toEqual(['INDIVIDUAL', 'BUSINESS'])
  })
})

describe('PREFERRED_CONTACTS', () => {
  it('contains exactly PHONE, WHATSAPP and EMAIL', () => {
    expect(PREFERRED_CONTACTS).toEqual(['PHONE', 'WHATSAPP', 'EMAIL'])
  })
})

describe('CATEGORIES', () => {
  it('mirrors the YellowPagesCategory enum in prisma/schema.prisma (same values, same order)', () => {
    const schema = readFileSync(path.join(process.cwd(), 'prisma/schema.prisma'), 'utf8')
    const block = schema.match(/enum YellowPagesCategory \{([\s\S]*?)\}/)[1]
    const enumValues = block
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, '').trim())
      .filter((l) => /^[A-Z0-9_]+$/.test(l))
    expect(CATEGORIES.map((c) => c.value)).toEqual(enumValues)
    // sanity: the Destiny Nation "Influence Gates" sectors are covered
    for (const v of ['GOVERNANCE_POLITICS', 'ENGINEERING_TECHNOLOGY', 'CIVIL_CONSTRUCTION_ENGINEERING', 'DIPLOMACY_INTERNATIONAL_RELATIONS', 'DEFENCE_SECURITY_INTELLIGENCE']) {
      expect(enumValues).toContain(v)
    }
  })

  it('has a non-empty, unique label for every category', () => {
    const labels = CATEGORIES.map((c) => c.label)
    expect(labels.every((label) => typeof label === 'string' && label.trim().length > 0)).toBe(true)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('has a unique value for every category', () => {
    const values = CATEGORIES.map((c) => c.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('includes OTHER as the final catch-all category', () => {
    expect(CATEGORIES[CATEGORIES.length - 1]).toEqual({ value: 'OTHER', label: 'Other' })
  })
})

describe('CATEGORY_VALUES', () => {
  it('is derived from CATEGORIES and matches its value ordering', () => {
    expect(CATEGORY_VALUES).toEqual(CATEGORIES.map((c) => c.value))
  })

  it('has the same length as CATEGORIES', () => {
    expect(CATEGORY_VALUES).toHaveLength(CATEGORIES.length)
  })
})

describe('categoryLabel', () => {
  it('returns the human-readable label for a known category value', () => {
    expect(categoryLabel('TOURISM_TRAVEL')).toBe('Tourism & Travel')
    expect(categoryLabel('HOME_SERVICES_TRADES')).toBe('Home Services & Trades')
    expect(categoryLabel('OTHER')).toBe('Other')
  })

  it('returns every category value mapped to its exact label', () => {
    for (const { value, label } of CATEGORIES) {
      expect(categoryLabel(value)).toBe(label)
    }
  })

  it('falls back to the raw value when given an unknown category', () => {
    expect(categoryLabel('NOT_A_REAL_CATEGORY')).toBe('NOT_A_REAL_CATEGORY')
  })

  it('falls back to the value itself for an empty string', () => {
    expect(categoryLabel('')).toBe('')
  })

  it('falls back to the value itself for undefined', () => {
    expect(categoryLabel(undefined)).toBe(undefined)
  })

  it('falls back to the value itself for null', () => {
    expect(categoryLabel(null)).toBe(null)
  })
})

describe('SOCIAL_LINK_KEYS', () => {
  it('contains the expected social platform keys in order', () => {
    expect(SOCIAL_LINK_KEYS).toEqual(['facebook', 'instagram', 'linkedin', 'tiktok', 'twitter', 'youtube'])
  })

  it('has no duplicate keys', () => {
    expect(new Set(SOCIAL_LINK_KEYS).size).toBe(SOCIAL_LINK_KEYS.length)
  })
})

describe('MAX_DESCRIPTION_CHARS', () => {
  it('is a positive integer', () => {
    expect(Number.isInteger(MAX_DESCRIPTION_CHARS)).toBe(true)
    expect(MAX_DESCRIPTION_CHARS).toBeGreaterThan(0)
  })

  it('is set to 1200', () => {
    expect(MAX_DESCRIPTION_CHARS).toBe(1200)
  })
})

describe('LISTINGS_PAGE_SIZE', () => {
  it('is a positive integer', () => {
    expect(Number.isInteger(LISTINGS_PAGE_SIZE)).toBe(true)
    expect(LISTINGS_PAGE_SIZE).toBeGreaterThan(0)
  })

  it('is set to 12', () => {
    expect(LISTINGS_PAGE_SIZE).toBe(12)
  })
})
