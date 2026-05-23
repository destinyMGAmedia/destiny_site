import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import WeeklyReportForm from '@/components/admin/WeeklyReportForm'

export const dynamic = 'force-dynamic'

function getCurrentWeekBounds() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setDate(now.getDate() + diff)
  mon.setHours(0, 0, 0, 0)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  sun.setHours(23, 59, 59, 999)
  return { mon, sun }
}

export default async function NewWeeklyReportPage({ params }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const assembly = await prisma.assembly.findUnique({ where: { slug } })
  if (!assembly) notFound()
  if (!canManageAssembly(session, assembly.id)) redirect('/admin/dashboard?error=unauthorized')

  const { mon, sun } = getCurrentWeekBounds()

  // Check if current week already has a report
  const existing = await prisma.weeklyReport.findUnique({
    where: { assemblyId_weekStart: { assemblyId: assembly.id, weekStart: mon } },
  })
  if (existing) redirect(`/admin/assemblies/${slug}/reports/${existing.id}`)

  const [arkCenters, arkServiceData] = await Promise.all([
    prisma.arkCenter.findMany({
      where: { assemblyId: assembly.id, isActive: true },
      select: { id: true, name: true, meetingDay: true },
      orderBy: { name: 'asc' },
    }),
    prisma.serviceData.findMany({
      where: {
        assemblyId: assembly.id,
        arkCenterId: { not: null },
        serviceDate: { gte: mon, lte: sun },
      },
      select: { arkCenterId: true, attendance: true, offering: true },
    }),
  ])

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          New Weekly Report
        </h1>
        <p className="text-sm text-gray-500 mt-1">{assembly.name}</p>
      </div>
      <WeeklyReportForm
        slug={slug}
        assemblyName={assembly.name}
        arkCenters={arkCenters}
        arkServiceData={arkServiceData}
      />
    </div>
  )
}
