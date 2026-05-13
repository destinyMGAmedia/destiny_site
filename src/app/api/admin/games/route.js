import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// The 4 games embedded in the system. Seeded automatically on first admin access.
const KNOWN_GAMES = [
  {
    title: 'Promise Land',
    description: 'An adventurous 3D journey through the wilderness. Equip the Armor of God, overcome temptations, and reach the Promise Land of Canaan.',
    instructions: 'Use W/A/S/D or arrow keys to move. Collect spiritual items and avoid obstacles on your way to Canaan.',
    type: 'CORE_VALUES',
    gameData: { component: 'PromiseLand', key: 'promise' },
    isFeatured: false,
    isActive: true,
    isKidsGame: false,
    isMultiplayer: false,
    maxPlayers: 1,
  },
  {
    title: 'Journey to Heaven',
    description: 'A spiritual 3D maze adventure. Play solo or challenge friends in multiplayer mode.',
    instructions: 'Roll the dice to advance. Land on ladders to climb higher. Watch out for trials that set you back. First to reach Heaven wins.',
    type: 'JOURNEY_TO_HEAVEN',
    gameData: { component: 'JourneyToHeavenFixed', key: 'journey' },
    isFeatured: true,
    isActive: true,
    isKidsGame: false,
    isMultiplayer: true,
    maxPlayers: 4,
  },
  {
    title: 'Bible Quiz',
    description: 'Test your knowledge of the Word with 5 random questions. Can you get a perfect score?',
    instructions: 'Answer each question by selecting the correct option. You have one attempt per question. Your score is shown at the end.',
    type: 'QUIZ',
    gameData: { component: 'HomeBibleQuiz', key: 'quiz' },
    isFeatured: false,
    isActive: true,
    isKidsGame: true,
    isMultiplayer: false,
    maxPlayers: 1,
  },
  {
    title: 'DMGA Crossword',
    description: 'Find hidden words from our vision and mission in this fun and challenging puzzle.',
    instructions: 'Drag over letters to select words. Words can be hidden horizontally, vertically, or diagonally. Find all words to complete the puzzle.',
    type: 'WORD_SEARCH',
    gameData: { component: 'BibleWordSearch', key: 'crossword' },
    isFeatured: false,
    isActive: true,
    isKidsGame: true,
    isMultiplayer: false,
    maxPlayers: 1,
  },
]

async function ensureGamesSeeded() {
  const count = await prisma.game.count()
  if (count > 0) return

  await prisma.game.createMany({
    data: KNOWN_GAMES,
    skipDuplicates: true,
  })
}

// Removes the old BibleCrossword game and migrates BibleWordSearch key to 'crossword'
async function migrateGames() {
  const allGames = await prisma.game.findMany()
  for (const game of allGames) {
    const d = typeof game.gameData === 'object' && game.gameData !== null ? game.gameData : {}
    if (d.component === 'BibleCrossword') {
      await prisma.game.delete({ where: { id: game.id } })
    } else if (d.component === 'BibleWordSearch' && (d.key !== 'crossword' || game.title === 'DMGA Word Search')) {
      await prisma.game.update({
        where: { id: game.id },
        data: { title: 'DMGA Crossword', gameData: { ...d, key: 'crossword' } },
      })
    }
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await ensureGamesSeeded()
  await migrateGames()

  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'asc' },
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
