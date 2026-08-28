'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import PersonalPortfolioView from '@/components/yellowpages/portfolio/PersonalPortfolioView'
import BusinessPortfolioView from '@/components/yellowpages/portfolio/BusinessPortfolioView'

export default function ListingDetailPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [status, setStatus] = useState('loading')

  const load = () => {
    fetch(`/api/yellowpages/listings/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => { setListing(data.listing); setStatus('ready') })
      .catch(() => setStatus('error'))
  }

  useEffect(() => {
    if (id) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-24" style={{ color: 'var(--yp-ink-soft)' }}>
        <Loader2 size={20} className="animate-spin mr-2" /> Loading…
      </div>
    )
  }

  if (status === 'error' || !listing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--yp-ink)' }}>Portfolio Not Found</h1>
        <p className="text-sm" style={{ color: 'var(--yp-ink-soft)' }}>This listing may have been removed.</p>
      </div>
    )
  }

  const View = listing.listingType === 'INDIVIDUAL' ? PersonalPortfolioView : BusinessPortfolioView
  return <View listing={listing} listingId={id} onReload={load} />
}
