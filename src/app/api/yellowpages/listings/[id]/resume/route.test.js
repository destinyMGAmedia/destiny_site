import { POST } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: { yellowPagesListing: { findUnique: vi.fn(), update: vi.fn(), yellowPagesEditOtp: { findUnique: vi.fn() } } },
}))
// checkEditAuthorization -> otp.js -> email.js: keep the real editAuth but stub prisma's OTP model.
vi.mock('@/lib/yellowpages/editAuth', () => ({
  checkEditAuthorization: vi.fn(),
}))
import { checkEditAuthorization } from '@/lib/yellowpages/editAuth'

// Keep the REAL @react-pdf renderer (so the happy-path tests stream genuine PDF bytes), but
// wrap renderResumePdf in a spy that calls through by default — lets one test force a failure.
vi.mock('@/lib/yellowpages/resumeDocument', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, renderResumePdf: vi.fn(actual.renderResumePdf) }
})
import { renderResumePdf } from '@/lib/yellowpages/resumeDocument'

const makeParams = (id) => ({ params: Promise.resolve({ id }) })
const req = (body = {}) =>
  new Request('http://localhost/api/yellowpages/listings/l1/resume', { method: 'POST', body: JSON.stringify(body) })

const individual = {
  id: 'l1',
  listingType: 'INDIVIDUAL',
  isActive: true,
  name: 'Jane Developer',
  headline: 'Full-stack Engineer',
  resumeSummary: 'Ten years building web apps.',
  description: 'Bio text',
  email: 'jane@example.com',
  phone: '08012345678',
  country: 'Nigeria',
  website: 'https://jane.dev',
  socialLinks: {},
  skills: ['React', 'Node.js'],
  languages: ['English'],
  experience: [{ title: 'Engineer', organization: 'Acme', startDate: '2020', endDate: '2024', current: false, description: 'Built things' }],
  education: [{ school: 'Uni', degree: 'BSc', field: 'CS', startYear: '2012', endYear: '2016' }],
  projects: [{ name: 'Thing', role: 'Lead', url: 'https://thing.dev', description: 'A thing' }],
  certifications: 'AWS SA',
  resumeAiContent: {},
}

describe('POST /api/yellowpages/listings/[id]/resume', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkEditAuthorization.mockResolvedValue({ ok: true })
    prisma.yellowPagesListing.update.mockImplementation(({ data }) => Promise.resolve({ ...individual, ...data }))
  })

  it('400 on an unparseable JSON body (before any DB call)', async () => {
    const bad = new Request('http://localhost/api/yellowpages/listings/l1/resume', { method: 'POST', body: '<<<' })
    const res = await POST(bad, makeParams('l1'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON body' })
    expect(prisma.yellowPagesListing.findUnique).not.toHaveBeenCalled()
  })

  it('404 when the listing does not exist', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    expect((await POST(req({ editToken: 't' }), makeParams('nope'))).status).toBe(404)
  })

  it('404 for an inactive listing', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ ...individual, isActive: false })
    expect((await POST(req({ editToken: 't' }), makeParams('l1'))).status).toBe(404)
  })

  it('500 (and does not leak the error) when PDF rendering throws', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(individual)
    renderResumePdf.mockRejectedValueOnce(new Error('pdf boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await POST(req({ editToken: 't' }), makeParams('l1'))
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ error: 'Failed to generate résumé' })
    // the choice was still persisted before the render attempt
    expect(prisma.yellowPagesListing.update).toHaveBeenCalled()
    errSpy.mockRestore()
  })

  it('respects an explicit useAi:true in the body', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(individual)
    await POST(req({ editToken: 't', useAi: true }), makeParams('l1'))
    expect(prisma.yellowPagesListing.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ resumeUseAi: true }) }),
    )
  })

  it('404 for a BUSINESS listing', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ ...individual, listingType: 'BUSINESS' })
    expect((await POST(req({ editToken: 't' }), makeParams('l1'))).status).toBe(404)
  })

  it('403 when not authorised (not the owner)', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(individual)
    checkEditAuthorization.mockResolvedValue({ ok: false, status: 403, error: 'nope' })
    const res = await POST(req({ ownerEmail: 'stranger@x.com' }), makeParams('l1'))
    expect(res.status).toBe(403)
    expect(prisma.yellowPagesListing.update).not.toHaveBeenCalled()
  })

  it('persists the chosen template/locale and streams a UK "cv" PDF', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(individual)
    const res = await POST(req({ editToken: 't', template: 'MODERN', locale: 'UK' }), makeParams('l1'))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    expect(res.headers.get('Content-Disposition')).toMatch(/jane-developer-cv\.pdf/)
    expect(prisma.yellowPagesListing.update).toHaveBeenCalledWith({
      where: { id: 'l1' },
      data: { resumeTemplate: 'MODERN', resumeLocale: 'UK', resumeUseAi: false },
    })
    const bytes = new Uint8Array(await res.arrayBuffer())
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('%PDF')
  })

  it('defaults locale to UK for a Nigeria listing when none is given', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(individual)
    const res = await POST(req({ editToken: 't' }), makeParams('l1'))
    expect(res.headers.get('Content-Disposition')).toMatch(/-cv\.pdf/)
  })
})
