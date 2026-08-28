import { POST } from './route'
import prisma from '@/lib/prisma'
import { checkEditAuthorization } from '@/lib/yellowpages/editAuth'
import { optimizeResume, aiConfigured } from '@/lib/yellowpages/ai'

vi.mock('@/lib/prisma', () => ({ default: { yellowPagesListing: { findUnique: vi.fn(), update: vi.fn() } } }))
vi.mock('@/lib/yellowpages/editAuth', () => ({ checkEditAuthorization: vi.fn() }))
vi.mock('@/lib/yellowpages/ai', () => ({
  optimizeResume: vi.fn(),
  aiConfigured: vi.fn(),
  aiProviderLabel: () => 'Gemini',
}))

const makeParams = (id) => ({ params: Promise.resolve({ id }) })
const req = (body = { editToken: 't' }) =>
  new Request('http://localhost/api/yellowpages/listings/l1/resume/optimize', { method: 'POST', body: JSON.stringify(body) })

const listing = {
  id: 'l1', listingType: 'INDIVIDUAL', isActive: true, name: 'Jane', country: 'Nigeria',
  resumeSummary: 's', skills: ['React'], experience: [{ title: 'Dev', organization: 'Acme', description: 'x' }],
  education: [], projects: [], languages: [], socialLinks: {}, resumeAiContent: {},
}

describe('POST /api/yellowpages/listings/[id]/resume/optimize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkEditAuthorization.mockResolvedValue({ ok: true })
    prisma.yellowPagesListing.findUnique.mockResolvedValue(listing)
    prisma.yellowPagesListing.update.mockResolvedValue(listing)
  })

  it('400 on an unparseable JSON body', async () => {
    const bad = new Request('http://localhost/api/yellowpages/listings/l1/resume/optimize', { method: 'POST', body: 'nope' })
    const res = await POST(bad, makeParams('l1'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON body' })
  })

  it('404 when the listing is missing / inactive / BUSINESS', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    expect((await POST(req(), makeParams('l1'))).status).toBe(404)
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ ...listing, listingType: 'BUSINESS' })
    expect((await POST(req(), makeParams('l1'))).status).toBe(404)
  })

  it('403 when not authorised', async () => {
    checkEditAuthorization.mockResolvedValue({ ok: false, status: 403, error: 'no' })
    expect((await POST(req(), makeParams('l1'))).status).toBe(403)
  })

  it('reports ai_unconfigured without calling the optimiser', async () => {
    aiConfigured.mockReturnValue(false)
    const res = await POST(req(), makeParams('l1'))
    expect(await res.json()).toMatchObject({ applied: false, reason: 'ai_unconfigured' })
    expect(optimizeResume).not.toHaveBeenCalled()
    expect(prisma.yellowPagesListing.update).not.toHaveBeenCalled()
  })

  it('502 when the optimiser returns null (AI failed)', async () => {
    aiConfigured.mockReturnValue(true)
    optimizeResume.mockResolvedValue(null)
    const res = await POST(req(), makeParams('l1'))
    expect(res.status).toBe(502)
    expect(await res.json()).toMatchObject({ applied: false, reason: 'ai_failed' })
  })

  it('stores the AI content and turns resumeUseAi on', async () => {
    aiConfigured.mockReturnValue(true)
    const aiContent = { summary: 'Better.', skills: ['React'], experience: [{ bullets: ['Did X'] }], provider: 'Gemini' }
    optimizeResume.mockResolvedValue(aiContent)
    const res = await POST(req({ editToken: 't', locale: 'US', jobDescription: 'Senior React role' }), makeParams('l1'))
    expect(await res.json()).toMatchObject({ applied: true, provider: 'Gemini' })
    expect(prisma.yellowPagesListing.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { resumeAiContent: aiContent, resumeUseAi: true, resumeLocale: 'US' },
    })
    expect(optimizeResume).toHaveBeenCalledWith(expect.objectContaining({ jobDescription: 'Senior React role' }))
  })

  it('defaults the locale to the country rule (UK for Nigeria) when the body omits it', async () => {
    aiConfigured.mockReturnValue(true)
    const aiContent = { summary: 'Better.', skills: [], experience: [], provider: 'Gemini' }
    optimizeResume.mockResolvedValue(aiContent)
    await POST(req({ editToken: 't' }), makeParams('l1'))
    expect(prisma.yellowPagesListing.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { resumeAiContent: aiContent, resumeUseAi: true, resumeLocale: 'UK' },
    })
    expect(optimizeResume).toHaveBeenCalledWith(expect.objectContaining({ jobDescription: undefined }))
  })
})
