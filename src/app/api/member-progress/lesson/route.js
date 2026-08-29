import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const body = await req.json()
  const { memberId, stageId, contentId, action } = body

  if (!memberId || !stageId) {
    return NextResponse.json({ error: 'memberId and stageId required' }, { status: 400 })
  }

  try {
    // Verify member and stage exist
    const [member, stage] = await Promise.all([
      prisma.member.findUnique({ where: { id: memberId }, select: { id: true, growthLevel: true } }),
      prisma.growthStage.findUnique({ where: { id: stageId }, select: { id: true, level: true } }),
    ])

    if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    if (!stage) return NextResponse.json({ error: 'Stage not found' }, { status: 404 })

    // Find or create MemberProgress
    let progress = await prisma.memberProgress.findUnique({
      where: { memberId_stageId: { memberId, stageId } }
    })

    if (!progress) {
      progress = await prisma.memberProgress.create({
        data: { memberId, stageId, status: 'ENROLLED', completedContents: [] }
      })
    }

    // If just enrolling, return current progress
    if (action === 'enroll' || !contentId) {
      return NextResponse.json(progress)
    }

    // Add contentId to completedContents (no duplicates)
    const existing = Array.isArray(progress.completedContents) ? progress.completedContents : []
    if (existing.includes(contentId)) {
      return NextResponse.json(progress) // already marked
    }

    const updated = await prisma.memberProgress.update({
      where: { memberId_stageId: { memberId, stageId } },
      data: { completedContents: [...existing, contentId] }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Lesson progress error:', error)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
