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
    const memberData = {
      firstName: body.firstName,
      lastName: body.lastName,
      middleName: body.middleName || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || null,
      gender: body.gender,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      joinDate: body.joinDate ? new Date(body.joinDate) : member.joinDate,
      baptismDate: body.baptismDate ? new Date(body.baptismDate) : null,
      fellowship: body.fellowship || null,
      department: body.department || null,
      status: body.status || 'ACTIVE',
      growthLevel: body.growthLevel || 'NEW_COMER',
      arkCenterId: body.arkCenterId || null,
      emergencyName: body.emergencyName || null,
      emergencyPhone: body.emergencyPhone || null,
      notes: body.notes || null
    }

    const updatedMember = await prisma.member.update({
      where: { id: params.id },
      data: memberData,
      include: {
        arkCenter: {
          select: { name: true, location: true }
        }
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Member update error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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

    await prisma.member.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Member deletion error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}