import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET — list all ark centers for an assembly
export async function GET(req) {
  const session = await getServerSession(authOptions)
  
  const { searchParams } = new URL(req.url)
  const assemblyId = searchParams.get('assemblyId')
  const slug = searchParams.get('slug')

  // Allow public access if slug is provided (for registration form), otherwise require session
  if (!session && !slug) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!assemblyId && !slug) return NextResponse.json({ error: 'Assembly ID or slug required' }, { status: 400 })
  
  const where = assemblyId ? { assemblyId } : { assembly: { slug } }
  
  if (assemblyId && !canManageAssembly(session, assemblyId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const centers = await prisma.arkCenter.findMany({
    where,
    include: {
      leader: {
        select: { id: true, firstName: true, lastName: true }
      },
      _count: {
        select: { serviceData: true, members: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(centers)
}

// POST — create a new ark center
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, location, meetingDay, meetingTime, leaderId, assemblyId } = body

  if (!name || !assemblyId) {
    return NextResponse.json({ error: 'Name and Assembly ID are required' }, { status: 400 })
  }

  if (!canManageAssembly(session, assemblyId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const center = await prisma.arkCenter.create({
    data: {
      name,
      location,
      meetingDay: meetingDay || 'Thursday',
      meetingTime,
      leaderId: leaderId || null,
      assemblyId,
    },
    include: {
      leader: {
        select: { id: true, firstName: true, lastName: true }
      }
    }
  })

  return NextResponse.json(center, { status: 201 })
}
