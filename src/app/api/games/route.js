import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Returns the set of active game keys so the public page knows what to show.
// Falls back to all games enabled if the DB has no records yet.
export async function GET() {
  try {
    const games = await prisma.game.findMany({
      select: {
        gameData: true,
        isActive: true,
        isFeatured: true,
        isKidsGame: true,
        title: true,
        description: true,
        isMultiplayer: true,
        maxPlayers: true,
      },
    })

    if (games.length === 0) {
      // Nothing seeded yet — allow all games
      return NextResponse.json({ activeKeys: null })
    }

    const activeKeys = games
      .filter(g => g.isActive)
      .map(g => {
        const data = g.gameData
        return typeof data === 'object' && data !== null ? data.key : null
      })
      .filter(Boolean)

    return NextResponse.json({ activeKeys })
  } catch {
    // If DB is unavailable, allow all games
    return NextResponse.json({ activeKeys: null })
  }
}
