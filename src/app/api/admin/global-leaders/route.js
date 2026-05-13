import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const leaders = await prisma.globalLeader.findMany({
    orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json(leaders)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, title, bio, photo, displayOrder, isActive } = await req.json()

    if (!name?.trim() || !title?.trim()) {
      return NextResponse.json({ error: 'Name and title are required' }, { status: 400 })
    }

    const leader = await prisma.globalLeader.create({
      data: {
        name: name.trim(),
        title: title.trim(),
        bio: bio?.trim() || null,
        photo: photo || null,
        displayOrder: parseInt(displayOrder) || 0,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(leader)
  } catch (err) {
    console.error('[GLOBAL_LEADER_POST]', err)
    return NextResponse.json({ error: 'Failed to create leader' }, { status: 500 })
  }
}
