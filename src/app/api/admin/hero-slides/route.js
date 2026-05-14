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
    const slides = await prisma.heroSlide.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(slides)
  } catch (err) {
    console.error('[HERO_SLIDES_GET]', err)
    return NextResponse.json({ error: 'Failed to fetch hero slides' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !canManageSiteContent(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageUrl, caption, ctaText, ctaLink, displayOrder, isActive } = await req.json()

    if (!imageUrl?.trim()) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    const slide = await prisma.heroSlide.create({
      data: {
        imageUrl: imageUrl.trim(),
        caption: caption?.trim() || null,
        ctaText: ctaText?.trim() || null,
        ctaLink: ctaLink?.trim() || null,
        displayOrder: parseInt(displayOrder) || 0,
        isActive: isActive !== false,
      },
    })

    return NextResponse.json(slide)
  } catch (err) {
    console.error('[HERO_SLIDES_POST]', err)
    return NextResponse.json({ error: 'Failed to create hero slide' }, { status: 500 })
  }
}
