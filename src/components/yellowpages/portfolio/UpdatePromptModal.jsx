'use client'
import { X, Sparkles, Plus } from 'lucide-react'

/**
 * One-time nudge shown to the owner when their portfolio has several empty sections. Lists the
 * missing pieces, each linking into the edit form.
 */
export default function UpdatePromptModal({ missing = [], editHref, onClose }) {
  if (!missing.length) return null
  return (
    <div className="yp-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Complete your portfolio">
      <div className="yp-modal p-6" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--yp-ink)' }}>
            <Sparkles size={18} style={{ color: 'var(--yp-yellow-600)' }} /> Make your portfolio shine
          </h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--yp-ink-soft)' }}>
          A few sections are still empty. Filling them in helps people take you seriously.
        </p>
        <ul className="space-y-2 mb-5">
          {missing.map((s) => (
            <li key={s.key}>
              <a href={`${editHref}#${s.anchor}`} className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--yp-ink)' }}>
                <Plus size={14} style={{ color: 'var(--yp-yellow-600)' }} /> {s.addLabel}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex gap-3">
          <a href={editHref} className="yp-btn-primary flex-1 justify-center">Edit my portfolio</a>
          <button type="button" onClick={onClose} className="yp-btn-outline">Later</button>
        </div>
      </div>
    </div>
  )
}
