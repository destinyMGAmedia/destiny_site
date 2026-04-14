import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Join a game room
export async function POST(req) {
  try {
    const { roomCode, username } = await req.json()

    if (!roomCode || !username) {
      return NextResponse.json({ error: 'Room code and username are required' }, { status: 400 })
    }

    const room = await prisma.gameRoom.findUnique({
      where: { roomCode },
      include: {
        players: true,
        _count: { select: { players: true } }
      }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({ error: 'Room is not accepting new players' }, { status: 400 })
    }

    if (room._count.players >= room.maxPlayers) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 })
    }

    // Check if player already in room
    const existingPlayer = room.players.find(p => p.username === username)
    if (existingPlayer) {
      return NextResponse.json({ error: 'Player already in room' }, { status: 400 })
    }

    const player = await prisma.gamePlayer.create({
      data: {
        roomId: room.id,
        username,
        position: room.players.length + 1
      }
    })

    const updatedRoom = await prisma.gameRoom.findUnique({
      where: { id: room.id },
      include: {
        players: {
          orderBy: { joinedAt: 'asc' }
        },
        invitations: true
      }
    })

    return NextResponse.json(updatedRoom)
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}