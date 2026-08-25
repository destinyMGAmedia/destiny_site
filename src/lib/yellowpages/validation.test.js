import { validateListingInput, validateRatingInput, publicReviewerName, isValidUrl } from './validation'

describe('validateListingInput', () => {
  const validBusiness = {
    listingType: 'BUSINESS',
    name: 'Acme Travels',
    contactPersonName: 'Jane Doe',
    phone: '08012345678',
    category: 'TOURISM_TRAVEL',
    description: 'We plan trips.',
  }

  it('accepts a minimal valid BUSINESS submission', () => {
    const { errors, data } = validateListingInput(validBusiness)
    expect(errors).toBeNull()
    expect(data.name).toBe('Acme Travels')
    expect(data.contactPersonName).toBe('Jane Doe')
    expect(data.preferredContact).toBe('PHONE')
  })

  it('accepts a minimal valid INDIVIDUAL submission and defaults contactPersonName to name', () => {
    const { errors, data } = validateListingInput({
      listingType: 'INDIVIDUAL',
      name: 'John Plumber',
      phone: '08012345678',
      category: 'HOME_SERVICES_TRADES',
      description: 'I fix pipes.',
    })
    expect(errors).toBeNull()
    expect(data.contactPersonName).toBe('John Plumber')
  })

  it('requires listingType to be a known value', () => {
    const { errors } = validateListingInput({ ...validBusiness, listingType: 'BOGUS' })
    expect(errors.listingType).toBeDefined()
  })

  it('requires name', () => {
    const { errors } = validateListingInput({ ...validBusiness, name: '  ' })
    expect(errors.name).toBeDefined()
  })

  it('does not require contactPersonName for BUSINESS listings — deferred to "complete your profile"', () => {
    const { errors, data } = validateListingInput({ ...validBusiness, contactPersonName: '' })
    expect(errors).toBeNull()
    expect(data.contactPersonName).toBeNull()
  })

  it('does not require contactPersonName for INDIVIDUAL listings', () => {
    const { errors } = validateListingInput({
      listingType: 'INDIVIDUAL',
      name: 'John',
      phone: '08012345678',
      category: 'HOME_SERVICES_TRADES',
      description: 'desc',
    })
    expect(errors).toBeNull()
  })

  it('requires phone', () => {
    const { errors } = validateListingInput({ ...validBusiness, phone: '' })
    expect(errors.phone).toBeDefined()
  })

  it('rejects a malformed phone', () => {
    const { errors } = validateListingInput({ ...validBusiness, phone: '123' })
    expect(errors.phone).toBeDefined()
  })

  it('rejects a malformed whatsapp number when provided', () => {
    const { errors } = validateListingInput({ ...validBusiness, whatsapp: '123' })
    expect(errors.whatsapp).toBeDefined()
  })

  it('rejects a malformed email when provided', () => {
    const { errors } = validateListingInput({ ...validBusiness, email: 'not-an-email' })
    expect(errors.email).toBeDefined()
  })

  it('rejects an unknown category', () => {
    const { errors } = validateListingInput({ ...validBusiness, category: 'NOT_REAL' })
    expect(errors.category).toBeDefined()
  })

  it('requires description', () => {
    const { errors } = validateListingInput({ ...validBusiness, description: '' })
    expect(errors.description).toBeDefined()
  })

  it('rejects a description over the max length', () => {
    const { errors } = validateListingInput({ ...validBusiness, description: 'a'.repeat(1201) })
    expect(errors.description).toBeDefined()
  })

  it('rejects a malformed website when provided', () => {
    const { errors } = validateListingInput({ ...validBusiness, website: 'not a url' })
    expect(errors.website).toBeDefined()
  })

  it('accepts a well-formed website', () => {
    const { errors } = validateListingInput({ ...validBusiness, website: 'https://acme.com' })
    expect(errors).toBeNull()
  })

  it('rejects an invalid preferredContact', () => {
    const { errors } = validateListingInput({ ...validBusiness, preferredContact: 'CARRIER_PIGEON' })
    expect(errors.preferredContact).toBeDefined()
  })

  it('rejects a non-integer yearsInOperation', () => {
    const { errors } = validateListingInput({ ...validBusiness, yearsInOperation: 'many' })
    expect(errors.yearsInOperation).toBeDefined()
  })

  it('rejects an out-of-range yearsInOperation', () => {
    const { errors } = validateListingInput({ ...validBusiness, yearsInOperation: 500 })
    expect(errors.yearsInOperation).toBeDefined()
  })

  it('accepts a valid yearsInOperation', () => {
    const { errors, data } = validateListingInput({ ...validBusiness, yearsInOperation: 5 })
    expect(errors).toBeNull()
    expect(data.yearsInOperation).toBe(5)
  })

  it('keeps only known social link keys and drops non-string values', () => {
    const { data } = validateListingInput({
      ...validBusiness,
      socialLinks: { facebook: 'fb.com/acme', notarealkey: 'x', instagram: 42 },
    })
    expect(data.socialLinks).toEqual({ facebook: 'fb.com/acme' })
  })
})

describe('validateRatingInput', () => {
  it('accepts a valid rating with phone', () => {
    const { errors, data } = validateRatingInput({ stars: 5, reviewerName: 'Jane Doe', phone: '08012345678' })
    expect(errors).toBeNull()
    expect(data.contact).toBe('08012345678')
  })

  it('accepts a valid rating with email, lowercased', () => {
    const { errors, data } = validateRatingInput({ stars: 4, reviewerName: 'Jane', email: 'Jane@Example.com' })
    expect(errors).toBeNull()
    expect(data.contact).toBe('jane@example.com')
  })

  it('prefers phone over email as the dedupe contact when both are given', () => {
    const { data } = validateRatingInput({ stars: 3, reviewerName: 'Jane', phone: '08012345678', email: 'jane@example.com' })
    expect(data.contact).toBe('08012345678')
  })

  it('rejects stars outside 1-5', () => {
    expect(validateRatingInput({ stars: 0, reviewerName: 'Jane', phone: '08012345678' }).errors.stars).toBeDefined()
    expect(validateRatingInput({ stars: 6, reviewerName: 'Jane', phone: '08012345678' }).errors.stars).toBeDefined()
  })

  it('requires reviewerName', () => {
    const { errors } = validateRatingInput({ stars: 5, phone: '08012345678' })
    expect(errors.reviewerName).toBeDefined()
  })

  it('requires at least phone or email', () => {
    const { errors } = validateRatingInput({ stars: 5, reviewerName: 'Jane' })
    expect(errors.contact).toBeDefined()
  })
})

describe('publicReviewerName', () => {
  it('formats "First L." from a full name', () => {
    expect(publicReviewerName('Jane Doe')).toBe('Jane D.')
  })

  it('formats a middle-name full name using the last token', () => {
    expect(publicReviewerName('Jane Mary Doe')).toBe('Jane D.')
  })

  it('returns a single-word name unchanged', () => {
    expect(publicReviewerName('Cher')).toBe('Cher')
  })

  it('returns "Anonymous" for empty input', () => {
    expect(publicReviewerName('')).toBe('Anonymous')
    expect(publicReviewerName(undefined)).toBe('Anonymous')
  })
})

describe('isValidUrl', () => {
  it('accepts http(s) URLs with a domain', () => {
    expect(isValidUrl('https://example.com')).toBe(true)
    expect(isValidUrl('http://example.com/path')).toBe(true)
  })

  it('rejects non-URL strings', () => {
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('ftp://example.com')).toBe(false)
  })
})
