import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { ClipboardList, Plus, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

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

function formatWeek(weekStart, weekEnd) {
  const s = new Date(weekStart)
  const e = new Date(weekEnd)
  const opts = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', opts)}`
}

export default async function AssemblyReportsPage({ params }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const assembly = await prisma.assembly.findUnique({ where: { slug } })
  if (!assembly) notFound()
  if (!canManageAssembly(session, assembly.id)) redirect('/admin/dashboard?error=unauthorized')

  const { mon, sun } = getCurrentWeekBounds()

  const reports = await prisma.weeklyReport.findMany({
    where: { assemblyId: assembly.id },
    orderBy: { weekStart: 'desc' },
    take: 52,
  })

  const currentWeekReport = reports.find(r => {
    const ws = new Date(r.weekStart)
    return ws.getFullYear() === mon.getFullYear() &&
      ws.getMonth() === mon.getMonth() &&
      ws.getDate() === mon.getDate()
  })

  const StatusBadge = ({ status }) => {
    if (status === 'SUBMITTED') return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle2 size={11} /> Submitted
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <Clock size={11} /> Draft
      </span>
    )
  }

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Weekly Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">{assembly.name}</p>
      </div>

      {/* Current week status banner */}
      <div className={`rounded-2xl p-5 border-l-4 flex items-start justify-between gap-4 ${
        currentWeekReport?.status === 'SUBMITTED'
          ? 'bg-green-50 border-green-500'
          : currentWeekReport?.status === 'DRAFT'
          ? 'bg-amber-50 border-amber-400'
          : 'bg-red-50 border-red-400'
      }`}>
        <div className="flex items-start gap-3">
          {currentWeekReport?.status === 'SUBMITTED' ? (
            <CheckCircle2 size={22} className="text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={22} className={`mt-0.5 flex-shrink-0 ${currentWeekReport ? 'text-amber-500' : 'text-red-500'}`} />
          )}
          <div>
            <p className="font-semibold text-gray-900 text-sm">
              {currentWeekReport?.status === 'SUBMITTED'
                ? 'This week\'s report has been submitted'
                : currentWeekReport?.status === 'DRAFT'
                ? 'This week\'s report is saved as a draft'
                : 'This week\'s report has not been submitted'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Week of {formatWeek(mon, sun)}
            </p>
          </div>
        </div>
        {currentWeekReport?.status === 'SUBMITTED' ? (
          <Link href={`/admin/assemblies/${slug}/reports/${currentWeekReport.id}`} className="btn-outline btn-sm flex-shrink-0">
            View
          </Link>
        ) : currentWeekReport?.status === 'DRAFT' ? (
          <Link href={`/admin/assemblies/${slug}/reports/${currentWeekReport.id}`} className="btn-primary btn-sm flex-shrink-0">
            Continue Draft
          </Link>
        ) : (
          <Link href={`/admin/assemblies/${slug}/reports/new`} className="btn-primary btn-sm flex-shrink-0 flex items-center gap-1.5">
            <Plus size={14} /> Submit Report
          </Link>
        )}
      </div>

      {/* Past reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Reports</h2>
          {!currentWeekReport && (
            <Link href={`/admin/assemblies/${slug}/reports/new`} className="btn-primary btn-sm flex items-center gap-1.5">
              <Plus size={14} /> New Report
            </Link>
          )}
        </div>

        {reports.length === 0 ? (
          <div className="card p-12 text-center">
            <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No reports submitted yet</p>
            <p className="text-xs text-gray-400 mt-1">Start by submitting this week's report</p>
            <Link href={`/admin/assemblies/${slug}/reports/new`} className="btn-primary btn-sm inline-flex items-center gap-1.5 mt-4">
              <Plus size={14} /> Submit This Week
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Week</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Submitted</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatWeek(r.weekStart, r.weekEnd)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/assemblies/${slug}/reports/${r.id}`}
                        className="text-xs font-semibold text-purple-700 hover:text-purple-900"
                      >
                        {r.status === 'DRAFT' ? 'Edit' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
