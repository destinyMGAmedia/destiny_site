import {
  generateOtpCode,
  hashOtpCode,
  hashOtpContact,
  otpExpiry,
  normalizeContact,
  authorizedEditContacts,
  isAuthorizedEditContact,
  maskContact,
  sendEditOtp,
} from './otp'
import { OTP_CODE_LENGTH, OTP_TTL_MINUTES } from './constants'

// These helpers are pure crypto / string logic with the sole exception of sendEditOtp, which
// is exercised here against the REAL sms.js (no provider wired -> not delivered) and the REAL
// email.js (no RESEND_API_KEY in tests -> no-op send). Nothing is mocked.

describe('generateOtpCode', () => {
  it('returns a string of exactly OTP_CODE_LENGTH digits', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateOtpCode()
      expect(typeof code).toBe('string')
      expect(code).toMatch(new RegExp(`^\\d{${OTP_CODE_LENGTH}}$`))
    }
  })

  it('left-pads small numbers so the length is stable', () => {
    // Statistically at least one of these will be a low number needing padding; the regex
    // above already guards length, this just asserts leading zeros are possible/allowed.
    const codes = Array.from({ length: 500 }, generateOtpCode)
    expect(codes.some((c) => c[0] === '0')).toBe(true)
  })
})

describe('hashOtpCode / hashOtpContact', () => {
  it('produce a 64-char hex sha256 digest', () => {
    expect(hashOtpCode('123456')).toMatch(/^[a-f0-9]{64}$/)
    expect(hashOtpContact('jane@example.com')).toMatch(/^[a-f0-9]{64}$/)
  })

  it('are deterministic for the same input', () => {
    expect(hashOtpCode('000111')).toBe(hashOtpCode('000111'))
    expect(hashOtpContact('2348012345678')).toBe(hashOtpContact('2348012345678'))
  })

  it('differ for different inputs and across the two namespaces', () => {
    expect(hashOtpCode('123456')).not.toBe(hashOtpCode('123457'))
    // ":otp:" prefix vs bare contact means a code and a contact never collide
    expect(hashOtpCode('123456')).not.toBe(hashOtpContact('123456'))
  })
})

describe('otpExpiry', () => {
  it('is OTP_TTL_MINUTES after the supplied instant', () => {
    const from = new Date('2026-01-01T00:00:00.000Z')
    const exp = otpExpiry(from)
    expect(exp.getTime() - from.getTime()).toBe(OTP_TTL_MINUTES * 60 * 1000)
  })

  it('defaults to now when no argument is given', () => {
    const before = Date.now()
    const exp = otpExpiry()
    const after = Date.now()
    expect(exp.getTime()).toBeGreaterThanOrEqual(before + OTP_TTL_MINUTES * 60 * 1000)
    expect(exp.getTime()).toBeLessThanOrEqual(after + OTP_TTL_MINUTES * 60 * 1000)
  })
})

describe('normalizeContact', () => {
  it('returns null for empty / whitespace / nullish input', () => {
    expect(normalizeContact('')).toBeNull()
    expect(normalizeContact('   ')).toBeNull()
    expect(normalizeContact(null)).toBeNull()
    expect(normalizeContact(undefined)).toBeNull()
  })

  it('lower-cases and tags a valid email', () => {
    expect(normalizeContact('  JANE@Example.COM ')).toEqual({ channel: 'EMAIL', value: 'jane@example.com' })
  })

  it('rejects a malformed email', () => {
    expect(normalizeContact('jane@')).toBeNull()
    expect(normalizeContact('@example.com')).toBeNull()
    expect(normalizeContact('not-an-email')).toBeNull() // no @, falls through to phone check -> invalid
  })

  it('strips separators from a phone and tags it SMS', () => {
    expect(normalizeContact('080 1234 5678')).toEqual({ channel: 'SMS', value: '08012345678' })
    expect(normalizeContact('+234-801-234-5678')).toEqual({ channel: 'SMS', value: '+2348012345678' })
  })

  it('rejects a too-short phone', () => {
    expect(normalizeContact('12345')).toBeNull()
  })
})

describe('authorizedEditContacts', () => {
  it('is empty for a bare listing', () => {
    expect(authorizedEditContacts({}).size).toBe(0)
    expect(authorizedEditContacts().size).toBe(0)
  })

  it('includes the public phone and email when not editStrict', () => {
    const set = authorizedEditContacts({ phone: '08012345678', email: 'Owner@Example.com' })
    expect(set.has('08012345678')).toBe(true)
    expect(set.has('owner@example.com')).toBe(true)
  })

  it('adds normalised editContacts entries', () => {
    const set = authorizedEditContacts({
      editContacts: ['Editor@Example.com', '+234 802 000 0000', 'garbage'],
    })
    expect(set.has('editor@example.com')).toBe(true)
    expect(set.has('+2348020000000')).toBe(true)
    expect(set.has('garbage')).toBe(false)
  })

  it('with editStrict, only editContacts count — the public phone/email are excluded', () => {
    const set = authorizedEditContacts({
      editStrict: true,
      phone: '08012345678',
      email: 'owner@example.com',
      editContacts: ['editor@example.com'],
    })
    expect(set.has('08012345678')).toBe(false)
    expect(set.has('owner@example.com')).toBe(false)
    expect(set.has('editor@example.com')).toBe(true)
  })
})

describe('isAuthorizedEditContact', () => {
  const listing = { phone: '08012345678', email: 'owner@example.com', editContacts: ['editor@example.com'] }

  it('matches the public phone / email in any case or format', () => {
    expect(isAuthorizedEditContact(listing, '0801-234-5678')).toBe(true)
    expect(isAuthorizedEditContact(listing, 'OWNER@example.com')).toBe(true)
  })

  it('matches an editContacts entry', () => {
    expect(isAuthorizedEditContact(listing, 'editor@example.com')).toBe(true)
  })

  it('rejects an unknown contact and an unparseable one', () => {
    expect(isAuthorizedEditContact(listing, 'stranger@example.com')).toBe(false)
    expect(isAuthorizedEditContact(listing, 'nonsense')).toBe(false)
    expect(isAuthorizedEditContact(listing, '')).toBe(false)
  })
})

describe('maskContact', () => {
  it('masks an email keeping the first char and domain', () => {
    expect(maskContact('jane@example.com', 'EMAIL')).toBe('j•••@example.com')
  })

  it('uses a minimum of two dots for a very short local part', () => {
    expect(maskContact('a@b.com', 'EMAIL')).toBe('a••@b.com')
  })

  it('masks a phone keeping the last four digits', () => {
    expect(maskContact('08012345678', 'SMS')).toBe('•••••••5678')
  })

  it('uses a minimum of two dots for a short phone', () => {
    expect(maskContact('1234', 'SMS')).toBe('••1234')
  })
})

describe('sendEditOtp', () => {
  it('reports delivered:true for the EMAIL channel (real email.js no-ops without a key)', async () => {
    const res = await sendEditOtp({ channel: 'EMAIL', to: 'jane@example.com', code: '123456', listingName: 'Jane Dev' })
    expect(res).toEqual({ delivered: true })
  })

  it('reports delivered:false for SMS (no provider wired)', async () => {
    const res = await sendEditOtp({ channel: 'SMS', to: '2348012345678', code: '123456', listingName: 'Jane Dev' })
    expect(res).toEqual({ delivered: false })
  })
})
