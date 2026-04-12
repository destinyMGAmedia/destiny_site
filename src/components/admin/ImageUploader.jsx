'use client'
import { useState, useRef } from 'react'
import { Upload, X, Loader } from 'lucide-react'
import Image from 'next/image'

export default function ImageUploader({
  label = 'Image',
  value,
  assemblySlug,
  category = 'hero',
  onUpload,
  onClear,
  aspectHint = '',
}) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Get signed upload params from server
      const sigRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assemblySlug, category }),
      })
      if (!sigRes.ok) throw new Error('Could not get upload signature')
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json()

      // Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('signature', signature)
      formData.append('timestamp', timestamp)
      formData.append('folder', folder)
      formData.append('api_key', apiKey)

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      )
      if (!upRes.ok) throw new Error('Upload failed')
      const data = await upRes.json()
      onUpload(data.secure_url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {label && <p className="form-label">{label}{aspectHint && <span className="text-gray-400 font-normal ml-1">({aspectHint})</span>}</p>}

      {value ? (
        <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
          <div className="relative h-40 w-full">
            <Image src={value} alt="Uploaded" fill sizes="600px" className="object-cover" />
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white/90 text-gray-800 shadow"
            >
              Change
            </button>
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg bg-white/90 text-red-500 shadow"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:border-purple-400"
          style={{ borderColor: 'var(--border)', background: 'var(--ivory)' }}
        >
          {uploading ? (
            <><Loader size={20} className="animate-spin text-purple-600" /><p className="text-sm text-gray-500">Uploading...</p></>
          ) : (
            <><Upload size={20} className="text-gray-400" /><p className="text-sm text-gray-500">Click to upload image</p></>
          )}
        </button>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
