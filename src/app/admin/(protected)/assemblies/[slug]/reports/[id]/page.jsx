import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import WeeklyReportForm from '@/components/admin/WeeklyReportForm'
import { CheckCircle2, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

function formatWeek(weekStart, weekEnd) {
  const s = new Date(weekStart)
  const e = new Date(weekEnd)
  const opts = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`
}

export default async function WeeklyReportDetailPage({ params }) {
  const { slug, id } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const assembly = await prisma.assembly.findUnique({ where: { slug } })
  if (!assembly) notFound()
  if (!canManageAssembly(session, assembly.id)) redirect('/admin/dashboard?error=unauthorized')

  const report = await prisma.weeklyReport.findFirst({
    where: { id, assemblyId: assembly.id },
  })
  if (!report) notFound()

  const arkCenters = await prisma.arkCenter.findMany({
    where: { assemblyId: assembly.id, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  const isSubmitted = report.status === 'SUBMITTED'

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            {isSubmitted ? 'Weekly Report' : 'Edit Draft Report'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {assembly.name} · {formatWeek(report.weekStart, report.weekEnd)}
          </p>
        </div>
        {isSubmitted ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex-shrink-0">
            <CheckCircle2 size={13} /> Submitted {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex-shrink-0">
            <Clock size={13} /> Draft
          </span>
        )}
      </div>

      <WeeklyReportForm
        slug={slug}
        assemblyName={assembly.name}
        existingReport={report}
        arkCenters={arkCenters}
        arkServiceData={[]}
      />
    </div>
  )
}
