import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/assembly/[slug]
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const assembly = await prisma.assembly.findUnique({
    where: { slug },
    include: { givingDetails: true },
  })
  if (!assembly) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canUpdateContent(session, assembly.id) && !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(assembly)
}

// PATCH /api/admin/assembly/[slug]
export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const assembly = await prisma.assembly.findUnique({ where: { slug } })
  if (!assembly) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!canUpdateContent(session, assembly.id) && !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const allowedFields = [
    'name', 'tagline', 'welcomeText', 'aboutText',
    'address', 'mapLink', 'parkingNotes', 'serviceTimes',
    'phone', 'email', 'whatsapp', 'heroImage',
  ]

  const data = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) data[field] = body[field]
  }

  const updated = await prisma.assembly.update({ where: { slug }, data })
  return NextResponse.json(updated)
}
