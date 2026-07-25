'use client'
import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'

const STATUS_OPTIONS = ['ALL', 'PENDING', 'SUCCESS', 'FAILED', 'PLEDGED']
const PACKAGE_OPTIONS = ['ALL', 'LADDER', 'FOUNDERS_CIRCLE']

function toCsv(rows) {
  const headers = ['reference', 'package', 'tier', 'amount', 'currency', 'status', 'isPledge', 'isManualEntry', 'donorName', 'donorEmail', 'donorPhone', 'createdAt']
  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  }
  return lines.join('\n')
}

export default function NationContributionsTable({ contributions }) {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [packageFilter, setPackageFilter] = useState('ALL')
  const [pledgeOnly, setPledgeOnly] = useState(false)
  const [notesDraft, setNotesDraft] = useState({})
  const [savingId, setSavingId] = useState(null)

  const filtered = useMemo(() => {
    return contributions.filter((c) => {
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
      if (packageFilter !== 'ALL' && c.package !== packageFilter) return false
      if (pledgeOnly && !c.isPledge) return false
      return true
    })
  }, [contributions, statusFilter, packageFilter, pledgeOnly])

  function handleExport() {
    const csv = toCsv(filtered)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `destiny-nation-contributions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleMarkContacted(id) {
    setSavingId(id)
    try {
      const res = await fetch(`/api/admin/nation/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpNotes: notesDraft[id] ?? '' }),
      })
      if (!res.ok) throw new Error('Failed to save')
    } catch (err) {
      console.error('[NationContributionsTable] mark-contacted failed:', err)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={packageFilter} onChange={(e) => setPackageFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
          {PACKAGE_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={pledgeOnly} onChange={(e) => setPledgeOnly(e.target.checked)} />
          Pledges only
        </label>
        <button
          onClick={handleExport}
          className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border"
          style={{ borderColor: 'var(--purple-800)', color: 'var(--purple-800)' }}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b text-gray-500">
              <th className="py-2 pr-4">Donor</th>
              <th className="py-2 pr-4">Package / Tier</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Follow-up</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  <p className="font-semibold">{c.donorName}</p>
                  <p className="text-gray-500">{c.donorEmail}</p>
                </td>
                <td className="py-3 pr-4">
                  <p>{c.package === 'FOUNDERS_CIRCLE' ? "Founders' Circle" : 'Giving Ladder'}</p>
                  <p className="text-gray-500">{c.tier}{c.isManualEntry ? ' · bank transfer' : ''}</p>
                </td>
                <td className="py-3 pr-4">{c.currency} {c.amount.toLocaleString()}</td>
                <td className="py-3 pr-4">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100">{c.status}</span>
                </td>
                <td className="py-3 pr-4">
                  {c.isPledge || c.isManualEntry ? (
                    <div className="flex items-center gap-2">
                      <input
                        defaultValue={c.followUpNotes || ''}
                        placeholder="Notes…"
                        onChange={(e) => setNotesDraft((d) => ({ ...d, [c.id]: e.target.value }))}
                        className="border rounded-lg px-2 py-1 text-xs w-40"
                      />
                      <button
                        onClick={() => handleMarkContacted(c.id)}
                        disabled={savingId === c.id}
                        className="text-xs font-semibold px-2 py-1 rounded-lg"
                        style={{ background: 'var(--purple-800)', color: 'white' }}
                      >
                        {savingId === c.id ? 'Saving…' : 'Save'}
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-gray-400">No contributions match these filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
