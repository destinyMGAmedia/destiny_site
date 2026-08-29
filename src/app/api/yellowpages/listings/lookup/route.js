import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sanitizePhone, isValidPhone, isValidEmail } from '@/lib/yellowpages/validation'

// POST /api/yellowpages/listings/lookup — public, unauthenticated. Body: { phone } or { email }.
// Returns the caller's own listing(s) in full (including inactive ones) so they can review and
// edit them — knowing the phone/email on file is treated as proof of ownership, the same trust
// model already used elsewhere in this app (member lookup). See spec/theyellowpages.md.
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const phone = body.phone ? sanitizePhone(body.phone) : ''
  const email = (body.email || '').trim().toLowerCase()

  if (!phone && !email) {
    return NextResponse.json({ error: 'Please provide a phone number or email address.' }, { status: 400 })
  }
  if (phone && !isValidPhone(phone)) {
    return NextResponse.json({ error: 'Enter a valid phone number (digits only, 7–15 digits).' }, { status: 400 })
  }
  if (!phone && email && !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const where = { OR: [] }
  if (phone) where.OR.push({ phone })
  if (email) where.OR.push({ email: { equals: email, mode: 'insensitive' } })

  const listings = await prisma.yellowPagesListing.findMany({
    where,
    include: { assembly: { select: { slug: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json({ listings })
}
