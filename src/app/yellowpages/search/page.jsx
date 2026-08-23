'use client'
import { Suspense } from 'react'
import ListingsBrowser from '@/components/yellowpages/ListingsBrowser'

export default function SearchPage() {
  return (
    <div className="section-container">
      <h1 className="section-heading" style={{ color: 'var(--yp-ink)' }}>Browse the Directory</h1>
      <p className="section-subheading">Search by skill, service, business, category, or location.</p>
      <Suspense fallback={null}>
        <ListingsBrowser />
      </Suspense>
    </div>
  )
}
