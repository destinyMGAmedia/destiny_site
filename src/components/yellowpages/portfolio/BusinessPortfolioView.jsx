'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MapPin, MessageSquare, Pencil } from 'lucide-react'
import RatingStars from '../RatingStars'
import PortfolioBanner from '../PortfolioBanner'
import ReviewsModal from '../ReviewsModal'
import ContactCard from './ContactCard'
import PortfolioSection from './PortfolioSection'
import UpdatePromptModal from './UpdatePromptModal'
import { useYellowPagesBase } from '../shared/YellowPagesChrome'
import { categoryLabel } from '@/lib/yellowpages/constants'
import { portfolioSections, missingPortfolioSections } from '@/lib/yellowpages/portfolio'

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export default function BusinessPortfolioView({ listing, listingId, onReload }) {
  const base = useYellowPagesBase()
  const editHref = `${base}/manage?listingId=${listingId}`
  const [showReviews, setShowReviews] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)

  const sectionState = useMemo(() => {
    const map = {}
    for (const s of portfolioSections(listing)) map[s.key] = s
    return map
  }, [listing])
  const missing = useMemo(() => missingPortfolioSections(listing), [listing])

  // localStorage is client-only, so this must run after mount (not in a lazy initializer —
  // that would risk a hydration mismatch). The setState calls here are intentional.
  useEffect(() => {
    let owner = false
    let alreadyDismissed = true
    try {
      owner = Boolean(window.localStorage.getItem(`yp:edited:${listingId}`))
      alreadyDismissed = Boolean(window.localStorage.getItem(`yp:promptDismissed:${listingId}`))
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOwner(owner)
    if (owner && !alreadyDismissed && missing.length >= 3) {
      setShowPrompt(true)
    }
  }, [listingId, missing.length])

  const dismissPrompt = () => {
    setShowPrompt(false)
    try {
      window.localStorage.setItem(`yp:promptDismissed:${listingId}`, '1')
    } catch {
      /* ignore */
    }
  }

  const location = [listing.city, listing.state, listing.country].filter(Boolean).join(', ')
  const sec = (key) => Boolean(sectionState[key]?.filled)
  const addLabelFor = (key) => sectionState[key]?.addLabel
  const commonSectionProps = (key) => ({
    id: sectionState[key]?.anchor,
    filled: sec(key),
    addLabel: addLabelFor(key),
    isOwner,
    editHref,
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <PortfolioBanner listing={listing} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold break-words" style={{ fontFamily: 'var(--font-serif)', color: 'var(--yp-ink)' }}>
          {listing.name}
        </h1>
        {listing.contactPersonName && listing.contactPersonName !== listing.name && (
          <p className="text-sm mt-1" style={{ color: 'var(--yp-ink-soft)' }}>
            {listing.contactPersonName}{listing.position ? `, ${listing.position}` : ''}
          </p>
        )}
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="yp-pill shrink-0">{categoryLabel(listing.category)}</span>
          {listing.yearsInOperation != null && (
            <span className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>{listing.yearsInOperation} yrs in operation</span>
          )}
          {location && (
            <span className="flex items-center gap-1 text-sm min-w-0" style={{ color: 'var(--yp-ink-soft)' }}>
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button type="button" onClick={() => setShowReviews(true)} className="yp-btn-outline !py-2 !px-4">
            <MessageSquare size={15} />
            {listing.ratingCount > 0 ? (
              <span className="flex items-center gap-1.5">
                <RatingStars value={listing.avgRating} size={13} />
                {listing.avgRating.toFixed(1)} ({listing.ratingCount})
              </span>
            ) : (
              'Reviews'
            )}
          </button>
          <a href={editHref} className="yp-btn-outline !py-2 !px-4">
            <Pencil size={15} /> Edit
          </a>
        </div>
      </div>

      <div className="space-y-6">
        <PortfolioSection title="About" {...commonSectionProps('about')}>
          <p className="whitespace-pre-line" style={{ color: 'var(--yp-ink-soft)' }}>{listing.description}</p>
        </PortfolioSection>

        <PortfolioSection title="Products & Services" {...commonSectionProps('services')}>
          <p className="whitespace-pre-line" style={{ color: 'var(--yp-ink-soft)' }}>{listing.servicesOffered}</p>
        </PortfolioSection>

        <PortfolioSection title="Projects" {...commonSectionProps('projects')}>
          <ul className="space-y-4">
            {(listing.projects || []).map((x, i) => (
              <li key={i}>
                <p className="font-semibold" style={{ color: 'var(--yp-ink)' }}>{[x.name, x.role].filter(Boolean).join(' — ')}</p>
                {x.url && (
                  <a href={x.url} target="_blank" rel="noopener noreferrer" className="text-xs underline break-all" style={{ color: 'var(--yp-yellow-700)' }}>
                    {x.url}
                  </a>
                )}
                {x.description && <p className="text-sm mt-1 whitespace-pre-line" style={{ color: 'var(--yp-ink-soft)' }}>{x.description}</p>}
              </li>
            ))}
          </ul>
        </PortfolioSection>

        <PortfolioSection title="Team" {...commonSectionProps('team')}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(listing.team || []).map((m, i) => {
              const inner = (
                <>
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt="" className="w-16 h-16 rounded-full object-cover mx-auto" />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center font-bold" style={{ background: 'var(--yp-yellow-100)', color: 'var(--yp-yellow-700)' }}>
                      {initials(m.name)}
                    </div>
                  )}
                  <p className="text-sm font-semibold text-center mt-2" style={{ color: 'var(--yp-ink)' }}>{m.name}</p>
                  {m.role && <p className="text-xs text-center" style={{ color: 'var(--yp-ink-soft)' }}>{m.role}</p>}
                  {m.linkedListingId && <p className="text-xs text-center underline mt-0.5" style={{ color: 'var(--yp-yellow-700)' }}>View profile</p>}
                </>
              )
              return m.linkedListingId ? (
                <Link key={i} href={`${base}/listing/${m.linkedListingId}`} className="yp-card p-3 block">
                  {inner}
                </Link>
              ) : (
                <div key={i} className="yp-card p-3">{inner}</div>
              )
            })}
          </div>
        </PortfolioSection>

        <PortfolioSection id="yp-portfolio-section" title="Gallery" filled={sec('gallery')} addLabel={addLabelFor('gallery')} isOwner={isOwner} editHref={editHref}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(listing.portfolioImages || []).map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
            ))}
          </div>
        </PortfolioSection>

        <PortfolioSection title="Credentials" {...commonSectionProps('credentials')}>
          <div className="space-y-1 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
            {listing.certifications && <p>Certifications: {listing.certifications}</p>}
            {listing.licenseNumber && <p>Registration / License: {listing.licenseNumber}</p>}
            {listing.yearsInOperation != null && <p>{listing.yearsInOperation} years in operation</p>}
          </div>
        </PortfolioSection>

        <ContactCard listing={listing} />
      </div>

      {showReviews && (
        <ReviewsModal
          listing={listing}
          listingId={listingId}
          onClose={() => setShowReviews(false)}
          onSubmitted={() => onReload?.()}
        />
      )}
      {showPrompt && <UpdatePromptModal missing={missing} editHref={editHref} onClose={dismissPrompt} />}
    </div>
  )
}
