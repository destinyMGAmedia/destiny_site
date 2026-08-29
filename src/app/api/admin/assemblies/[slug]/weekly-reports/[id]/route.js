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

  const { slug, id } = await params
  const { error, status, assembly } = await resolveAssembly(slug, session)
  if (error) return NextResponse.json({ error }, { status })

  const report = await prisma.weeklyReport.findFirst({
    where: { id, assemblyId: assembly.id },
  })
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })

  const arkCenters = await prisma.arkCenter.findMany({
    where: { assemblyId: assembly.id, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ report, arkCenters })
}

export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug, id } = await params
  const { error, status, assembly } = await resolveAssembly(slug, session)
  if (error) return NextResponse.json({ error }, { status })

  const report = await prisma.weeklyReport.findFirst({
    where: { id, assemblyId: assembly.id },
  })
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  if (report.status === 'SUBMITTED') {
    return NextResponse.json({ error: 'Submitted reports cannot be edited' }, { status: 403 })
  }

  const body = await req.json()
  const {
    branchPastor, administrator,
    thursdayAttendance, sundayAttendance, followUp,
    majorActivities, leadershipMeetings, challenges, hqSupport,
    financeOfficer, thursdayIncome, sundayIncome, expenses,
    amountBanked, dateBanked, proofOfPayment, proofUrl,
    status: reportStatus,
  } = body

  const isSubmitting = reportStatus === 'SUBMITTED'

  const updated = await prisma.weeklyReport.update({
    where: { id },
    data: {
      status: isSubmitting ? 'SUBMITTED' : 'DRAFT',
      branchPastor: branchPastor ?? report.branchPastor,
      administrator: administrator ?? report.administrator,
      thursdayAttendance: thursdayAttendance ?? report.thursdayAttendance,
      sundayAttendance: sundayAttendance ?? report.sundayAttendance,
      followUp: followUp ?? report.followUp,
      majorActivities: majorActivities ?? report.majorActivities,
      leadershipMeetings: leadershipMeetings ?? report.leadershipMeetings,
      challenges: challenges ?? report.challenges,
      hqSupport: hqSupport ?? report.hqSupport,
      financeOfficer: financeOfficer ?? report.financeOfficer,
      thursdayIncome: thursdayIncome ?? report.thursdayIncome,
      sundayIncome: sundayIncome ?? report.sundayIncome,
      expenses: expenses ?? report.expenses,
      amountBanked: amountBanked !== undefined ? (amountBanked ? parseFloat(amountBanked) : null) : report.amountBanked,
      dateBanked: dateBanked !== undefined ? (dateBanked ? new Date(dateBanked) : null) : report.dateBanked,
      proofOfPayment: proofOfPayment !== undefined ? !!proofOfPayment : report.proofOfPayment,
      proofUrl: proofUrl !== undefined ? (proofUrl || null) : report.proofUrl,
      ...(isSubmitting && !report.submittedAt
        ? { submittedAt: new Date(), submittedById: session.user.id }
        : {}),
    },
  })

  return NextResponse.json(updated)
}
