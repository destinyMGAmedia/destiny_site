'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check, Sparkles } from 'lucide-react'
import ListingForm from '@/components/yellowpages/ListingForm'
import BackLink from '@/components/yellowpages/BackLink'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'
import { getProfileCompleteness } from '@/lib/yellowpages/profileCompleteness'

function RegisterForm() {
  const base = useYellowPagesBase()
  const searchParams = useSearchParams()
  const [created, setCreated] = useState(null)
  const [completing, setCompleting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Optional prefill support — lets other flows (e.g. member registration) link here with
  // known values already filled in. See spec/theyellowpages.md's join-page integration note.
  const initialValues = {
    listingType: searchParams.get('listingType') === 'BUSINESS' ? 'BUSINESS' : 'INDIVIDUAL',
    name: searchParams.get('name') || '',
    phone: searchParams.get('phone') || '',
    email: searchParams.get('email') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    country: searchParams.get('country') || '',
    assemblySlug: searchParams.get('assemblySlug') || '',
  }

  if (saved) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--yp-yellow-100)' }}>
          <Check size={28} style={{ color: 'var(--yp-yellow-600)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>Profile Updated</h1>
        <a href={`${base}/listing/${created.id}`} className="yp-btn-primary">View Your Listing</a>
      </div>
    )
  }

  if (created && completing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
        <BackLink href={`${base}/listing/${created.id}`} label="Back to my listing" className="mb-4" />
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Complete Your Profile</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>{created.name}</p>
        <ListingForm
          mode="edit"
          listingId={created.id}
          ownerContact={{ phone: created.phone || undefined, email: created.email || undefined }}
          initialValues={created}
          onSuccess={() => setSaved(true)}
        />
      </div>
    )
  }

  if (created) {
    const completeness = getProfileCompleteness(created)
    return (
      <div className="max-w-lg mx-auto px-4 py-10 sm:py-16 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--yp-yellow-100)' }}>
          <Check size={28} style={{ color: 'var(--yp-yellow-600)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--yp-ink)' }}>You&rsquo;re Listed!</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
          {created.name} is now live in The Yellow Pages directory.
        </p>

        <div className="yp-card p-5 text-left mb-6">
          <p className="flex items-center gap-2 text-sm font-semibold mb-1" style={{ color: 'var(--yp-yellow-700)' }}>
            <Sparkles size={16} /> Your profile is {completeness}% complete
          </p>
          <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
            A photo, your location, and a few other details help you get noticed and stand out from the crowd — add them now, or anytime later with the <strong>Edit</strong> button on your portfolio page.
          </p>
        </div>

        <button onClick={() => setCompleting(true)} className="yp-btn-primary w-full justify-center mb-3">
          Complete My Profile
        </button>
        <a href={`${base}/listing/${created.id}`} className="yp-btn-outline w-full justify-center">
          Skip for Now, View My Listing
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>List Your Skill or Business</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--yp-ink-soft)' }}>
        Free to list. Visible to anyone searching the directory — no login required.
      </p>
      <ListingForm initialValues={initialValues} onSuccess={setCreated} />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}
