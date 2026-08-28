import prisma from '@/lib/prisma'
import { renderResumePdf } from '@/lib/yellowpages/resumeDocument'

// GET /api/yellowpages/listings/[id]/resume — streams an ATS-friendly résumé PDF built from an
// INDIVIDUAL listing's public data. 404 for a missing/hidden listing or a BUSINESS listing.
export const runtime = 'nodejs'

function slugify(name) {
  return (name || 'resume')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'resume'
}

export async function GET(_req, { params }) {
  const { id } = await params

  const listing = await prisma.yellowPagesListing.findUnique({ where: { id } })
  if (!listing || !listing.isActive || listing.listingType !== 'INDIVIDUAL') {
    return new Response(JSON.stringify({ error: 'Résumé not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const buffer = await renderResumePdf(listing)
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${slugify(listing.name)}-resume.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('[YELLOWPAGES] Failed to render résumé PDF:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate résumé' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
