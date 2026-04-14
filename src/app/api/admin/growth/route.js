import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const stages = await prisma.growthStage.findMany({
    include: {
      contents: { orderBy: { order: 'asc' } },
      questions: true
    },
    orderBy: { level: 'asc' }
  })
  return NextResponse.json(stages)
}

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { action, ...data } = body

  try {
    if (action === 'ADD_CONTENT') {
      const content = await prisma.growthContent.create({
        data: {
          stageId: data.stageId,
          title: data.title,
          type: data.type,
          url: data.url,
          body: data.body,
          order: data.order || 0
        }
      })
      return NextResponse.json(content)
    }

    if (action === 'ADD_QUESTION') {
      const question = await prisma.growthQuestion.create({
        data: {
          stageId: data.stageId,
          question: data.question,
          type: data.type,
          options: data.options,
          correctAnswer: data.correctAnswer
        }
      })
      return NextResponse.json(question)
    }

    if (action === 'DELETE_CONTENT') {
      await prisma.growthContent.delete({ where: { id: data.id } })
      return NextResponse.json({ success: true })
    }

    if (action === 'DELETE_QUESTION') {
      await prisma.growthQuestion.delete({ where: { id: data.id } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Growth Track API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
