'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, AlertCircle, Clock, TrendingUp, Users, BarChart2, Search } from 'lucide-react'

function fmt(n) {
  return Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0 })
}

function formatWeek(weekStart, weekEnd) {
  const s = new Date(weekStart)
  const e = new Date(weekEnd)
  const opts = { day: 'numeric', month: 'short' }
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`
}

function toMondayStr(date) {
  const d = new Date(date)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

export default function GlobalReportsDashboard({
  allAssemblies, submissionStatus, submitted, drafts, notSubmitted,
  weekTotalIncome, weekTotalAttendance, recentReports, selectedMonday,
}) {
  const router = useRouter()
  const [weekInput, setWeekInput] = useState(toMondayStr(selectedMonday))
  const [search, setSearch] = useState('')

  function applyWeek(val) {
    setWeekInput(val)
    router.push(`/admin/reports?week=${val}`)
  }

  const filteredRecent = recentReports.filter(r =>
    !search || r.assemblyName.toLowerCase().includes(search.toLowerCase())
  )

  const StatusCard = ({ item }) => {
    const isSubmitted = item.reportStatus === 'SUBMITTED'
    const isDraft = item.reportStatus === 'DRAFT'

    return (
      <div className={`rounded-xl border p-4 flex items-start gap-3 ${
        isSubmitted ? 'bg-green-50 border-green-200' :
        isDraft ? 'bg-amber-50 border-amber-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        {isSubmitted ? <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" /> :
         isDraft ? <Clock size={18} className="text-amber-500 flex-shrink-0 mt-0.5" /> :
         <AlertCircle size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
          <p className="text-xs text-gray-500">{item.city}</p>
          <span className={`inline-block mt-1.5 text-xs font-semibold ${
            isSubmitted ? 'text-green-700' : isDraft ? 'text-amber-600' : 'text-gray-400'
          }`}>
            {isSubmitted ? '✅ Submitted' : isDraft ? '⚠️ Draft' : '❌ Not submitted'}
          </span>
        </div>
        {item.reportId && (
          <Link
            href={`/admin/reports/${item.reportId}`}
            className="text-xs text-purple-700 font-semibold hover:underline flex-shrink-0"
          >
            View
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Weekly Reports
        </h1>
        <p className="text-sm text-gray-500 mt-1">All assemblies · submission tracking</p>
      </div>

      {/* Week selector */}
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div>
          <label className="form-label">Select Week (Monday)</label>
          <input
            type="date"
            className="form-input"
            value={weekInput}
            onChange={e => applyWeek(e.target.value)}
          />
        </div>
        <p className="text-sm text-gray-500">
          Showing: <strong>{formatWeek(selectedMonday, new Date(new Date(selectedMonday).setDate(new Date(selectedMonday).getDate() + 6)))}</strong>
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Submitted', value: submitted, icon: CheckCircle2, color: 'text-green-700', bg: 'bg-green-100' },
          { label: 'Drafts', value: drafts, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
          { label: 'Not Submitted', value: notSubmitted, icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-100' },
          { label: 'Total Assemblies', value: allAssemblies.length, icon: BarChart2, color: 'text-purple-700', bg: 'bg-purple-100' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <TrendingUp size={18} className="text-green-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Week Total Income</p>
            <p className="text-2xl font-bold text-green-700">₦{fmt(weekTotalIncome)}</p>
          </div>
        </div>
        <div className="card p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <Users size={18} className="text-purple-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Week Sunday Attendance</p>
            <p className="text-2xl font-bold text-purple-700">{fmt(weekTotalAttendance)}</p>
          </div>
        </div>
      </div>

      {/* Submission status grid */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Submission Status — All Assemblies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {submissionStatus.map(s => <StatusCard key={s.id} item={s} />)}
        </div>
      </section>

      {/* All reports table */}
      <section>
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">All Reports</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="form-input pl-8 py-1.5 text-sm w-48"
              placeholder="Search assembly…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Assembly</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Week</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Income</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Sunday Att.</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRecent.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No reports found</td></tr>
              ) : filteredRecent.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{r.assemblyName}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{formatWeek(r.weekStart, r.weekEnd)}</td>
                  <td className="px-4 py-3">
                    {r.status === 'SUBMITTED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <CheckCircle2 size={10} /> Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        <Clock size={10} /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-green-700 font-semibold hidden sm:table-cell">₦{fmt(r.totalIncome)}</td>
                  <td className="px-4 py-3 text-right text-gray-700 hidden lg:table-cell">{r.sundayAttendance}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/reports/${r.id}`} className="text-xs font-semibold text-purple-700 hover:text-purple-900">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
