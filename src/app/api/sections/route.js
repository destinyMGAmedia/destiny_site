import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/sections — create a new custom section
export async function POST(req) {
  const session = await getServerSession(authOptions)
  const body = await req.json()
  const { assemblyId, type, title, position } = body

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assembly = await prisma.assembly.findUnique({ where: { id: assemblyId } })
  if (!assembly) return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })

  if (!canUpdateContent(session, assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // CONTACT section cannot be added — it already exists
  if (type === 'CONTACT') {
    return NextResponse.json({ error: 'CONTACT section already exists' }, { status: 400 })
  }

  const section = await prisma.assemblySection.create({
    data: {
      assemblyId,
      type: type || 'CUSTOM',
      title,
      position: position || 500,
      isVisible: true,
      isCustom: type === 'CUSTOM' || !type,
    },
  })

  return NextResponse.json(section, { status: 201 })
}
