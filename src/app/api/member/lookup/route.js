import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const body = await req.json()
  // Accept { phone, email } or legacy { identifier }
  const { identifier, phone, email } = body

  const phoneVal = phone || (identifier && !identifier.includes('@') ? identifier : null)
  const emailVal = email || (identifier && identifier.includes('@') ? identifier : null)

  if (!phoneVal && !emailVal) {
    return NextResponse.json({ error: 'Phone or email required' }, { status: 400 })
  }

  const orConditions = [
    phoneVal ? { phone: phoneVal } : null,
    emailVal ? { email: emailVal } : null,
  ].filter(Boolean)

  try {
    // Check if member exists
    const member = await prisma.member.findFirst({
      where: { OR: orConditions },
      include: {
        assembly: true,
        progress: {
          include: {
            stage: {
              include: {
                contents: { orderBy: { order: 'asc' } },
                questions: true
              }
            }
          }
        }
      }
    })

    if (member) {
      // Get current stage info
      const currentStage = await prisma.growthStage.findUnique({
        where: { level: member.growthLevel },
        include: {
          contents: { orderBy: { order: 'asc' } },
          questions: true
        }
      })

      // Check progress in current stage
      const currentProgress = member.progress.find(p => p.stage.level === member.growthLevel)
      
      // Determine next action
      let nextAction = null
      if (!currentProgress) {
        nextAction = {
          type: 'ENROLL',
          description: `Enroll in ${currentStage?.title || 'training'}`,
          url: `/growth-track/${member.growthLevel.toLowerCase()}`
        }
      } else if (currentProgress.status === 'ENROLLED') {
        const completedLessons = Array.isArray(currentProgress.completedContents) ? currentProgress.completedContents.length : 0
        const totalLessons = currentStage?.contents.length || 0
        const LEVEL_SLUG = {
          FOUNDATIONAL_CLASS: 'foundational_class',
          DESTINY_CULTURE: 'destiny_culture',
          MINISTRY_CLASS: 'ministry_class',
          LEADERSHIP_CLASS: 'leadership_class',
          PASTORAL_CLASS: 'pastoral_class',
          ADVANCED_LEADERSHIP_2: 'advanced_leadership_2',
          ADVANCED_LEADERSHIP_3: 'advanced_leadership_3',
        }
        const stageSlug = LEVEL_SLUG[member.growthLevel] || member.growthLevel.toLowerCase()

        if (completedLessons < totalLessons) {
          nextAction = {
            type: 'LESSON',
            description: `Continue ${currentStage.title}`,
            url: `/growth-track/${stageSlug}`
          }
        } else if (!currentProgress.testScore) {
          nextAction = {
            type: 'TEST',
            description: `Take ${currentStage.title} assessment`,
            url: `/growth-track/${stageSlug}/assessment`
          }
        }
      } else if (currentProgress.status === 'COMPLETED') {
        // Check if there's a next level
        const growthLevels = [
          'NEW_COMER',
          'FOUNDATIONAL_CLASS',
          'DESTINY_CULTURE',
          'MINISTRY_CLASS',
          'LEADERSHIP_CLASS',
          'PASTORAL_CLASS',
          'ADVANCED_LEADERSHIP_2',
          'ADVANCED_LEADERSHIP_3'
        ]
        const currentIndex = growthLevels.indexOf(member.growthLevel)
        if (currentIndex < growthLevels.length - 1) {
          const nextLevel = growthLevels[currentIndex + 1]
          const nextStage = await prisma.growthStage.findUnique({
            where: { level: nextLevel }
          })
          nextAction = {
            type: 'NEXT_LEVEL',
            description: `Ready for ${nextStage?.title || 'next level'}`,
            url: `/growth-track/${nextLevel.toLowerCase()}`
          }
        } else {
          nextAction = {
            type: 'COMPLETE',
            description: 'All growth track stages completed!',
            url: '/growth-track/completed'
          }
        }
      }

      return NextResponse.json({
        exists: true,
        type: 'MEMBER',
        data: {
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          currentLevel: member.growthLevel,
          assembly: member.assembly.name,
          nextAction,
          progress: {
            currentStage: currentStage?.title,
            completedLessons: Array.isArray(currentProgress?.completedContents) ? currentProgress.completedContents.length : 0,
            totalLessons: currentStage?.contents.length || 0,
            testScore: currentProgress?.testScore || null,
            status: currentProgress?.status || 'NOT_ENROLLED'
          }
        }
      })
    }

    // Check if first timer exists
    const firstTimer = await prisma.firstTimer.findFirst({
      where: { OR: orConditions },
      include: {
        assembly: true
      }
    })

    if (firstTimer) {
      return NextResponse.json({
        exists: true,
        type: 'FIRST_TIMER',
        data: {
          id: firstTimer.id,
          name: `${firstTimer.firstName} ${firstTimer.lastName}`,
          registeredAt: firstTimer.registeredAt,
          convertedToMember: firstTimer.convertedToMember,
          assembly: firstTimer.assembly?.name || 'Not specified',
          nextAction: {
            type: 'REGISTER_MEMBER',
            description: 'Complete member registration to access growth track',
            url: '/member/register'
          }
        }
      })
    }

    // Not found
    return NextResponse.json({
      exists: false,
      message: 'No record found with this phone number or email'
    })

  } catch (error) {
    console.error('Member lookup error:', error)
    return NextResponse.json({ error: 'Failed to lookup member' }, { status: 500 })
  }
}