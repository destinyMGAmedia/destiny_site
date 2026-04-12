import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/assemblies/[slug]/prayer — submit prayer request (public)
export async function POST(req, { params }) {
  const body = await req.json()
  const { name, email, request } = body

  if (!name || !request) {
    return NextResponse.json({ error: 'Name and prayer request are required.' }, { status: 400 })
  }

  const assembly = await prisma.assembly.findUnique({ where: { slug: (await params).slug } })
  if (!assembly) return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })

  const prayer = await prisma.prayerRequest.create({
    data: { assemblyId: assembly.id, name, email, request },
  })

  return NextResponse.json({ success: true, id: prayer.id }, { status: 201 })
}

// GET /api/assemblies/[slug]/prayer — list prayer requests (admin only)
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assembly = await prisma.assembly.findUnique({ where: { slug: (await params).slug } })
  if (!assembly) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!canManageAssembly(session, assembly.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') // PENDING | PRAYED | ARCHIVED

  const prayers = await prisma.prayerRequest.findMany({
    where: {
      assemblyId: assembly.id,
      ...(status && { status }),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(prayers)
}
