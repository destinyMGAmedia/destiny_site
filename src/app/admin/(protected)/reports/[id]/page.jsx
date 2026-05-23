import { getServerSession } from 'next-auth'
import { authOptions, isGlobalAdmin } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { CheckCircle2, Clock, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

const INCOME_LABELS = { tithe: 'Tithe', offering: 'Offering', specialSeed: 'Special Seed', welfare: 'Welfare', partnership: 'Partnership', otherIncome: 'Other Income' }
const ATTENDANCE_CATS = ['adults', 'youth', 'children', 'firstTimers', 'newConverts', 'workers']
const CAT_LABELS = { adults: 'Adults', youth: 'Youth', children: 'Children', firstTimers: 'First Timers', newConverts: 'New Converts', workers: 'Workers' }

function fmt(n) { return Number(n || 0).toLocaleString('en-NG') }
function formatWeek(s, e) {
  const opts = { day: 'numeric', month: 'short', year: 'numeric' }
  return `${new Date(s).toLocaleDateString('en-GB', opts)} – ${new Date(e).toLocaleDateString('en-GB', opts)}`
}

function AttRow({ label, data }) {
  const m = Number(data?.male || 0), f = Number(data?.female || 0)
  return (
    <tr className="border-b border-gray-50">
      <td className="py-2 px-3 text-gray-700">{label}</td>
      <td className="py-2 px-3 text-center">{m}</td>
      <td className="py-2 px-3 text-center">{f}</td>
      <td className="py-2 px-3 text-center font-semibold text-purple-700">{m + f}</td>
    </tr>
  )
}

export default async function GlobalReportDetailPage({ params }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!session) redirect('/admin/login')
  if (!isGlobalAdmin(session)) redirect('/admin/dashboard?error=unauthorized')

  const report = await prisma.weeklyReport.findUnique({
    where: { id },
    include: { assembly: { select: { name: true, slug: true, city: true } } },
  })
  if (!report) notFound()

  const ti = report.thursdayIncome || {}
  const si = report.sundayIncome || {}
  const ta = report.thursdayAttendance || {}
  const sa = report.sundayAttendance || {}
  const fu = report.followUp || {}

  const thursdayMainIncome = Object.keys(INCOME_LABELS).reduce((s, k) => s + Number(ti?.main?.[k] || 0), 0)
  const thursdayArkIncome = (ti?.arkCenters || []).reduce((s, r) => s + Number(r.offering || 0), 0)
  const sundayIncome = Object.keys(INCOME_LABELS).reduce((s, k) => s + Number(si?.[k] || 0), 0)
  const totalIncome = thursdayMainIncome + thursdayArkIncome + sundayIncome
  const totalExpenses = (report.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0)
  const netBalance = totalIncome - totalExpenses

  const sundayTotal = ATTENDANCE_CATS.reduce((s, c) => s + Number(sa[c]?.male || 0) + Number(sa[c]?.female || 0), 0)
  const thursdayMainTotal = ATTENDANCE_CATS.reduce((s, c) => s + Number(ta?.main?.[c]?.male || 0) + Number(ta?.main?.[c]?.female || 0), 0)
  const thursdayArkTotal = (ta?.arkCenters || []).reduce((s, r) => s + Number(r.attendance || 0), 0)

  return (
    <div className="space-y-8 fade-in max-w-4xl">
      <div className="flex items-start gap-3">
        <Link href="/admin/reports" className="p-2 hover:bg-gray-100 rounded-lg text-purple-900 flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            {report.assembly.name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{formatWeek(report.weekStart, report.weekEnd)} · {report.assembly.city}</p>
        </div>
        {report.status === 'SUBMITTED' ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex-shrink-0">
            <CheckCircle2 size={12} /> Submitted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 flex-shrink-0">
            <Clock size={12} /> Draft
          </span>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: `₦${fmt(totalIncome)}`, color: 'text-green-700' },
          { label: 'Sunday Attendance', value: sundayTotal, color: 'text-purple-700' },
          { label: 'Net Balance', value: `₦${fmt(Math.abs(netBalance))}${netBalance < 0 ? ' −' : ''}`, color: netBalance >= 0 ? 'text-green-700' : 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance */}
      <section className="card p-6">
        <h2 className="font-bold text-gray-900 mb-4">Attendance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Thursday — Main ({thursdayMainTotal} total)</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200"><th className="text-left py-1.5 px-3 text-xs text-gray-500">Category</th><th className="text-center py-1.5 px-3 text-xs text-gray-500">M</th><th className="text-center py-1.5 px-3 text-xs text-gray-500">F</th><th className="text-center py-1.5 px-3 text-xs text-gray-500">Total</th></tr></thead>
              <tbody>{ATTENDANCE_CATS.map(c => <AttRow key={c} label={CAT_LABELS[c]} data={ta?.main?.[c]} />)}</tbody>
            </table>
            {(ta?.arkCenters || []).length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 mb-1">Ark Centers ({thursdayArkTotal} total)</p>
                {(ta.arkCenters).map(r => (
                  <div key={r.arkCenterId} className="flex justify-between text-sm py-1 border-b border-gray-50">
                    <span className="text-gray-700">{r.name}</span>
                    <span className="font-semibold">{r.attendance}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Sunday — Main ({sundayTotal} total)</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200"><th className="text-left py-1.5 px-3 text-xs text-gray-500">Category</th><th className="text-center py-1.5 px-3 text-xs text-gray-500">M</th><th className="text-center py-1.5 px-3 text-xs text-gray-500">F</th><th className="text-center py-1.5 px-3 text-xs text-gray-500">Total</th></tr></thead>
              <tbody>{ATTENDANCE_CATS.map(c => <AttRow key={c} label={CAT_LABELS[c]} data={sa[c]} />)}</tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Follow-up */}
      <section className="card p-6">
        <h2 className="font-bold text-gray-900 mb-4">Follow-up & Membership</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ['firstTimersContacted', 'First Timers Contacted'],
            ['firstTimersRetained', 'First Timers Retained'],
            ['newConvertsInDiscipleship', 'New Converts in Discipleship'],
            ['baptisms', 'Baptisms Conducted'],
            ['newWorkers', 'New Workers Added'],
            ['membersFollowedUp', 'Members Followed Up'],
            ['visitations', 'Visitations Conducted'],
          ].map(([k, label]) => (
            <div key={k} className="bg-gray-50 rounded-xl p-3">
              <p className="text-2xl font-bold text-purple-700">{fu[k] || 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Admin notes */}
      {(report.majorActivities || report.leadershipMeetings || report.challenges || report.hqSupport) && (
        <section className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4">Administrative Notes</h2>
          <div className="space-y-4">
            {[
              [report.majorActivities, 'Major Activities'],
              [report.leadershipMeetings, 'Leadership Meetings Held'],
              [report.challenges, 'Challenges Encountered'],
              [report.hqSupport, 'HQ Support Needed'],
            ].filter(([v]) => v).map(([v, label]) => (
              <div key={label}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{v}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Finance */}
      <section className="card p-6">
        <h2 className="font-bold text-gray-900 mb-4">Financial Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Thursday Income — Main</h3>
            {Object.keys(INCOME_LABELS).map(k => (
              <div key={k} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                <span className="text-gray-600">{INCOME_LABELS[k]}</span>
                <span className="font-semibold">₦{fmt(ti?.main?.[k] || 0)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 font-bold"><span>Total</span><span className="text-green-700">₦{fmt(thursdayMainIncome)}</span></div>

            {(ti?.arkCenters || []).length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Thursday — Ark Centers</h4>
                {(ti.arkCenters).map(r => (
                  <div key={r.arkCenterId} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                    <span className="text-gray-600">{r.name}</span>
                    <span className="font-semibold">₦{fmt(r.offering)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm pt-2 font-bold"><span>Total</span><span className="text-green-700">₦{fmt(thursdayArkIncome)}</span></div>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Sunday Income</h3>
            {Object.keys(INCOME_LABELS).map(k => (
              <div key={k} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                <span className="text-gray-600">{INCOME_LABELS[k]}</span>
                <span className="font-semibold">₦{fmt(si?.[k] || 0)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm pt-2 font-bold"><span>Total</span><span className="text-green-700">₦{fmt(sundayIncome)}</span></div>
          </div>
        </div>

        {(report.expenses || []).length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Expenses</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-200"><th className="text-left py-1.5 px-3 text-xs text-gray-500">Category</th><th className="text-right py-1.5 px-3 text-xs text-gray-500">Amount</th><th className="text-left py-1.5 px-3 text-xs text-gray-500">Approved By</th></tr></thead>
              <tbody>
                {report.expenses.map((e, i) => (
                  <tr key={i} className="border-b border-gray-50"><td className="py-1.5 px-3 text-gray-700">{e.category}</td><td className="py-1.5 px-3 text-right">₦{fmt(e.amount)}</td><td className="py-1.5 px-3 text-gray-500">{e.approvedBy || '—'}</td></tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t-2 border-gray-200"><td className="py-2 px-3 font-bold">Total</td><td className="py-2 px-3 text-right font-bold text-red-600">₦{fmt(totalExpenses)}</td><td /></tr></tfoot>
            </table>
          </div>
        )}

        <div className="mt-6 pt-4 border-t-2 border-gray-200 grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-gray-500 mb-1">Total Income</p><p className="font-bold text-green-700">₦{fmt(totalIncome)}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">Total Expenses</p><p className="font-bold text-red-600">₦{fmt(totalExpenses)}</p></div>
          <div><p className="text-xs text-gray-500 mb-1">Net Balance</p><p className={`font-bold ${netBalance >= 0 ? 'text-purple-700' : 'text-red-600'}`}>₦{fmt(Math.abs(netBalance))}</p></div>
        </div>

        {(report.amountBanked || report.dateBanked) && (
          <div className="mt-4 p-4 bg-blue-50 rounded-xl text-sm">
            <p className="font-semibold text-gray-900 mb-2">Banking Details</p>
            <div className="flex gap-6">
              {report.amountBanked && <div><p className="text-xs text-gray-500">Amount Banked</p><p className="font-semibold">₦{fmt(report.amountBanked)}</p></div>}
              {report.dateBanked && <div><p className="text-xs text-gray-500">Date Banked</p><p className="font-semibold">{new Date(report.dateBanked).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>}
              <div><p className="text-xs text-gray-500">Proof</p><p className="font-semibold">{report.proofOfPayment ? '✅ Yes' : '❌ No'}</p></div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
