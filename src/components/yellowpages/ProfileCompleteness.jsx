'use client'
import { Sparkles } from 'lucide-react'
import { missingPortfolioSections, portfolioCompleteness } from '@/lib/yellowpages/portfolio'

/**
 * The "complete your portfolio" card — a live progress bar plus the highest-priority empty
 * sections, each a jump link to that part of the form. Reflects the in-progress form state, so
 * it updates as fields are filled in (used inside ListingForm).
 */
export default function ProfileCompleteness({ listing, maxPrompts = 4 }) {
  const completeness = portfolioCompleteness(listing)
  const missing = missingPortfolioSections(listing)

  if (missing.length === 0) {
    return (
      <div className="yp-card p-4 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--yp-yellow-700)' }}>
        <Sparkles size={16} /> Your portfolio is complete — nice work!
      </div>
    )
  }

  return (
    <div className="yp-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--yp-ink)' }}>Portfolio strength</span>
        <span className="text-sm font-bold" style={{ color: 'var(--yp-yellow-700)' }}>{completeness}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--yp-yellow-100)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${completeness}%`, background: 'var(--yp-yellow-600)' }} />
      </div>
      <ul className="space-y-1.5">
        {missing.slice(0, maxPrompts).map((s) => (
          <li key={s.key} className="text-sm">
            <a href={`#${s.anchor}`} className="font-semibold underline" style={{ color: 'var(--yp-ink)' }}>
              {s.addLabel}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
