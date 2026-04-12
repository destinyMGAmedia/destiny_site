import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/admins — list all admin users (GLOBAL_ADMIN+)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admins = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, isActive: true,
      createdAt: true, lastLogin: true,
      assembly: { select: { name: true, slug: true } },
    },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
  })

  return NextResponse.json(admins)
}

// POST /api/admins — create new admin account (GLOBAL_ADMIN+)
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, email, password, role, assemblySlug } = body

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'name, email, password, role are required' }, { status: 400 })
  }

  // Only SUPER_ADMIN can create other SUPER_ADMIN or GLOBAL_ADMIN accounts
  if (
    ['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(role) &&
    session.user.role !== 'SUPER_ADMIN'
  ) {
    return NextResponse.json(
      { error: 'Only a SUPER_ADMIN can create GLOBAL_ADMIN or SUPER_ADMIN accounts.' },
      { status: 403 }
    )
  }

  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (exists) {
    return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
  }

  // Resolve assembly if role is ASSEMBLY_ADMIN or APP_ADMIN
  let assemblyId = null
  if (['ASSEMBLY_ADMIN', 'APP_ADMIN'].includes(role)) {
    if (!assemblySlug) {
      return NextResponse.json({ error: 'assemblySlug is required for this role.' }, { status: 400 })
    }
    const assembly = await prisma.assembly.findUnique({ where: { slug: assemblySlug } })
    if (!assembly) {
      return NextResponse.json({ error: `Assembly "${assemblySlug}" not found.` }, { status: 404 })
    }
    assemblyId = assembly.id
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashed,
      role,
      assemblyId,
      isActive: true,
    },
    select: {
      id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
      assembly: { select: { name: true, slug: true } },
    },
  })

  return NextResponse.json(user, { status: 201 })
}
