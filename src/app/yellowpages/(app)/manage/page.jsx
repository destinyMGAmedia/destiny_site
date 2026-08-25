'use client'
import { useState } from 'react'
import { Search, AlertCircle, Check, Pencil } from 'lucide-react'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import { categoryLabel } from '@/lib/yellowpages/constants'
import ListingForm from '@/components/yellowpages/ListingForm'

const sanitizePhone = (value) => (value || '').replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '')

/**
 * "Manage my listing" — a lightweight, loginless owner flow: verify by the same phone/email
 * used to create the listing (the same trust model this app already uses for member lookup),
 * then edit via ListingForm in edit mode. See spec/theyellowpages.md's owner-edit addition.
 */
export default function ManagePage() {
  const base = useYellowPagesBase()
  const [step, setStep] = useState('LOOKUP') // LOOKUP -> LIST -> EDIT -> SAVED
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listings, setListings] = useState([])
  const [selected, setSelected] = useState(null)

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
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }
      if (data.listings.length === 0) {
        setError('No listing found with that phone number or email.')
        return
      }
      setListings(data.listings)
      setStep('LIST')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectListing = (listing) => {
    setSelected(listing)
    setStep('EDIT')
  }

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

  if (step === 'EDIT' && selected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Edit Your Listing</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>{selected.name}</p>
        <ListingForm
          mode="edit"
          listingId={selected.id}
          ownerContact={{ phone: phone.trim() || undefined, email: email.trim() || undefined }}
          initialValues={{
            listingType: selected.listingType,
            name: selected.name,
            contactPersonName: selected.contactPersonName || '',
            position: selected.position || '',
            phone: selected.phone,
            whatsapp: selected.whatsapp || '',
            email: selected.email || '',
            category: selected.category,
            subCategory: selected.subCategory || '',
            description: selected.description,
            servicesOffered: selected.servicesOffered || '',
            city: selected.city || '',
            state: selected.state || '',
            country: selected.country || '',
            assemblySlug: selected.assembly?.slug || '',
            website: selected.website || '',
            socialLinks: selected.socialLinks || {},
            yearsInOperation: selected.yearsInOperation ?? '',
            certifications: selected.certifications || '',
            logoUrl: selected.logoUrl || '',
            photoUrl: selected.photoUrl || '',
            portfolioImages: selected.portfolioImages || [],
            licenseNumber: selected.licenseNumber || '',
            preferredContact: selected.preferredContact || 'PHONE',
          }}
          onSuccess={() => setStep('SAVED')}
        />
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
            <button key={l.id} onClick={() => selectListing(l)} className="yp-card w-full p-4 text-left flex items-center justify-between gap-3">
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
