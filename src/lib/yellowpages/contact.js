// Server-only (Node runtime — API routes, not proxy.js). Hashes a rating's contact (phone or
// email, whichever was provided) so we can enforce one rating per (listing, contact) without
// ever persisting or returning the raw contact. See spec/theyellowpages.md "Invariants".
import { createHash } from 'crypto'

/**
 * @param {string} contact - already-normalized phone (digits only) or lowercased email
 */
export function hashContact(contact) {
  const salt = process.env.NEXTAUTH_SECRET || 'yellowpages-fallback-salt'
  return createHash('sha256').update(`${salt}:${contact}`).digest('hex')
}
