import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const devotionals = await prisma.devotional.findMany({
    orderBy: { scheduledDate: 'desc' },
  })

  return NextResponse.json(devotionals)
}

export async function POST(req) {
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
    
    // Adjust based on targetTimezone to ensure it's stored in correct UTC
    // Default WAT (UTC+1)
    let offset = 1 
    if (targetTimezone === 'USA_EAST') offset = -5
    if (targetTimezone === 'USA_WEST') offset = -8

    // Set hours in UTC based on the local target time and its offset
    // UTC = Local - Offset
    const utcHours = parseInt(hours) - offset
    fullScheduledAt.setUTCHours(utcHours, parseInt(minutes), 0, 0)

    const devotional = await prisma.devotional.create({
      data: {
        title,
        content,
        scripture,
        scriptureRef,
        scheduledDate: fullScheduledAt,
        publishTime: publishTime || '00:00',
        targetTimezone: targetTimezone || 'NIGERIA',
        authorId: session.user.id,
      },
    })

    return NextResponse.json(devotional)
  } catch (err) {
    console.error('[DEVOTIONAL_POST]', err)
    return NextResponse.json({ error: 'Failed to create devotional' }, { status: 500 })
  }
}
