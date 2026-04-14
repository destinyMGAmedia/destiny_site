import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PATCH — update an ark center
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const center = await prisma.arkCenter.findUnique({ where: { id } })
  if (!center) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!canManageAssembly(session, center.assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { name, location, meetingDay, meetingTime, leaderId, isActive } = body

  const updated = await prisma.arkCenter.update({
    where: { id },
    data: {
      name,
      location,
      meetingDay,
      meetingTime,
      leaderId,
      isActive,
    },
    include: {
      leader: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  })

  return NextResponse.json(updated)
}

// DELETE — delete an ark center
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const center = await prisma.arkCenter.findUnique({ where: { id } })
  if (!center) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!canManageAssembly(session, center.assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.arkCenter.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
