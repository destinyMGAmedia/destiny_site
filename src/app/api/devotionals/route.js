import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/devotionals — get today's devotional (timezone-aware)
// Query: ?timezone=NIGERIA|USA_EAST|USA_WEST
// Also supports: ?archive=true to get past devotionals (paginated)
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const timezone = searchParams.get('timezone') || 'NIGERIA'
  const archive = searchParams.get('archive') === 'true'
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const today = new Date()
  // For each timezone, compute "today's date" in that zone
  const tzOffsets = { NIGERIA: 1, USA_EAST: -4, USA_WEST: -7 } // UTC offsets (approx)
  const offset = tzOffsets[timezone] || 1
  const localDate = new Date(today.getTime() + offset * 60 * 60 * 1000)
  const todayStr = localDate.toISOString().split('T')[0]

  if (archive) {
    const [data, total] = await Promise.all([
      prisma.devotional.findMany({
        where: {
          scheduledDate: { lt: new Date(todayStr) },
          OR: [{ targetTimezone: timezone }, { targetTimezone: 'ALL' }],
        },
        orderBy: { scheduledDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.devotional.count({
        where: {
          scheduledDate: { lt: new Date(todayStr) },
          OR: [{ targetTimezone: timezone }, { targetTimezone: 'ALL' }],
        },
      }),
    ])
    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  }

  // Today's devotional
  const devotional = await prisma.devotional.findFirst({
    where: {
      scheduledDate: {
        gte: new Date(todayStr + 'T00:00:00Z'),
        lt: new Date(todayStr + 'T23:59:59Z'),
      },
      OR: [{ targetTimezone: timezone }, { targetTimezone: 'ALL' }],
    },
    orderBy: { scheduledDate: 'desc' },
  })

  return NextResponse.json(devotional || null)
}

// POST /api/devotionals — create/schedule a devotional (GLOBAL_ADMIN+)
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, content, scripture, scriptureRef, scheduledDate, publishTime, targetTimezone } = body

  if (!title || !content || !scheduledDate) {
    return NextResponse.json({ error: 'title, content, scheduledDate are required' }, { status: 400 })
  }

  const devotional = await prisma.devotional.create({
    data: {
      title,
      content,
      scripture,
      scriptureRef,
      scheduledDate: new Date(scheduledDate),
      publishTime: publishTime || '00:00',
      targetTimezone: targetTimezone || 'ALL',
      authorId: session.user.id,
    },
  })

  return NextResponse.json(devotional, { status: 201 })
}
