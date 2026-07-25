import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

// PATCH /api/admin/nation/[id] — mark a pledge/contribution row as contacted (writes followUpNotes).
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { followUpNotes } = body

  try {
    const contribution = await prisma.destinyNationContribution.update({
      where: { id },
      data: { followUpNotes: followUpNotes ?? '' },
    })
    return NextResponse.json(contribution)
  } catch (err) {
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }
    throw err
  }
}
