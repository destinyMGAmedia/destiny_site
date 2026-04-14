import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Get specific room details
export async function GET(req, { params }) {
  try {
    const { roomId } = params

    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: {
        players: {
          orderBy: { joinedAt: 'asc' }
        },
        invitations: {
          where: { status: 'PENDING' }
        }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error fetching room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update room state or settings
export async function PATCH(req, { params }) {
  try {
    const { roomId } = params
    const { gameState, status, username } = await req.json()

    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: true }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    // Update game state
    const updatedRoom = await prisma.gameRoom.update({
      where: { id: roomId },
      data: {
        ...(gameState && { gameState }),
        ...(status && { status }),
        updatedAt: new Date()
      },
      include: {
        players: {
          orderBy: { joinedAt: 'asc' }
        },
        invitations: true
      }
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete/abandon room
export async function DELETE(req, { params }) {
  try {
    const { roomId } = params
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.hostPlayer !== username) {
      return NextResponse.json({ error: 'Only host can delete room' }, { status: 403 })
    }

    await prisma.gameRoom.update({
      where: { id: roomId },
      data: { status: 'ABANDONED' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}