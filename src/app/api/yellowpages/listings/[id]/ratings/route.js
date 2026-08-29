import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateRatingInput, publicReviewerName } from '@/lib/yellowpages/validation'
import { hashContact } from '@/lib/yellowpages/contact'

// POST /api/yellowpages/listings/[id]/ratings — public, unauthenticated. One rating per
// (listing, contact), enforced by the DB's @@unique([listingId, contactHash]). Re-submitting
// with the same phone/email is treated as editing your own review (upsert) rather than an
// error — there is no login, so "same contact" is how we recognise the author. The raw
// phone/email is never persisted or returned. See spec/theyellowpages.md "Invariants".
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
  const RATING_SELECT = { id: true, stars: true, comment: true, reviewerName: true, createdAt: true }
  const whereContact = { listingId_contactHash: { listingId: id, contactHash } }
  const newValues = { stars: data.stars, comment: data.comment, reviewerName: data.reviewerName }

  try {
    // Did this contact already review this listing? Drives the 200-vs-201 status and lets the
    // client tell the reviewer "updated" vs "submitted".
    const existing = await prisma.yellowPagesRating.findUnique({ where: whereContact, select: { id: true } })

    let rating
    try {
      rating = await prisma.yellowPagesRating.upsert({
        where: whereContact,
        create: { listingId: id, contactHash, ...newValues },
        update: newValues,
        select: RATING_SELECT,
      })
    } catch (error) {
      // Lost a race with a concurrent first-time submission from the same contact — apply ours
      // as an edit to the row that just won.
      if (error.code !== 'P2002') throw error
      rating = await prisma.yellowPagesRating.update({ where: whereContact, data: newValues, select: RATING_SELECT })
    }

    return NextResponse.json(
      { rating: { ...rating, reviewerName: publicReviewerName(rating.reviewerName) }, updated: Boolean(existing) },
      { status: existing ? 200 : 201 },
    )
  } catch (error) {
    console.error('[YELLOWPAGES] Failed to submit rating:', error)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}
