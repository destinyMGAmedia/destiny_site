import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const assembly = await prisma.assembly.findFirst({
      where: { slug: params.slug }
    })

    if (!assembly) {
      return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })
    }

    if (!canManageAssembly(session, assembly.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const member = await prisma.member.findFirst({
      where: { 
        id: params.id,
        assemblyId: assembly.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    const body = await request.json()
    
    // Update member's growth level
    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: { 
        growthLevel: body.growthLevel,
        updatedAt: new Date()
      },
      include: {
        arkCenter: {
          select: { name: true, location: true }
        }
      }
    })

    // Create a progress record
    await prisma.memberProgress.create({
      data: {
        memberId: params.id,
        stageId: body.stageId || null, // Optional - depends on if we track which stage they completed
        completedAt: new Date(),
        score: body.score || null
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Member promotion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}