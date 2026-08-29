import {
  isIndividual,
  portfolioSections,
  missingPortfolioSections,
  portfolioCompleteness,
} from './portfolio'

describe('isIndividual', () => {
  it('is true only for listingType === INDIVIDUAL', () => {
    expect(isIndividual({ listingType: 'INDIVIDUAL' })).toBe(true)
    expect(isIndividual({ listingType: 'BUSINESS' })).toBe(false)
  })

  it('defaults to false for an empty / missing listing', () => {
    expect(isIndividual()).toBe(false)
    expect(isIndividual({})).toBe(false)
    expect(isIndividual({ listingType: null })).toBe(false)
  })
})

describe('portfolioSections', () => {
  it('returns the individual-flavoured section set for an INDIVIDUAL listing', () => {
    const keys = portfolioSections({ listingType: 'INDIVIDUAL' }).map((s) => s.key)
    expect(keys).toEqual([
      'about',
      'skills',
      'experience',
      'education',
      'projects',
      'gallery',
      'languages',
      'credentials',
      'onlinePresence',
    ])
  })

  it('returns the business-flavoured section set for a BUSINESS listing', () => {
    const keys = portfolioSections({ listingType: 'BUSINESS' }).map((s) => s.key)
    expect(keys).toEqual([
      'about',
      'services',
      'projects',
      'team',
      'gallery',
      'credentials',
      'onlinePresence',
    ])
  })

  it('treats an unknown/absent listingType as a business', () => {
    expect(portfolioSections({}).map((s) => s.key)).toEqual(
      portfolioSections({ listingType: 'BUSINESS' }).map((s) => s.key),
    )
  })

  it('every section carries key, label, addLabel, anchor and a boolean filled flag', () => {
    for (const s of portfolioSections({ listingType: 'INDIVIDUAL' })) {
      expect(typeof s.key).toBe('string')
      expect(s.label.length).toBeGreaterThan(0)
      expect(s.addLabel.length).toBeGreaterThan(0)
      expect(s.anchor).toMatch(/^yp-/)
      expect(typeof s.filled).toBe('boolean')
    }
  })

  it('marks every section empty for a bare listing', () => {
    const sections = portfolioSections({ listingType: 'INDIVIDUAL' })
    expect(sections.every((s) => s.filled === false)).toBe(true)
  })

  it('about is filled by resumeSummary OR description', () => {
    const bySummary = portfolioSections({ listingType: 'BUSINESS', resumeSummary: 'hi' })
    const byDescription = portfolioSections({ listingType: 'BUSINESS', description: 'hi' })
    expect(bySummary.find((s) => s.key === 'about').filled).toBe(true)
    expect(byDescription.find((s) => s.key === 'about').filled).toBe(true)
  })

  it('skills is filled only by a non-empty array', () => {
    const empty = portfolioSections({ listingType: 'INDIVIDUAL', skills: [] })
    const full = portfolioSections({ listingType: 'INDIVIDUAL', skills: ['Go'] })
    expect(empty.find((s) => s.key === 'skills').filled).toBe(false)
    expect(full.find((s) => s.key === 'skills').filled).toBe(true)
  })

  it('credentials is filled by certifications, licenseNumber, or yearsInOperation === 0', () => {
    const byZeroYears = portfolioSections({ listingType: 'BUSINESS', yearsInOperation: 0 })
    expect(byZeroYears.find((s) => s.key === 'credentials').filled).toBe(true)

    const byLicense = portfolioSections({ listingType: 'BUSINESS', licenseNumber: 'RC123' })
    expect(byLicense.find((s) => s.key === 'credentials').filled).toBe(true)

    const none = portfolioSections({ listingType: 'BUSINESS', yearsInOperation: null })
    expect(none.find((s) => s.key === 'credentials').filled).toBe(false)
  })

  it('onlinePresence is filled by a website or any truthy social link', () => {
    const byWebsite = portfolioSections({ listingType: 'INDIVIDUAL', website: 'https://x.dev' })
    expect(byWebsite.find((s) => s.key === 'onlinePresence').filled).toBe(true)

    const bySocial = portfolioSections({ listingType: 'INDIVIDUAL', socialLinks: { twitter: '@x' } })
    expect(bySocial.find((s) => s.key === 'onlinePresence').filled).toBe(true)

    const emptySocial = portfolioSections({ listingType: 'INDIVIDUAL', socialLinks: { twitter: '' } })
    expect(emptySocial.find((s) => s.key === 'onlinePresence').filled).toBe(false)
  })
})

describe('missingPortfolioSections', () => {
  it('returns every section for a bare listing', () => {
    expect(missingPortfolioSections({ listingType: 'BUSINESS' })).toHaveLength(
      portfolioSections({ listingType: 'BUSINESS' }).length,
    )
  })

  it('excludes sections that now have content', () => {
    const listing = { listingType: 'BUSINESS', description: 'about us', servicesOffered: 'stuff' }
    const missingKeys = missingPortfolioSections(listing).map((s) => s.key)
    expect(missingKeys).not.toContain('about')
    expect(missingKeys).not.toContain('services')
    expect(missingKeys).toContain('team')
  })

  it('returns an empty list once every applicable section is filled', () => {
    const listing = {
      listingType: 'BUSINESS',
      description: 'about',
      servicesOffered: 'services',
      projects: [{ name: 'p' }],
      team: [{ name: 't' }],
      portfolioImages: ['a.jpg'],
      certifications: 'ISO',
      website: 'https://x.com',
    }
    expect(missingPortfolioSections(listing)).toEqual([])
  })
})

describe('portfolioCompleteness', () => {
  it('is 0 for a bare listing', () => {
    expect(portfolioCompleteness({ listingType: 'INDIVIDUAL' })).toBe(0)
  })

  it('is 100 when all applicable sections are filled', () => {
    const listing = {
      listingType: 'BUSINESS',
      description: 'about',
      servicesOffered: 'services',
      projects: [{ name: 'p' }],
      team: [{ name: 't' }],
      portfolioImages: ['a.jpg'],
      certifications: 'ISO',
      website: 'https://x.com',
    }
    expect(portfolioCompleteness(listing)).toBe(100)
  })

  it('rounds the filled/total ratio to a whole percent', () => {
    // BUSINESS has 7 sections; fill 2 -> 2/7 = 28.57 -> 29
    const listing = { listingType: 'BUSINESS', description: 'a', servicesOffered: 'b' }
    expect(portfolioCompleteness(listing)).toBe(29)
  })

  it('never exceeds 100 or drops below 0', () => {
    const v = portfolioCompleteness({ listingType: 'INDIVIDUAL', skills: ['a'] })
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThanOrEqual(100)
  })
})
