import { getServerSession } from 'next-auth'
import { authOptions, isAssemblyAdmin } from '@/lib/auth'
import { generateUploadSignature, getUploadFolder } from '@/lib/cloudinary'
import { NextResponse } from 'next/server'

/**
 * POST /api/upload
 * Returns a signed Cloudinary upload signature so the client can upload
 * directly to Cloudinary without exposing the API secret.
 *
 * Body: { assemblySlug: string, category: string, tags?: string[] }
 *
 * Categories: hero | team | photos | audio-thumbnails | events |
 *             giving | devotionals | games | hero-slides | treasures
 */
export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { assemblySlug, category, tags = [] } = body

  if (!assemblySlug || !category) {
    return NextResponse.json(
      { error: 'assemblySlug and category are required' },
      { status: 400 }
    )
  }

  // Assembly admins can only upload to their own assembly folder
  if (
    session.user.role === 'ASSEMBLY_ADMIN' &&
    assemblySlug !== session.user.assemblySlug &&
    assemblySlug !== 'global'
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const folder = getUploadFolder(assemblySlug, category)
  const signatureData = generateUploadSignature(folder, tags)

  return NextResponse.json(signatureData)
}
