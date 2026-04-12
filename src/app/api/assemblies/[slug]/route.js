import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/assemblies/[slug] — get full assembly data for the public page
export async function GET(req, { params }) {
  const assembly = await prisma.assembly.findUnique({
    where: { slug: (await params).slug, isActive: true },
    include: {
      sections: { where: { isVisible: true }, orderBy: { position: 'asc' } },
      teamMembers: { orderBy: { displayOrder: 'asc' } },
      events: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take: 10,
      },
      givingDetails: true,
      testimonies: { where: { isApproved: true }, orderBy: { createdAt: 'desc' }, take: 10 },
      mediaItems: { orderBy: { createdAt: 'desc' }, take: 12 },
      audioContent: { orderBy: { publishedAt: 'desc' }, take: 6 },
    },
  })

  if (!assembly) return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })

  return NextResponse.json(assembly)
}

// PUT /api/assemblies/[slug] — update assembly details
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assembly = await prisma.assembly.findUnique({ where: { slug: (await params).slug } })
  if (!assembly) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!canUpdateContent(session, assembly.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()

  // Strip fields that shouldn't be updated via this endpoint
  const { id, slug, isHQ, createdAt, updatedAt, ...updateData } = body

  const updated = await prisma.assembly.update({
    where: { slug: (await params).slug },
    data: updateData,
  })

  return NextResponse.json(updated)
}

// DELETE /api/assemblies/[slug] — soft delete (GLOBAL_ADMIN+ only)
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const assembly = await prisma.assembly.findUnique({ where: { slug: (await params).slug } })
  if (!assembly) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (assembly.isHQ) {
    return NextResponse.json({ error: 'The HQ assembly cannot be deleted.' }, { status: 400 })
  }

  // Soft delete — set isActive = false
  await prisma.assembly.update({
    where: { slug: (await params).slug },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true, message: 'Assembly deactivated.' })
}
