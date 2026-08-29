'use client'
import { Plus } from 'lucide-react'

/**
 * Placeholder shown in place of an empty portfolio section. The owner gets an "Add …" call to
 * action linking into the edit flow; visitors just see a muted "not added yet" line.
 */
export default function EmptySection({ addLabel, isOwner, editHref }) {
  if (!isOwner) {
    return <p className="yp-empty-hint">Not added yet.</p>
  }
  return (
    <a href={editHref} className="yp-empty-hint flex items-center justify-center gap-1.5 font-semibold" style={{ color: 'var(--yp-yellow-700)' }}>
      <Plus size={15} /> {addLabel}
    </a>
  )
}
