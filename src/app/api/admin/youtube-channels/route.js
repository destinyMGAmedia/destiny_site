import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET all YouTube channels
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const channels = await prisma.youtubeChannel.findMany({
      orderBy: { channelType: 'asc' }
    })

    return NextResponse.json(channels)
  } catch (error) {
    console.error('Error fetching YouTube channels:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new YouTube channel
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { channelType, channelId, channelName, description, isActive } = data

    // Validate required fields
    if (!channelType || !channelId || !channelName) {
      return NextResponse.json(
        { message: 'Channel type, channel ID, and channel name are required' },
        { status: 400 }
      )
    }

    // Check if channel type already exists (unique constraint)
    const existingChannel = await prisma.youtubeChannel.findUnique({
      where: { channelType }
    })

    if (existingChannel) {
      return NextResponse.json(
        { message: `A channel with type "${channelType}" already exists` },
        { status: 409 }
      )
    }

    // Create new channel
    const channel = await prisma.youtubeChannel.create({
      data: {
        channelType,
        channelId,
        channelName,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(channel, { status: 201 })
  } catch (error) {
    console.error('Error creating YouTube channel:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'A channel with this type already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}