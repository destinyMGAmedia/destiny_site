import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const assemblyId = searchParams.get('assemblyId')
  
  // Global admins can access all events without assemblyId
  if (['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
    const where = assemblyId ? { assemblyId } : {}
    const events = await prisma.event.findMany({
      where,
      include: {
        assembly: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      },
      orderBy: { startDate: 'desc' },
    })
    return NextResponse.json(events)
  }

  // For other roles, require assemblyId and permission check
  if (!assemblyId) return NextResponse.json({ error: 'assemblyId required' }, { status: 400 })

  if (!canUpdateContent(session, assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const events = await prisma.event.findMany({
    where: { assemblyId },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json(events)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { assemblyId, title, startDate, endDate, time, venue, description, flyerImage, isGlobal, isChildrensEvent } = body

  if (!title || !startDate) {
    return NextResponse.json({ error: 'title and startDate are required' }, { status: 400 })
  }

  // Global/Super admins can create global events
  if (['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
    // For non-global events, require assemblyId
    if (!isGlobal && !assemblyId) {
      return NextResponse.json({ error: 'assemblyId required for non-global events' }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        assemblyId: isGlobal ? null : assemblyId,
        title,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        time: time || null,
        venue: venue || null,
        description: description || null,
        flyerImage: flyerImage || null,
        isGlobal: Boolean(isGlobal),
        isChildrensEvent: Boolean(isChildrensEvent),
      },
      include: {
        assembly: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      }
    })

    return NextResponse.json(event, { status: 201 })
  }

  // For other roles, require assemblyId and permission check
  if (!assemblyId) {
    return NextResponse.json({ error: 'assemblyId required' }, { status: 400 })
  }

  if (!canUpdateContent(session, assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const event = await prisma.event.create({
    data: {
      assemblyId,
      title,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      time: time || null,
      venue: venue || null,
      description: description || null,
      flyerImage: flyerImage || null,
      isGlobal: false,
      isChildrensEvent: Boolean(isChildrensEvent),
    },
  })

  return NextResponse.json(event, { status: 201 })
}
