import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { status, adminNotes } = body
  // status: 'APPROVED' | 'REJECTED'

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json({ error: 'status must be APPROVED or REJECTED' }, { status: 400 })
  }

  const rec = await prisma.promotionRecommendation.findUnique({
    where: { id },
    include: {
      member: true,
    }
  })

  if (!rec) return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 })
  if (rec.status !== 'PENDING') {
    return NextResponse.json({ error: 'Recommendation has already been resolved' }, { status: 409 })
  }

  await prisma.promotionRecommendation.update({
    where: { id },
    data: {
      status,
      adminNotes: adminNotes || null,
      resolvedById: session.user.id || null,
      resolvedAt: new Date(),
    }
  })

  if (status === 'APPROVED') {
    // Promote the member
    await prisma.member.update({
      where: { id: rec.memberId },
      data: { growthLevel: rec.toLevel }
    })

    // Auto-enroll in new stage
    const stage = await prisma.growthStage.findUnique({ where: { level: rec.toLevel } })
    if (stage) {
      await prisma.memberProgress.upsert({
        where: { memberId_stageId: { memberId: rec.memberId, stageId: stage.id } },
        create: {
          memberId: rec.memberId,
          stageId: stage.id,
          status: 'ENROLLED',
          enrolledAt: new Date(),
        },
        update: {}
      })
    }
  }

  return NextResponse.json({ success: true, status })
}
