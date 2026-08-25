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
    <div>
      <div className="max-w-xl mx-auto px-4 pt-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>{categoryLabel(category)}</h1>
        <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
          Members and businesses offering {categoryLabel(category).toLowerCase()} services.
        </p>
      </div>
      <Suspense fallback={null}>
        <ListingsBrowser lockedCategory={category} />
      </Suspense>
    </div>
  )
}
