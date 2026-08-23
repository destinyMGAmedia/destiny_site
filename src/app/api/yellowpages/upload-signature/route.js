import { NextResponse } from 'next/server'
import { generateUploadSignature, getUploadFolder } from '@/lib/cloudinary'

// GET /api/yellowpages/upload-signature?type=logo|photo — public, unauthenticated (same trust
// level as the rest of the public listing-submission flow). The folder is fixed server-side
// (never taken from the client) so this can't be used to write into unrelated Cloudinary
// folders — see spec/theyellowpages.md's API contract.
export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') === 'photo' ? 'photo' : 'logo'

  const folder = getUploadFolder('global', 'yellowpages')
  const signatureData = generateUploadSignature(folder, ['yellowpages', type])

  return NextResponse.json(signatureData)
}
