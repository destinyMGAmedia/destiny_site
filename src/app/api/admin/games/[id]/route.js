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

export async function PATCH(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { isActive, isFeatured, isKidsGame, isMultiplayer, maxPlayers, description, instructions, words } = data

    const patch = {
      ...(isActive !== undefined && { isActive: !!isActive }),
      ...(isFeatured !== undefined && { isFeatured: !!isFeatured }),
      ...(isKidsGame !== undefined && { isKidsGame: !!isKidsGame }),
      ...(isMultiplayer !== undefined && { isMultiplayer: !!isMultiplayer }),
      ...(maxPlayers !== undefined && { maxPlayers: Math.min(Math.max(parseInt(maxPlayers) || 2, 2), 20) }),
      ...(description !== undefined && { description: description || null }),
      ...(instructions !== undefined && { instructions: instructions || null }),
    }

    // Merge words into gameData, preserving other gameData fields
    if (words !== undefined) {
      const existing = await prisma.game.findUnique({ where: { id }, select: { gameData: true } })
      const existingData = typeof existing?.gameData === 'object' && existing.gameData !== null ? existing.gameData : {}
      patch.gameData = { ...existingData, words: words === null ? undefined : Array.isArray(words) ? words : [] }
      if (words === null) delete patch.gameData.words
    }

    const game = await prisma.game.update({ where: { id }, data: patch })
    return NextResponse.json(game)
  } catch (err) {
    console.error('[GAME_PATCH]', err)
    return NextResponse.json({ error: 'Failed to update game settings' }, { status: 500 })
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
