import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Search for players by username
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json([])
    }

    // Search in both PlayerProgress (game players) and User (registered users)
    const [gamePlayers, registeredUsers] = await Promise.all([
      prisma.playerProgress.findMany({
        where: {
          username: {
            contains: query.trim(),
            mode: 'insensitive'
          }
        },
        select: { username: true },
        take: 10
      }),
      prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query.trim(),
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: query.trim(),
                mode: 'insensitive'
              }
            }
          ]
        },
        select: { name: true, email: true },
        take: 10
      })
    ])

    // Combine and deduplicate results
    const players = new Set()
    
    gamePlayers.forEach(p => players.add(p.username))
    registeredUsers.forEach(u => {
      if (u.name) players.add(u.name)
      if (u.email) players.add(u.email.split('@')[0]) // Add username part of email
    })

    return NextResponse.json(Array.from(players).slice(0, 10))
  } catch (error) {
    console.error('Error searching players:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}