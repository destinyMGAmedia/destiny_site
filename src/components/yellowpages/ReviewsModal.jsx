'use client'
import { X } from 'lucide-react'
import RatingStars from './RatingStars'
import RatingForm from './RatingForm'

/**
 * Reviews are off the main portfolio page now — this modal holds the full list plus the
 * "leave a review" form. On submit it calls `onSubmitted` so the parent can refetch and the
 * average rating updates on the page (and, on next load, on the listing card).
 */
export default function ReviewsModal({ listing, listingId, onClose, onSubmitted }) {
  const ratings = listing.ratings || []

  return (
    <div className="yp-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Reviews">
      <div className="yp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 p-5 border-b" style={{ borderColor: 'var(--yp-border)' }}>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg" style={{ color: 'var(--yp-ink)' }}>Reviews</h2>
            {listing.ratingCount > 0 && (
              <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
                <RatingStars value={listing.avgRating} size={14} />
                <span className="font-semibold">{listing.avgRating.toFixed(1)}</span>
                ({listing.ratingCount})
              </span>
            )}
          </div>
          <button type="button" onClick={onClose} aria-label="Close reviews">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {ratings.length === 0 ? (
            <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>No reviews yet — be the first to leave one.</p>
          ) : (
            <ul className="space-y-4 mb-6">
              {ratings.map((r) => (
                <li key={r.id} className="border-b pb-4 last:border-0" style={{ borderColor: 'var(--yp-border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <RatingStars value={r.stars} size={14} />
                    <span className="text-sm font-semibold">{r.reviewerName}</span>
                  </div>
                  {r.comment && <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}

          <div className="pt-5 border-t" style={{ borderColor: 'var(--yp-border)' }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--yp-ink)' }}>Leave a review</h3>
            <RatingForm listingId={listingId} onSubmitted={onSubmitted} />
          </div>
        </div>
      </div>
    </div>
  )
}
