import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { publicReviewerName, validateListingInput } from '@/lib/yellowpages/validation'
import { checkEditAuthorization } from '@/lib/yellowpages/editAuth'

// GET /api/yellowpages/listings/[id] — public listing detail. 404s for a hidden/deleted
// listing so a deactivated listing isn't distinguishable from one that never existed.
export async function GET(_req, { params }) {
  const { id } = await params

  const listing = await prisma.yellowPagesListing.findUnique({
    where: { id },
    include: {
      ratings: { orderBy: { createdAt: 'desc' }, select: { id: true, stars: true, comment: true, reviewerName: true, createdAt: true } },
      assembly: { select: { slug: true, name: true, city: true, country: true } },
    },
  })

  if (!listing || !listing.isActive) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const ratingCount = listing.ratings.length
  const avgRating = ratingCount === 0 ? null : listing.ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount

  // `editContacts` are other people's raw phone/email — never expose them on the public detail
  // endpoint. The owner-facing edit flow reads them via the contact-verified `lookup` route.
  const { editContacts, ...publicListing } = listing

  return NextResponse.json({
    listing: {
      ...publicListing,
      hasEditRestrictions: Boolean(listing.editStrict) || (editContacts || []).length > 0,
      ratings: listing.ratings.map((r) => ({ ...r, reviewerName: publicReviewerName(r.reviewerName) })),
      avgRating,
      ratingCount,
    },
  })
}

// PATCH /api/yellowpages/listings/[id] — two independent modes:
//   1. Admin (isGlobalAdmin session): moderation only — `{ isActive }` to hide/reactivate,
//      and/or `{ resetEditLock: true }` to clear `editStrict` + `editContacts` so a
//      locked-out owner can regain access.
//   2. Owner self-edit (no login): an email-OTP `editToken` or an authorised
//      `ownerPhone`/`ownerEmail` (see src/lib/yellowpages/editAuth.js), plus the listing fields.
export async function PATCH(req, { params }) {
  const { id } = await params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  if (session && isGlobalAdmin(session)) {
    const data = {}
    if (typeof body.isActive === 'boolean') data.isActive = body.isActive
    if (body.resetEditLock === true) {
      data.editStrict = false
      data.editContacts = []
    }
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Provide isActive (boolean) and/or resetEditLock (true).' }, { status: 400 })
    }
    try {
      const listing = await prisma.yellowPagesListing.update({ where: { id }, data })
      return NextResponse.json({ listing })
    } catch (error) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      console.error('[YELLOWPAGES] Failed to update listing:', error)
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
    }
  }

  // Owner self-edit path — authorised by an email-OTP `editToken` or an authorised
  // `ownerPhone`/`ownerEmail`. See src/lib/yellowpages/editAuth.js.
  const existing = await prisma.yellowPagesListing.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const auth = await checkEditAuthorization(existing, body)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { errors, data } = validateListingInput(body)
  if (errors) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  let assemblyId = existing.assemblyId
  if (body.assemblySlug !== undefined) {
    if (!body.assemblySlug) {
      assemblyId = null
    } else {
      const assembly = await prisma.assembly.findUnique({ where: { slug: body.assemblySlug } })
      if (!assembly) {
        return NextResponse.json({ errors: { assemblySlug: 'Assembly not found.' } }, { status: 400 })
      }
      assemblyId = assembly.id
    }
  }

  try {
    const listing = await prisma.yellowPagesListing.update({ where: { id }, data: { ...data, assemblyId } })
    return NextResponse.json({ listing })
  } catch (error) {
    console.error('[YELLOWPAGES] Failed to update listing (owner edit):', error)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

// DELETE /api/yellowpages/listings/[id] — admin-only (isGlobalAdmin). Hard delete; cascades to ratings.
export async function DELETE(_req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params

  try {
    await prisma.yellowPagesListing.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    console.error('[YELLOWPAGES] Failed to delete listing:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
