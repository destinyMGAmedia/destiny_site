import { getServerSession } from 'next-auth'
import { authOptions, canUpdateContent } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT /api/admin/giving/[assemblyId] — upsert giving details
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { assemblyId } = await params
  if (!canUpdateContent(session, assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { bankName, accountName, accountNumber, instructions } = body

  const giving = await prisma.givingDetails.upsert({
    where: { assemblyId },
    update: { bankName, accountName, accountNumber, instructions },
    create: { assemblyId, bankName, accountName, accountNumber, instructions },
  })

  return NextResponse.json(giving)
}
