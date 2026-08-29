'use client'
import { useRef, useState } from 'react'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { OTP_CODE_LENGTH } from '@/lib/yellowpages/constants'

/**
 * Enter-the-code dialog for the owner-verify flow. Verifies **automatically** the moment the
 * full code is entered — no button press. `onVerify(code)` resolves to `{ error }` (a string
 * to show) or `{ error: null }` on success (the parent then unmounts this modal).
 */
export default function OtpModal({ maskedTo, onVerify, onResend, onClose }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')
  const [resent, setResent] = useState(false)
  const triedRef = useRef('')

  const verify = async (value) => {
    if (value.length !== OTP_CODE_LENGTH || status === 'verifying') return
    triedRef.current = value
    setStatus('verifying')
    setError('')
    setResent(false)
    const res = await onVerify(value)
    if (res?.error) {
      setError(res.error)
      setStatus('idle')
    }
    // on success the parent unmounts this modal
  }

  const handleChange = (raw) => {
    const next = raw.replace(/\D/g, '').slice(0, OTP_CODE_LENGTH)
    setCode(next)
    if (error) setError('')
    // Auto-submit once complete. Skip if it's the exact code we just tried (avoids a loop on
    // a wrong code); editing any digit makes it eligible again.
    if (next.length === OTP_CODE_LENGTH && next !== triedRef.current) verify(next)
  }

  const resend = async () => {
    setError('')
    setResent(false)
    triedRef.current = ''
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
          We sent a {OTP_CODE_LENGTH}-digit code to <strong>{maskedTo}</strong>. It verifies
          automatically once you finish typing. Expires in 10 minutes.
        </p>

        <input
          className="yp-input text-center tracking-[0.5em] text-lg font-semibold"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_CODE_LENGTH}
          value={code}
          onChange={(e) => handleChange(e.target.value)}
          disabled={status === 'verifying'}
          aria-label="Verification code"
          autoFocus
        />

        {status === 'verifying' && (
          <p className="flex items-center gap-1 text-sm mt-3" style={{ color: 'var(--yp-ink-soft)' }}>
            <Loader2 size={14} className="animate-spin" /> Verifying…
          </p>
        )}

        {error && (
          <>
            <p className="flex items-center gap-1 text-red-600 text-sm mt-3">
              <AlertCircle size={14} /> {error}
            </p>
            {code.length === OTP_CODE_LENGTH && status !== 'verifying' && (
              <button
                type="button"
                onClick={() => { triedRef.current = ''; verify(code) }}
                className="yp-btn-primary w-full justify-center mt-3"
              >
                Try again
              </button>
            )}
          </>
        )}

        {resent && !error && (
          <p className="text-sm mt-3" style={{ color: 'var(--yp-yellow-700)' }}>A new code is on its way.</p>
        )}

        {onResend && (
          <button type="button" onClick={resend} className="mt-3 text-sm font-semibold underline" style={{ color: 'var(--yp-yellow-700)' }}>
            Resend code
          </button>
        )}
      </div>
    </div>
  )
}
