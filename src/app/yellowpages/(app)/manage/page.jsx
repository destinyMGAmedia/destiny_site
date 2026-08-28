'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, AlertCircle, Check, Pencil, Mail, Phone, Loader2 } from 'lucide-react'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import { categoryLabel } from '@/lib/yellowpages/constants'
import ListingForm from '@/components/yellowpages/ListingForm'
import OtpModal from '@/components/yellowpages/OtpModal'

const sanitizePhone = (value) => (value || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')

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
  const searchParams = useSearchParams()
  const deepLinkId = searchParams.get('listingId') || ''

  // LOOKUP -> LIST -> VERIFY (-> OTP modal | PHONE_MATCH) -> EDIT -> SAVED
  const [step, setStep] = useState(deepLinkId ? 'VERIFY' : 'LOOKUP')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listings, setListings] = useState([])
  const [selected, setSelected] = useState(deepLinkId ? { id: deepLinkId, name: 'your listing' } : null)

  // VERIFY sub-state
  const [channel, setChannel] = useState('EMAIL')
  const [verifyContact, setVerifyContact] = useState('')
  const [otp, setOtp] = useState(null) // { maskedTo }
  const [phoneMatch, setPhoneMatch] = useState('')

  // Result of a successful verification, passed to ListingForm.
  const [editAuth, setEditAuth] = useState(null) // { editToken } | { ownerPhone }
  const [editValues, setEditValues] = useState(null)

  useEffect(() => {
    if (!deepLinkId) return
    fetch(`/api/yellowpages/listings/${deepLinkId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.listing) setSelected({ id: d.listing.id, name: d.listing.name }) })
      .catch(() => {})
  }, [deepLinkId])

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!phone.trim() && !email.trim()) {
      setError('Please enter your phone number or email.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/yellowpages/listings/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() || undefined, email: email.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong. Please try again.'); return }
      if (data.listings.length === 0) { setError('No listing found with that phone number or email.'); return }
      setListings(data.listings)
      // Pre-fill the verification step with whatever they just used.
      if (email.trim()) { setChannel('EMAIL'); setVerifyContact(email.trim()) }
      else { setChannel('PHONE'); setVerifyContact(phone.trim()) }
      setStep('LIST')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const pickListing = (listing) => {
    setSelected(listing)
    setError('')
    setStep('VERIFY')
  }

  const loadEditableAndGo = async (authBody) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/yellowpages/listings/${selected.id}/editable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authBody),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'We could not open this listing for editing.'); return false }
      setEditAuth(authBody)
      setEditValues(editInitialValues(data.listing))
      setStep('EDIT')
      return true
    } catch {
      setError('We could not open this listing for editing.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const requestOtp = async (e) => {
    e.preventDefault()
    const to = verifyContact.trim()
    if (!to) { setError('Enter your email or phone number.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/yellowpages/listings/${selected.id}/edit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'We could not send a code. Please try again.'); return }
      if (data.sent) {
        setOtp({ maskedTo: data.maskedTo })
      } else if (data.fallback === 'PHONE_MATCH') {
        setPhoneMatch(to)
        setStep('PHONE_MATCH')
      }
    } catch {
      setError('We could not send a code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (code) => {
    try {
      const res = await fetch(`/api/yellowpages/listings/${selected.id}/edit-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: verifyContact.trim(), code }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'That code did not work.' }
      setOtp(null)
      await loadEditableAndGo({ editToken: data.editToken })
      return { error: null }
    } catch {
      return { error: 'Something went wrong. Please try again.' }
    }
  }

  const resendOtp = async () => {
    try {
      const res = await fetch(`/api/yellowpages/listings/${selected.id}/edit-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: verifyContact.trim() }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Could not resend.' }
      if (data.maskedTo) setOtp({ maskedTo: data.maskedTo })
      return { error: null }
    } catch {
      return { error: 'Could not resend.' }
    }
  }

  const submitPhoneMatch = async (e) => {
    e.preventDefault()
    const p = sanitizePhone(phoneMatch)
    if (!p) { setError('Enter the phone number on the listing.'); return }
    await loadEditableAndGo({ ownerPhone: p })
  }

  // ---- render ----------------------------------------------------------------

  if (step === 'SAVED') {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--yp-yellow-100)' }}>
          <Check size={28} style={{ color: 'var(--yp-yellow-600)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>Changes Saved</h1>
        <a href={`${base}/listing/${selected.id}`} className="yp-btn-primary">View Your Listing</a>
      </div>
    )
  }

  if (step === 'EDIT' && selected && editValues) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Edit Your Listing</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>{selected.name}</p>
        <ListingForm
          mode="edit"
          listingId={selected.id}
          editToken={editAuth?.editToken}
          ownerContact={editAuth?.ownerPhone ? { phone: editAuth.ownerPhone } : undefined}
          initialValues={editValues}
          onSuccess={() => { markEditedInThisBrowser(selected.id); setStep('SAVED') }}
        />
      </div>
    )
  }

  if (step === 'PHONE_MATCH') {
    return (
      <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Verify by phone</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          Text codes aren&rsquo;t available yet. For now, enter the phone number exactly as it appears
          on the listing to continue.
        </p>
        <form onSubmit={submitPhoneMatch} className="space-y-4">
          <input
            className="yp-input"
            type="tel"
            value={phoneMatch}
            onChange={(e) => { setError(''); setPhoneMatch(sanitizePhone(e.target.value)) }}
            aria-label="Phone number on the listing"
          />
          {error && <p className="flex items-center gap-1 text-red-600 text-sm"><AlertCircle size={16} /> {error}</p>}
          <button type="submit" disabled={loading} className="yp-btn-primary w-full justify-center">
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    )
  }

  if (step === 'VERIFY' && selected) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Verify it&rsquo;s you</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          To edit <strong>{selected.name}</strong>, we&rsquo;ll send a one-time code to a contact on file.
        </p>

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setChannel('EMAIL')}
            className="flex-1 yp-card p-3 text-sm font-semibold flex items-center justify-center gap-1.5"
            style={channel === 'EMAIL' ? { borderColor: 'var(--yp-yellow-600)', background: 'var(--yp-yellow-100)' } : undefined}
          >
            <Mail size={15} /> Email
          </button>
          <button
            type="button"
            onClick={() => setChannel('PHONE')}
            className="flex-1 yp-card p-3 text-sm font-semibold flex items-center justify-center gap-1.5"
            style={channel === 'PHONE' ? { borderColor: 'var(--yp-yellow-600)', background: 'var(--yp-yellow-100)' } : undefined}
          >
            <Phone size={15} /> Phone
          </button>
        </div>

        <form onSubmit={requestOtp} className="space-y-4">
          <div>
            <label className="yp-label" htmlFor="verify-contact">
              {channel === 'EMAIL' ? 'Email on the listing' : 'Phone on the listing'}
            </label>
            <input
              id="verify-contact"
              className="yp-input"
              type={channel === 'EMAIL' ? 'email' : 'tel'}
              value={verifyContact}
              onChange={(e) => { setError(''); setVerifyContact(channel === 'PHONE' ? sanitizePhone(e.target.value) : e.target.value) }}
            />
            {channel === 'PHONE' && (
              <p className="mt-1 text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
                Text codes aren&rsquo;t available yet — we&rsquo;ll ask you to confirm the number on file.
              </p>
            )}
          </div>

          {error && <p className="flex items-center gap-1 text-red-600 text-sm"><AlertCircle size={16} /> {error}</p>}

          <button type="submit" disabled={loading} className="yp-btn-primary w-full justify-center">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : channel === 'EMAIL' ? 'Send code' : 'Continue'}
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

  if (step === 'LIST') {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Your Listings</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>Select one to edit.</p>
        <div className="space-y-3">
          {listings.map((l) => (
            <button key={l.id} onClick={() => pickListing(l)} className="yp-card w-full p-4 text-left flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{l.name}</p>
                <p className="text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
                  {categoryLabel(l.category)}{!l.isActive ? ' · Deactivated by admin' : ''}
                </p>
              </div>
              <Pencil size={16} className="shrink-0" style={{ color: 'var(--yp-yellow-600)' }} />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--yp-yellow-100)' }}>
          <Search size={24} style={{ color: 'var(--yp-yellow-600)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Manage My Listing</h1>
        <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
          Enter the phone number or email you used when you listed, and we&rsquo;ll find your listing.
          You&rsquo;ll verify with a one-time code before editing.
        </p>
      </div>

      <form onSubmit={handleLookup} className="space-y-4">
        <div>
          <label className="yp-label" htmlFor="manage-phone">Phone Number</label>
          <input id="manage-phone" className="yp-input" type="tel" value={phone} onChange={(e) => { setError(''); setPhone(sanitizePhone(e.target.value)) }} />
        </div>
        <div>
          <label className="yp-label" htmlFor="manage-email">Email Address</label>
          <input id="manage-email" className="yp-input" type="email" value={email} onChange={(e) => { setError(''); setEmail(e.target.value) }} />
        </div>
        <p className="text-xs" style={{ color: 'var(--yp-ink-soft)' }}>You may fill one or both fields.</p>

        {error && (
          <p className="flex items-center gap-1 text-red-600 text-sm">
            <AlertCircle size={16} /> {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="yp-btn-primary w-full justify-center">
          {loading ? 'Searching…' : 'Find My Listing'}
        </button>
      </form>
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
