import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PATCH /api/sections/[id] — update visibility, position, title, or custom content
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const section = await prisma.assemblySection.findUnique({
    where: { id: (await params).id },
    include: { assembly: { select: { id: true } } },
  })
  if (!section) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!canUpdateContent(session, section.assembly.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Prevent CONTACT from being moved (position is locked at 9999)
  const body = await req.json()
  if (section.type === 'CONTACT' && body.position !== undefined) {
    delete body.position
  }

  const updated = await prisma.assemblySection.update({
    where: { id: (await params).id },
    data: {
      ...(body.isVisible   !== undefined && { isVisible: body.isVisible }),
      ...(body.position    !== undefined && { position: body.position }),
      ...(body.title       !== undefined && { title: body.title }),
      ...(body.customContent !== undefined && { customContent: body.customContent }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/sections/[id] — only custom sections can be deleted
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const section = await prisma.assemblySection.findUnique({
    where: { id: (await params).id },
    include: { assembly: { select: { id: true } } },
  })
  if (!section) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!canUpdateContent(session, section.assembly.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Standard sections (non-custom) cannot be deleted — only hidden
  if (!section.isCustom) {
    return NextResponse.json(
      { error: 'Standard sections cannot be deleted. Use toggle visibility instead.' },
      { status: 400 }
    )
  }

  await prisma.assemblySection.delete({ where: { id: (await params).id } })
  return NextResponse.json({ success: true })
}
