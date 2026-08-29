'use client'
import { AlertCircle } from 'lucide-react'

export function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="flex items-center gap-1 text-red-600 text-xs mt-1">
      <AlertCircle size={12} /> {message}
    </p>
  )
}

export function TextField({ id, label, value, onChange, error, hint, type = 'text', placeholder, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="yp-label" htmlFor={id}>{label}</label>}
      <input
        id={id}
        type={type}
        className="yp-input"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <FieldError message={error} />
      {hint && <p className="mt-1 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>{hint}</p>}
    </div>
  )
}

export function TextArea({ id, label, value, onChange, error, hint, placeholder, rows = 3, maxLength }) {
  return (
    <div>
      {label && <label className="yp-label" htmlFor={id}>{label}</label>}
      <textarea
        id={id}
        className="yp-textarea"
        rows={rows}
        maxLength={maxLength}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <FieldError message={error} />
      {hint && <p className="mt-1 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>{hint}</p>}
    </div>
  )
}
