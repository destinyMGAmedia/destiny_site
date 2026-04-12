import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST — submit a testimony (public)
export async function POST(req, { params }) {
  const body = await req.json()
  const { name, title, content, image } = body

  if (!name || !title || !content) {
    return NextResponse.json({ error: 'Name, title, and testimony are required.' }, { status: 400 })
  }

  const assembly = await prisma.assembly.findUnique({ where: { slug: (await params).slug } })
  if (!assembly) return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })

  const testimony = await prisma.testimony.create({
    data: { assemblyId: assembly.id, name, title, content, image: image || null },
  })

  return NextResponse.json({ success: true, id: testimony.id }, { status: 201 })
}

// GET — list testimonies
// Public: only approved ones
// Admin: all, with optional isApproved filter
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(req.url)

  const assembly = await prisma.assembly.findUnique({ where: { slug: (await params).slug } })
  if (!assembly) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isAdmin = session && canManageAssembly(session, assembly.id)

  const testimonies = await prisma.testimony.findMany({
    where: {
      assemblyId: assembly.id,
      ...(!isAdmin && { isApproved: true }),
    },
    orderBy: { createdAt: 'desc' },
    take: parseInt(searchParams.get('limit') || '20'),
  })

  return NextResponse.json(testimonies)
}
