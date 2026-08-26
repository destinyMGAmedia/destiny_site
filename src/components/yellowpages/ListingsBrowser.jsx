'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import ListingCard from './ListingCard'
import { CATEGORIES } from '@/lib/yellowpages/constants'

// Hoisted out of ListingsBrowser (not declared inline in render), per react-hooks/static-components.
function CategoryChip({ value, label, active, onSelect, vertical }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(value)}
      className={`shrink-0 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${vertical ? 'w-full text-left px-3.5 py-2' : 'px-3.5 py-1.5'}`}
      style={
        active
          ? { background: 'var(--yp-yellow-700)', color: '#fff' }
          : { background: 'var(--yp-surface)', color: 'var(--yp-ink-soft)', border: '1px solid var(--yp-border)' }
      }
    >
      {label}
    </button>
  )
}

/**
 * The timeline feed. Search and assembly filters live in Nav (shared/Nav.jsx) and are read
 * here reactively via the URL; category is a sidebar chip list (vertical on desktop,
 * horizontal scroll row on mobile) owned by this component. Used by /browse (all filters
 * editable) and /category/[category] (category preset via `lockedCategory`).
 */
export default function ListingsBrowser({ lockedCategory }) {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''
  const assemblySlug = searchParams.get('assemblySlug') || ''
  const [category, setCategory] = useState(lockedCategory || '')

  const [listings, setListings] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const buildQuery = useCallback(
    (targetPage) => {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (lockedCategory || category) params.set('category', lockedCategory || category)
      if (assemblySlug) params.set('assemblySlug', assemblySlug)
      if (targetPage > 1) params.set('page', String(targetPage))
      return params
    },
    [q, category, assemblySlug, lockedCategory]
  )

  const fetchPage = useCallback(
    (targetPage, { append }) => {
      const params = buildQuery(targetPage)
      if (append) setLoadingMore(true)
      else setLoading(true)
      setError('')

      fetch(`/api/yellowpages/listings?${params.toString()}`)
        .then(async (res) => {
          const data = await res.json()
          if (!res.ok) throw new Error(data.error || 'Failed to load listings')
          return data
        })
        .then((data) => {
          setListings((prev) => (append ? [...prev, ...data.listings] : data.listings))
          setTotalPages(data.totalPages)
          setTotal(data.total)
          setPage(targetPage)
        })
        .catch(() => setError('Could not load listings. Please try again.'))
        .finally(() => {
          setLoading(false)
          setLoadingMore(false)
        })
    },
    [buildQuery]
  )

  // Re-fetch page 1 whenever any filter changes (q/assemblySlug from the URL via Nav, category
  // from this component's own sidebar).
  useEffect(() => {
    fetchPage(1, { append: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, assemblySlug, lockedCategory])

  const chips = [{ value: '', label: 'All' }, ...CATEGORIES]

  return (
    <div className={`max-w-7xl mx-auto px-4 lg:px-8 py-6 ${lockedCategory ? '' : 'lg:grid lg:grid-cols-[220px_1fr] lg:gap-8'}`}>
      {!lockedCategory && (
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1" role="tablist" aria-label="Filter by category">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 px-1" style={{ color: 'var(--yp-ink-soft)' }}>
              Industry
            </p>
            {chips.map((c) => (
              <CategoryChip key={c.value} value={c.value} label={c.label} active={category === c.value} onSelect={setCategory} vertical />
            ))}
          </div>
        </aside>
      )}

      <div className="max-w-xl w-full mx-auto min-w-0">
        {!lockedCategory && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4 lg:hidden min-w-0 max-w-full" role="tablist" aria-label="Filter by category (mobile)" style={{ scrollbarWidth: 'none' }}>
            {chips.map((c) => (
              <CategoryChip key={c.value} value={c.value} label={c.label} active={category === c.value} onSelect={setCategory} />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16" style={{ color: 'var(--yp-ink-soft)' }}>
            <Loader2 size={20} className="animate-spin mr-2" /> Loading listings…
          </div>
        )}

        {!loading && error && (
          <p className="text-center py-16 text-red-600">{error}</p>
        )}

        {!loading && !error && listings.length === 0 && (
          <p className="text-center py-16" style={{ color: 'var(--yp-ink-soft)' }}>
            No listings match your search yet. Be the first to{' '}
            <a href="register" className="underline font-semibold">list your skill or business</a>.
          </p>
        )}

        {!loading && !error && listings.length > 0 && (
          <>
            <p className="text-sm mb-3" style={{ color: 'var(--yp-ink-soft)' }}>
              {total} listing{total === 1 ? '' : 's'}
            </p>
            <div className="space-y-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {page < totalPages && (
              <div className="flex justify-center mt-8">
                <button
                  className="yp-btn-outline"
                  disabled={loadingMore}
                  onClick={() => fetchPage(page + 1, { append: true })}
                >
                  {loadingMore ? 'Loading…' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
