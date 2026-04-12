'use client'
import { useState } from 'react'

/**
 * useCloudinaryUpload
 * Hook for uploading files directly to Cloudinary from the browser
 * using a server-generated signature (API secret never exposed client-side)
 *
 * Usage:
 *   const { upload, uploading, progress, error } = useCloudinaryUpload()
 *   const result = await upload(file, { assemblySlug: 'headquarters', category: 'hero' })
 *   // result.secure_url → use this as the stored Cloudinary URL
 */
export function useCloudinaryUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)

  const upload = async (file, { assemblySlug, category, tags = [] } = {}) => {
    setUploading(true)
    setProgress(0)
    setError(null)

    try {
      // Step 1: Get signed upload params from our API
      const sigRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assemblySlug, category, tags }),
      })

      if (!sigRes.ok) {
        const err = await sigRes.json()
        throw new Error(err.error || 'Failed to get upload signature')
      }

      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json()

      // Step 2: Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)
      if (tags.length) formData.append('tags', tags.join(','))

      // Use XMLHttpRequest for upload progress tracking
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText))
          } else {
            reject(new Error('Cloudinary upload failed'))
          }
        })

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')))

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
        xhr.send(formData)
      })

      setProgress(100)
      return result // { secure_url, public_id, width, height, format, duration, ... }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, progress, error }
}
