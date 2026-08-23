'use client'
import { Suspense } from 'react'
import { useParams, notFound } from 'next/navigation'
import ListingsBrowser from '@/components/yellowpages/ListingsBrowser'
import { CATEGORY_VALUES, categoryLabel } from '@/lib/yellowpages/constants'

export default function CategoryPage() {
  const { category } = useParams()

  if (!CATEGORY_VALUES.includes(category)) {
    notFound()
  }

  return (
    <div className="section-container">
      <h1 className="section-heading" style={{ color: 'var(--yp-ink)' }}>{categoryLabel(category)}</h1>
      <p className="section-subheading">Members and businesses offering {categoryLabel(category).toLowerCase()} services.</p>
      <Suspense fallback={null}>
        <ListingsBrowser lockedCategory={category} />
      </Suspense>
    </div>
  )
}
