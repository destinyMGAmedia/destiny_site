import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { normalizeContact, hashOtpContact, hashOtpCode } from '@/lib/yellowpages/otp'
import { OTP_MAX_ATTEMPTS, EDIT_TOKEN_WINDOW_MINUTES } from '@/lib/yellowpages/constants'

// POST /api/yellowpages/listings/[id]/edit-otp/verify — Body: { to, code }.
// On success marks the OTP consumed and returns { editToken } — the OTP row id, accepted by
// PATCH /api/yellowpages/listings/[id] for the next EDIT_TOKEN_WINDOW_MINUTES.
export async function POST(req, { params }) {
  const { id } = await params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const norm = normalizeContact((body.to || '').trim())
  const code = String(body.code || '').trim()
  if (!norm || !code) {
    return NextResponse.json({ error: 'Enter the code we sent you.' }, { status: 400 })
  }

  const contactHash = hashOtpContact(norm.value)
  const row = await prisma.yellowPagesEditOtp.findFirst({
    where: { listingId: id, contactHash, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  })

  if (!row) {
    return NextResponse.json({ error: 'That code has expired or is invalid. Request a new one.' }, { status: 400 })
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return NextResponse.json({ error: 'Too many incorrect attempts. Request a new code.' }, { status: 429 })
  }

  if (row.codeHash !== hashOtpCode(code)) {
    const updated = await prisma.yellowPagesEditOtp.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    })
    return NextResponse.json(
      { error: 'Incorrect code.', attemptsLeft: Math.max(OTP_MAX_ATTEMPTS - updated.attempts, 0) },
      { status: 400 },
    )
  }

  await prisma.yellowPagesEditOtp.update({ where: { id: row.id }, data: { consumedAt: new Date() } })

  return NextResponse.json({ editToken: row.id, expiresInMinutes: EDIT_TOKEN_WINDOW_MINUTES })
}
