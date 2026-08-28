'use client'
import { useEffect, useMemo, useState } from 'react'
import { MapPin, MessageSquare, FileDown, Pencil, BriefcaseBusiness } from 'lucide-react'
import RatingStars from '../RatingStars'
import PortfolioBanner from '../PortfolioBanner'
import { useImageLightbox } from '../ImageLightbox'
import ReviewsModal from '../ReviewsModal'
import ContactCard from './ContactCard'
import PortfolioSection from './PortfolioSection'
import UpdatePromptModal from './UpdatePromptModal'
import { useYellowPagesBase } from '../shared/YellowPagesChrome'
import { categoryLabel } from '@/lib/yellowpages/constants'
import { portfolioSections, missingPortfolioSections } from '@/lib/yellowpages/portfolio'

const dateRange = (start, end, current) => {
  const s = (start || '').trim()
  const e = current ? 'Present' : (end || '').trim()
  return [s, e].filter(Boolean).join(' – ')
}

export default function PersonalPortfolioView({ listing, listingId, onReload }) {
  const base = useYellowPagesBase()
  const editHref = `${base}/manage?listingId=${listingId}`
  const [showReviews, setShowReviews] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const lightbox = useImageLightbox()

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
  const about = listing.resumeSummary || listing.description
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
      <PortfolioBanner listing={listing} onPreview={(url) => lightbox.open(url)} />

      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold break-words" style={{ fontFamily: 'var(--font-serif)', color: 'var(--yp-ink)' }}>
              {listing.name}
            </h1>
            {listing.headline && <p className="text-sm mt-1" style={{ color: 'var(--yp-ink-soft)' }}>{listing.headline}</p>}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="yp-pill shrink-0">{categoryLabel(listing.category)}</span>
              {listing.openToWork && (
                <span className="yp-pill shrink-0" style={{ background: 'var(--yp-yellow-200)', color: 'var(--yp-yellow-800)' }}>
                  Open to work
                </span>
              )}
              {location && (
                <span className="flex items-center gap-1 text-sm min-w-0" style={{ color: 'var(--yp-ink-soft)' }}>
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{location}</span>
                </span>
              )}
            </div>
          </div>
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
          <a href={`/api/yellowpages/listings/${listingId}/resume`} className="yp-btn-outline !py-2 !px-4">
            <FileDown size={15} /> Download Résumé
          </a>
          <a href={editHref} className="yp-btn-outline !py-2 !px-4">
            <Pencil size={15} /> Edit
          </a>
        </div>
      </div>

      <div className="space-y-6">
        <PortfolioSection title="About" {...commonSectionProps('about')}>
          <p className="whitespace-pre-line" style={{ color: 'var(--yp-ink-soft)' }}>{about}</p>
        </PortfolioSection>

        <PortfolioSection title="Skills" {...commonSectionProps('skills')}>
          <div className="flex flex-wrap gap-2">
            {(listing.skills || []).map((s) => (
              <span key={s} className="yp-pill">{s}</span>
            ))}
          </div>
        </PortfolioSection>

        <PortfolioSection title="Experience" {...commonSectionProps('experience')}>
          <ol className="space-y-4">
            {(listing.experience || []).map((x, i) => (
              <li key={i} className="relative pl-4 border-l-2" style={{ borderColor: 'var(--yp-yellow-200)' }}>
                <p className="font-semibold" style={{ color: 'var(--yp-ink)' }}>
                  {[x.title, x.organization].filter(Boolean).join(' · ')}
                </p>
                <p className="text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
                  {[dateRange(x.startDate, x.endDate, x.current), x.location].filter(Boolean).join(' · ')}
                </p>
                {x.description && <p className="text-sm mt-1 whitespace-pre-line" style={{ color: 'var(--yp-ink-soft)' }}>{x.description}</p>}
              </li>
            ))}
          </ol>
        </PortfolioSection>

        <PortfolioSection title="Education" {...commonSectionProps('education')}>
          <ol className="space-y-4">
            {(listing.education || []).map((x, i) => (
              <li key={i} className="relative pl-4 border-l-2" style={{ borderColor: 'var(--yp-yellow-200)' }}>
                <p className="font-semibold" style={{ color: 'var(--yp-ink)' }}>
                  {[x.degree, x.field].filter(Boolean).join(', ') || x.school}
                </p>
                <p className="text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
                  {[x.school && [x.degree, x.field].filter(Boolean).length ? x.school : null, dateRange(x.startYear, x.endYear)].filter(Boolean).join(' · ')}
                </p>
                {x.description && <p className="text-sm mt-1" style={{ color: 'var(--yp-ink-soft)' }}>{x.description}</p>}
              </li>
            ))}
          </ol>
        </PortfolioSection>

        <PortfolioSection title="Projects" {...commonSectionProps('projects')}>
          <ul className="space-y-4">
            {(listing.projects || []).map((x, i) => (
              <li key={i}>
                <p className="font-semibold" style={{ color: 'var(--yp-ink)' }}>
                  {[x.name, x.role].filter(Boolean).join(' — ')}
                </p>
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

        <PortfolioSection id="yp-portfolio-section" title="Work Samples" filled={sec('gallery')} addLabel={addLabelFor('gallery')} isOwner={isOwner} editHref={editHref}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(listing.portfolioImages || []).map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => lightbox.open(listing.portfolioImages, i)}
                className="yp-zoomable block"
                aria-label={`Preview work sample ${i + 1}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full aspect-square object-cover rounded-lg" />
              </button>
            ))}
          </div>
        </PortfolioSection>

        <PortfolioSection title="Languages" {...commonSectionProps('languages')}>
          <div className="flex flex-wrap gap-2">
            {(listing.languages || []).map((l) => (
              <span key={l} className="yp-pill">{l}</span>
            ))}
          </div>
        </PortfolioSection>

        <PortfolioSection title="Credentials" {...commonSectionProps('credentials')}>
          <div className="space-y-1 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
            {listing.certifications && <p>{listing.certifications}</p>}
            {listing.availability && <p className="flex items-center gap-1"><BriefcaseBusiness size={13} /> {listing.availability}</p>}
            {listing.yearsInOperation != null && <p>{listing.yearsInOperation} years of experience</p>}
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
      {lightbox.node}
    </div>
  )
}
