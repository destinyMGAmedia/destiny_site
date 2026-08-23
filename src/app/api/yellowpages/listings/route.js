import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateListingInput } from '@/lib/yellowpages/validation'
import { CATEGORY_VALUES, LISTINGS_PAGE_SIZE } from '@/lib/yellowpages/constants'

function withRatingSummary(listing) {
  const { ratings, ...rest } = listing
  const ratingCount = ratings.length
  const avgRating = ratingCount === 0 ? null : ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount
  return { ...rest, avgRating, ratingCount }
}

// GET /api/yellowpages/listings — public search/browse.
// Query params: q, category, assemblySlug, city, country, page (1-based, default 1).
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')?.trim()
  const assemblySlug = searchParams.get('assemblySlug')?.trim()
  const city = searchParams.get('city')?.trim()
  const country = searchParams.get('country')?.trim()
  const pageParam = Number(searchParams.get('page'))
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1

  if (category && !CATEGORY_VALUES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const where = { isActive: true }
  if (category) where.category = category
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (country) where.country = { contains: country, mode: 'insensitive' }
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { servicesOffered: { contains: q, mode: 'insensitive' } },
      { subCategory: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (assemblySlug) {
    const assembly = await prisma.assembly.findUnique({ where: { slug: assemblySlug } })
    if (!assembly) {
      // Unknown assembly filter — no matches, not an error (soft filter mismatch).
      return NextResponse.json({ listings: [], page, pageSize: LISTINGS_PAGE_SIZE, total: 0, totalPages: 0 })
    }
    where.assemblyId = assembly.id
  }

  const [total, listings] = await Promise.all([
    prisma.yellowPagesListing.count({ where }),
    prisma.yellowPagesListing.findMany({
      where,
      include: { ratings: { select: { stars: true } }, assembly: { select: { slug: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * LISTINGS_PAGE_SIZE,
      take: LISTINGS_PAGE_SIZE,
    }),
  ])

  return NextResponse.json({
    listings: listings.map(withRatingSummary),
    page,
    pageSize: LISTINGS_PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / LISTINGS_PAGE_SIZE),
  })
}

// POST /api/yellowpages/listings — public, unauthenticated listing submission. Auto-publishes
// (isActive: true by default) per spec/theyellowpages.md — no approval queue.
export async function POST(req) {
  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { errors, data } = validateListingInput(body)
  if (errors) {
    return NextResponse.json({ errors }, { status: 400 })
  }

  let assemblyId = null
  if (body.assemblySlug) {
    const assembly = await prisma.assembly.findUnique({ where: { slug: body.assemblySlug } })
    if (!assembly) {
      return NextResponse.json({ errors: { assemblySlug: 'Assembly not found.' } }, { status: 400 })
    }
    assemblyId = assembly.id
  }

  try {
    const listing = await prisma.yellowPagesListing.create({ data: { ...data, assemblyId } })
    return NextResponse.json({ listing: { ...listing, avgRating: null, ratingCount: 0 } }, { status: 201 })
  } catch (error) {
    console.error('[YELLOWPAGES] Failed to create listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
