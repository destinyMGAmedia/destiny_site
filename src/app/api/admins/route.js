import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendCredentialEmail } from '@/lib/email'

// GET /api/admins — list all admin users (GLOBAL_ADMIN+)
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admins = await prisma.user.findMany({
    select: {
      id: true, name: true, username: true, email: true, role: true, isActive: true,
      createdAt: true, lastLogin: true, rawPassword: true,
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
  const { name, username, email, password, role, assemblySlug } = body

  if (!name || !username || !password || !role) {
    return NextResponse.json({ error: 'name, username, password, role are required' }, { status: 400 })
  }

  // Username must be alphanumeric
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return NextResponse.json({ error: 'Username must contain only letters and numbers.' }, { status: 400 })
  }

  // Only SUPER_ADMIN can create GLOBAL_ADMIN accounts
  if (
    ['SUPER_ADMIN', 'GLOBAL_ADMIN'].includes(role) &&
    session.user.role !== 'SUPER_ADMIN'
  ) {
    return NextResponse.json(
      { error: 'Only a SUPER_ADMIN can create GLOBAL_ADMIN or SUPER_ADMIN accounts.' },
      { status: 403 }
    )
  }

  // Check username uniqueness
  const usernameExists = await prisma.user.findUnique({ where: { username } })
  if (usernameExists) {
    return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 })
  }

  // Check email uniqueness (only if provided)
  if (email) {
    const emailExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (emailExists) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }
  }

  // Resolve assembly
  let assemblyId = null
  let assemblyName = null
  if (['ASSEMBLY_ADMIN', 'APP_ADMIN'].includes(role)) {
    if (!assemblySlug) {
      return NextResponse.json({ error: 'assemblySlug is required for this role.' }, { status: 400 })
    }
    const assembly = await prisma.assembly.findUnique({ where: { slug: assemblySlug } })
    if (!assembly) {
      return NextResponse.json({ error: `Assembly "${assemblySlug}" not found.` }, { status: 404 })
    }
    assemblyId = assembly.id
    assemblyName = assembly.name
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      name,
      username,
      email: email ? email.toLowerCase() : null,
      password: hashed,
      rawPassword: password,
      role,
      assemblyId,
      isActive: true,
      mustChangePassword: true,
    },
    select: {
      id: true, name: true, username: true, email: true, role: true, isActive: true, createdAt: true,
      assembly: { select: { name: true, slug: true } },
    },
  })

  // Send credential email if email provided
  await sendCredentialEmail({
    to: email || null,
    name,
    username,
    password,
    role,
    assemblyName,
    isRegenerated: false,
  })

  return NextResponse.json(user, { status: 201 })
}
