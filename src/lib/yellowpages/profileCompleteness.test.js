import { PROFILE_PROMPTS, getProfilePrompts, getProfileCompleteness } from './profileCompleteness'

const bareListing = { listingType: 'INDIVIDUAL' }

const fullListing = {
  listingType: 'BUSINESS',
  logoUrl: 'https://example.com/logo.png',
  portfolioImages: ['https://example.com/a.jpg'],
  city: 'Lagos',
  assemblySlug: 'lagos',
  contactPersonName: 'Jane Doe',
  servicesOffered: 'Flights, hotels',
  website: 'https://acme.com',
  certifications: 'IATA',
}

describe('getProfilePrompts', () => {
  it('returns every prompt except contactPerson for a bare INDIVIDUAL listing (that one is moot for individuals)', () => {
    const prompts = getProfilePrompts(bareListing)
    expect(prompts).toHaveLength(PROFILE_PROMPTS.length - 1)
    expect(prompts.find((p) => p.key === 'contactPerson')).toBeUndefined()
  })

  it('returns no prompts for a fully filled-in listing', () => {
    expect(getProfilePrompts(fullListing)).toHaveLength(0)
  })

  it('treats logoUrl or photoUrl as satisfying the photo prompt', () => {
    expect(getProfilePrompts({ photoUrl: 'https://example.com/p.jpg' }).find((p) => p.key === 'photo')).toBeUndefined()
  })

  it('treats a social link as satisfying the online-presence prompt even without a website', () => {
    expect(getProfilePrompts({ socialLinks: { instagram: '@acme' } }).find((p) => p.key === 'onlinePresence')).toBeUndefined()
  })

  it('does not require a contact person for INDIVIDUAL listings', () => {
    expect(getProfilePrompts({ listingType: 'INDIVIDUAL' }).find((p) => p.key === 'contactPerson')).toBeUndefined()
  })

  it('requires a contact person for BUSINESS listings', () => {
    expect(getProfilePrompts({ listingType: 'BUSINESS' }).find((p) => p.key === 'contactPerson')).toBeDefined()
  })

  it('accepts any of city/state/country for the location prompt', () => {
    expect(getProfilePrompts({ state: 'Lagos' }).find((p) => p.key === 'location')).toBeUndefined()
    expect(getProfilePrompts({ country: 'Nigeria' }).find((p) => p.key === 'location')).toBeUndefined()
  })

  it('defaults to an empty object safely', () => {
    expect(getProfilePrompts()).toHaveLength(PROFILE_PROMPTS.length)
  })
})

describe('getProfileCompleteness', () => {
  it('is low (not 0) for a bare INDIVIDUAL listing, since contactPerson is already moot', () => {
    expect(getProfileCompleteness(bareListing)).toBe(13)
  })

  it('is 0 for a truly empty listing', () => {
    expect(getProfileCompleteness({})).toBe(0)
  })

  it('is 100 for a fully filled-in listing', () => {
    expect(getProfileCompleteness(fullListing)).toBe(100)
  })

  it('increases as prompts are satisfied', () => {
    const partial = getProfileCompleteness({ logoUrl: 'x' })
    expect(partial).toBeGreaterThan(0)
    expect(partial).toBeLessThan(100)
  })

  it('defaults to 0 safely with no listing', () => {
    expect(getProfileCompleteness()).toBe(0)
  })
})
