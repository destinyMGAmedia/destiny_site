import {
  resolveDialCode,
  toInternationalDigits,
  whatsappUrl,
  telHref,
  formatInternational,
  COUNTRY_NAMES,
} from './phone'

describe('resolveDialCode', () => {
  it('resolves canonical country names', () => {
    expect(resolveDialCode('Nigeria')).toBe('234')
    expect(resolveDialCode('United Kingdom')).toBe('44')
    expect(resolveDialCode('Ghana')).toBe('233')
  })

  it('is case- and whitespace-insensitive', () => {
    expect(resolveDialCode('  nigeria ')).toBe('234')
    expect(resolveDialCode('UNITED KINGDOM')).toBe('44')
  })

  it('resolves common aliases', () => {
    expect(resolveDialCode('USA')).toBe('1')
    expect(resolveDialCode('U.S.A.')).toBe('1')
    expect(resolveDialCode('UK')).toBe('44')
    expect(resolveDialCode('England')).toBe('44')
    expect(resolveDialCode('Naija')).toBe('234')
    expect(resolveDialCode('UAE')).toBe('971')
  })

  it('resolves ISO-2 codes', () => {
    expect(resolveDialCode('NG')).toBe('234')
    expect(resolveDialCode('gb')).toBe('44')
  })

  it('returns null for the unknown / empty', () => {
    expect(resolveDialCode('')).toBeNull()
    expect(resolveDialCode(null)).toBeNull()
    expect(resolveDialCode('Wakanda')).toBeNull()
  })
})

describe('toInternationalDigits', () => {
  it('converts a local Nigerian number using the country', () => {
    expect(toInternationalDigits('08012345678', { country: 'Nigeria' })).toBe('2348012345678')
  })

  it('strips spaces, dashes and parens', () => {
    expect(toInternationalDigits('080 1234-5678', { country: 'Nigeria' })).toBe('2348012345678')
    expect(toInternationalDigits('(080) 1234 5678', { country: 'Nigeria' })).toBe('2348012345678')
  })

  it('accepts an explicit dial code (e.g. the stored countryDialCode) over the country text', () => {
    expect(toInternationalDigits('08012345678', { dialCode: '234' })).toBe('2348012345678')
    expect(toInternationalDigits('08012345678', { dialCode: '+234', country: 'Wakanda' })).toBe('2348012345678')
  })

  it('leaves an already-international +number alone (just drops the +)', () => {
    expect(toInternationalDigits('+2348012345678', { country: 'Nigeria' })).toBe('2348012345678')
    expect(toInternationalDigits('+44 7911 123456')).toBe('447911123456')
  })

  it('handles the 00 international prefix', () => {
    expect(toInternationalDigits('00 234 8012345678')).toBe('2348012345678')
  })

  it('does not double-prefix a number that already carries its calling code', () => {
    expect(toInternationalDigits('2348012345678', { country: 'Nigeria' })).toBe('2348012345678')
  })

  it('converts a local UK number', () => {
    expect(toInternationalDigits('07911 123456', { country: 'United Kingdom' })).toBe('447911123456')
  })

  it('best-effort (strip leading zero) when the country is unknown', () => {
    expect(toInternationalDigits('08012345678', {})).toBe('8012345678')
    expect(toInternationalDigits('08012345678', { country: 'Wakanda' })).toBe('8012345678')
  })

  it('returns an empty string for empty / junk input', () => {
    expect(toInternationalDigits('', { country: 'Nigeria' })).toBe('')
    expect(toInternationalDigits(null)).toBe('')
    expect(toInternationalDigits('abc')).toBe('')
  })
})

describe('whatsappUrl', () => {
  it('builds a wa.me link in full international form — the reported bug', () => {
    expect(whatsappUrl('08012345678', { country: 'Nigeria' })).toBe('https://wa.me/2348012345678')
  })

  it('prefers a stored dial code', () => {
    expect(whatsappUrl('080 1234 5678', { dialCode: '234' })).toBe('https://wa.me/2348012345678')
  })

  it('returns null when there is nothing usable', () => {
    expect(whatsappUrl('', { country: 'Nigeria' })).toBeNull()
    expect(whatsappUrl(null)).toBeNull()
  })
})

describe('telHref', () => {
  it('produces a +E.164 tel: link', () => {
    expect(telHref('08012345678', { country: 'Nigeria' })).toBe('tel:+2348012345678')
  })

  it('falls back to the raw value when it cannot normalise', () => {
    expect(telHref('abc')).toBe('tel:abc')
    expect(telHref('')).toBeNull()
  })
})

describe('formatInternational', () => {
  it('groups the calling code for display', () => {
    expect(formatInternational('08012345678', { country: 'Nigeria' })).toBe('+234 8012345678')
  })

  it('falls back to the raw value when unresolvable', () => {
    expect(formatInternational('abc')).toBe('abc')
  })
})

describe('COUNTRY_NAMES', () => {
  it('is a sorted, de-duplicated list including Nigeria', () => {
    expect(COUNTRY_NAMES).toContain('Nigeria')
    expect(COUNTRY_NAMES).toContain('United States')
    expect([...COUNTRY_NAMES]).toEqual([...COUNTRY_NAMES].sort())
    expect(new Set(COUNTRY_NAMES).size).toBe(COUNTRY_NAMES.length)
  })
})
