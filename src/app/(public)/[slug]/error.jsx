'use client'
import { useEffect } from 'react'
import { RefreshCw, Home } from 'lucide-react'

export default function AssemblyError({ error, reset }) {
  useEffect(() => {
    console.error('Assembly page error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--ivory)' }}>
      <div className="card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--purple-100)' }}>
          <RefreshCw size={28} style={{ color: 'var(--purple-700)' }} />
        </div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}>
          Page Temporarily Unavailable
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          We couldn&apos;t load this assembly page right now. This is usually a temporary connection issue — please try again.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={reset} className="btn-primary w-full justify-center flex items-center gap-2">
            <RefreshCw size={16} /> Try Again
          </button>
          <a href="/" className="btn-outline w-full justify-center flex items-center gap-2">
            <Home size={16} /> Go to Home
          </a>
        </div>
      </div>
    </div>
  )
}
