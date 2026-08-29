// Server-only. Shared "is this request allowed to edit this listing?" check, used by
// PATCH /api/yellowpages/listings/[id] and POST /api/yellowpages/listings/[id]/editable.
// Two ways to be authorized:
//   1. `editToken` — the id of a YellowPagesEditOtp row verified for THIS listing within the
//      last EDIT_TOKEN_WINDOW_MINUTES (the email-OTP flow).
//   2. `ownerPhone` / `ownerEmail` that is an authorized edit contact for the listing — its
//      public phone/email (unless `editStrict`) plus any `editContacts`. This is the interim
//      phone path and the fallback while SMS OTP isn't wired.
import prisma from '@/lib/prisma'
import { isAuthorizedEditContact } from './otp'
import { EDIT_TOKEN_WINDOW_MINUTES } from './constants'
import { sanitizePhone } from './validation'

/**
 * @param {{ id: string, phone?: string, email?: string|null, editStrict?: boolean, editContacts?: string[] }} listing
 * @param {{ editToken?: string, ownerPhone?: string, ownerEmail?: string }} body
 * @returns {Promise<{ ok: true } | { ok: false, status: number, error: string }>}
 */
export async function checkEditAuthorization(listing, body = {}) {
  const editToken = (body.editToken || '').trim()

  if (editToken) {
    const otp = await prisma.yellowPagesEditOtp.findUnique({ where: { id: editToken } })
    const cutoff = new Date(Date.now() - EDIT_TOKEN_WINDOW_MINUTES * 60 * 1000)
    if (otp && otp.listingId === listing.id && otp.consumedAt && otp.consumedAt > cutoff) {
      return { ok: true }
    }
    return { ok: false, status: 403, error: 'Your verification has expired. Please verify again.' }
  }

  const ownerPhone = body.ownerPhone ? sanitizePhone(body.ownerPhone) : ''
  const ownerEmail = (body.ownerEmail || '').trim().toLowerCase()
  if (!ownerPhone && !ownerEmail) {
    return { ok: false, status: 400, error: 'A verification code or the phone/email on file is required to edit this listing.' }
  }
  if (isAuthorizedEditContact(listing, ownerPhone || ownerEmail)) {
    return { ok: true }
  }
  return { ok: false, status: 403, error: 'The phone or email you entered is not authorized to edit this listing.' }
}
