'use client'
import { useRef, useState } from 'react'
import { UploadCloud, X, Loader2 } from 'lucide-react'
import { useYellowPagesUpload } from '@/lib/yellowpages/useYellowPagesUpload'

/**
 * Click-to-upload image field for the listing form (logo or photo). Uploads directly to
 * Cloudinary via the public signed-upload flow and reports the resulting URL to the parent.
 */
export default function ImageUploadField({ label, type, value, onChange }) {
  const inputRef = useRef(null)
  const { upload, uploading, error } = useYellowPagesUpload()
  const [localError, setLocalError] = useState('')

  const handleFile = async (files) => {
    const file = files?.[0]
    if (!file) return
    setLocalError('')
    try {
      const result = await upload(file, type)
      onChange(result.secure_url)
    } catch {
      setLocalError('Upload failed. Please try again.')
    }
  }

  return (
    <div>
      <label className="yp-label">{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors"
        style={{ borderColor: 'var(--yp-border)' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files)}
          aria-label={label}
        />

        {value ? (
          <div className="flex items-center justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt={`${label} preview`} className="w-14 h-14 rounded-lg object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange('') }}
              className="p-1 rounded-full"
              style={{ background: 'var(--yp-yellow-100)' }}
              aria-label={`Remove ${label}`}
            >
              <X size={14} />
            </button>
          </div>
        ) : uploading ? (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
            <Loader2 size={16} className="animate-spin" /> Uploading…
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--yp-ink-soft)' }}>
            <UploadCloud size={16} /> Click to upload
          </div>
        )}
      </div>
      {(localError || error) && <p className="text-xs text-red-600 mt-1">{localError || error}</p>}
    </div>
  )
}
