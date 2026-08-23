'use client'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/yellowpages/constants'
import { useYellowPagesBase } from './shared/YellowPagesChrome'

export default function CategoryGrid() {
  const base = useYellowPagesBase()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.value}
          href={`${base}/category/${cat.value}`}
          className="yp-card p-4 text-sm font-semibold text-center hover:opacity-90"
        >
          {cat.label}
        </Link>
      ))}
    </div>
  )
}
