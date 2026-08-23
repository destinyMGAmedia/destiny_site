'use client'
import { Star } from 'lucide-react'

/**
 * Presentational star rating. Pass `interactive` + `onChange` for a selectable input
 * (used by RatingForm); omit them for a read-only display (used by ListingCard/detail page).
 */
export default function RatingStars({ value = 0, size = 16, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="inline-flex items-center gap-0.5" role={interactive ? 'radiogroup' : 'img'} aria-label={`${value} out of 5 stars`}>
      {stars.map((n) => {
        const filled = n <= Math.round(value)
        const star = (
          <Star
            key={n}
            size={size}
            fill={filled ? 'var(--yp-yellow-500)' : 'none'}
            stroke={filled ? 'var(--yp-yellow-600)' : 'var(--yp-border)'}
          />
        )
        if (!interactive) return star
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? '' : 's'}`}
            onClick={() => onChange?.(n)}
            className="p-0.5 leading-none"
          >
            {star}
          </button>
        )
      })}
    </div>
  )
}
