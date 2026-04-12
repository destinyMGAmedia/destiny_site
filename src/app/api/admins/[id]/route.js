import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin, isSuperAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// PATCH /api/admins/[id] — update name, password, role, isActive (GLOBAL_ADMIN+)
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const target = await prisma.user.findUnique({ where: { id: (await params).id } })
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // GLOBAL_ADMIN cannot modify SUPER_ADMIN accounts
  if (target.role === 'SUPER_ADMIN' && !isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Only a SUPER_ADMIN can modify another SUPER_ADMIN.' }, { status: 403 })
  }

  const body = await req.json()
  const updateData = {}

  if (body.name)     updateData.name     = body.name
  if (body.isActive !== undefined) updateData.isActive = body.isActive

  // Password reset
  if (body.password) {
    updateData.password = await bcrypt.hash(body.password, 12)
  }

  // Role change — only SUPER_ADMIN can elevate to SUPER_ADMIN or GLOBAL_ADMIN
  if (body.role) {
    if (['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(body.role) && !isSuperAdmin(session)) {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can assign GLOBAL_ADMIN or SUPER_ADMIN roles.' },
        { status: 403 }
      )
    }
    updateData.role = body.role
  }

  const updated = await prisma.user.update({
    where: { id: (await params).id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true, isActive: true },
  })

  return NextResponse.json(updated)
}

// DELETE /api/admins/[id] — hard delete (SUPER_ADMIN only)
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || !isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Only SUPER_ADMIN can permanently delete accounts.' }, { status: 403 })
  }

  // Prevent self-deletion
  if ((await params).id === session.user.id) {
    return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 })
  }

  await prisma.user.delete({ where: { id: (await params).id } })
  return NextResponse.json({ success: true })
}
