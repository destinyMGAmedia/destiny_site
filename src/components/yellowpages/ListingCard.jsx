'use client'
import Link from 'next/link'
import { MapPin, Briefcase } from 'lucide-react'
import { useYellowPagesBase } from './shared/YellowPagesChrome'
import { categoryLabel } from '@/lib/yellowpages/constants'
import RatingStars from './RatingStars'

export default function ListingCard({ listing }) {
  const base = useYellowPagesBase()
  const location = [listing.city, listing.state, listing.country].filter(Boolean).join(', ')

  return (
    <Link href={`${base}/listing/${listing.id}`} className="yp-card block p-5 h-full">
      <div className="flex items-start gap-3 mb-3">
        {listing.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.logoUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--yp-yellow-100)' }}>
            <Briefcase size={20} style={{ color: 'var(--yp-yellow-600)' }} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-bold text-base leading-tight truncate">{listing.name}</h3>
          <span className="yp-pill mt-1">{categoryLabel(listing.category)}</span>
        </div>
      </div>

      <p className="text-sm mb-3 line-clamp-3" style={{ color: 'var(--yp-ink-soft)' }}>
        {listing.description}
      </p>

      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
        {location ? (
          <span className="flex items-center gap-1 truncate">
            <MapPin size={13} /> {location}
          </span>
        ) : <span />}
        {listing.ratingCount > 0 ? (
          <span className="flex items-center gap-1 shrink-0">
            <RatingStars value={listing.avgRating} size={13} />
            <span>({listing.ratingCount})</span>
          </span>
        ) : (
          <span className="shrink-0 italic">No reviews yet</span>
        )}
      </div>
    </Link>
  )
}
