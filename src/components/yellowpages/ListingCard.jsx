'use client'
import Link from 'next/link'
import { MapPin, Briefcase } from 'lucide-react'
import { useYellowPagesBase } from './shared/YellowPagesChrome'
import { categoryLabel } from '@/lib/yellowpages/constants'
import RatingStars from './RatingStars'

/** A single feed item — the "post" unit of the timeline. */
export default function ListingCard({ listing }) {
  const base = useYellowPagesBase()
  const location = [listing.city, listing.state, listing.country].filter(Boolean).join(', ')
  const cover = listing.portfolioImages?.[0]

  return (
    <Link href={`${base}/listing/${listing.id}`} className="yp-card block p-5">
      <div className="flex items-start gap-3">
        {listing.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.logoUrl} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--yp-yellow-100)' }}>
            <Briefcase size={20} style={{ color: 'var(--yp-yellow-600)' }} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base leading-tight truncate">{listing.name}</h3>
            {listing.ratingCount > 0 ? (
              <span className="flex items-center gap-1 text-xs shrink-0" style={{ color: 'var(--yp-ink-soft)' }}>
                <RatingStars value={listing.avgRating} size={13} /> ({listing.ratingCount})
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="yp-pill shrink-0">{categoryLabel(listing.category)}</span>
            {location && (
              <span className="flex items-center gap-1 text-xs min-w-0 max-w-full" style={{ color: 'var(--yp-ink-soft)' }}>
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            )}
          </div>

          <p className="text-sm mt-3 line-clamp-3" style={{ color: 'var(--yp-ink-soft)' }}>
            {listing.description}
          </p>
        </div>
      </div>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="w-full h-56 object-cover rounded-xl mt-4" />
      )}
    </Link>
  )
}
