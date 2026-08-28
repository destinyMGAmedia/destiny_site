'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Check, Mail, Loader2, Compass } from 'lucide-react'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import ListingForm from '@/components/yellowpages/ListingForm'
import OtpModal from '@/components/yellowpages/OtpModal'

/** Maps a full listing (from /editable) to ListingForm's initialValues shape. */
function editInitialValues(l) {
  return {
    listingType: l.listingType,
    name: l.name || '',
    contactPersonName: l.contactPersonName || '',
    position: l.position || '',
    phone: l.phone || '',
    whatsapp: l.whatsapp || '',
    email: l.email || '',
    category: l.category,
    subCategory: l.subCategory || '',
    description: l.description || '',
    servicesOffered: l.servicesOffered || '',
    headline: l.headline || '',
    resumeSummary: l.resumeSummary || '',
    bannerImageUrl: l.bannerImageUrl || '',
    availability: l.availability || '',
    openToWork: Boolean(l.openToWork),
    skills: l.skills || [],
    languages: l.languages || [],
    experience: l.experience || [],
    education: l.education || [],
    projects: l.projects || [],
    team: l.team || [],
    editContacts: l.editContacts || [],
    editStrict: Boolean(l.editStrict),
    city: l.city || '',
    state: l.state || '',
    country: l.country || '',
    assemblySlug: l.assembly?.slug || '',
    website: l.website || '',
    socialLinks: l.socialLinks || {},
    yearsInOperation: l.yearsInOperation ?? '',
    certifications: l.certifications || '',
    logoUrl: l.logoUrl || '',
    photoUrl: l.photoUrl || '',
    portfolioImages: l.portfolioImages || [],
    licenseNumber: l.licenseNumber || '',
    preferredContact: l.preferredContact || 'PHONE',
  }
}

function markEditedInThisBrowser(id) {
  try {
    window.localStorage.setItem(`yp:edited:${id}`, '1')
  } catch {
    /* ignore */
  }
}

function ManageFlow() {
  const base = useYellowPagesBase()
  const listingId = useSearchParams().get('listingId') || ''

  // VERIFY -> (OTP modal) -> EDIT -> SAVED
  const [step, setStep] = useState('VERIFY')
  const [listingName, setListingName] = useState('your listing')
  const [notFound, setNotFound] = useState(false)

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [otp, setOtp] = useState(null) // { maskedTo }

  const [editToken, setEditToken] = useState(null)
  const [editValues, setEditValues] = useState(null)

  useEffect(() => {
    if (!listingId) return
    fetch(`/api/yellowpages/listings/${listingId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setListingName(d.listing?.name || 'your listing'))
      .catch(() => setNotFound(true))
  }, [listingId])

  const loadEditableAndGo = async (token) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/yellowpages/listings/${listingId}/editable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editToken: token }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'We could not open this listing for editing.'); return }
      setEditToken(token)
      setEditValues(editInitialValues(data.listing))
      setStep('EDIT')
    } catch {
      setError('We could not open this listing for editing.')
    } finally {
      setLoading(false)
    }
  }

  const requestOtp = async (e) => {
    e.preventDefault()
    const to = email.trim()
    if (!to) { setError('Enter the email address on file for this listing.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/yellowpages/listings/${listingId}/edit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'We could not send a code. Please try again.'); return }
      setOtp({ maskedTo: data.maskedTo })
    } catch {
      setError('We could not send a code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (code) => {
    try {
      const res = await fetch(`/api/yellowpages/listings/${listingId}/edit-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email.trim(), code }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'That code did not work.' }
      setOtp(null)
      await loadEditableAndGo(data.editToken)
      return { error: null }
    } catch {
      return { error: 'Something went wrong. Please try again.' }
    }
  }

  const resendOtp = async () => {
    try {
      const res = await fetch(`/api/yellowpages/listings/${listingId}/edit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Could not resend.' }
      if (data.maskedTo) setOtp({ maskedTo: data.maskedTo })
      return { error: null }
    } catch {
      return { error: 'Could not resend.' }
    }
  }

  // ---- render --------------------------------------------------------------

  if (!listingId || notFound) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--yp-yellow-100)' }}>
          <Compass size={24} style={{ color: 'var(--yp-yellow-600)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>
          {notFound ? 'Portfolio not found' : 'Open your portfolio to edit it'}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          Find your portfolio in the directory and use the <strong>Edit</strong> button on your
          page. You&rsquo;ll verify with a one-time code sent to the email on file.
        </p>
        <a href={`${base}/browse`} className="yp-btn-primary">Browse the directory</a>
      </div>
    )
  }

  if (step === 'SAVED') {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--yp-yellow-100)' }}>
          <Check size={28} style={{ color: 'var(--yp-yellow-600)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>Changes Saved</h1>
        <a href={`${base}/listing/${listingId}`} className="yp-btn-primary">View Your Listing</a>
      </div>
    )
  }

  if (step === 'EDIT' && editValues) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Edit Your Listing</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>{listingName}</p>
        <ListingForm
          mode="edit"
          listingId={listingId}
          editToken={editToken}
          initialValues={editValues}
          onSuccess={() => { markEditedInThisBrowser(listingId); setStep('SAVED') }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Verify it&rsquo;s you</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
        To edit <strong>{listingName}</strong>, enter the email address on file and we&rsquo;ll
        send you a one-time code.
      </p>

      <form onSubmit={requestOtp} className="space-y-4">
        <div>
          <label className="yp-label" htmlFor="verify-email">Email on the listing</label>
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--yp-ink-soft)' }} />
            <input
              id="verify-email"
              className="yp-input !pl-9"
              type="email"
              value={email}
              onChange={(e) => { setError(''); setEmail(e.target.value) }}
            />
          </div>
        </div>

        {error && <p className="flex items-center gap-1 text-red-600 text-sm"><AlertCircle size={16} /> {error}</p>}

        <button type="submit" disabled={loading} className="yp-btn-primary w-full justify-center">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : 'Send code'}
        </button>
      </form>

      {otp && (
        <OtpModal
          maskedTo={otp.maskedTo}
          onVerify={verifyOtp}
          onResend={resendOtp}
          onClose={() => setOtp(null)}
        />
      )}
    </div>
  )
}

export default function ManagePage() {
  return (
    <Suspense fallback={null}>
      <ManageFlow />
    </Suspense>
  )
}
