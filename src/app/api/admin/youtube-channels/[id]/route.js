import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PUT update YouTube channel
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const { channelType, channelId, channelName, description, isActive } = data

    // Validate required fields
    if (!channelType || !channelId || !channelName) {
      return NextResponse.json(
        { message: 'Channel type, channel ID, and channel name are required' },
        { status: 400 }
      )
    }

    // Check if the channel exists
    const existingChannel = await prisma.youtubeChannel.findUnique({
      where: { id }
    })

    if (!existingChannel) {
      return NextResponse.json(
        { message: 'Channel not found' },
        { status: 404 }
      )
    }

    // Check if channel type conflicts with another channel (only if type is being changed)
    if (existingChannel.channelType !== channelType) {
      const conflictingChannel = await prisma.youtubeChannel.findUnique({
        where: { channelType }
      })

      if (conflictingChannel && conflictingChannel.id !== id) {
        return NextResponse.json(
          { message: `A channel with type "${channelType}" already exists` },
          { status: 409 }
        )
      }
    }

    // Update channel
    const channel = await prisma.youtubeChannel.update({
      where: { id },
      data: {
        channelType,
        channelId,
        channelName,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json(channel)
  } catch (error) {
    console.error('Error updating YouTube channel:', error)
    
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

// DELETE YouTube channel
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if the channel exists
    const existingChannel = await prisma.youtubeChannel.findUnique({
      where: { id }
    })

    if (!existingChannel) {
      return NextResponse.json(
        { message: 'Channel not found' },
        { status: 404 }
      )
    }

    // Delete channel
    await prisma.youtubeChannel.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Channel deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting YouTube channel:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}