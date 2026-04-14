import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// Create a new game room
export async function POST(req) {
  try {
    const { hostPlayer, difficulty = 'MEDIUM', maxPlayers = 4 } = await req.json()

    if (!hostPlayer) {
      return NextResponse.json({ error: 'Host player is required' }, { status: 400 })
    }

    let roomCode
    let attempts = 0
    do {
      roomCode = generateRoomCode()
      attempts++
      if (attempts > 10) {
        return NextResponse.json({ error: 'Unable to generate unique room code' }, { status: 500 })
      }
    } while (await prisma.gameRoom.findUnique({ where: { roomCode } }))

    const room = await prisma.gameRoom.create({
      data: {
        roomCode,
        hostPlayer,
        difficulty,
        maxPlayers,
        players: {
          create: {
            username: hostPlayer,
            position: 1,
          }
        }
      },
      include: {
        players: true,
        invitations: true
      }
    })

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error creating game room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get game rooms (for finding games to join)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'WAITING'

    const rooms = await prisma.gameRoom.findMany({
      where: { 
        status,
        players: {
          some: {}
        }
      },
      include: {
        players: true,
        _count: {
          select: { players: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Error fetching game rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}