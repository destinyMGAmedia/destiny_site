'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import CategoryGrid from '@/components/yellowpages/CategoryGrid'
import ListingCard from '@/components/yellowpages/ListingCard'

export default function YellowPagesHome() {
  const base = useYellowPagesBase()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [recent, setRecent] = useState([])

  useEffect(() => {
    fetch('/api/yellowpages/listings')
      .then((res) => res.json())
      .then((data) => setRecent(data.listings || []))
      .catch(() => setRecent([]))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    router.push(`${base}/search${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div>
      <section className="text-center px-4 sm:px-6 py-20" style={{ background: 'var(--yp-yellow-100)' }}>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--yp-ink)' }}>
          Find Trusted Skills &amp; Businesses
        </h1>
        <p className="max-w-xl mx-auto mb-8" style={{ color: 'var(--yp-ink-soft)' }}>
          A directory of members&rsquo; skills and businesses from across the Destiny Mission Global family —
          search by category and find who&rsquo;s near you.
        </p>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--yp-ink-soft)' }} />
            <input
              className="yp-input !pl-10"
              placeholder="Search for a skill, service, or business…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search"
            />
          </div>
          <button type="submit" className="yp-btn-primary">Search</button>
        </form>

        <p className="mt-6 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
          Have a skill or business to offer?{' '}
          <Link href={`${base}/register`} className="underline font-semibold">List it for free</Link>
        </p>
      </section>

      <section className="section-container">
        <h2 className="section-heading" style={{ color: 'var(--yp-ink)' }}>Browse by Category</h2>
        <p className="section-subheading">Find people offering exactly what you&rsquo;re looking for.</p>
        <CategoryGrid />
      </section>

      {recent.length > 0 && (
        <section className="section-container pt-0">
          <h2 className="section-heading" style={{ color: 'var(--yp-ink)' }}>Recently Added</h2>
          <p className="section-subheading">The newest skills and businesses in the directory.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recent.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
