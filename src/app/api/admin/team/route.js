import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/team?assemblyId=xxx
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const assemblyId = searchParams.get('assemblyId')
  if (!assemblyId) return NextResponse.json({ error: 'assemblyId required' }, { status: 400 })

  if (!canUpdateContent(session, assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const members = await prisma.teamMember.findMany({
    where: { assemblyId },
    orderBy: [{ department: 'asc' }, { displayOrder: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(members)
}

// POST /api/admin/team — create team member
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { assemblyId, name, role, bio, photo, category, fellowship, department, displayOrder } = body

  if (!assemblyId || !name || !role || !category) {
    return NextResponse.json({ error: 'assemblyId, name, role, category required' }, { status: 400 })
  }

  if (!canUpdateContent(session, assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const member = await prisma.teamMember.create({
    data: {
      assemblyId,
      name,
      role,
      bio: bio || null,
      photo: photo || null,
      category,
      fellowship: fellowship || null,
      department: department || null,
      displayOrder: parseInt(displayOrder) || 0,
    },
  })

  return NextResponse.json(member)
}
