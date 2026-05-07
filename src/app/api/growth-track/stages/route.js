import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const LEVEL_ORDER = [
  'NEW_COMER',
  'FOUNDATIONAL_CLASS',
  'DESTINY_CULTURE',
  'MINISTRY_CLASS',
  'LEADERSHIP_CLASS',
  'PASTORAL_CLASS',
  'ADVANCED_LEADERSHIP_2',
  'ADVANCED_LEADERSHIP_3',
]

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const memberId = searchParams.get('memberId')

  if (!memberId) {
    return NextResponse.json({ error: 'memberId required' }, { status: 400 })
  }

  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { growthLevel: true }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const stages = await prisma.growthStage.findMany({
      include: {
        contents: { orderBy: { order: 'asc' }, select: { id: true, title: true, type: true, order: true, url: true, body: true } },
        questions: { select: { id: true } },
        progress: {
          where: { memberId },
          take: 1,
        }
      }
    })

    // Sort stages by the canonical level order (GrowthStage only covers training levels, not NEW_COMER)
    const trainingOrder = LEVEL_ORDER.slice(1) // remove NEW_COMER
    stages.sort((a, b) => trainingOrder.indexOf(a.level) - trainingOrder.indexOf(b.level))

    const memberLevelIndex = LEVEL_ORDER.indexOf(member.growthLevel)

    const result = stages.map(stage => {
      const stageLevelIndex = LEVEL_ORDER.indexOf(stage.level)
      const memberProgress = stage.progress[0] || null
      const completedContents = Array.isArray(memberProgress?.completedContents)
        ? memberProgress.completedContents
        : []

      const isLocked = stageLevelIndex > memberLevelIndex
      const isActive = stageLevelIndex === memberLevelIndex
      const isCompleted = memberProgress?.status === 'COMPLETED'
      const isPendingStart = isActive && (!memberProgress || completedContents.length === 0)

      return {
        id: stage.id,
        level: stage.level,
        title: stage.title,
        description: stage.description,
        contents: stage.contents,
        questionsCount: stage.questions.length,
        memberProgress: memberProgress ? {
          id: memberProgress.id,
          status: memberProgress.status,
          testScore: memberProgress.testScore,
          badgeEarned: memberProgress.badgeEarned,
          completedAt: memberProgress.completedAt,
          completedContents,
        } : null,
        isLocked,
        isActive,
        isCompleted,
        isPendingStart,
      }
    })

    return NextResponse.json({ stages: result, memberGrowthLevel: member.growthLevel })
  } catch (error) {
    console.error('Growth track stages error:', error)
    return NextResponse.json({ error: 'Failed to fetch stages' }, { status: 500 })
  }
}
