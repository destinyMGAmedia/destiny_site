import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const devotional = await prisma.devotional.findUnique({
    where: { id },
  })

  if (!devotional) {
    return NextResponse.json({ error: 'Devotional not found' }, { status: 404 })
  }

  return NextResponse.json(devotional)
}

export async function PUT(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { title, content, scripture, scriptureRef, scheduledDate, publishTime, targetTimezone } = data

    if (!title || !content || !scheduledDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const fullScheduledAt = new Date(scheduledDate)
    const [hours, minutes] = (publishTime || '00:00').split(':')
    fullScheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    const devotional = await prisma.devotional.update({
      where: { id },
      data: {
        title,
        content,
        scripture,
        scriptureRef,
        scheduledDate: fullScheduledAt,
        publishTime: publishTime || '00:00',
        targetTimezone: targetTimezone || 'NIGERIA',
      },
    })

    return NextResponse.json(devotional)
  } catch (err) {
    console.error('[DEVOTIONAL_PUT]', err)
    return NextResponse.json({ error: 'Failed to update devotional' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.devotional.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DEVOTIONAL_DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete devotional' }, { status: 500 })
  }
}
