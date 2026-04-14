import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET — list service data for an assembly
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: assemblyId } = await params
  if (!canManageAssembly(session, assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const serviceType = searchParams.get('type')
  const arkCenterId = searchParams.get('arkCenterId')
  const take = parseInt(searchParams.get('take') || '50')

  const serviceData = await prisma.serviceData.findMany({
    where: { 
      assemblyId,
      ...(serviceType ? { serviceType } : {}),
      ...(arkCenterId ? { arkCenterId } : (arkCenterId === 'none' ? { arkCenterId: null } : {}))
    },
    include: {
      arkCenter: {
        select: { name: true }
      }
    },
    orderBy: { serviceDate: 'desc' },
    take
  })

  return NextResponse.json(serviceData)
}

// POST — record service data for an assembly
export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id: assemblyId } = await params
  if (!canManageAssembly(session, assemblyId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { serviceDate, attendance, serviceType, notes, offering, tithe, testimony, arkCenterId } = body

  if (!serviceDate || attendance === undefined || !serviceType) {
    return NextResponse.json({ error: 'Date, attendance count, and service type are required' }, { status: 400 })
  }

  const record = await prisma.serviceData.create({
    data: {
      assemblyId,
      arkCenterId,
      serviceDate: new Date(serviceDate),
      attendance: parseInt(attendance),
      serviceType,
      offering: offering ? parseFloat(offering) : null,
      tithe: tithe ? parseFloat(tithe) : null,
      testimony,
      notes,
    }
  })

  return NextResponse.json(record, { status: 201 })
}
