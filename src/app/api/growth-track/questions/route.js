import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const stageId = searchParams.get('stageId')

  if (!stageId) {
    return NextResponse.json({ error: 'stageId required' }, { status: 400 })
  }

  try {
    const questions = await prisma.growthQuestion.findMany({
      where: { stageId },
      select: { id: true, question: true, type: true, options: true }
      // correctAnswer excluded — never sent to client
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
  }
}
