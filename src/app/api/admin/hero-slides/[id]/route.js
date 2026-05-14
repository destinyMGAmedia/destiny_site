import { getServerSession } from 'next-auth'
import { authOptions, canManageSiteContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !canManageSiteContent(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { imageUrl, caption, ctaText, ctaLink, displayOrder, isActive } = await req.json()

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        ...(imageUrl !== undefined && { imageUrl: imageUrl.trim() }),
        ...(caption !== undefined && { caption: caption?.trim() || null }),
        ...(ctaText !== undefined && { ctaText: ctaText?.trim() || null }),
        ...(ctaLink !== undefined && { ctaLink: ctaLink?.trim() || null }),
        ...(displayOrder !== undefined && { displayOrder: parseInt(displayOrder) || 0 }),
        ...(isActive !== undefined && { isActive: !!isActive }),
      },
    })

    return NextResponse.json(slide)
  } catch (err) {
    console.error('[HERO_SLIDES_PATCH]', err)
    return NextResponse.json({ error: 'Failed to update hero slide' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session || !canManageSiteContent(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.heroSlide.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[HERO_SLIDES_DELETE]', err)
    return NextResponse.json({ error: 'Failed to delete hero slide' }, { status: 500 })
  }
}
