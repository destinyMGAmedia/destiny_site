'use client'
import { Sparkles } from 'lucide-react'
import { getProfilePrompts, getProfileCompleteness } from '@/lib/yellowpages/profileCompleteness'

/**
 * The LinkedIn-style "complete your profile" card — a live progress bar plus a short list of
 * the highest-priority missing fields, each with a one-line reason and a jump link to that
 * field. Reflects the current in-progress form state, so it updates as the person fills things
 * in (used inside ListingForm's edit mode).
 */
export default function ProfileCompleteness({ listing, maxPrompts = 3 }) {
  const completeness = getProfileCompleteness(listing)
  const prompts = getProfilePrompts(listing)

  if (prompts.length === 0) {
    return (
      <div className="yp-card p-4 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--yp-yellow-700)' }}>
        <Sparkles size={16} /> Your profile is complete — nice work!
      </div>
    )
  }

  return (
    <div className="yp-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--yp-ink)' }}>Profile strength</span>
        <span className="text-sm font-bold" style={{ color: 'var(--yp-yellow-700)' }}>{completeness}%</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--yp-yellow-100)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${completeness}%`, background: 'var(--yp-yellow-600)' }} />
      </div>
      <ul className="space-y-2">
        {prompts.slice(0, maxPrompts).map((p) => (
          <li key={p.key} className="text-sm">
            <a href={`#${p.anchor}`} className="font-semibold underline" style={{ color: 'var(--yp-ink)' }}>
              {p.label}
            </a>
            <span style={{ color: 'var(--yp-ink-soft)' }}> — {p.why}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
