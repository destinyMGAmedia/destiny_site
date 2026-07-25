'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useNationBase } from '@/components/nation/shared/NationChrome'

export default function GiveCallbackPage() {
  return (
    <Suspense fallback={<p className="text-center py-24 text-white/70">Loading…</p>}>
      <GiveCallbackContent />
    </Suspense>
  )
}

function GiveCallbackContent() {
  const searchParams = useSearchParams()
  const base = useNationBase()
  const txRef = searchParams.get('tx_ref')
  const transactionId = searchParams.get('transaction_id')
  const missingParams = !txRef || !transactionId
  // 'verifying' | 'success' | 'failed' | 'error' — lazily seeded so the missing-params
  // case never needs a synchronous setState inside the effect below.
  const [state, setState] = useState(missingParams ? 'error' : 'verifying')

  useEffect(() => {
    if (missingParams) return

    let cancelled = false
    fetch(`/api/nation/give/verify?tx_ref=${encodeURIComponent(txRef)}&transaction_id=${encodeURIComponent(transactionId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setState(data.status === 'SUCCESS' ? 'success' : data.status === 'FAILED' ? 'failed' : 'error')
      })
      .catch(() => { if (!cancelled) setState('error') })

    return () => { cancelled = true }
  }, [txRef, transactionId, missingParams])

  return (
    <section className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
      {state === 'verifying' && <p className="text-white/70">Verifying your payment…</p>}

      {state === 'success' && (
        <>
          <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--gold-500)' }}>Thank you!</h1>
          <p className="text-white/70">Your gift has been received. A receipt has been sent to your email.</p>
        </>
      )}

      {state === 'failed' && (
        <>
          <h1 className="text-2xl font-bold mb-3 text-red-400">Payment Not Completed</h1>
          <p className="text-white/70">Your payment didn&rsquo;t go through. No funds were captured — please try again.</p>
        </>
      )}

      {state === 'error' && (
        <>
          <h1 className="text-2xl font-bold mb-3 text-red-400">Something Went Wrong</h1>
          <p className="text-white/70">We couldn&rsquo;t confirm this payment automatically. If you were charged, our team will follow up.</p>
        </>
      )}

      <Link href={`${base}/partner`} className="inline-block mt-8 text-cyan-300 hover:text-cyan-200 underline">
        Back to Get Involved
      </Link>
    </section>
  )
}
