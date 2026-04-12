'use client'
import { useRef, useState } from 'react'
import { UploadCloud, X, Check } from 'lucide-react'
import { useCloudinaryUpload } from '@/lib/useCloudinaryUpload'

/**
 * FileUploader — drag-and-drop + click upload to Cloudinary
 *
 * Props:
 *   assemblySlug  - which assembly folder
 *   category      - folder category ('hero', 'team', 'photos', etc.)
 *   accept        - MIME types e.g. "image/*" or "audio/*"
 *   onUploadDone  - callback(result) called with Cloudinary upload result
 *   label         - field label
 *   currentUrl    - existing Cloudinary URL to preview
 *   multiple      - allow multiple files
 */
export default function FileUploader({
  assemblySlug,
  category,
  accept = 'image/*',
  onUploadDone,
  label = 'Upload File',
  currentUrl = null,
  multiple = false,
}) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(currentUrl)
  const [done, setDone] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const { upload, uploading, progress, error } = useCloudinaryUpload()

  const handleFiles = async (files) => {
    if (!files?.length) return
    setDone(false)

    if (multiple) {
      for (const file of Array.from(files)) {
        const result = await upload(file, { assemblySlug, category })
        onUploadDone?.(result)
      }
      setDone(true)
    } else {
      const file = files[0]
      // Local preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setPreview(e.target.result)
        reader.readAsDataURL(file)
      }
      const result = await upload(file, { assemblySlug, category })
      onUploadDone?.(result)
      setDone(true)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const isImage = accept.startsWith('image')

  return (
    <div className="space-y-2">
      {label && <label className="form-label">{label}</label>}

      {/* Preview */}
      {preview && isImage && !multiple && (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 mb-2">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => { setPreview(null); setDone(false) }}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {uploading ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Uploading... {progress}%</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progress}%`, background: 'var(--purple-700)' }}
              />
            </div>
          </div>
        ) : done ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check size={20} />
            <span className="text-sm font-semibold">Upload complete!</span>
          </div>
        ) : (
          <>
            <UploadCloud size={28} className="mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">
              {multiple ? 'Drop files here or click to select' : 'Drop file here or click to select'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {accept === 'image/*' ? 'JPG, PNG, WebP, GIF' : accept}
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  )
}
