import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin, canManageAssembly } from '@/lib/auth'
import prisma from '@/lib/prisma'

const GROWTH_ORDER = [
  'NEW_COMER',
  'FOUNDATIONAL_CLASS',
  'DESTINY_CULTURE',
  'MINISTRY_CLASS',
  'LEADERSHIP_CLASS',
  'PASTORAL_CLASS',
  'ADVANCED_LEADERSHIP_2',
  'ADVANCED_LEADERSHIP_3',
]

// Assembly admin can directly promote up to MINISTRY_CLASS.
// LEADERSHIP_CLASS and above require a recommendation (global admin approval).
const DIRECT_PROMOTE_MAX = 'MINISTRY_CLASS'
const DIRECT_PROMOTE_MAX_IDX = GROWTH_ORDER.indexOf(DIRECT_PROMOTE_MAX)

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  const assembly = await prisma.assembly.findUnique({ where: { slug } })
  if (!assembly) return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })

  if (!isGlobalAdmin(session) && !canManageAssembly(session, assembly.id)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const members = await prisma.member.findMany({
    where: { assemblyId: assembly.id },
    include: {
      progress: {
        include: { stage: true },
        orderBy: { enrolledAt: 'desc' }
      },
      promotionRecs: {
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }]
  })

  return NextResponse.json({ assembly, members })
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json()
  const { action, memberId, toLevel, notes } = body
  // action: 'PROMOTE' | 'RECOMMEND'

  const assembly = await prisma.assembly.findUnique({ where: { slug } })
  if (!assembly) return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })

  if (!isGlobalAdmin(session) && !canManageAssembly(session, assembly.id)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const member = await prisma.member.findFirst({
    where: { id: memberId, assemblyId: assembly.id }
  })
  if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })

  const fromLevel = member.growthLevel
  const fromIdx = GROWTH_ORDER.indexOf(fromLevel)
  const toIdx = GROWTH_ORDER.indexOf(toLevel)

  if (toIdx !== fromIdx + 1) {
    return NextResponse.json({ error: 'Can only promote one level at a time' }, { status: 400 })
  }

  if (action === 'PROMOTE') {
    // Direct promotion only allowed up to MINISTRY_CLASS (or global admin can do any)
    if (!isGlobalAdmin(session) && toIdx > DIRECT_PROMOTE_MAX_IDX) {
      return NextResponse.json({
        error: `Assembly admins can only directly promote up to ${DIRECT_PROMOTE_MAX}. Use RECOMMEND for higher levels.`
      }, { status: 403 })
    }

    // Update member growth level
    await prisma.member.update({
      where: { id: memberId },
      data: { growthLevel: toLevel }
    })

    // Auto-enroll in the new stage if a GrowthStage exists for it
    const stage = await prisma.growthStage.findUnique({ where: { level: toLevel } })
    if (stage) {
      await prisma.memberProgress.upsert({
        where: { memberId_stageId: { memberId, stageId: stage.id } },
        create: {
          memberId,
          stageId: stage.id,
          status: 'ENROLLED',
          enrolledAt: new Date(),
        },
        update: {} // already exists, leave as is
      })
    }

    return NextResponse.json({ success: true, action: 'PROMOTED', toLevel })
  }

  if (action === 'RECOMMEND') {
    if (isGlobalAdmin(session)) {
      return NextResponse.json({ error: 'Global admins can directly promote, no need to recommend' }, { status: 400 })
    }
    if (toIdx <= DIRECT_PROMOTE_MAX_IDX) {
      return NextResponse.json({ error: 'Use PROMOTE for levels up to MINISTRY_CLASS' }, { status: 400 })
    }

    // Check for existing pending recommendation
    const existing = await prisma.promotionRecommendation.findFirst({
      where: { memberId, status: 'PENDING' }
    })
    if (existing) {
      return NextResponse.json({ error: 'A pending recommendation already exists for this member' }, { status: 409 })
    }

    const rec = await prisma.promotionRecommendation.create({
      data: {
        memberId,
        assemblyId: assembly.id,
        fromLevel,
        toLevel,
        status: 'PENDING',
        notes: notes || null,
        recommendedById: session.user.id || null,
      }
    })

    return NextResponse.json({ success: true, action: 'RECOMMENDED', recommendation: rec })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
