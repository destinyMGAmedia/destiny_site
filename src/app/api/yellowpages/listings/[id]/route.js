import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { publicReviewerName, validateListingInput, sanitizePhone } from '@/lib/yellowpages/validation'

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

  return NextResponse.json({
    listing: {
      ...listing,
      ratings: listing.ratings.map((r) => ({ ...r, reviewerName: publicReviewerName(r.reviewerName) })),
      avgRating,
      ratingCount,
    },
  })
}

// PATCH /api/yellowpages/listings/[id] — two independent modes:
//   1. Admin (isGlobalAdmin session): { isActive } only — the moderation hide/reactivate toggle.
//   2. Owner self-edit (no login): { ownerPhone or ownerEmail, ...listing fields }. The given
//      contact must match the listing's own phone/email on file — the same "contact you already
//      know is proof enough" trust model this app already uses elsewhere (member lookup, etc.).
//      See spec/theyellowpages.md's "members should be able to edit their listing" addition.
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
    if (typeof body.isActive !== 'boolean') {
      return NextResponse.json({ error: 'isActive (boolean) is required' }, { status: 400 })
    }
    try {
      const listing = await prisma.yellowPagesListing.update({ where: { id }, data: { isActive: body.isActive } })
      return NextResponse.json({ listing })
    } catch (error) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }
      console.error('[YELLOWPAGES] Failed to update listing:', error)
      return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
    }
  }

  // Owner self-edit path.
  const ownerPhone = body.ownerPhone ? sanitizePhone(body.ownerPhone) : ''
  const ownerEmail = (body.ownerEmail || '').trim().toLowerCase()
  if (!ownerPhone && !ownerEmail) {
    return NextResponse.json({ error: 'ownerPhone or ownerEmail is required to edit a listing.' }, { status: 400 })
  }

  const existing = await prisma.yellowPagesListing.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const matches =
    (ownerPhone && existing.phone === ownerPhone) ||
    (ownerEmail && existing.email && existing.email.toLowerCase() === ownerEmail)
  if (!matches) {
    return NextResponse.json({ error: 'The phone or email you entered does not match this listing.' }, { status: 403 })
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
