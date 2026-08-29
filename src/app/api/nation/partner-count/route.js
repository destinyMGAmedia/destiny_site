import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const FOUNDING_PARTNER_CAP = 100

// GET /api/nation/partner-count — public "first 100 Founding Gatekeepers" live counter (§0, §4).
export async function GET() {
  const count = await prisma.destinyNationContribution.count({
    where: { status: { in: ['SUCCESS', 'PLEDGED'] } },
  })

  return NextResponse.json({ count, remaining: Math.max(0, FOUNDING_PARTNER_CAP - count) })
}
