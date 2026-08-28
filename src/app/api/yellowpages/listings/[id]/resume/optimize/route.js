import prisma from '@/lib/prisma'
import { checkEditAuthorization } from '@/lib/yellowpages/editAuth'
import { buildResumeModel, normalizeTemplate, normalizeLocale } from '@/lib/yellowpages/resumeModel'
import { optimizeResume, aiConfigured, aiProviderLabel } from '@/lib/yellowpages/ai'

// POST /api/yellowpages/listings/[id]/resume/optimize — owner-only. Runs the AI résumé
// optimiser over the listing's raw content and stores the result on the listing
// (`resumeAiContent`), turning `resumeUseAi` on. Body: { locale?, jobDescription? }.
export const runtime = 'nodejs'
export const maxDuration = 60

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

  if (!aiConfigured()) {
    return Response.json({ applied: false, reason: 'ai_unconfigured', aiContent: null })
  }

  const template = normalizeTemplate(listing.resumeTemplate)
  const locale = normalizeLocale(body.locale || listing.resumeLocale, listing.country)
  const baseModel = buildResumeModel({ ...listing, resumeUseAi: false }, { template, locale })

  const aiContent = await optimizeResume({ model: baseModel, jobDescription: body.jobDescription })
  if (!aiContent) {
    return Response.json({ applied: false, reason: 'ai_failed', provider: aiProviderLabel(), aiContent: null }, { status: 502 })
  }

  await prisma.yellowPagesListing.update({
    where: { id },
    data: { resumeAiContent: aiContent, resumeUseAi: true, resumeLocale: locale },
  })

  return Response.json({ applied: true, provider: aiContent.provider, aiContent })
}
