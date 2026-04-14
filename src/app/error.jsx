'use client'
import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Global error boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--ivory)' }}>
      <div className="text-center max-w-lg">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
        >
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        
        <h1
          className="text-3xl font-bold mb-4"
          style={{ fontFamily: 'var(--font-serif)', color: 'var(--purple-900)' }}
        >
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-8">
          We're experiencing technical difficulties. This might be a temporary issue with our servers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          
          <Link href="/" className="btn-outline inline-flex items-center justify-center gap-2">
            <ArrowLeft size={18} />
            Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-8 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer mb-3">
              Developer Information
            </summary>
            <pre className="text-xs bg-gray-100 p-4 rounded-lg overflow-auto text-red-600 whitespace-pre-wrap">
              {error.message}
              {error.stack && '\n\n' + error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}