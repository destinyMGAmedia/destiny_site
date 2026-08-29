'use client'
import { ArrowLeft } from 'lucide-react'

/**
 * "Back to the listing" affordance for every inner Yellow Pages page (verify, edit, résumé,
 * reviews…). Renders an <a> when given `href`, or a <button> when given `onClick` (for modals).
 */
export default function BackLink({ href, onClick, label = 'Back to portfolio', className = '' }) {
  const cls = `inline-flex items-center gap-1 text-sm font-medium ${className}`
  const style = { color: 'var(--yp-ink-soft)' }
  const inner = (
    <>
      <ArrowLeft size={14} /> {label}
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} className={cls} style={style}>
      {inner}
    </button>
  ) : (
    <a href={href} className={cls} style={style}>
      {inner}
    </a>
  )
}
