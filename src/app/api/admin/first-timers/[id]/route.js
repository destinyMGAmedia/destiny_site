import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Only global admins can delete records' }, { status: 403 })
  }

  const { id } = await params

  try {
    await prisma.firstTimer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete first timer:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    // Get the first timer to check assembly
    const firstTimer = await prisma.firstTimer.findUnique({
      where: { id }
    })

    if (!firstTimer) {
      return NextResponse.json({ error: 'First timer not found' }, { status: 404 })
    }

    // Check permissions
    if (!canManageAssembly(session, firstTimer.assemblyId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update first timer
    const updated = await prisma.firstTimer.update({
      where: { id },
      data: body
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update first timer:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}