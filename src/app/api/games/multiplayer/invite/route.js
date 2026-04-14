import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Send game invitation
export async function POST(req) {
  try {
    const { roomId, fromPlayer, toPlayer } = await req.json()

    if (!roomId || !fromPlayer || !toPlayer) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Check if room exists
    const room = await prisma.gameRoom.findUnique({
      where: { id: roomId },
      include: { players: true }
    })

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    if (room.status !== 'WAITING') {
      return NextResponse.json({ error: 'Cannot invite to room that is not waiting' }, { status: 400 })
    }

    // Check if inviter is in the room
    const inviter = room.players.find(p => p.username === fromPlayer)
    if (!inviter) {
      return NextResponse.json({ error: 'Inviter not in room' }, { status: 403 })
    }

    // Check if target player is already in room
    const targetInRoom = room.players.find(p => p.username === toPlayer)
    if (targetInRoom) {
      return NextResponse.json({ error: 'Player already in room' }, { status: 400 })
    }

    // Check if invitation already exists
    const existingInvite = await prisma.gameInvite.findUnique({
      where: {
        roomId_toPlayer: {
          roomId,
          toPlayer
        }
      }
    })

    if (existingInvite && existingInvite.status === 'PENDING') {
      return NextResponse.json({ error: 'Invitation already sent' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    const invitation = await prisma.gameInvite.create({
      data: {
        roomId,
        fromPlayer,
        toPlayer,
        expiresAt
      }
    })

    return NextResponse.json(invitation)
  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get invitations for a user
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const invitations = await prisma.gameInvite.findMany({
      where: {
        toPlayer: username,
        status: 'PENDING',
        expiresAt: { gt: new Date() }
      },
      include: {
        room: {
          include: {
            players: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(invitations)
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}