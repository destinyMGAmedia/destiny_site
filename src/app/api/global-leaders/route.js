import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Public endpoint — returns active leaders ordered by displayOrder
export async function GET() {
  try {
    const leaders = await prisma.globalLeader.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(leaders)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
