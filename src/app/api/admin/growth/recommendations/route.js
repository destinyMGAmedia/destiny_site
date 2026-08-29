import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session || !isGlobalAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'PENDING'

  const recs = await prisma.promotionRecommendation.findMany({
    where: status === 'ALL' ? {} : { status },
    include: {
      member: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          growthLevel: true,
          assembly: { select: { id: true, name: true, slug: true } }
        }
      },
      assembly: { select: { id: true, name: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ recommendations: recs })
}
