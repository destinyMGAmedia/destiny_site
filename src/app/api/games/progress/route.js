import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 })
  }

  try {
    const progress = await prisma.playerProgress.findUnique({
      where: { username: username.toLowerCase() }
    })

    if (!progress) {
      return NextResponse.json({ message: 'No progress found', gameData: {} })
    }

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { username, gameData } = await req.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const progress = await prisma.playerProgress.upsert({
      where: { username: username.toLowerCase() },
      update: { gameData },
      create: { 
        username: username.toLowerCase(), 
        gameData 
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Error saving progress:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
