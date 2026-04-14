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
    notes
  } = body

  try {
    const assembly = await prisma.assembly.findUnique({
      where: { slug }
    })

    if (!assembly) {
      return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })
    }

    if (type === 'VISITOR') {
      const visitor = await prisma.visitor.create({
        data: {
          assemblyId: assembly.id,
          firstName,
          lastName,
          email,
          phone,
          notes
        }
      })
      return NextResponse.json({ success: true, visitor }, { status: 201 })
    } else if (type === 'MEMBER') {
      const member = await prisma.member.create({
        data: {
          assemblyId: assembly.id,
          firstName,
          lastName,
          middleName,
          email,
          phone,
          gender,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          address,
          city,
          state,
          country,
          fellowship,
          department: department === 'NONE' ? 'NONE' : department,
          arkCenterId,
          notes,
          growthLevel: 'NEW_COMER' // Default as requested
        }
      })
      return NextResponse.json({ success: true, member }, { status: 201 })
    }

    return NextResponse.json({ error: 'Invalid registration type' }, { status: 400 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 })
  }
}
