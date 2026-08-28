'use client'
import { useState } from 'react'
import { X } from 'lucide-react'

/**
 * Chip / tag input backed by a string[]. Commit a tag with Enter or comma; Backspace on an
 * empty field removes the last one. Used for skills, languages, and editor contacts.
 */
export default function TagInput({ id, label, hint, values = [], onChange, placeholder = 'Type and press Enter', max, error }) {
  const [draft, setDraft] = useState('')

  const add = (raw) => {
    const v = (raw || '').trim().replace(/,$/, '').trim()
    setDraft('')
    if (!v) return
    if (max && values.length >= max) return
    if (values.some((x) => x.toLowerCase() === v.toLowerCase())) return
    onChange([...values, v])
  }
  const removeAt = (i) => onChange(values.filter((_, idx) => idx !== i))

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && values.length) {
      removeAt(values.length - 1)
    }
  }

  return (
    <div>
      {label && (
        <label className="yp-label" htmlFor={id}>
          {label}
          {max ? <span className="font-normal text-xs" style={{ color: 'var(--yp-ink-soft)' }}> ({values.length}/{max})</span> : null}
        </label>
      )}
      <div className="yp-input flex flex-wrap gap-1.5 !h-auto py-1.5" style={{ minHeight: 42 }}>
        {values.map((v, i) => (
          <span
            key={`${v}-${i}`}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
            style={{ background: 'var(--yp-yellow-100)', color: 'var(--yp-ink)' }}
          >
            {v}
            <button type="button" onClick={() => removeAt(i)} aria-label={`Remove ${v}`}>
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          id={id}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ minWidth: '8ch' }}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={values.length ? '' : placeholder}
        />
      </div>
      {error && <p className="mt-1 text-red-600 text-xs">{error}</p>}
      {hint && <p className="mt-1 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>{hint}</p>}
    </div>
  )
}
