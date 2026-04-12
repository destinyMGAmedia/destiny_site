import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/assemblies — list all assemblies (public-safe, no private fields)
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const activeOnly = searchParams.get('active') !== 'false'

  const assemblies = await prisma.assembly.findMany({
    where: activeOnly ? { isActive: true } : {},
    select: {
      id: true, slug: true, name: true, city: true, country: true,
      timezone: true, heroImage: true, tagline: true, isHQ: true,
      serviceTimes: true, phone: true, email: true,
    },
    orderBy: [{ isHQ: 'desc' }, { name: 'asc' }],
  })

  return NextResponse.json(assemblies)
}

// POST /api/assemblies — create new assembly (GLOBAL_ADMIN+)
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, slug, city, country, timezone } = body

  if (!name || !slug || !city || !country) {
    return NextResponse.json({ error: 'name, slug, city, country are required' }, { status: 400 })
  }

  // Enforce slug format: lowercase, hyphens only
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')

  const exists = await prisma.assembly.findUnique({ where: { slug: cleanSlug } })
  if (exists) {
    return NextResponse.json({ error: `Slug "${cleanSlug}" is already taken` }, { status: 409 })
  }

  const assembly = await prisma.assembly.create({
    data: {
      name,
      slug: cleanSlug,
      city,
      country,
      timezone: timezone || 'NIGERIA',
    },
  })

  // Auto-create default page sections for the new assembly
  const DEFAULT_SECTIONS = [
    { type: 'HERO',        title: 'Hero Banner',     position: 10   },
    { type: 'FIND_US',     title: 'Find Us',          position: 20   },
    { type: 'FELLOWSHIPS', title: 'Fellowships',      position: 30   },
    { type: 'DEPARTMENTS', title: 'Departments',      position: 40   },
    { type: 'EVENTS',      title: "What's On",        position: 50   },
    { type: 'MEDIA',       title: 'Media',            position: 60   },
    { type: 'GIVING',      title: 'Giving',           position: 70   },
    { type: 'PRAYER',      title: 'Prayer Requests',  position: 80   },
    { type: 'TESTIMONIES', title: 'Testimonies',      position: 90   },
    { type: 'CONTACT',     title: 'Contact',          position: 9999 },
  ]

  await prisma.assemblySection.createMany({
    data: DEFAULT_SECTIONS.map((s) => ({ ...s, assemblyId: assembly.id })),
  })

  return NextResponse.json(assembly, { status: 201 })
}
