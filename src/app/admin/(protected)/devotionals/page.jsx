'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Calendar, Edit2, Trash2, ExternalLink } from 'lucide-react'

export default function DevotionalsPage() {
  const [devotionals, setDevotionals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchDevotionals()
  }, [])

  const fetchDevotionals = async () => {
    try {
      const res = await fetch('/api/admin/devotionals')
      const data = await res.json()
      setDevotionals(data)
    } catch (err) {
      console.error('Failed to fetch devotionals', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteDevotional = async (id) => {
    if (!confirm('Are you sure you want to delete this devotional?')) return
    try {
      const res = await fetch(`/api/admin/devotionals/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDevotionals(prev => prev.filter(d => d.id !== id))
      }
    } catch (err) {
      alert('Failed to delete devotional')
    }
  }

  const filtered = devotionals.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.scriptureRef || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
            Royal Feed Devotionals
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Schedule and manage daily spiritual food for the DMGA family</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/devotionals/series" className="btn-secondary">
            <Calendar size={18} /> Schedule Series
          </Link>
          <Link href="/admin/devotionals/new" className="btn-primary">
            <Plus size={18} /> New Devotional
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="form-input pl-9"
          placeholder="Search by title or scripture..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--ivory)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Scripture</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filtered.map(d => {
                  const scheduledDate = new Date(d.scheduledDate)
                  const isPast = scheduledDate <= new Date()
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          {scheduledDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          <span className="text-gray-300">|</span>
                          {d.publishTime}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{d.title}</td>
                      <td className="px-4 py-3 text-gray-600 italic">
                        {d.scriptureRef || <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {isPast ? (
                          <span className="pill pill-success text-[10px] uppercase font-bold tracking-wider">Published</span>
                        ) : (
                          <span className="pill pill-warning text-[10px] uppercase font-bold tracking-wider">Scheduled</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/royal-feed`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                            title="View Publicly"
                          >
                            <ExternalLink size={16} />
                          </Link>
                          <Link
                            href={`/admin/devotionals/${d.id}/edit`}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => deleteDevotional(d.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-gray-400">No devotionals found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
