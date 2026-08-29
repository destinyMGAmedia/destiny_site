import { getServerSession } from 'next-auth'
import { authOptions, canManageAssembly } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import ServiceDataManager from '@/components/admin/attendance/ServiceDataManager'
import { TrendingUp, TrendingDown, DollarSign, ClipboardList, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

function fmt(n) {
  return Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })
}

function incomeFromReport(report) {
  let total = 0
  const ti = report.thursdayIncome || {}
  const si = report.sundayIncome || {}
  const incomeTypes = ['tithe', 'offering', 'specialSeed', 'welfare', 'partnership', 'otherIncome']
  for (const k of incomeTypes) {
    total += Number(ti?.main?.[k] || 0)
    total += Number(si?.[k] || 0)
  }
  for (const ark of (ti?.arkCenters || [])) total += Number(ark.offering || 0)
  return total
}

function expensesFromReport(report) {
  return (report.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0)
}

function formatWeek(weekStart, weekEnd) {
  const s = new Date(weekStart)
  const e = new Date(weekEnd)
  const opts = { day: 'numeric', month: 'short' }
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`
}

export default async function AssemblyFinancePage({ params }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')

  const assembly = await prisma.assembly.findUnique({ where: { slug } })
  if (!assembly) notFound()
  if (!canManageAssembly(session, assembly.id)) redirect('/admin/dashboard?error=unauthorized')

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const weeklyReports = await prisma.weeklyReport.findMany({
    where: { assemblyId: assembly.id, status: 'SUBMITTED', weekStart: { gte: monthStart } },
    orderBy: { weekStart: 'desc' },
  })

  const totalIncome = weeklyReports.reduce((s, r) => s + incomeFromReport(r), 0)
  const totalExpenses = weeklyReports.reduce((s, r) => s + expensesFromReport(r), 0)
  const netBalance = totalIncome - totalExpenses

  const monthName = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-10 fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Finance
        </h1>
        <p className="text-sm text-gray-500 mt-1">{assembly.name} · {monthName}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-green-700" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-700">₦{fmt(totalIncome)}</p>
            <p className="text-xs text-gray-400 mt-0.5">from {weeklyReports.length} submitted report{weeklyReports.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="card p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <TrendingDown size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600">₦{fmt(totalExpenses)}</p>
          </div>
        </div>
        <div className={`card p-5 flex items-start gap-4 ${netBalance >= 0 ? 'bg-purple-50 border border-purple-100' : 'bg-red-50 border border-red-100'}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${netBalance >= 0 ? 'bg-purple-100' : 'bg-red-100'}`}>
            <DollarSign size={18} className={netBalance >= 0 ? 'text-purple-700' : 'text-red-600'} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Net Balance</p>
            <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
              ₦{fmt(Math.abs(netBalance))}{netBalance < 0 ? ' deficit' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly breakdown */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Weekly Breakdown — {monthName}</h2>
          <Link href={`/admin/assemblies/${slug}/reports`} className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1">
            All Reports <ArrowRight size={12} />
          </Link>
        </div>

        {weeklyReports.length === 0 ? (
          <div className="card p-8 text-center">
            <ClipboardList size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 text-sm">No submitted reports for {monthName} yet.</p>
            <Link href={`/admin/assemblies/${slug}/reports/new`} className="btn-primary btn-sm inline-flex mt-3">
              Submit This Week's Report
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Week</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Income</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Expenses</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Net</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {weeklyReports.map(r => {
                  const inc = incomeFromReport(r)
                  const exp = expensesFromReport(r)
                  const net = inc - exp
                  return (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{formatWeek(r.weekStart, r.weekEnd)}</td>
                      <td className="px-4 py-3 text-right text-green-700 font-semibold hidden sm:table-cell">₦{fmt(inc)}</td>
                      <td className="px-4 py-3 text-right text-red-600 hidden sm:table-cell">₦{fmt(exp)}</td>
                      <td className={`px-4 py-3 text-right font-bold ${net >= 0 ? 'text-purple-700' : 'text-red-600'}`}>
                        ₦{fmt(Math.abs(net))}{net < 0 ? ' −' : ''}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/admin/assemblies/${slug}/reports/${r.id}`} className="text-xs font-semibold text-purple-700 hover:text-purple-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Raw service records */}
      <section>
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Individual Service Records</h2>
          <p className="text-xs text-gray-400 mt-1">Raw per-service attendance and offering entries including Ark Centers</p>
        </div>
        <ServiceDataManager assemblyId={assembly.id} />
      </section>
    </div>
  )
}
