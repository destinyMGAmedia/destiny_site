import prisma from '@/lib/prisma'
import { checkEditAuthorization } from '@/lib/yellowpages/editAuth'
import { buildResumeModel, resumeGaps, normalizeTemplate, normalizeLocale } from '@/lib/yellowpages/resumeModel'

// POST /api/yellowpages/listings/[id]/resume/data — owner-only. Returns the résumé-relevant
// slice of the listing (so the preview page can build models client-side for any
// template / locale / AI combination), plus the current settings and the ATS "gaps" list.
export const runtime = 'nodejs'

const RESUME_FIELDS = [
  'id', 'name', 'headline', 'resumeSummary', 'description', 'email', 'phone', 'website',
  'city', 'state', 'country', 'socialLinks', 'skills', 'languages', 'experience', 'education',
  'projects', 'certifications', 'resumeTemplate', 'resumeLocale', 'resumeUseAi', 'resumeAiContent',
]

export async function POST(req, { params }) {
  const { id } = await params

  let body
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const listing = await prisma.yellowPagesListing.findUnique({ where: { id } })
  if (!listing || !listing.isActive || listing.listingType !== 'INDIVIDUAL') {
    return Response.json({ error: 'Résumé not found' }, { status: 404 })
  }

  const auth = await checkEditAuthorization(listing, body)
  if (!auth.ok) {
    return Response.json({ error: auth.error }, { status: auth.status })
  }

  const resumeListing = Object.fromEntries(RESUME_FIELDS.map((k) => [k, listing[k]]))
  const template = normalizeTemplate(listing.resumeTemplate)
  const locale = normalizeLocale(listing.resumeLocale, listing.country)

  // Gaps are computed against the *raw* content (AI off) so they reflect what's actually missing.
  const baseModel = buildResumeModel({ ...resumeListing, resumeUseAi: false }, { template, locale })

  return Response.json({
    listing: resumeListing,
    settings: {
      template,
      locale,
      useAi: Boolean(listing.resumeUseAi),
      hasAiContent: listing.resumeAiContent && Object.keys(listing.resumeAiContent).length > 0,
    },
    gaps: resumeGaps(baseModel),
  })
}
