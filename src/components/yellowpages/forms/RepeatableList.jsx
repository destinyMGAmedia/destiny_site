'use client'
import { X, Plus } from 'lucide-react'

/**
 * Generic add/remove list of structured rows (experience, education, projects, team). The
 * parent owns the array and supplies `makeEmpty` plus a render function for one row via
 * `children({ item, index, update })` — `update(patch)` shallow-merges into that row.
 */
export default function RepeatableList({ id, title, hint, items = [], onChange, makeEmpty, addLabel = 'Add', max, children }) {
  const updateAt = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const removeAt = (i) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => {
    if (max && items.length >= max) return
    onChange([...items, makeEmpty()])
  }

  return (
    <div id={id}>
      <div className="flex items-center justify-between mb-2">
        <span className="yp-label" style={{ marginBottom: 0 }}>{title}</span>
        {max ? <span className="text-xs" style={{ color: 'var(--yp-ink-soft)' }}>{items.length}/{max}</span> : null}
      </div>
      {hint && <p className="text-xs mb-2" style={{ color: 'var(--yp-ink-soft)' }}>{hint}</p>}

      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="yp-card p-4 pt-8 relative">
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-2 right-2 p-1 rounded-full"
              style={{ background: 'var(--yp-yellow-100)' }}
              aria-label={`Remove ${title} entry ${i + 1}`}
            >
              <X size={13} />
            </button>
            {children({ item, index: i, update: (patch) => updateAt(i, patch) })}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={Boolean(max && items.length >= max)}
        className="yp-btn-outline !py-1.5 !px-3 mt-3 text-sm"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </div>
  )
}
