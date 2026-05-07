import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req, { params }) {
  const { slug } = await params
  const body = await req.json()
  const { 
    type, // 'VISITOR' or 'MEMBER'
    firstName, 
    lastName, 
    email, 
    phone,
    middleName,
    gender,
    dateOfBirth,
    address,
    city,
    state,
    country,
    fellowship,
    department,
    arkCenterId,
    notes,
    howDidYouHear,
    prayerRequest,
    isConverted,
    wantsFollowUp
  } = body

  try {
    const assembly = await prisma.assembly.findUnique({
      where: { slug }
    })

    if (!assembly) {
      return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })
    }

    // Check for existing records
    if (phone || email) {
      const existingFirstTimer = await prisma.firstTimer.findFirst({
        where: {
          OR: [
            phone ? { phone } : {},
            email ? { email } : {}
          ].filter(obj => Object.keys(obj).length > 0)
        }
      })

      const existingMember = await prisma.member.findFirst({
        where: {
          OR: [
            phone ? { phone } : {},
            email ? { email } : {}
          ].filter(obj => Object.keys(obj).length > 0)
        }
      })

      if (existingMember) {
        return NextResponse.json({ 
          error: 'Already registered as a member',
          exists: true,
          memberData: {
            name: `${existingMember.firstName} ${existingMember.lastName}`,
            growthLevel: existingMember.growthLevel
          }
        }, { status: 409 })
      }

      if (existingFirstTimer && type === 'VISITOR') {
        return NextResponse.json({ 
          error: 'Already registered as a first timer',
          exists: true,
          firstTimerData: {
            name: `${existingFirstTimer.firstName} ${existingFirstTimer.lastName}`,
            registeredAt: existingFirstTimer.registeredAt
          }
        }, { status: 409 })
      }
    }

    if (type === 'VISITOR') {
      // Use FirstTimer table for visitors
      const firstTimer = await prisma.firstTimer.create({
        data: {
          assemblyId: assembly.id,
          firstName,
          lastName,
          middleName,
          email,
          phone,
          address,
          city,
          state,
          country,
          gender: gender || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          howDidYouHear: howDidYouHear || 'Not specified',
          prayerRequest,
          isConverted: isConverted || false,
          wantsFollowUp: wantsFollowUp !== false, // Default true
          notes
        }
      })

      // Also create a simple Visitor record for backward compatibility
      await prisma.visitor.create({
        data: {
          assemblyId: assembly.id,
          firstName,
          lastName,
          email,
          phone,
          notes
        }
      })

      return NextResponse.json({ success: true, firstTimer }, { status: 201 })
    } else if (type === 'MEMBER') {
      // Check if this person was a first timer
      let firstTimerId = null
      if (phone || email) {
        const existingFirstTimer = await prisma.firstTimer.findFirst({
          where: {
            OR: [
              phone ? { phone } : {},
              email ? { email } : {}
            ].filter(obj => Object.keys(obj).length > 0),
            convertedToMember: false
          }
        })

        if (existingFirstTimer) {
          firstTimerId = existingFirstTimer.id
        }
      }

      const member = await prisma.member.create({
        data: {
          assemblyId: assembly.id,
          firstName,
          lastName,
          middleName,
          email,
          phone,
          gender: gender || 'MALE',
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          city,
          state,
          country,
          fellowship,
          department: department === 'NONE' ? null : department,
          arkCenterId: arkCenterId || null,
          notes,
          growthLevel: 'NEW_COMER' // Default as requested
        }
      })

      // Update first timer record if exists
      if (firstTimerId) {
        await prisma.firstTimer.update({
          where: { id: firstTimerId },
          data: { convertedToMember: true, memberId: member.id }
        })
      }

      // Auto-enroll in Foundational Class (first growth stage)
      const foundationalStage = await prisma.growthStage.findFirst({
        where: { level: 'FOUNDATIONAL_CLASS' }
      })
      if (foundationalStage) {
        await prisma.memberProgress.create({
          data: {
            memberId: member.id,
            stageId: foundationalStage.id,
            status: 'ENROLLED',
            enrolledAt: new Date(),
          }
        }).catch(() => {})
      }

      return NextResponse.json({ success: true, member }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid registration type' }, { status: 400 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 })
  }
}
