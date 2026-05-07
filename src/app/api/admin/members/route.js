import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const {
    assemblyId, firstName, lastName, middleName, gender, dateOfBirth,
    email, phone, address, city, state, country,
    fellowship, department, arkCenterId, growthLevel,
    baptismDate, emergencyName, emergencyPhone, notes, firstTimerId
  } = body

  if (!firstName || !lastName || !gender || !assemblyId) {
    return NextResponse.json({ error: 'firstName, lastName, gender, and assemblyId are required' }, { status: 400 })
  }

  // Verify admin can manage this assembly
  if (!isGlobalAdmin(session) && !canManageAssembly(session, assemblyId)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  try {
    const member = await prisma.member.create({
      data: {
        assemblyId,
        firstName,
        lastName,
        middleName: middleName || null,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        state: state || null,
        country: country || null,
        fellowship: fellowship || null,
        department: (department === 'NONE' || !department) ? null : department,
        arkCenterId: arkCenterId || null,
        growthLevel: growthLevel || 'NEW_COMER',
        baptismDate: baptismDate ? new Date(baptismDate) : null,
        emergencyName: emergencyName || null,
        emergencyPhone: emergencyPhone || null,
        notes: notes || null,
      }
    })

    // Link and mark first-timer as converted if provided
    if (firstTimerId) {
      await prisma.firstTimer.update({
        where: { id: firstTimerId },
        data: { convertedToMember: true, memberId: member.id }
      }).catch(() => {}) // non-fatal if firstTimer not found
    }

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}
