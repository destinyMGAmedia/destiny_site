import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const event = await prisma.event.findUnique({ 
    where: { id },
    include: {
      assembly: {
        select: { id: true, name: true, city: true }
      }
    }
  })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Global/Super admins can update any event, others need permission check
  if (!['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
    if (!canUpdateContent(session, event.assemblyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { title, startDate, endDate, time, venue, description, flyerImage, isGlobal, isChildrensEvent, assemblyId } = await req.json()

  const updateData = {
    ...(title !== undefined && { title }),
    ...(startDate !== undefined && { startDate: new Date(startDate) }),
    ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    ...(time !== undefined && { time: time || null }),
    ...(venue !== undefined && { venue: venue || null }),
    ...(description !== undefined && { description: description || null }),
    ...(flyerImage !== undefined && { flyerImage: flyerImage || null }),
  }

  // Global admins can change isGlobal and assemblyId
  if (['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
    if (isGlobal !== undefined) updateData.isGlobal = Boolean(isGlobal)
    if (assemblyId !== undefined) updateData.assemblyId = isGlobal ? null : assemblyId
  }
  
  if (isChildrensEvent !== undefined) updateData.isChildrensEvent = Boolean(isChildrensEvent)

  const updated = await prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      assembly: {
        select: { id: true, name: true, city: true }
      }
    }
  })

  return NextResponse.json(updated)
}

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canUpdateContent(session, event.assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, startDate, endDate, time, venue, description, flyerImage } = await req.json()

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(startDate !== undefined && { startDate: new Date(startDate) }),
      ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      ...(time !== undefined && { time: time || null }),
      ...(venue !== undefined && { venue: venue || null }),
      ...(description !== undefined && { description: description || null }),
      ...(flyerImage !== undefined && { flyerImage: flyerImage || null }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  
  // Global/Super admins can delete any event, others need permission check
  if (!['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(session.user.role)) {
    if (!canUpdateContent(session, event.assemblyId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
