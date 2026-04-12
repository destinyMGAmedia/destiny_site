import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

// ─────────────────────────────────────────────
// FOLDER STRUCTURE IN CLOUDINARY
//
// dmga/
// ├── assemblies/
// │   ├── headquarters/
// │   │   ├── hero/
// │   │   ├── team/
// │   │   ├── media/photos/
// │   │   ├── media/audio-thumbnails/
// │   │   └── events/
// │   └── {slug}/...
// ├── global/
// │   ├── hero-slides/
// │   ├── games/
// │   └── devotionals/
// └── treasures/
// ─────────────────────────────────────────────

/**
 * Get Cloudinary upload folder path based on context
 * @param {string} assemblySlug
 * @param {string} category - 'hero'|'team'|'photos'|'audio-thumbnails'|'events'|'giving'
 */
export function getUploadFolder(assemblySlug, category) {
  if (assemblySlug === 'global') {
    return `dmga/global/${category}`
  }
  return `dmga/assemblies/${assemblySlug}/${category}`
}

/**
 * Delete a Cloudinary asset by its public_id
 */
export async function deleteCloudinaryAsset(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

/**
 * Generate a signed upload signature for client-side uploads
 * This keeps the API secret server-side only
 */
export function generateUploadSignature(folder, tags = []) {
  const timestamp = Math.round(Date.now() / 1000)
  const params = {
    timestamp,
    folder,
    tags: tags.join(','),
  }

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET
  )

  return {
    signature,
    timestamp,
    folder,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
  }
}
