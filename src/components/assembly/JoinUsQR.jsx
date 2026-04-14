'use client'
import { useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

// Dynamic QR code using a free service — generates from URL
export default function JoinUsQR({ assemblySlug, assemblyName }) {
  const [show, setShow] = useState(false)
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/${assemblySlug}/join`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(joinUrl)}`

  return (
    <>
      {/* Floating trigger */}
      <div className="flex justify-end max-w-7xl mx-auto px-6 py-3">
        <button
          onClick={() => setShow(true)}
          className="btn-secondary btn-sm"
        >
          👋 Join Us / Register
        </button>
      </div>

      {/* QR Modal */}
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShow(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h3 className="font-bold text-lg mb-1" style={{ color: 'var(--purple-900)', fontFamily: 'var(--font-serif)' }}>
              Welcome!
            </h3>
            <p className="text-sm text-gray-500 mb-4">{assemblyName}</p>

            <img
              src={qrUrl}
              alt="Join Us QR Code"
              className="mx-auto mb-4 rounded-xl"
              width={200}
              height={200}
            />

            <p className="text-xs text-gray-400 mb-4">
              Scan with your phone camera or click the button below to register as a visitor or member
            </p>

            <Link
              href={`/${assemblySlug}/join`}
              className="btn-primary w-full justify-center"
            >
              Open Membership Form
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
