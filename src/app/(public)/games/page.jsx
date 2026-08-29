import GamesClient from './GamesClient'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function GamesPage() {
  let enabledKeys = null
  let crosswordWords = null

  try {
    const games = await prisma.game.findMany({
      select: { gameData: true, isActive: true },
    })

    if (games.length > 0) {
      enabledKeys = games
        .filter(g => g.isActive)
        .map(g => {
          const d = g.gameData
          return typeof d === 'object' && d !== null ? d.key : null
        })
        .filter(Boolean)

      const crossword = games.find(g => {
        const d = g.gameData
        return typeof d === 'object' && d !== null && d.component === 'BibleWordSearch'
      })
      if (Array.isArray(crossword?.gameData?.words) && crossword.gameData.words.length > 0) {
        crosswordWords = crossword.gameData.words
      }
    }
  } catch {
    // DB unavailable — show all games with default words
  }

  return <GamesClient enabledKeys={enabledKeys} words={crosswordWords} />
}
