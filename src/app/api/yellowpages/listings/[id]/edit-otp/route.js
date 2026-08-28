import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import {
  normalizeContact,
  isAuthorizedEditContact,
  hashOtpContact,
  hashOtpCode,
  generateOtpCode,
  otpExpiry,
  maskContact,
  sendEditOtp,
} from '@/lib/yellowpages/otp'
import { OTP_RATE_LIMIT_PER_HOUR, OTP_TTL_MINUTES } from '@/lib/yellowpages/constants'

// POST /api/yellowpages/listings/[id]/edit-otp — start the loginless owner-edit verification.
// Body: { to } (phone or email) — the contact must already be on file for the listing (its
// public phone/email unless `editStrict`, plus any `editContacts`).
//   • email  → a 6-digit code is emailed; respond { sent: true }
//   • phone  → no SMS provider yet, respond { sent: false, fallback: 'PHONE_MATCH' } so the
//              client switches to the "enter the number exactly as on file" interim check
export async function POST(req, { params }) {
  const { id } = await params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const listing = await prisma.yellowPagesListing.findUnique({ where: { id } })
  if (!listing || !listing.isActive) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const rawTo = (body.to || '').trim()
  const norm = normalizeContact(rawTo)
  if (!norm) {
    return NextResponse.json({ error: 'Enter a valid phone number or email address.' }, { status: 400 })
  }

  if (!isAuthorizedEditContact(listing, rawTo)) {
    return NextResponse.json(
      { error: "That phone number or email isn't on file for this listing." },
      { status: 403 },
    )
  }

  const contactHash = hashOtpContact(norm.value)

  // Rate-limit code requests per (listing, contact) over the trailing hour.
  const since = new Date(Date.now() - 60 * 60 * 1000)
  const recent = await prisma.yellowPagesEditOtp.count({
    where: { listingId: id, contactHash, createdAt: { gt: since } },
  })
  if (recent >= OTP_RATE_LIMIT_PER_HOUR) {
    return NextResponse.json(
      { error: 'Too many code requests. Please wait a while and try again.' },
      { status: 429 },
    )
  }

  // Phone: SMS isn't wired — tell the client to use the interim "number on file" check.
  if (norm.channel === 'SMS') {
    return NextResponse.json({ sent: false, fallback: 'PHONE_MATCH', channel: 'SMS' })
  }

  const code = generateOtpCode()
  await prisma.yellowPagesEditOtp.create({
    data: {
      listingId: id,
      channel: 'EMAIL',
      contactHash,
      codeHash: hashOtpCode(code),
      expiresAt: otpExpiry(),
    },
  })

  try {
    await sendEditOtp({ channel: 'EMAIL', to: norm.value, code, listingName: listing.name })
  } catch (error) {
    console.error('[YELLOWPAGES] Failed to send edit OTP:', error)
    return NextResponse.json({ error: 'We could not send the code right now. Please try again.' }, { status: 502 })
  }

  return NextResponse.json({
    sent: true,
    channel: 'EMAIL',
    maskedTo: maskContact(norm.value, 'EMAIL'),
    expiresInMinutes: OTP_TTL_MINUTES,
  })
}
