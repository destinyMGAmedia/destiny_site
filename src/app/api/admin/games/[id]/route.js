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

  const game = await prisma.game.findUnique({
    where: { id },
  })

  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  return NextResponse.json(game)
}

export async function PUT(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { title, description, instructions, type, gameData, thumbnail, isFeatured, isActive, isKidsGame, isMultiplayer, maxPlayers } = data

    if (!title || !type || !gameData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const game = await prisma.game.update({
      where: { id },
      data: {
        title,
        description,
        instructions,
        type,
        gameData,
        thumbnail,
        isFeatured: !!isFeatured,
        isActive: isActive !== false,
        isKidsGame: !!isKidsGame,
        isMultiplayer: !!isMultiplayer,
        maxPlayers: parseInt(maxPlayers) || 1,
      },
    })

    return NextResponse.json(game)
  } catch (err) {
    console.error('[GAME_PUT]', err)
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.game.delete({
      where: { id },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[GAME_DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }
}
