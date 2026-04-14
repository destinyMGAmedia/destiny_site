import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Respond to invitation (accept/decline)
export async function PATCH(req, { params }) {
  try {
    const { inviteId } = params
    const { action, username } = await req.json()

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const invitation = await prisma.gameInvite.findUnique({
      where: { id: inviteId },
      include: {
        room: {
          include: {
            players: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.toPlayer !== username) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    if (invitation.status !== 'PENDING') {
      return NextResponse.json({ error: 'Invitation already responded to' }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.gameInvite.update({
        where: { id: inviteId },
        data: { status: 'EXPIRED' }
      })
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 })
    }

    const newStatus = action === 'accept' ? 'ACCEPTED' : 'DECLINED'

    // Update invitation status
    await prisma.gameInvite.update({
      where: { id: inviteId },
      data: { status: newStatus }
    })

    let result = { status: newStatus }

    // If accepting, add player to room
    if (action === 'accept') {
      const room = invitation.room

      if (room.status !== 'WAITING') {
        return NextResponse.json({ error: 'Room is no longer accepting players' }, { status: 400 })
      }

      if (room.players.length >= room.maxPlayers) {
        return NextResponse.json({ error: 'Room is full' }, { status: 400 })
      }

      // Check if player already in room
      const existingPlayer = room.players.find(p => p.username === username)
      if (!existingPlayer) {
        await prisma.gamePlayer.create({
          data: {
            roomId: room.id,
            username,
            position: room.players.length + 1
          }
        })
      }

      // Return updated room
      const updatedRoom = await prisma.gameRoom.findUnique({
        where: { id: room.id },
        include: {
          players: {
            orderBy: { joinedAt: 'asc' }
          },
          invitations: true
        }
      })

      result.room = updatedRoom
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error responding to invitation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}