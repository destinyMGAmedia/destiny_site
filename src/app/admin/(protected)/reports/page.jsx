import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import GlobalReportsDashboard from '@/components/admin/GlobalReportsDashboard'

export const dynamic = 'force-dynamic'

function getCurrentWeekMonday() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setDate(now.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  return mon
}

function incomeFromReport(report) {
  let total = 0
  const ti = report.thursdayIncome || {}
  const si = report.sundayIncome || {}
  const types = ['tithe', 'offering', 'specialSeed', 'welfare', 'partnership', 'otherIncome']
  for (const k of types) { total += Number(ti?.main?.[k] || 0); total += Number(si?.[k] || 0) }
  for (const ark of (ti?.arkCenters || [])) total += Number(ark.offering || 0)
  return total
}

function sundayAttFromReport(report) {
  const sa = report.sundayAttendance || {}
  const cats = ['adults', 'youth', 'children', 'firstTimers', 'newConverts', 'workers']
  return cats.reduce((s, c) => s + Number(sa[c]?.male || 0) + Number(sa[c]?.female || 0), 0)
}

export default async function GlobalReportsPage({ searchParams }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  if (!isGlobalAdmin(session)) redirect('/admin/dashboard?error=unauthorized')

  const sp = await searchParams
  const weekStartParam = sp?.week

  const currentMon = getCurrentWeekMonday()
  const selectedMonday = weekStartParam ? new Date(weekStartParam) : currentMon
  selectedMonday.setHours(0, 0, 0, 0)
  const selectedSunday = new Date(selectedMonday)
  selectedSunday.setDate(selectedMonday.getDate() + 6)
  selectedSunday.setHours(23, 59, 59, 999)

  const [allAssemblies, weekReports, recentReports] = await Promise.all([
    prisma.assembly.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true, city: true },
      orderBy: { name: 'asc' },
    }),
    prisma.weeklyReport.findMany({
      where: { weekStart: { gte: selectedMonday, lte: selectedSunday } },
      include: { assembly: { select: { id: true, name: true, slug: true, city: true } } },
    }),
    prisma.weeklyReport.findMany({
      orderBy: { weekStart: 'desc' },
      take: 100,
      include: { assembly: { select: { id: true, name: true, slug: true } } },
    }),
  ])

  // Build submission status for selected week
  const submissionStatus = allAssemblies.map(a => {
    const r = weekReports.find(w => w.assemblyId === a.id)
    return { ...a, reportStatus: r?.status || 'NOT_SUBMITTED', reportId: r?.id || null }
  })

  const submitted = submissionStatus.filter(s => s.reportStatus === 'SUBMITTED').length
  const drafts = submissionStatus.filter(s => s.reportStatus === 'DRAFT').length
  const notSubmitted = submissionStatus.filter(s => s.reportStatus === 'NOT_SUBMITTED').length

  const weekTotalIncome = weekReports.filter(r => r.status === 'SUBMITTED').reduce((s, r) => s + incomeFromReport(r), 0)
  const weekTotalAttendance = weekReports.filter(r => r.status === 'SUBMITTED').reduce((s, r) => s + sundayAttFromReport(r), 0)

  const recentWithStats = recentReports.map(r => ({
    id: r.id,
    assemblyId: r.assemblyId,
    assemblyName: r.assembly.name,
    assemblySlug: r.assembly.slug,
    weekStart: r.weekStart,
    weekEnd: r.weekEnd,
    status: r.status,
    submittedAt: r.submittedAt,
    totalIncome: incomeFromReport(r),
    sundayAttendance: sundayAttFromReport(r),
  }))

  return (
    <GlobalReportsDashboard
      allAssemblies={allAssemblies}
      submissionStatus={submissionStatus}
      submitted={submitted}
      drafts={drafts}
      notSubmitted={notSubmitted}
      weekTotalIncome={weekTotalIncome}
      weekTotalAttendance={weekTotalAttendance}
      recentReports={recentWithStats}
      selectedMonday={selectedMonday.toISOString()}
    />
  )
}
