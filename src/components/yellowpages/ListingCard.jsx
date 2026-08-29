'use client'
import Link from 'next/link'
import { MapPin, Briefcase, User } from 'lucide-react'
import { useYellowPagesBase } from './shared/YellowPagesChrome'
import { categoryLabel } from '@/lib/yellowpages/constants'
import RatingStars from './RatingStars'

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

function Stars({ listing }) {
  if (!listing.ratingCount) return null
  return (
    <span className="flex items-center gap-1 text-xs shrink-0" style={{ color: 'var(--yp-ink-soft)' }}>
      <RatingStars value={listing.avgRating} size={13} /> ({listing.ratingCount})
    </span>
  )
}

/** A single feed item — the "post" unit of the timeline. Layout differs by listing type. */
export default function ListingCard({ listing }) {
  const base = useYellowPagesBase()
  const location = [listing.city, listing.state, listing.country].filter(Boolean).join(', ')
  const cover = listing.portfolioImages?.[0] || listing.bannerImageUrl
  const isIndividual = listing.listingType === 'INDIVIDUAL'
  const skills = Array.isArray(listing.skills) ? listing.skills.slice(0, 3) : []

  return (
    <Link href={`${base}/listing/${listing.id}`} className="yp-card block p-5">
      <div className="flex items-start gap-3">
        {isIndividual ? (
          listing.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.photoUrl} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: 'var(--yp-yellow-100)', color: 'var(--yp-yellow-700)' }}>
              {initials(listing.name)}
            </div>
          )
        ) : listing.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.logoUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--yp-yellow-100)' }}>
            <Briefcase size={20} style={{ color: 'var(--yp-yellow-600)' }} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base leading-tight truncate">{listing.name}</h3>
            <Stars listing={listing} />
          </div>

          {isIndividual && listing.headline && (
            <p className="text-sm truncate mt-0.5" style={{ color: 'var(--yp-ink-soft)' }}>{listing.headline}</p>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="yp-pill shrink-0">{categoryLabel(listing.category)}</span>
            {!isIndividual && listing.categories?.length > 0 && (
              <span className="yp-pill shrink-0" style={{ background: 'var(--yp-yellow-100)' }}>+{listing.categories.length}</span>
            )}
            {isIndividual && listing.openToWork && (
              <span className="yp-pill shrink-0 flex items-center gap-1" style={{ background: 'var(--yp-yellow-200)', color: 'var(--yp-yellow-800)' }}>
                <User size={11} /> Open to work
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1 text-xs min-w-0 max-w-full" style={{ color: 'var(--yp-ink-soft)' }}>
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            )}
          </div>

          {isIndividual && skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--yp-yellow-100)', color: 'var(--yp-ink-soft)' }}>
                  {s}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm mt-3 line-clamp-3" style={{ color: 'var(--yp-ink-soft)' }}>
            {(!isIndividual && listing.servicesOffered) || listing.description}
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
