import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const body = await req.json()
  const { memberId, stageId, answers } = body

  if (!memberId || !stageId || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'memberId, stageId, and answers required' }, { status: 400 })
  }

  try {
    const [member, stage, progress] = await Promise.all([
      prisma.member.findUnique({ where: { id: memberId }, select: { id: true } }),
      prisma.growthStage.findUnique({
        where: { id: stageId },
        include: { questions: true, contents: { select: { id: true } } }
      }),
      prisma.memberProgress.findUnique({ where: { memberId_stageId: { memberId, stageId } } })
    ])

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    if (!stage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 })

    // Guard: cannot retake a completed assessment
    if (progress?.status === 'COMPLETED') {
      return NextResponse.json({
        error: 'Assessment already completed',
        passed: true,
        score: progress.testScore,
        status: 'COMPLETED'
      }, { status: 409 })
    }

    // Grade MULTIPLE_CHOICE questions
    const mcQuestions = stage.questions.filter(q => q.type === 'MULTIPLE_CHOICE')
    const textQuestions = stage.questions.filter(q => q.type === 'TEXT_SUMMARY')

    let correct = 0
    for (const q of mcQuestions) {
      const submitted = answers.find(a => a.questionId === q.id)
      if (submitted && submitted.answer === q.correctAnswer) correct++
    }

    const total = mcQuestions.length
    const score = total > 0 ? Math.round((correct / total) * 100) : 100
    const passed = total === 0 || score >= 70

    // Store TEXT_SUMMARY answers for admin review
    const textAnswers = textQuestions.reduce((acc, q) => {
      const submitted = answers.find(a => a.questionId === q.id)
      if (submitted) acc[q.id] = submitted.answer
      return acc
    }, {})

    const updateData = {
      testScore: score,
      assessmentAnswers: Object.keys(textAnswers).length > 0 ? textAnswers : undefined,
    }

    if (passed) {
      updateData.status = 'COMPLETED'
      updateData.badgeEarned = true
      updateData.completedAt = new Date()
    }

    const updated = await prisma.memberProgress.upsert({
      where: { memberId_stageId: { memberId, stageId } },
      create: {
        memberId,
        stageId,
        ...updateData,
        completedContents: progress?.completedContents ?? [],
      },
      update: updateData,
    })

    return NextResponse.json({ passed, score, total, status: updated.status })
  } catch (error) {
    console.error('Assessment submission error:', error)
    return NextResponse.json({ error: 'Failed to submit assessment' }, { status: 500 })
  }
}
