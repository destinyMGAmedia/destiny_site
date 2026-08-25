import { NextResponse } from 'next/server'
import { generateUploadSignature, getUploadFolder } from '@/lib/cloudinary'

const VALID_TYPES = ['logo', 'photo', 'portfolio']

// GET /api/yellowpages/upload-signature?type=logo|photo|portfolio — public, unauthenticated
// (same trust level as the rest of the public listing-submission flow). The folder is fixed
// server-side (never taken from the client) so this can't be used to write into unrelated
// Cloudinary folders — see spec/theyellowpages.md's API contract.
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const requested = searchParams.get('type')
  const type = VALID_TYPES.includes(requested) ? requested : 'logo'

  const folder = getUploadFolder('global', 'yellowpages')
  const signatureData = generateUploadSignature(folder, ['yellowpages', type])

  return NextResponse.json(signatureData)
}
