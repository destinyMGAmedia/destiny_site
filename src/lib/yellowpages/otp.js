// Server-only (Node runtime). Owner-edit OTP helpers: code generation/hashing, contact
// normalisation, the "who may edit this listing" allow-list, and channel dispatch (email now,
// SMS via the pluggable src/lib/yellowpages/sms.js once a provider is wired).
import { createHash, randomInt } from 'crypto'
import { OTP_CODE_LENGTH, OTP_TTL_MINUTES } from './constants'
import { sanitizePhone, isValidPhone, isValidEmail } from './validation'
import { sendSms } from './sms'
import { sendEditOtpEmail } from '@/lib/email'

const salt = () => process.env.NEXTAUTH_SECRET || 'yellowpages-fallback-salt'

/** Random numeric code, left-padded, as a string. */
export function generateOtpCode() {
  const max = 10 ** OTP_CODE_LENGTH
  return String(randomInt(0, max)).padStart(OTP_CODE_LENGTH, '0')
}

export function hashOtpCode(code) {
  return createHash('sha256').update(`${salt()}:otp:${code}`).digest('hex')
}

/** Same scheme as src/lib/yellowpages/contact.js, kept here so this module is self-contained. */
export function hashOtpContact(contact) {
  return createHash('sha256').update(`${salt()}:${contact}`).digest('hex')
}

export function otpExpiry(from = new Date()) {
  return new Date(from.getTime() + OTP_TTL_MINUTES * 60 * 1000)
}

/**
 * Normalises a raw contact string to `{ channel, value }` — email lowercased, phone digits-only.
 * Returns null if it is neither a valid email nor a valid phone.
 */
export function normalizeContact(raw) {
  const trimmed = (raw || '').trim()
  if (!trimmed) return null
  if (trimmed.includes('@')) {
    return isValidEmail(trimmed) ? { channel: 'EMAIL', value: trimmed.toLowerCase() } : null
  }
  const phone = sanitizePhone(trimmed)
  return isValidPhone(phone) ? { channel: 'SMS', value: phone } : null
}

/**
 * The set of normalised contacts allowed to request an edit OTP for a listing.
 * When `editStrict` is on, only `editContacts` count — the public phone/email do not.
 */
export function authorizedEditContacts(listing = {}) {
  const set = new Set()
  for (const raw of listing.editContacts || []) {
    const n = normalizeContact(raw)
    if (n) set.add(n.value)
  }
  if (!listing.editStrict) {
    if (listing.phone) set.add(sanitizePhone(listing.phone))
    if (listing.email) set.add(String(listing.email).toLowerCase())
  }
  return set
}

export function isAuthorizedEditContact(listing, rawContact) {
  const n = normalizeContact(rawContact)
  if (!n) return false
  return authorizedEditContacts(listing).has(n.value)
}

/** "j•••@example.com" / "•••••1234" — for a non-committal "code sent to …" confirmation. */
export function maskContact(value, channel) {
  if (channel === 'EMAIL') {
    const [user = '', domain = ''] = String(value).split('@')
    const head = user.slice(0, 1)
    return `${head}${'•'.repeat(Math.max(user.length - 1, 2))}@${domain}`
  }
  const digits = String(value)
  return `${'•'.repeat(Math.max(digits.length - 4, 2))}${digits.slice(-4)}`
}

/**
 * Dispatches the code. EMAIL sends immediately via Resend. SMS goes through the (currently
 * stubbed) provider; when it reports not-delivered the caller should fall back to the
 * "enter the number on file" interim check.
 * @returns {Promise<{ delivered: boolean }>}
 */
export async function sendEditOtp({ channel, to, code, listingName }) {
  if (channel === 'EMAIL') {
    await sendEditOtpEmail({ to, code, listingName })
    return { delivered: true }
  }
  const body = `Your ${listingName || 'listing'} edit code is ${code}. It expires in ${OTP_TTL_MINUTES} minutes.`
  const res = await sendSms({ to, body })
  return { delivered: Boolean(res.delivered) }
}
