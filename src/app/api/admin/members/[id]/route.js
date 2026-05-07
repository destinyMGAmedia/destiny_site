import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  try {
    // Get the member to check assembly
    const member = await prisma.member.findUnique({
      where: { id }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Check permissions
    if (!canManageAssembly(session, member.assemblyId)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Update member
    const updated = await prisma.member.update({
      where: { id },
      data: body
    })

    // If growth level changed, enroll in new stage
    if (body.growthLevel && body.growthLevel !== member.growthLevel) {
      const stage = await prisma.growthStage.findUnique({
        where: { level: body.growthLevel }
      })

      if (stage) {
        // Check if already enrolled
        const existingProgress = await prisma.memberProgress.findUnique({
          where: {
            memberId_stageId: {
              memberId: id,
              stageId: stage.id
            }
          }
        })

        if (!existingProgress) {
          await prisma.memberProgress.create({
            data: {
              memberId: id,
              stageId: stage.id,
              status: 'ENROLLED'
            }
          })
        }
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Failed to update member:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}