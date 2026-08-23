import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateRatingInput, publicReviewerName } from '@/lib/yellowpages/validation'
import { hashContact } from '@/lib/yellowpages/contact'

// POST /api/yellowpages/listings/[id]/ratings — public, unauthenticated. One rating per
// (listing, contact) enforced by the DB's @@unique([listingId, contactHash]) — see
// spec/theyellowpages.md "Invariants". The raw phone/email is never persisted or returned.
export async function POST(req, { params }) {
  const { id } = await params

  const listing = await prisma.yellowPagesListing.findUnique({ where: { id }, select: { id: true, isActive: true } })
  if (!listing || !listing.isActive) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { errors, data } = validateRatingInput(body)
  if (errors) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  const contactHash = hashContact(data.contact)

  try {
    const rating = await prisma.yellowPagesRating.create({
      data: {
        listingId: id,
        stars: data.stars,
        comment: data.comment,
        reviewerName: data.reviewerName,
        contactHash,
      },
      select: { id: true, stars: true, comment: true, reviewerName: true, createdAt: true },
    })
    return NextResponse.json({ rating: { ...rating, reviewerName: publicReviewerName(rating.reviewerName) } }, { status: 201 })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already rated this listing.' }, { status: 409 })
    }
    console.error('[YELLOWPAGES] Failed to create rating:', error)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}
