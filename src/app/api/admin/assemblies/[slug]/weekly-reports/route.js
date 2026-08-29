import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

async function resolveAssembly(slug, session) {
  const assembly = await prisma.assembly.findFirst({ where: { slug } })
  if (!assembly) return { error: 'Assembly not found', status: 404 }
  if (!canManageAssembly(session, assembly.id)) return { error: 'Forbidden', status: 403 }
  return { assembly }
}

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const { error, status, assembly } = await resolveAssembly(slug, session)
  if (error) return NextResponse.json({ error }, { status })

  const { searchParams } = new URL(req.url)
  const weekStart = searchParams.get('weekStart')
  const reportStatus = searchParams.get('status')

  const [reports, arkCenters] = await Promise.all([
    prisma.weeklyReport.findMany({
      where: {
        assemblyId: assembly.id,
        ...(weekStart ? { weekStart: new Date(weekStart) } : {}),
        ...(reportStatus ? { status: reportStatus } : {}),
      },
      orderBy: { weekStart: 'desc' },
      take: 52,
    }),
    prisma.arkCenter.findMany({
      where: { assemblyId: assembly.id, isActive: true },
      select: { id: true, name: true, meetingDay: true },
      orderBy: { name: 'asc' },
    }),
  ])

  // For prefill: fetch ark center service data for the requested week
  let arkServiceData = []
  if (weekStart) {
    const wStart = new Date(weekStart)
    const wEnd = new Date(wStart)
    wEnd.setDate(wEnd.getDate() + 6)
    arkServiceData = await prisma.serviceData.findMany({
      where: {
        assemblyId: assembly.id,
        arkCenterId: { not: null },
        serviceDate: { gte: wStart, lte: wEnd },
      },
      select: { arkCenterId: true, attendance: true, offering: true, serviceDate: true },
    })
  }

  return NextResponse.json({ reports, arkCenters, arkServiceData })
}

export async function POST(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const { error, status, assembly } = await resolveAssembly(slug, session)
  if (error) return NextResponse.json({ error }, { status })

  const body = await req.json()
  const {
    weekStart, weekEnd, branchPastor, administrator,
    thursdayAttendance, sundayAttendance, followUp,
    majorActivities, leadershipMeetings, challenges, hqSupport,
    financeOfficer, thursdayIncome, sundayIncome, expenses,
    amountBanked, dateBanked, proofOfPayment, proofUrl,
    status: reportStatus,
  } = body

  if (!weekStart || !weekEnd) {
    return NextResponse.json({ error: 'weekStart and weekEnd are required' }, { status: 400 })
  }

  const existing = await prisma.weeklyReport.findUnique({
    where: { assemblyId_weekStart: { assemblyId: assembly.id, weekStart: new Date(weekStart) } },
  })
  if (existing) {
    return NextResponse.json({ error: 'A report for this week already exists', reportId: existing.id }, { status: 409 })
  }

  const isSubmitting = reportStatus === 'SUBMITTED'

  const report = await prisma.weeklyReport.create({
    data: {
      assemblyId: assembly.id,
      weekStart: new Date(weekStart),
      weekEnd: new Date(weekEnd),
      status: isSubmitting ? 'SUBMITTED' : 'DRAFT',
      branchPastor: branchPastor || null,
      administrator: administrator || null,
      thursdayAttendance: thursdayAttendance || {},
      sundayAttendance: sundayAttendance || {},
      followUp: followUp || {},
      majorActivities: majorActivities || null,
      leadershipMeetings: leadershipMeetings || null,
      challenges: challenges || null,
      hqSupport: hqSupport || null,
      financeOfficer: financeOfficer || null,
      thursdayIncome: thursdayIncome || {},
      sundayIncome: sundayIncome || {},
      expenses: expenses || [],
      amountBanked: amountBanked ? parseFloat(amountBanked) : null,
      dateBanked: dateBanked ? new Date(dateBanked) : null,
      proofOfPayment: !!proofOfPayment,
      proofUrl: proofUrl || null,
      ...(isSubmitting ? { submittedAt: new Date(), submittedById: session.user.id } : {}),
    },
  })

  return NextResponse.json(report, { status: 201 })
}
