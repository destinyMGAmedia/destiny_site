import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const assemblyId = searchParams.get('assemblyId')
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
  const { assemblyId, title, startDate, endDate, time, venue, description, flyerImage } = body

  if (!assemblyId || !title || !startDate) {
    return NextResponse.json({ error: 'assemblyId, title, startDate are required' }, { status: 400 })
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
    },
  })

  return NextResponse.json(event, { status: 201 })
}
