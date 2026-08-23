'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import ListingCard from './ListingCard'
import { CATEGORIES } from '@/lib/yellowpages/constants'

/**
 * Shared search/filter/results grid used by both /search (all filters editable) and
 * /category/[category] (category preset via `lockedCategory`). Reads its initial filter
 * state from the URL and keeps the URL in sync as the visitor changes filters, so results
 * are shareable/bookmarkable.
 */
export default function ListingsBrowser({ lockedCategory }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [q, setQ] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(lockedCategory || searchParams.get('category') || '')
  const [assemblySlug, setAssemblySlug] = useState(searchParams.get('assemblySlug') || '')
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [country, setCountry] = useState(searchParams.get('country') || '')
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)

  const [assemblies, setAssemblies] = useState([])
  const [result, setResult] = useState({ listings: [], total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/assemblies')
      .then((res) => res.json())
      .then((data) => setAssemblies(Array.isArray(data) ? data : []))
      .catch(() => setAssemblies([]))
  }, [])

  const buildQuery = useCallback(
    (overridePage) => {
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (category) params.set('category', category)
      if (assemblySlug) params.set('assemblySlug', assemblySlug)
      if (city.trim()) params.set('city', city.trim())
      if (country.trim()) params.set('country', country.trim())
      const effectivePage = overridePage ?? page
      if (effectivePage > 1) params.set('page', String(effectivePage))
      return params
    },
    [q, category, assemblySlug, city, country, page]
  )

  // Debounced fetch + URL sync whenever a filter changes.
  useEffect(() => {
    setLoading(true)
    setError('')
    const timeout = setTimeout(() => {
      const params = buildQuery()
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false })

      const fetchParams = new URLSearchParams(params)
      if (lockedCategory) fetchParams.set('category', lockedCategory)

      fetch(`/api/yellowpages/listings?${fetchParams.toString()}`)
        .then((res) => res.json())
        .then((data) => setResult(data))
        .catch(() => setError('Could not load listings. Please try again.'))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, assemblySlug, city, country, page])

  // Reset to page 1 whenever a filter (other than page itself) changes.
  const updateFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  return (
    <div>
      <div className="yp-card p-4 sm:p-5 mb-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--yp-ink-soft)' }} />
          <input
            className="yp-input !pl-9"
            placeholder="Search skills, services, businesses…"
            value={q}
            onChange={(e) => updateFilter(setQ)(e.target.value)}
            aria-label="Search"
          />
        </div>

        {!lockedCategory && (
          <select className="yp-select" value={category} onChange={(e) => updateFilter(setCategory)(e.target.value)} aria-label="Category">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        )}

        <select className="yp-select" value={assemblySlug} onChange={(e) => updateFilter(setAssemblySlug)(e.target.value)} aria-label="Assembly">
          <option value="">All Assemblies</option>
          {assemblies.map((a) => (
            <option key={a.slug} value={a.slug}>{a.name}</option>
          ))}
        </select>

        <input
          className="yp-input"
          placeholder="City"
          value={city}
          onChange={(e) => updateFilter(setCity)(e.target.value)}
          aria-label="City"
        />
        <input
          className="yp-input"
          placeholder="Country"
          value={country}
          onChange={(e) => updateFilter(setCountry)(e.target.value)}
          aria-label="Country"
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16" style={{ color: 'var(--yp-ink-soft)' }}>
          <Loader2 size={20} className="animate-spin mr-2" /> Loading listings…
        </div>
      )}

      {!loading && error && (
        <p className="text-center py-16 text-red-600">{error}</p>
      )}

      {!loading && !error && result.listings.length === 0 && (
        <p className="text-center py-16" style={{ color: 'var(--yp-ink-soft)' }}>
          No listings match your search yet. Be the first to{' '}
          <a href="register" className="underline font-semibold">list your skill or business</a>.
        </p>
      )}

      {!loading && !error && result.listings.length > 0 && (
        <>
          <p className="text-sm mb-4" style={{ color: 'var(--yp-ink-soft)' }}>
            {result.total} listing{result.total === 1 ? '' : 's'} found
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {result.listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>

          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                className="yp-btn-outline !px-4 !py-2"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span className="text-sm font-semibold">
                Page {page} of {result.totalPages}
              </span>
              <button
                className="yp-btn-outline !px-4 !py-2"
                disabled={page >= result.totalPages}
                onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
