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
// Body: { to } — an EMAIL that is on file for the listing (its public email unless `editStrict`,
// plus any email in `editContacts`). Portfolio editing is verified by email only; phone/SMS
// verification is not offered. A 6-digit code is emailed; respond { sent: true }.
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
  if (!norm || norm.channel !== 'EMAIL') {
    return NextResponse.json(
      { error: 'Enter the email address on file for this listing — editing is verified by email.' },
      { status: 400 },
    )
  }

  if (!isAuthorizedEditContact(listing, rawTo)) {
    return NextResponse.json(
      { error: "That email address isn't on file for this listing." },
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
