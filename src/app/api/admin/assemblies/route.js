import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const DEFAULT_SECTIONS = [
  { type: 'HERO',        title: 'Hero Banner',    position: 10   },
  { type: 'FIND_US',     title: 'Find Us',         position: 20   },
  { type: 'FELLOWSHIPS', title: 'Fellowships',     position: 30   },
  { type: 'DEPARTMENTS', title: 'Departments',     position: 40   },
  { type: 'EVENTS',      title: "What's On",       position: 50   },
  { type: 'MEDIA',       title: 'Media',           position: 60   },
  { type: 'GIVING',      title: 'Giving',          position: 70   },
  { type: 'PRAYER',      title: 'Prayer Requests', position: 80   },
  { type: 'TESTIMONIES', title: 'Testimonies',     position: 90   },
  { type: 'CONTACT',     title: 'Contact',         position: 9999 },
]

function generatePassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  const specials = '!@#$'
  let pass = ''
  for (let i = 0; i < 8; i++) pass += chars[Math.floor(Math.random() * chars.length)]
  pass += specials[Math.floor(Math.random() * specials.length)]
  pass += Math.floor(Math.random() * 90 + 10)
  return pass
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    name, slug, city, country, address, phone, email, whatsapp, tagline,
    assemblyAdminName, assemblyAdminEmail,
    appAdminName, appAdminEmail,
  } = body

  // Validate required fields
  if (!name || !slug || !city || !country || !assemblyAdminName || !assemblyAdminEmail) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check slug not taken
  const existing = await prisma.assembly.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already exists — choose a different one' }, { status: 400 })
  }

  // Check emails not taken
  const emailsToCheck = [assemblyAdminEmail]
  if (appAdminEmail) emailsToCheck.push(appAdminEmail)
  for (const em of emailsToCheck) {
    const taken = await prisma.user.findUnique({ where: { email: em.toLowerCase().trim() } })
    if (taken) return NextResponse.json({ error: `Email already in use: ${em}` }, { status: 400 })
  }

  // Generate passwords
  const assemblyAdminPassword = generatePassword()
  const appAdminPassword = appAdminEmail ? generatePassword() : null

  // Create everything in a transaction
  const assembly = await prisma.$transaction(async (tx) => {
    // 1. Assembly
    const a = await tx.assembly.create({
      data: {
        slug: slug.toLowerCase().trim(),
        name, city, country, address, phone, email, whatsapp, tagline,
        isActive: true,
        isHQ: false,
      },
    })

    // 2. Default sections
    await tx.assemblySection.createMany({
      data: DEFAULT_SECTIONS.map((s) => ({ ...s, assemblyId: a.id })),
    })

    // 3. Assembly Admin
    const aHash = await bcrypt.hash(assemblyAdminPassword, 12)
    await tx.user.create({
      data: {
        name: assemblyAdminName,
        email: assemblyAdminEmail.toLowerCase().trim(),
        password: aHash,
        role: 'ASSEMBLY_ADMIN',
        assemblyId: a.id,
        isActive: true,
      },
    })

    // 4. App Admin (optional)
    if (appAdminEmail && appAdminName) {
      const bHash = await bcrypt.hash(appAdminPassword, 12)
      await tx.user.create({
        data: {
          name: appAdminName,
          email: appAdminEmail.toLowerCase().trim(),
          password: bHash,
          role: 'APP_ADMIN',
          assemblyId: a.id,
          isActive: true,
        },
      })
    }

    return a
  })

  return NextResponse.json({
    assembly,
    credentials: {
      assemblyAdmin: { name: assemblyAdminName, email: assemblyAdminEmail, password: assemblyAdminPassword },
      appAdmin: appAdminEmail ? { name: appAdminName, email: appAdminEmail, password: appAdminPassword } : null,
    },
  })
}
