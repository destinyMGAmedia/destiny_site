import prisma from '@/lib/prisma'
import { renderResumePdf } from '@/lib/yellowpages/resumeDocument'
import { buildResumeModel, resumeFileName, normalizeTemplate, normalizeLocale } from '@/lib/yellowpages/resumeModel'
import { checkEditAuthorization } from '@/lib/yellowpages/editAuth'

// POST /api/yellowpages/listings/[id]/resume — owner-only (same email-OTP / editToken auth as
// editing). Body: { editToken? | ownerEmail?/ownerPhone?, template?, locale?, useAi? }.
// Persists the template / locale / useAi choice, then streams the ATS-friendly résumé PDF.
export const runtime = 'nodejs'

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

  const template = normalizeTemplate(body.template || listing.resumeTemplate)
  const locale = normalizeLocale(body.locale || listing.resumeLocale, listing.country)
  const useAi = body.useAi === undefined ? Boolean(listing.resumeUseAi) : Boolean(body.useAi)

  // Persist the choices so the next download / the portfolio remembers them.
  const persisted = await prisma.yellowPagesListing.update({
    where: { id },
    data: { resumeTemplate: template, resumeLocale: locale, resumeUseAi: useAi },
  })

  try {
    const model = buildResumeModel(persisted, { template, locale })
    const buffer = await renderResumePdf(persisted, { template, locale })
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${resumeFileName(model)}"`,
        'Cache-Control': 'private, no-store',
      },
    })
  } catch (error) {
    console.error('[YELLOWPAGES] Failed to render résumé PDF:', error)
    return Response.json({ error: 'Failed to generate résumé' }, { status: 500 })
  }
}
