import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST — submit attendance (public, from QR code scan)
export async function POST(req, { params }) {
  const body = await req.json()
  const { fullName, phone, email, serviceDate, serviceType } = body

  if (!fullName || !serviceType) {
    return NextResponse.json({ error: 'Full name and service type are required.' }, { status: 400 })
  }

  const assembly = await prisma.assembly.findUnique({ where: { slug: (await params).slug } })
  if (!assembly) return NextResponse.json({ error: 'Assembly not found' }, { status: 404 })

  const record = await prisma.attendanceRecord.create({
    data: {
      assemblyId: assembly.id,
      fullName,
      phone: phone || null,
      email: email || null,
      serviceDate: serviceDate ? new Date(serviceDate) : new Date(),
      serviceType,
    },
  })

  return NextResponse.json({ success: true, id: record.id }, { status: 201 })
}

// GET — attendance records (admin only)
export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assembly = await prisma.assembly.findUnique({ where: { slug: (await params).slug } })
  if (!assembly) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!canManageAssembly(session, assembly.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from')
  const to   = searchParams.get('to')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')

  const [records, total] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: {
        assemblyId: assembly.id,
        ...(from && to && {
          serviceDate: { gte: new Date(from), lte: new Date(to) },
        }),
      },
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendanceRecord.count({
      where: {
        assemblyId: assembly.id,
        ...(from && to && {
          serviceDate: { gte: new Date(from), lte: new Date(to) },
        }),
      },
    }),
  ])

  return NextResponse.json({ data: records, total, page, totalPages: Math.ceil(total / limit) })
}
