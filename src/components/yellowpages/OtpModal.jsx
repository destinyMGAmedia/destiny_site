'use client'
import { useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { OTP_CODE_LENGTH } from '@/lib/yellowpages/constants'

/**
 * Enter-the-code dialog for the owner-edit flow. `onVerify(code)` should resolve to
 * `{ error }` (a string to show) or `{ error: null }` on success.
 */
export default function OtpModal({ maskedTo, onVerify, onResend, onClose }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const [resent, setResent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (code.trim().length !== OTP_CODE_LENGTH) {
      setError(`Enter the ${OTP_CODE_LENGTH}-digit code.`)
      return
    }
    setStatus('verifying')
    setError('')
    const res = await onVerify(code.trim())
    if (res?.error) {
      setError(res.error)
      setStatus('idle')
    }
    // on success the parent unmounts this modal
  }

  const resend = async () => {
    setError('')
    setResent(false)
    const res = await onResend?.()
    if (res?.error) setError(res.error)
    else setResent(true)
  }

  return (
    <div className="yp-modal-backdrop" role="dialog" aria-modal="true" aria-label="Enter verification code">
      <div className="yp-modal p-6" style={{ maxWidth: 420 }}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2 className="font-bold text-lg" style={{ color: 'var(--yp-ink)' }}>Enter your code</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--yp-ink-soft)' }}>
          We sent a {OTP_CODE_LENGTH}-digit code to <strong>{maskedTo}</strong>. It expires in 10 minutes.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="yp-input text-center tracking-[0.5em] text-lg font-semibold"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={OTP_CODE_LENGTH}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            aria-label="Verification code"
            autoFocus
          />

          {error && (
            <p className="flex items-center gap-1 text-red-600 text-sm">
              <AlertCircle size={14} /> {error}
            </p>
          )}
          {resent && !error && (
            <p className="text-sm" style={{ color: 'var(--yp-yellow-700)' }}>A new code is on its way.</p>
          )}

          <button type="submit" disabled={status === 'verifying'} className="yp-btn-primary w-full justify-center">
            {status === 'verifying' ? <><Loader2 size={15} className="animate-spin" /> Verifying…</> : 'Verify'}
          </button>
        </form>

        {onResend && (
          <button type="button" onClick={resend} className="mt-3 text-sm font-semibold underline" style={{ color: 'var(--yp-yellow-700)' }}>
            Resend code
          </button>
        )}
      </div>
    </div>
  )
}
