'use client'
import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'
import ListingForm from '@/components/yellowpages/ListingForm'
import { useYellowPagesBase } from '@/components/yellowpages/shared/YellowPagesChrome'

function RegisterForm() {
  const base = useYellowPagesBase()
  const searchParams = useSearchParams()
  const [created, setCreated] = useState(null)

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

  if (created) {
    return (
      <div className="section-container max-w-lg text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--yp-yellow-100)' }}>
          <Check size={28} style={{ color: 'var(--yp-yellow-600)' }} />
        </div>
        <h1 className="section-heading" style={{ color: 'var(--yp-ink)' }}>You&rsquo;re Listed!</h1>
        <p className="section-subheading">
          {created.name} is now live in The Yellow Pages directory.
        </p>
        <a href={`${base}/listing/${created.id}`} className="yp-btn-primary">View Your Listing</a>
      </div>
    )
  }

  return (
    <div className="section-container max-w-2xl">
      <h1 className="section-heading" style={{ color: 'var(--yp-ink)' }}>List Your Skill or Business</h1>
      <p className="section-subheading">
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
