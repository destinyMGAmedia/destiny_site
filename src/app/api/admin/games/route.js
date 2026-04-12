import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(games)
}

export async function POST(req) {
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

    const game = await prisma.game.create({
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
    console.error('[GAME_POST]', err)
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 })
  }
}
