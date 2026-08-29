'use client'
import { X } from 'lucide-react'
import { CATEGORIES, categoryLabel, MAX_EXTRA_CATEGORIES } from '@/lib/yellowpages/constants'

/**
 * BUSINESS-only: pick extra categories the business also operates in (beyond the primary one).
 * People browsing any of them will find the listing.
 */
export default function ExtraCategoriesField({ primary, values = [], onChange, error }) {
  const atMax = values.length >= MAX_EXTRA_CATEGORIES
  const available = CATEGORIES.filter(
    (c) => c.value !== primary && c.value !== 'OTHER' && !values.includes(c.value),
  )

  return (
    <div id="yp-extra-categories">
      <label className="yp-label" htmlFor="yp-extra-cat-select">
        Additional categories (optional)
        {values.length > 0 && (
          <span className="font-normal text-xs" style={{ color: 'var(--yp-ink-soft)' }}> ({values.length}/{MAX_EXTRA_CATEGORIES})</span>
        )}
      </label>

      {!atMax && (
        <select
          id="yp-extra-cat-select"
          className="yp-select"
          value=""
          onChange={(e) => { if (e.target.value) onChange([...values, e.target.value]) }}
        >
          <option value="">Add a category…</option>
          {available.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      )}

      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'var(--yp-yellow-100)', color: 'var(--yp-ink)' }}
            >
              {categoryLabel(v)}
              <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${categoryLabel(v)}`}>
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-red-600 text-xs">{error}</p>}
      <p className="mt-1 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
        Your primary category is <strong>{categoryLabel(primary) || 'not set'}</strong>. Add others your business also serves.
      </p>
    </div>
  )
}
