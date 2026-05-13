import { getServerSession } from 'next-auth'
import { authOptions, canManageSiteContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !canManageSiteContent(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!prisma.siteContent?.findMany) {
      return NextResponse.json({ error: 'SiteContent table not yet available — run db:push first' }, { status: 503 })
    }
    const rows = await prisma.siteContent.findMany()
    const map = Object.fromEntries(rows.map(r => [r.key, r.value]))
    return NextResponse.json(map)
  } catch (err) {
    console.error('[SITE_CONTENT_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch site content' }, { status: 500 })
  }
}

export async function PATCH(req) {
  const session = await getServerSession(authOptions)
  if (!session || !canManageSiteContent(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    if (!prisma.siteContent?.upsert) {
      return NextResponse.json({ error: 'SiteContent table not yet available — run db:push first' }, { status: 503 })
    }
    const { updates } = await req.json()
    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'updates object required' }, { status: 400 })
    }

    const ops = Object.entries(updates).map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    )

    await prisma.$transaction(ops)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[SITE_CONTENT_PATCH]', err)
    return NextResponse.json({ error: 'Failed to update site content' }, { status: 500 })
  }
}
