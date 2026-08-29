'use client'
import EmptySection from './EmptySection'

/**
 * A titled portfolio card. When `filled` is false it renders the EmptySection placeholder
 * (an "Add …" CTA for the owner, a muted line for visitors) instead of `children`.
 */
export default function PortfolioSection({ id, title, filled, addLabel, isOwner, editHref, children }) {
  // Keep public portfolios clean — visitors don't see empty optional sections at all; the
  // owner sees an "Add …" prompt in their place.
  if (!filled && !isOwner) return null

  return (
    <section id={id} className="yp-portfolio-section yp-card p-6">
      <h2 className="font-bold text-lg mb-3" style={{ color: 'var(--yp-ink)' }}>{title}</h2>
      {filled ? children : <EmptySection addLabel={addLabel} isOwner={isOwner} editHref={editHref} />}
    </section>
  )
}
