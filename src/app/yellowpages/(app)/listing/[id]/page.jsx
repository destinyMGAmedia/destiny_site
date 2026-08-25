'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Phone, Mail, MessageCircle, Globe, MapPin, Briefcase, Loader2 } from 'lucide-react'
import RatingStars from '@/components/yellowpages/RatingStars'
import RatingForm from '@/components/yellowpages/RatingForm'
import { categoryLabel } from '@/lib/yellowpages/constants'

const CONTACT_ICON = { PHONE: Phone, WHATSAPP: MessageCircle, EMAIL: Mail }

export default function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [status, setStatus] = useState('loading')

  const load = () => {
    fetch(`/api/yellowpages/listings/${id}`)
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => { setListing(data.listing); setStatus('ready') })
      .catch(() => setStatus('error'))
  }

  useEffect(() => {
    if (id) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-24" style={{ color: 'var(--yp-ink-soft)' }}>
        <Loader2 size={20} className="animate-spin mr-2" /> Loading…
      </div>
    )
  }

  if (status === 'error' || !listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Listing Not Found</h1>
        <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>This listing may have been removed.</p>
      </div>
    )
  }

  const location = [listing.city, listing.state, listing.country].filter(Boolean).join(', ')
  const PreferredIcon = CONTACT_ICON[listing.preferredContact] || Phone
  const socialLinks = Object.entries(listing.socialLinks || {}).filter(([, v]) => v)

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <div className="flex items-start gap-4 mb-6">
        {listing.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.logoUrl} alt={`${listing.name} logo`} className="w-16 h-16 rounded-xl object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-xl flex items-center justify-center" style={{ background: 'var(--yp-yellow-100)' }}>
            <Briefcase size={26} style={{ color: 'var(--yp-yellow-600)' }} />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-serif)', color: 'var(--yp-ink)' }}>{listing.name}</h1>
          {listing.contactPersonName && listing.contactPersonName !== listing.name && (
            <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
              {listing.contactPersonName}{listing.position ? `, ${listing.position}` : ''}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="yp-pill">{categoryLabel(listing.category)}</span>
            {location && (
              <span className="flex items-center gap-1 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
                <MapPin size={14} /> {location}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {listing.ratingCount > 0 ? (
          <>
            <RatingStars value={listing.avgRating} />
            <span className="text-sm font-semibold">{listing.avgRating.toFixed(1)}</span>
            <span className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>({listing.ratingCount} review{listing.ratingCount === 1 ? '' : 's'})</span>
          </>
        ) : (
          <span className="text-sm italic" style={{ color: 'var(--yp-ink-soft)' }}>No reviews yet</span>
        )}
      </div>

      <div className="yp-card p-6 mb-8">
        <h2 className="font-bold text-lg mb-2">About</h2>
        <p className="whitespace-pre-line" style={{ color: 'var(--yp-ink-soft)' }}>{listing.description}</p>

        {listing.servicesOffered && (
          <>
            <h3 className="font-bold text-sm mt-5 mb-1">Products/Services</h3>
            <p style={{ color: 'var(--yp-ink-soft)' }}>{listing.servicesOffered}</p>
          </>
        )}

        {listing.certifications && (
          <>
            <h3 className="font-bold text-sm mt-5 mb-1">Certifications/Memberships</h3>
            <p style={{ color: 'var(--yp-ink-soft)' }}>{listing.certifications}</p>
          </>
        )}

        {listing.yearsInOperation != null && (
          <p className="text-sm mt-3" style={{ color: 'var(--yp-ink-soft)' }}>{listing.yearsInOperation} years in operation</p>
        )}
      </div>

      {listing.portfolioImages?.length > 0 && (
        <div className="yp-card p-6 mb-8">
          <h2 className="font-bold text-lg mb-3">Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {listing.portfolioImages.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
            ))}
          </div>
        </div>
      )}

      <div className="yp-card p-6 mb-8">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          Contact <PreferredIcon size={16} style={{ color: 'var(--yp-yellow-600)' }} />
        </h2>
        <div className="flex flex-wrap gap-3">
          <a href={`tel:${listing.phone}`} className="yp-btn-outline !py-2 !px-4">
            <Phone size={15} /> Call
          </a>
          {listing.whatsapp && (
            <a href={`https://wa.me/${listing.whatsapp.replace(/^\+/, '')}`} className="yp-btn-outline !py-2 !px-4">
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
          {listing.email && (
            <a href={`mailto:${listing.email}`} className="yp-btn-outline !py-2 !px-4">
              <Mail size={15} /> Email
            </a>
          )}
          {listing.website && (
            <a href={listing.website} target="_blank" rel="noopener noreferrer" className="yp-btn-outline !py-2 !px-4">
              <Globe size={15} /> Website
            </a>
          )}
        </div>
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3 text-sm">
            {socialLinks.map(([key, value]) => (
              <span key={key} className="yp-pill">{key}: {value}</span>
            ))}
          </div>
        )}
      </div>

      <div className="yp-card p-6 mb-8">
        <h2 className="font-bold text-lg mb-3">Reviews</h2>
        {listing.ratings.length === 0 ? (
          <p className="text-sm mb-5" style={{ color: 'var(--yp-ink-soft)' }}>No reviews yet — be the first to leave one.</p>
        ) : (
          <ul className="space-y-4 mb-6">
            {listing.ratings.map((r) => (
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
        <RatingForm listingId={id} onSubmitted={load} />
      </div>
    </div>
  )
}
