import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { CATEGORY_VALUES, LISTINGS_PAGE_SIZE } from '@/lib/yellowpages/constants'

// GET /api/admin/yellowpages/listings — admin-only (isGlobalAdmin). Unlike the public
// /api/yellowpages/listings, this returns BOTH active and inactive listings so admins can
// review and reactivate/delete — the moderation backstop since listings auto-publish with
// no approval queue. See spec/theyellowpages.md.
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  const category = searchParams.get('category')?.trim()
  const status = searchParams.get('status')?.trim() // 'active' | 'inactive' | omitted (all)
  const pageParam = Number(searchParams.get('page'))
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1

  if (category && !CATEGORY_VALUES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const where = {}
  if (status === 'active') where.isActive = true
  if (status === 'inactive') where.isActive = false

  const and = []
  if (category) and.push({ OR: [{ category }, { categories: { has: category } }] })
  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { contactPersonName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    })
  }
  if (and.length) where.AND = and

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

  const withSummary = listings.map(({ ratings, ...rest }) => {
    const ratingCount = ratings.length
    const avgRating = ratingCount === 0 ? null : ratings.reduce((sum, r) => sum + r.stars, 0) / ratingCount
    return { ...rest, avgRating, ratingCount }
  })

  return NextResponse.json({
    listings: withSummary,
    page,
    pageSize: LISTINGS_PAGE_SIZE,
    total,
    totalPages: Math.ceil(total / LISTINGS_PAGE_SIZE),
  })
}
