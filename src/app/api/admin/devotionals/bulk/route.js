import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { devotionals } = await req.json()

    if (!devotionals || !Array.isArray(devotionals)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
    }

    const createdDevotionals = await Promise.all(
      devotionals.map(async (d) => {
        const { title, content, scripture, scriptureRef, scheduledDate, publishTime, targetTimezone } = d
        
        const fullScheduledAt = new Date(scheduledDate)
        const [hours, minutes] = (publishTime || '00:00').split(':')
        fullScheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        return prisma.devotional.create({
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
      })
    )

    return NextResponse.json({ count: createdDevotionals.length })
  } catch (err) {
    console.error('[DEVOTIONAL_BULK_POST]', err)
    return NextResponse.json({ error: 'Failed to create devotionals' }, { status: 500 })
  }
}
