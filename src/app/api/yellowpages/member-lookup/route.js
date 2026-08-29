import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sanitizePhone, isValidPhone, isValidEmail } from '@/lib/yellowpages/validation'

// POST /api/yellowpages/member-lookup — public, unauthenticated. Body: { assemblySlug, phone?, email? }.
//
// Used by the listing form to tell the submitter whether the phone/email they entered already
// belongs to a Member of the assembly they selected. Knowing the contact on file is treated as
// proof of identity — the same loginless trust model as /api/member/lookup and the listing
// "manage" flow. Only the member's name is returned (minimal PII) so the form can show a
// "this is you" confirmation; the actual listing→member link is (re)derived server-side in
// POST /api/yellowpages/listings, never trusted from the client. See spec/theyellowpages.md.
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const assemblySlug = (body.assemblySlug || '').trim()
  const phone = body.phone ? sanitizePhone(body.phone) : ''
  const email = (body.email || '').trim().toLowerCase()

  if (!assemblySlug) {
    return NextResponse.json({ error: 'An assembly is required to check membership.' }, { status: 400 })
  }
  if (!phone && !email) {
    return NextResponse.json({ error: 'Provide a phone number or email to check membership.' }, { status: 400 })
  }
  if (phone && !isValidPhone(phone)) {
    return NextResponse.json({ error: 'Enter a valid phone number (digits only, 7–15 digits).' }, { status: 400 })
  }
  if (!phone && email && !isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  try {
    const assembly = await prisma.assembly.findUnique({
      where: { slug: assemblySlug },
      select: { id: true, name: true },
    })
    if (!assembly) {
      return NextResponse.json({ error: 'Assembly not found.' }, { status: 404 })
    }

    const contactOr = []
    if (phone) contactOr.push({ phone })
    if (email) contactOr.push({ email: { equals: email, mode: 'insensitive' } })

    const member = await prisma.member.findFirst({
      where: { assemblyId: assembly.id, OR: contactOr },
      select: { firstName: true, lastName: true },
    })

    return NextResponse.json({
      assembly: { slug: assemblySlug, name: assembly.name },
      found: Boolean(member),
      member: member ? { firstName: member.firstName, lastName: member.lastName } : null,
    })
  } catch (error) {
    console.error('[YELLOWPAGES] Member lookup failed:', error)
    return NextResponse.json({ error: 'Failed to check membership' }, { status: 500 })
  }
}
