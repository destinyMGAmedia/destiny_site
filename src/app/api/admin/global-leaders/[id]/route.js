import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, title, bio, photo, displayOrder, isActive } = await req.json()

    const leader = await prisma.globalLeader.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(photo !== undefined && { photo: photo || null }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) || 0 }),
        ...(isActive !== undefined && { isActive: !!isActive }),
      },
    })

    return NextResponse.json(leader)
  } catch (err) {
    console.error('[GLOBAL_LEADER_PATCH]', err)
    return NextResponse.json({ error: 'Failed to update leader' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.globalLeader.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[GLOBAL_LEADER_DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete leader' }, { status: 500 })
  }
}
