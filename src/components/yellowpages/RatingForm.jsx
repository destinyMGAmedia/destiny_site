'use client'
import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import RatingStars from './RatingStars'

const sanitizePhone = (value) => (value || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')

/**
 * Rating submission form shown on the listing detail page. No login — dedupe is enforced
 * server-side by hashed contact (see spec/theyellowpages.md "Invariants").
 */
export default function RatingForm({ listingId, onSubmitted }) {
  const [stars, setStars] = useState(0)
  const [reviewerName, setReviewerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [submitError, setSubmitError] = useState('')
  const [wasUpdate, setWasUpdate] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = {}
    if (!stars) nextErrors.stars = 'Please choose a star rating.'
    if (!reviewerName.trim()) nextErrors.reviewerName = 'Your name is required.'
    if (!phone.trim() && !email.trim()) nextErrors.contact = 'Please provide your phone number or email.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    setErrors({})
    setSubmitError('')
    setStatus('loading')

    try {
      const res = await fetch(`/api/yellowpages/listings/${listingId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stars, reviewerName: reviewerName.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, comment: comment.trim() || undefined }),
      })
      const data = await res.json()

      if (res.ok) {
        setWasUpdate(Boolean(data.updated))
        setStatus('success')
        onSubmitted?.(data.rating)
      } else if (data.errors) {
        setErrors(data.errors)
        setStatus('idle')
      } else {
        setSubmitError(data.error || 'Something went wrong. Please try again.')
        setStatus('idle')
      }
    } catch {
      setSubmitError('Something went wrong. Please try again.')
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold" style={{ color: 'var(--yp-ink-soft)' }}>
          {wasUpdate ? 'Your review has been updated.' : 'Thanks for your review!'}
        </p>
        <button
          type="button"
          onClick={() => { setStatus('idle'); setSubmitError('') }}
          className="text-sm font-semibold underline"
          style={{ color: 'var(--yp-yellow-700)' }}
        >
          Edit your review
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="yp-label">Your Rating *</span>
        <RatingStars value={stars} interactive size={24} onChange={setStars} />
        {errors.stars && <p className="flex items-center gap-1 text-red-600 text-xs mt-1"><AlertCircle size={12} /> {errors.stars}</p>}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="yp-label" htmlFor="yp-rating-name">Your Name *</label>
          <input id="yp-rating-name" className="yp-input" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
          {errors.reviewerName && <p className="flex items-center gap-1 text-red-600 text-xs mt-1"><AlertCircle size={12} /> {errors.reviewerName}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="yp-label" htmlFor="yp-rating-phone">Phone</label>
          <input id="yp-rating-phone" className="yp-input" type="tel" value={phone} onChange={(e) => setPhone(sanitizePhone(e.target.value))} />
        </div>
        <div>
          <label className="yp-label" htmlFor="yp-rating-email">Email</label>
          <input id="yp-rating-email" className="yp-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      {errors.contact && <p className="flex items-center gap-1 text-red-600 text-xs -mt-2"><AlertCircle size={12} /> {errors.contact}</p>}
      <p className="text-xs -mt-2" style={{ color: 'var(--yp-ink-soft)' }}>
        Never shown publicly beyond your first name. Reviewed before? Submit again with the same
        phone or email and we&rsquo;ll update your existing review.
      </p>

      <div>
        <label className="yp-label" htmlFor="yp-rating-comment">Comment (optional)</label>
        <textarea id="yp-rating-comment" className="yp-textarea" value={comment} onChange={(e) => setComment(e.target.value)} />
      </div>

      {submitError && <p className="flex items-center gap-1 text-red-600 text-sm"><AlertCircle size={16} /> {submitError}</p>}

      <button type="submit" disabled={status === 'loading'} className="yp-btn-primary">
        {status === 'loading' ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}
