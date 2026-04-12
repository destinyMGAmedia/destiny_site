import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PATCH /api/admin/team/[id]
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const member = await prisma.teamMember.findUnique({
    where: { id },
    include: { assembly: { select: { id: true } } },
  })
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canUpdateContent(session, member.assembly.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const updated = await prisma.teamMember.update({
    where: { id },
    data: {
      ...(body.name         !== undefined && { name: body.name }),
      ...(body.role         !== undefined && { role: body.role }),
      ...(body.bio          !== undefined && { bio: body.bio }),
      ...(body.photo        !== undefined && { photo: body.photo || null }),
      ...(body.department   !== undefined && { department: body.department || null }),
      ...(body.fellowship   !== undefined && { fellowship: body.fellowship || null }),
      ...(body.displayOrder !== undefined && { displayOrder: parseInt(body.displayOrder) || 0 }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/admin/team/[id]
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const member = await prisma.teamMember.findUnique({
    where: { id },
    include: { assembly: { select: { id: true } } },
  })
  if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canUpdateContent(session, member.assembly.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.teamMember.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
