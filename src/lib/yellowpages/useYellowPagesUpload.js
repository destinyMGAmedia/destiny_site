'use client'
import { useState } from 'react'

/**
 * Uploads a logo/photo directly to Cloudinary using the public, unauthenticated signed-upload
 * flow at /api/yellowpages/upload-signature. Mirrors src/lib/useCloudinaryUpload.js but talks
 * to the Yellow Pages signature endpoint (fixed folder, no admin auth) — see
 * spec/theyellowpages.md's API contract.
 *
 * Usage:
 *   const { upload, uploading, error } = useYellowPagesUpload()
 *   const result = await upload(file, 'logo') // or 'photo'
 *   // result.secure_url → store as logoUrl/photoUrl
 */
export function useYellowPagesUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const upload = async (file, type = 'logo') => {
    setUploading(true)
    setError(null)

    try {
      const sigRes = await fetch(`/api/yellowpages/upload-signature?type=${type}`)
      if (!sigRes.ok) throw new Error('Failed to get upload signature')
      const { signature, timestamp, folder, cloudName, apiKey } = await sigRes.json()

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', apiKey)
      formData.append('timestamp', timestamp)
      formData.append('signature', signature)
      formData.append('folder', folder)
      formData.append('tags', `yellowpages,${type}`)

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!uploadRes.ok) throw new Error('Upload failed')

      return await uploadRes.json() // { secure_url, public_id, ... }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setUploading(false)
    }
  }

  return { upload, uploading, error }
}
