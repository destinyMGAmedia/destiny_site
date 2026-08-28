'use client'
import { useEffect, useState } from 'react'
import { Loader2, Link2, X } from 'lucide-react'

/**
 * Optional link from a business team member to an existing INDIVIDUAL listing. Typeahead over
 * GET /api/yellowpages/listings?listingType=INDIVIDUAL&q=. Calls
 * `onChange({ linkedListingId, linkedName })`.
 */
export default function LinkedProfilePicker({ linkedListingId = '', linkedName = '', onChange }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const term = query.trim()
    if (linkedListingId || !term) return undefined

    let cancelled = false
    const t = setTimeout(() => {
      setLoading(true)
      fetch(`/api/yellowpages/listings?listingType=INDIVIDUAL&q=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setResults(Array.isArray(d.listings) ? d.listings : []) })
        .catch(() => { if (!cancelled) setResults([]) })
        .finally(() => { if (!cancelled) setLoading(false) })
    }, 350)
    return () => { cancelled = true; clearTimeout(t) }
  }, [query, linkedListingId])

  // Ignore any stale matches once the box is empty or a profile is linked.
  const visibleResults = linkedListingId || !query.trim() ? [] : results

  if (linkedListingId) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full" style={{ background: 'var(--yp-yellow-100)' }}>
        <Link2 size={11} /> Linked{linkedName ? `: ${linkedName}` : ''}
        <button type="button" onClick={() => onChange({ linkedListingId: '', linkedName: '' })} aria-label="Unlink profile">
          <X size={11} />
        </button>
      </span>
    )
  }

  return (
    <div className="relative">
      <input
        className="yp-input !py-1.5 text-sm"
        placeholder="Link to an existing personal profile (optional)"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && query.trim() && (
        <div className="absolute z-20 left-0 right-0 mt-1 yp-card p-1 max-h-56 overflow-y-auto">
          {loading && (
            <p className="p-2 text-xs flex items-center gap-1" style={{ color: 'var(--yp-ink-soft)' }}>
              <Loader2 size={12} className="animate-spin" /> Searching…
            </p>
          )}
          {!loading && visibleResults.length === 0 && (
            <p className="p-2 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>No matching people.</p>
          )}
          {visibleResults.map((r) => (
            <button
              key={r.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange({ linkedListingId: r.id, linkedName: r.name }); setQuery(''); setOpen(false) }}
              className="block w-full text-left px-2 py-1.5 text-sm rounded"
            >
              {r.name}
              {r.headline ? <span style={{ color: 'var(--yp-ink-soft)' }}> — {r.headline}</span> : null}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
