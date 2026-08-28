import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { checkEditAuthorization } from '@/lib/yellowpages/editAuth'

// POST /api/yellowpages/listings/[id]/editable — Body: { editToken } or { ownerPhone } /
// { ownerEmail }. Returns the full listing (including `editContacts`, which the public GET
// hides) so the owner-edit form can be pre-filled. Same authorization as PATCH.
export async function POST(req, { params }) {
  const { id } = await params

  let body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const listing = await prisma.yellowPagesListing.findUnique({
    where: { id },
    include: { assembly: { select: { slug: true, name: true } } },
  })
  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  const auth = await checkEditAuthorization(listing, body)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  return NextResponse.json({ listing })
}
