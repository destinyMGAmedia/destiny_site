'use client'
import { useEffect, useState } from 'react'
import { Search, Loader2, Eye, EyeOff, Trash2, ChevronLeft, ChevronRight, Unlock } from 'lucide-react'
import { CATEGORIES, categoryLabel } from '@/lib/yellowpages/constants'

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

/**
 * Admin moderation table for The Yellow Pages — the lightweight backstop since listings
 * auto-publish with no approval queue. Lists both active and inactive listings, with
 * search/category/status filters and per-row deactivate/reactivate/delete actions.
 * See spec/theyellowpages.md's "Admin moderation" section.
 */
export default function YellowPagesAdminTable() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [result, setResult] = useState({ listings: [], total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const load = () => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (category) params.set('category', category)
    if (status) params.set('status', status)
    if (page > 1) params.set('page', String(page))

    fetch(`/api/admin/yellowpages/listings?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setResult)
      .catch(() => setError('Could not load listings.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const timeout = setTimeout(load, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, status, page])

  const updateFilter = (setter) => (value) => { setter(value); setPage(1) }

  const toggleActive = async (listing) => {
    setBusyId(listing.id)
    try {
      const res = await fetch(`/api/yellowpages/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !listing.isActive }),
      })
      if (res.ok) {
        const { listing: updated } = await res.json()
        setResult((r) => ({ ...r, listings: r.listings.map((l) => (l.id === listing.id ? { ...l, isActive: updated.isActive } : l)) }))
      }
    } finally {
      setBusyId(null)
    }
  }

  const resetEditLock = async (listing) => {
    setBusyId(listing.id)
    try {
      const res = await fetch(`/api/yellowpages/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetEditLock: true }),
      })
      if (res.ok) {
        setResult((r) => ({
          ...r,
          listings: r.listings.map((l) => (l.id === listing.id ? { ...l, editStrict: false, editContacts: [] } : l)),
        }))
      }
    } finally {
      setBusyId(null)
    }
  }

  const deleteListing = async (id) => {
    setBusyId(id)
    try {
      const res = await fetch(`/api/yellowpages/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setResult((r) => ({ ...r, listings: r.listings.filter((l) => l.id !== id), total: r.total - 1 }))
      }
    } finally {
      setBusyId(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="border rounded-lg pl-8 pr-3 py-2 text-sm"
            placeholder="Search name, phone, email…"
            value={q}
            onChange={(e) => updateFilter(setQ)(e.target.value)}
            aria-label="Search"
          />
        </div>
        <select value={category} onChange={(e) => updateFilter(setCategory)(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" aria-label="Category">
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={status} onChange={(e) => updateFilter(setStatus)(e.target.value)} className="border rounded-lg px-3 py-2 text-sm" aria-label="Status">
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-500">{result.total} listing{result.total === 1 ? '' : 's'}</span>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading…
        </div>
      )}

      {!loading && error && <p className="text-center py-12 text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b text-gray-500">
                <th className="py-2 pr-4">Listing</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Location</th>
                <th className="py-2 pr-4">Rating</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.listings.map((l) => (
                <tr key={l.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-semibold">{l.name}</p>
                    <p className="text-gray-500">{l.phone}{l.email ? ` · ${l.email}` : ''}</p>
                  </td>
                  <td className="py-3 pr-4">{l.listingType === 'INDIVIDUAL' ? 'Person' : 'Business'}</td>
                  <td className="py-3 pr-4">{categoryLabel(l.category)}</td>
                  <td className="py-3 pr-4">{[l.city, l.country].filter(Boolean).join(', ') || '—'}</td>
                  <td className="py-3 pr-4">{l.ratingCount > 0 ? `${l.avgRating.toFixed(1)} (${l.ratingCount})` : '—'}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {l.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(l)}
                        disabled={busyId === l.id}
                        className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border"
                        style={{ borderColor: 'var(--purple-800)', color: 'var(--purple-800)' }}
                      >
                        {l.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                        {l.isActive ? 'Deactivate' : 'Activate'}
                      </button>

                      {(l.editStrict || (l.editContacts && l.editContacts.length > 0)) && (
                        <button
                          onClick={() => resetEditLock(l)}
                          disabled={busyId === l.id}
                          title="Clear editStrict + editContacts so a locked-out owner can regain access"
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border"
                          style={{ borderColor: 'var(--purple-800)', color: 'var(--purple-800)' }}
                        >
                          <Unlock size={13} /> Reset edit lock
                        </button>
                      )}

                      {confirmDeleteId === l.id ? (
                        <span className="flex items-center gap-1 text-xs">
                          <button onClick={() => deleteListing(l.id)} disabled={busyId === l.id} className="font-semibold text-red-600">
                            Confirm
                          </button>
                          <button onClick={() => setConfirmDeleteId(null)} className="text-gray-400">Cancel</button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(l.id)}
                          className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border border-red-200 text-red-600"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {result.listings.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400">No listings match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-2 rounded-lg border disabled:opacity-40">
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold">Page {page} of {result.totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))} disabled={page >= result.totalPages} className="p-2 rounded-lg border disabled:opacity-40">
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
