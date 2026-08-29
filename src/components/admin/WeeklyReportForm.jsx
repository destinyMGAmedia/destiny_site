'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, Loader2, Plus, Trash2 } from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────────────

function parseDateStr(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function getWeekBounds(dateStr) {
  // dateStr = 'YYYY-MM-DD' for Monday of the week
  const [y, m, d] = dateStr.split('-').map(Number)
  const mon = new Date(y, m - 1, d)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return { weekStart: mon.toISOString(), weekEnd: sun.toISOString() }
}

function currentWeekMonday() {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const mon = new Date(now)
  mon.setDate(now.getDate() + diff)
  const y = mon.getFullYear()
  const m = String(mon.getMonth() + 1).padStart(2, '0')
  const dd = String(mon.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function sundayOf(mondayStr) {
  const [y, m, d] = mondayStr.split('-').map(Number)
  const sun = new Date(y, m - 1, d + 6)
  const sy = sun.getFullYear()
  const sm = String(sun.getMonth() + 1).padStart(2, '0')
  const sd = String(sun.getDate()).padStart(2, '0')
  return `${sy}-${sm}-${sd}`
}

function fmt(n) {
  return n ? Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 }) : '0'
}

const ATTENDANCE_CATEGORIES = ['adults', 'youth', 'children', 'firstTimers', 'newConverts', 'workers']
const CATEGORY_LABELS = { adults: 'Adults', youth: 'Youth', children: 'Children', firstTimers: 'First Timers', newConverts: 'New Converts', workers: 'Workers' }
const INCOME_TYPES = ['tithe', 'offering', 'specialSeed', 'welfare', 'partnership', 'otherIncome']
const INCOME_LABELS = { tithe: 'Tithe', offering: 'Offering', specialSeed: 'Special Seed', welfare: 'Welfare', partnership: 'Partnership', otherIncome: 'Other Income' }
const EXPENSE_CATEGORIES = ['Welfare', 'Logistics', 'Media', 'Utilities', 'Evangelism', 'Maintenance', 'Other']

// ── Sub-components ─────────────────────────────────────────────────────────

function AttendanceGrid({ data, onChange, readonly }) {
  const row = (cat) => ({
    male: Number(data?.[cat]?.male || 0),
    female: Number(data?.[cat]?.female || 0),
  })

  const total = (cat) => row(cat).male + row(cat).female
  const grandMale = ATTENDANCE_CATEGORIES.reduce((s, c) => s + row(c).male, 0)
  const grandFemale = ATTENDANCE_CATEGORIES.reduce((s, c) => s + row(c).female, 0)
  const grandTotal = grandMale + grandFemale

  function set(cat, field, val) {
    const v = Math.max(0, parseInt(val) || 0)
    onChange({ ...data, [cat]: { ...(data?.[cat] || {}), [field]: v } })
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[360px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500 w-36">Category</th>
            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-500 w-24">Male</th>
            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-500 w-24">Female</th>
            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-500 w-24">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {ATTENDANCE_CATEGORIES.map(cat => (
            <tr key={cat}>
              <td className="py-2 px-2 font-medium text-gray-700">{CATEGORY_LABELS[cat]}</td>
              <td className="py-1.5 px-2">
                <input
                  type="number" min="0" inputMode="numeric"
                  className="form-input text-center w-full"
                  value={row(cat).male || ''}
                  disabled={readonly}
                  onChange={e => set(cat, 'male', e.target.value)}
                  placeholder="0"
                />
              </td>
              <td className="py-1.5 px-2">
                <input
                  type="number" min="0" inputMode="numeric"
                  className="form-input text-center w-full"
                  value={row(cat).female || ''}
                  disabled={readonly}
                  onChange={e => set(cat, 'female', e.target.value)}
                  placeholder="0"
                />
              </td>
              <td className="py-2 px-2 text-center font-semibold text-purple-700">{total(cat)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td className="py-2 px-2 font-bold text-gray-900 text-xs uppercase tracking-wide">TOTAL</td>
            <td className="py-2 px-2 text-center font-bold text-gray-900">{grandMale}</td>
            <td className="py-2 px-2 text-center font-bold text-gray-900">{grandFemale}</td>
            <td className="py-2 px-2 text-center font-bold text-purple-700 text-base">{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function ArkAttendanceTable({ rows, onChange, readonly }) {
  function set(arkCenterId, val) {
    onChange(rows.map(r => r.arkCenterId === arkCenterId ? { ...r, attendance: Math.max(0, parseInt(val) || 0) } : r))
  }
  const total = rows.reduce((s, r) => s + (Number(r.attendance) || 0), 0)
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[280px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500">Ark Center</th>
            <th className="text-center py-2 px-2 text-xs font-semibold text-gray-500 w-28">Attendance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(r => (
            <tr key={r.arkCenterId}>
              <td className="py-2 px-2 text-gray-700">{r.name}</td>
              <td className="py-1.5 px-2">
                <input
                  type="number" min="0" inputMode="numeric"
                  className="form-input text-center w-full"
                  value={r.attendance || ''}
                  disabled={readonly}
                  onChange={e => set(r.arkCenterId, e.target.value)}
                  placeholder="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td className="py-2 px-2 font-bold text-gray-900 text-xs uppercase">TOTAL</td>
            <td className="py-2 px-2 text-center font-bold text-purple-700">{total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function IncomeTable({ data, onChange, readonly }) {
  const total = INCOME_TYPES.reduce((s, k) => s + (Number(data?.[k]) || 0), 0)
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[280px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500">Income Type</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 w-36">Amount (₦)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {INCOME_TYPES.map(k => (
            <tr key={k}>
              <td className="py-2 px-2 text-gray-700">{INCOME_LABELS[k]}</td>
              <td className="py-1.5 px-2">
                <input
                  type="number" min="0" inputMode="decimal"
                  className="form-input text-right w-full"
                  value={data?.[k] || ''}
                  disabled={readonly}
                  onChange={e => onChange({ ...data, [k]: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td className="py-2 px-2 font-bold text-gray-900 text-xs uppercase">TOTAL</td>
            <td className="py-2 px-2 text-right font-bold text-purple-700">₦{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function ArkIncomeTable({ rows, onChange, readonly }) {
  function set(arkCenterId, val) {
    onChange(rows.map(r => r.arkCenterId === arkCenterId ? { ...r, offering: parseFloat(val) || 0 } : r))
  }
  const total = rows.reduce((s, r) => s + (Number(r.offering) || 0), 0)
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[280px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-2 text-xs font-semibold text-gray-500">Ark Center</th>
            <th className="text-right py-2 px-2 text-xs font-semibold text-gray-500 w-36">Offering (₦)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {rows.map(r => (
            <tr key={r.arkCenterId}>
              <td className="py-2 px-2 text-gray-700">{r.name}</td>
              <td className="py-1.5 px-2">
                <input
                  type="number" min="0" inputMode="decimal"
                  className="form-input text-right w-full"
                  value={r.offering || ''}
                  disabled={readonly}
                  onChange={e => set(r.arkCenterId, e.target.value)}
                  placeholder="0"
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-200 bg-gray-50">
            <td className="py-2 px-2 font-bold text-gray-900 text-xs uppercase">TOTAL</td>
            <td className="py-2 px-2 text-right font-bold text-purple-700">₦{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ── Main Form ──────────────────────────────────────────────────────────────

export default function WeeklyReportForm({ slug, assemblyName, existingReport, arkCenters, arkServiceData }) {
  const router = useRouter()
  const readonly = existingReport?.status === 'SUBMITTED'
  const isEdit = !!existingReport

  const [tab, setTab] = useState('admin')
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // ── Build initial ark center rows from existing report or prefill from ServiceData
  function buildArkAttendanceRows(existing) {
    if (existing && Array.isArray(existing)) return existing
    return arkCenters.map(c => {
      const sd = (arkServiceData || []).filter(s => s.arkCenterId === c.id)
      const att = sd.reduce((sum, s) => sum + (s.attendance || 0), 0)
      return { arkCenterId: c.id, name: c.name, attendance: att || 0 }
    })
  }

  function buildArkIncomeRows(existing) {
    if (existing && Array.isArray(existing)) return existing
    return arkCenters.map(c => {
      const sd = (arkServiceData || []).filter(s => s.arkCenterId === c.id)
      const offering = sd.reduce((sum, s) => sum + (s.offering || 0), 0)
      return { arkCenterId: c.id, name: c.name, offering: offering || 0 }
    })
  }

  const [weekMonday, setWeekMonday] = useState(() => {
    if (existingReport?.weekStart) {
      const d = new Date(existingReport.weekStart)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
    return currentWeekMonday()
  })

  // Admin section state
  const [branchPastor, setBranchPastor] = useState(existingReport?.branchPastor || '')
  const [administrator, setAdministrator] = useState(existingReport?.administrator || '')
  const [thursdayMain, setThursdayMain] = useState(existingReport?.thursdayAttendance?.main || {})
  const [thursdayArk, setThursdayArk] = useState(() => buildArkAttendanceRows(existingReport?.thursdayAttendance?.arkCenters))
  const [sundayAtt, setSundayAtt] = useState(existingReport?.sundayAttendance || {})
  const [followUp, setFollowUp] = useState(existingReport?.followUp || {})
  const [majorActivities, setMajorActivities] = useState(existingReport?.majorActivities || '')
  const [leadershipMeetings, setLeadershipMeetings] = useState(existingReport?.leadershipMeetings || '')
  const [challenges, setChallenges] = useState(existingReport?.challenges || '')
  const [hqSupport, setHqSupport] = useState(existingReport?.hqSupport || '')

  // Finance section state
  const [financeOfficer, setFinanceOfficer] = useState(existingReport?.financeOfficer || '')
  const [thursdayIncomeMain, setThursdayIncomeMain] = useState(existingReport?.thursdayIncome?.main || {})
  const [thursdayIncomeArk, setThursdayIncomeArk] = useState(() => buildArkIncomeRows(existingReport?.thursdayIncome?.arkCenters))
  const [sundayIncome, setSundayIncome] = useState(existingReport?.sundayIncome || {})
  const [expenses, setExpenses] = useState(existingReport?.expenses?.length ? existingReport.expenses : [{ category: 'Welfare', amount: '', approvedBy: '' }])
  const [amountBanked, setAmountBanked] = useState(existingReport?.amountBanked || '')
  const [dateBanked, setDateBanked] = useState(existingReport?.dateBanked ? new Date(existingReport.dateBanked).toISOString().split('T')[0] : '')
  const [proofOfPayment, setProofOfPayment] = useState(existingReport?.proofOfPayment || false)
  const [proofUrl, setProofUrl] = useState(existingReport?.proofUrl || '')

  // ── Computed totals
  const thursdayMainIncome = INCOME_TYPES.reduce((s, k) => s + (Number(thursdayIncomeMain?.[k]) || 0), 0)
  const thursdayArkIncome = thursdayIncomeArk.reduce((s, r) => s + (Number(r.offering) || 0), 0)
  const thursdayTotalIncome = thursdayMainIncome + thursdayArkIncome
  const sundayTotalIncome = INCOME_TYPES.reduce((s, k) => s + (Number(sundayIncome?.[k]) || 0), 0)
  const totalIncome = thursdayTotalIncome + sundayTotalIncome
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const netBalance = totalIncome - totalExpenses

  function buildPayload() {
    const { weekStart, weekEnd } = getWeekBounds(weekMonday)
    return {
      weekStart, weekEnd,
      branchPastor, administrator,
      thursdayAttendance: { main: thursdayMain, arkCenters: thursdayArk },
      sundayAttendance: sundayAtt,
      followUp,
      majorActivities, leadershipMeetings, challenges, hqSupport,
      financeOfficer,
      thursdayIncome: { main: thursdayIncomeMain, arkCenters: thursdayIncomeArk },
      sundayIncome,
      expenses: expenses.map(e => ({ ...e, amount: parseFloat(e.amount) || 0 })),
      amountBanked: amountBanked ? parseFloat(amountBanked) : null,
      dateBanked: dateBanked || null,
      proofOfPayment,
      proofUrl: proofUrl || null,
    }
  }

  async function save(reportStatus) {
    setError('')
    const isSub = reportStatus === 'SUBMITTED'
    if (isSub) setSubmitting(true); else setSaving(true)

    try {
      const payload = { ...buildPayload(), status: reportStatus }
      let res
      if (isEdit) {
        res = await fetch(`/api/admin/assemblies/${slug}/weekly-reports/${existingReport.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`/api/admin/assemblies/${slug}/weekly-reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.status === 409) {
          const data = await res.json()
          if (data.reportId) {
            setError('A report for this week already exists.')
            return
          }
        }
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save report')
        return
      }

      if (isSub) {
        setSuccess(true)
        setTimeout(() => router.push(`/admin/assemblies/${slug}/reports`), 1800)
      } else {
        const saved = await res.json()
        if (!isEdit) router.replace(`/admin/assemblies/${slug}/reports/${saved.id}`)
        else router.refresh()
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Report Submitted!</h2>
        <p className="text-gray-500 text-sm">Redirecting to reports list…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[['admin', 'Administrative'], ['finance', 'Financial']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === key ? 'bg-white shadow text-purple-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {/* ── TAB 1: Administrative ── */}
      {tab === 'admin' && (
        <div className="space-y-8">
          {/* Basic Info */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Branch Name</label>
                <input className="form-input bg-gray-50" value={assemblyName} disabled />
              </div>
              <div>
                <label className="form-label">Reporting Week (Monday)</label>
                <input
                  type="date"
                  className="form-input"
                  value={weekMonday}
                  disabled={readonly || isEdit}
                  onChange={e => setWeekMonday(e.target.value)}
                  max={currentWeekMonday()}
                />
                {weekMonday && (
                  <p className="text-xs text-gray-400 mt-1">
                    {parseDateStr(weekMonday).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}
                    {' – '}
                    {parseDateStr(sundayOf(weekMonday)).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">Branch Pastor</label>
                <input className="form-input" value={branchPastor} disabled={readonly} onChange={e => setBranchPastor(e.target.value)} placeholder="Pastor name" />
              </div>
              <div>
                <label className="form-label">Administrator</label>
                <input className="form-input" value={administrator} disabled={readonly} onChange={e => setAdministrator(e.target.value)} placeholder="Administrator name" />
              </div>
            </div>
          </section>

          {/* Thursday Attendance */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Thursday Service — Main Assembly</h3>
            <p className="text-xs text-gray-500 mb-4">Attendance breakdown by category</p>
            <AttendanceGrid data={thursdayMain} onChange={setThursdayMain} readonly={readonly} />

            {arkCenters.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 text-sm mb-3">Thursday — Ark Centers</h4>
                <ArkAttendanceTable rows={thursdayArk} onChange={setThursdayArk} readonly={readonly} />
              </div>
            )}
          </section>

          {/* Sunday Attendance */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Sunday Service Attendance</h3>
            <p className="text-xs text-gray-500 mb-4">Main assembly only</p>
            <AttendanceGrid data={sundayAtt} onChange={setSundayAtt} readonly={readonly} />
          </section>

          {/* Follow-up */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Follow-up & Membership Development</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['firstTimersContacted', 'First Timers Contacted'],
                ['firstTimersRetained', 'First Timers Retained'],
                ['newConvertsInDiscipleship', 'New Converts in Discipleship'],
                ['baptisms', 'Baptisms Conducted'],
                ['newWorkers', 'New Workers Added'],
                ['membersFollowedUp', 'Members Followed Up'],
                ['visitations', 'Visitations Conducted'],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    type="number" min="0" inputMode="numeric"
                    className="form-input"
                    value={followUp[key] || ''}
                    disabled={readonly}
                    onChange={e => setFollowUp(f => ({ ...f, [key]: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Admin Notes */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Administrative Notes</h3>
            <div className="space-y-4">
              {[
                [majorActivities, setMajorActivities, 'Major Activities This Week'],
                [leadershipMeetings, setLeadershipMeetings, 'Leadership Meetings Held'],
                [challenges, setChallenges, 'Challenges Encountered'],
                [hqSupport, setHqSupport, 'Headquarters Support Needed'],
              ].map(([val, setter, label]) => (
                <div key={label}>
                  <label className="form-label">{label}</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={val}
                    disabled={readonly}
                    onChange={e => setter(e.target.value)}
                    placeholder="Enter details…"
                  />
                </div>
              ))}
            </div>
          </section>

          {!readonly && (
            <div className="flex justify-end">
              <button
                onClick={() => setTab('finance')}
                className="btn-primary flex items-center gap-2"
              >
                Next: Financial Report <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: Financial ── */}
      {tab === 'finance' && (
        <div className="space-y-8">
          {/* Basic Info */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Branch Name</label>
                <input className="form-input bg-gray-50" value={assemblyName} disabled />
              </div>
              <div>
                <label className="form-label">Reporting Week</label>
                <input className="form-input bg-gray-50" disabled
                  value={weekMonday ? `${parseDateStr(weekMonday).toLocaleDateString('en-GB',{day:'numeric',month:'short'})} – ${parseDateStr(sundayOf(weekMonday)).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}` : ''}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Finance Officer</label>
                <input className="form-input" value={financeOfficer} disabled={readonly} onChange={e => setFinanceOfficer(e.target.value)} placeholder="Finance officer name" />
              </div>
            </div>
          </section>

          {/* Thursday Income */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Thursday Service Income — Main Assembly</h3>
            <p className="text-xs text-gray-500 mb-4">Income collected at the Thursday service</p>
            <IncomeTable data={thursdayIncomeMain} onChange={setThursdayIncomeMain} readonly={readonly} />

            {arkCenters.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-700 text-sm mb-3">Thursday Income — Ark Centers</h4>
                <ArkIncomeTable rows={thursdayIncomeArk} onChange={setThursdayIncomeArk} readonly={readonly} />
              </div>
            )}
          </section>

          {/* Sunday Income */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-1">Sunday Service Income</h3>
            <p className="text-xs text-gray-500 mb-4">Main assembly Sunday service</p>
            <IncomeTable data={sundayIncome} onChange={setSundayIncome} readonly={readonly} />
          </section>

          {/* Expenses */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Weekly Expenses</h3>
                <p className="text-xs text-gray-500">All expenditure for the week</p>
              </div>
              {!readonly && (
                <button
                  onClick={() => setExpenses(e => [...e, { category: 'Other', amount: '', approvedBy: '' }])}
                  className="btn-outline btn-sm flex items-center gap-1"
                >
                  <Plus size={13} /> Add Row
                </button>
              )}
            </div>
            <div className="space-y-3">
              {expenses.map((exp, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    {i === 0 && <label className="form-label">Category</label>}
                    <select
                      className="form-input"
                      value={exp.category}
                      disabled={readonly}
                      onChange={e => setExpenses(prev => prev.map((r, j) => j === i ? { ...r, category: e.target.value } : r))}
                    >
                      {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-span-4">
                    {i === 0 && <label className="form-label">Amount (₦)</label>}
                    <input
                      type="number" min="0" inputMode="decimal"
                      className="form-input"
                      value={exp.amount}
                      disabled={readonly}
                      onChange={e => setExpenses(prev => prev.map((r, j) => j === i ? { ...r, amount: e.target.value } : r))}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="form-label">Approved By</label>}
                    <input
                      className="form-input"
                      value={exp.approvedBy}
                      disabled={readonly}
                      onChange={e => setExpenses(prev => prev.map((r, j) => j === i ? { ...r, approvedBy: e.target.value } : r))}
                      placeholder="Name"
                    />
                  </div>
                  <div className="col-span-1 flex items-end pb-0.5">
                    {i === 0 && <div className="form-label invisible">x</div>}
                    {!readonly && (
                      <button
                        onClick={() => setExpenses(prev => prev.filter((_, j) => j !== i))}
                        className="p-2 text-red-400 hover:text-red-600"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-sm">
              <span className="font-semibold text-gray-700">Total Expenses</span>
              <span className="font-bold text-red-600">₦{fmt(totalExpenses)}</span>
            </div>
          </section>

          {/* Financial Summary */}
          <section className="card p-6 bg-purple-50 border border-purple-100">
            <h3 className="font-bold text-gray-900 mb-4">Financial Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Thursday Income (Main)</span>
                <span className="font-semibold">₦{fmt(thursdayMainIncome)}</span>
              </div>
              {arkCenters.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Thursday Income (Ark Centers)</span>
                  <span className="font-semibold">₦{fmt(thursdayArkIncome)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Sunday Income</span>
                <span className="font-semibold">₦{fmt(sundayTotalIncome)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-purple-200">
                <span className="font-bold text-gray-900">Total Income</span>
                <span className="font-bold text-green-700">₦{fmt(totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Total Expenses</span>
                <span className="font-bold text-red-600">₦{fmt(totalExpenses)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-purple-300">
                <span className="font-bold text-gray-900 text-base">Net Balance</span>
                <span className={`font-bold text-lg ${netBalance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  ₦{fmt(Math.abs(netBalance))}{netBalance < 0 ? ' (deficit)' : ''}
                </span>
              </div>
            </div>
          </section>

          {/* Banking */}
          <section className="card p-6">
            <h3 className="font-bold text-gray-900 mb-4">Banking Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Amount Banked (₦)</label>
                <input
                  type="number" min="0" inputMode="decimal"
                  className="form-input"
                  value={amountBanked}
                  disabled={readonly}
                  onChange={e => setAmountBanked(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="form-label">Date Banked</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateBanked}
                  disabled={readonly}
                  onChange={e => setDateBanked(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="form-label">Proof of Payment</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={proofOfPayment}
                      disabled={readonly}
                      onChange={e => setProofOfPayment(e.target.checked)}
                      className="w-4 h-4 accent-purple-700"
                    />
                    <span className="text-sm text-gray-700">Proof attached / available</span>
                  </label>
                </div>
                {proofOfPayment && (
                  <input
                    className="form-input mt-2"
                    value={proofUrl}
                    disabled={readonly}
                    onChange={e => setProofUrl(e.target.value)}
                    placeholder="Link to proof (optional)"
                  />
                )}
              </div>
            </div>
          </section>

          {/* Actions */}
          {!readonly && (
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => save('DRAFT')}
                disabled={saving || submitting}
                className="btn-outline flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saving ? 'Saving…' : 'Save Draft'}
              </button>
              <button
                onClick={() => save('SUBMITTED')}
                disabled={saving || submitting}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
