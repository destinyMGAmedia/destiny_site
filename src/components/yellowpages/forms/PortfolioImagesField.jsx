'use client'
import { X, Loader2, ImagePlus } from 'lucide-react'
import { MAX_PORTFOLIO_IMAGES } from '@/lib/yellowpages/constants'
import { useYellowPagesUpload } from '@/lib/yellowpages/useYellowPagesUpload'

/** Multi-photo uploader for the work/gallery images — images only, no video. */
export default function PortfolioImagesField({ label = 'Work / Personal Photos', images = [], onChange }) {
  const { upload, uploading, error } = useYellowPagesUpload()

  const handleFiles = async (files) => {
    const remaining = MAX_PORTFOLIO_IMAGES - images.length
    const toUpload = Array.from(files || []).slice(0, remaining)
    for (const file of toUpload) {
      try {
        const result = await upload(file, 'portfolio')
        onChange((prev) => [...prev, result.secure_url])
      } catch {
        // per-file error already surfaced via the hook's `error` state
      }
    }
  }

  return (
    <div>
      <span className="yp-label">
        {label}{' '}
        <span className="font-normal text-xs" style={{ color: 'var(--yp-ink-soft)' }}>
          ({images.length}/{MAX_PORTFOLIO_IMAGES}, images only)
        </span>
      </span>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange((prev) => prev.filter((_, idx) => idx !== i))}
              className="absolute top-1 right-1 p-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.9)' }}
              aria-label={`Remove photo ${i + 1}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < MAX_PORTFOLIO_IMAGES && (
          <label
            className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer text-xs gap-1"
            style={{ borderColor: 'var(--yp-border)', color: 'var(--yp-ink-soft)' }}
          >
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} aria-label="Add photo" />
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            {uploading ? 'Uploading…' : 'Add photo'}
          </label>
        )}
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
