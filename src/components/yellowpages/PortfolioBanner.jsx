'use client'
import { Briefcase } from 'lucide-react'

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

/**
 * Portfolio cover for the detail page. Uses `bannerImageUrl`, then (for individuals) the
 * professional `photoUrl`, then a solid yellow block. The avatar/logo floats over the bottom
 * edge; callers render the name/headline/actions below. Pass `onPreview(url)` to make the
 * cover and avatar images open in a full-screen lightbox.
 */
export default function PortfolioBanner({ listing, onPreview }) {
  const isIndividual = listing.listingType === 'INDIVIDUAL'
  const cover = listing.bannerImageUrl || (isIndividual ? listing.photoUrl : null)
  const avatar = isIndividual ? listing.photoUrl : listing.logoUrl

  const preview = (url) => (onPreview && url ? () => onPreview(url) : undefined)

  return (
    <div className="relative mb-14">
      <div className="yp-banner">
        {cover && (
          <button
            type="button"
            onClick={preview(cover)}
            className={`block w-full h-full ${onPreview ? 'yp-zoomable' : ''}`}
            aria-label="Preview banner image"
            disabled={!onPreview}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover} alt="" className="yp-banner-img" />
          </button>
        )}
      </div>

      <div className="absolute -bottom-10 left-5 sm:left-8">
        {avatar ? (
          <button
            type="button"
            onClick={preview(avatar)}
            className={onPreview ? 'yp-zoomable' : undefined}
            aria-label={`Preview ${isIndividual ? 'profile' : 'logo'} image`}
            disabled={!onPreview}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar}
              alt={listing.name}
              className={`w-24 h-24 object-cover border-4 ${isIndividual ? 'rounded-full' : 'rounded-2xl'}`}
              style={{ borderColor: 'var(--yp-cream)', background: 'var(--yp-surface)' }}
            />
          </button>
        ) : (
          <div
            className={`w-24 h-24 flex items-center justify-center border-4 text-2xl font-bold ${isIndividual ? 'rounded-full' : 'rounded-2xl'}`}
            style={{ borderColor: 'var(--yp-cream)', background: 'var(--yp-yellow-100)', color: 'var(--yp-yellow-700)' }}
          >
            {isIndividual ? initials(listing.name) : <Briefcase size={30} style={{ color: 'var(--yp-yellow-600)' }} />}
          </div>
        )}
      </div>
    </div>
  )
}
