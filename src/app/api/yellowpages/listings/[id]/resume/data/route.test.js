import { POST } from './route'
import prisma from '@/lib/prisma'
import { checkEditAuthorization } from '@/lib/yellowpages/editAuth'

vi.mock('@/lib/prisma', () => ({ default: { yellowPagesListing: { findUnique: vi.fn() } } }))
vi.mock('@/lib/yellowpages/editAuth', () => ({ checkEditAuthorization: vi.fn() }))

const makeParams = (id) => ({ params: Promise.resolve({ id }) })
const req = (body = { editToken: 't' }) =>
  new Request('http://localhost/api/yellowpages/listings/l1/resume/data', { method: 'POST', body: JSON.stringify(body) })

const listing = {
  id: 'l1',
  listingType: 'INDIVIDUAL',
  isActive: true,
  name: 'Jane',
  email: 'jane@x.com',
  country: 'Nigeria',
  resumeSummary: 'Summary.',
  skills: ['React'],
  experience: [{ title: 'Dev', organization: 'Acme', startDate: '2020', endDate: '2024', description: 'did things' }],
  education: [{ school: 'Uni', degree: 'BSc' }],
  socialLinks: {},
  languages: [],
  projects: [],
  resumeAiContent: {},
}

describe('POST /api/yellowpages/listings/[id]/resume/data', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    checkEditAuthorization.mockResolvedValue({ ok: true })
  })

  it('400 on an unparseable JSON body', async () => {
    const bad = new Request('http://localhost/api/yellowpages/listings/l1/resume/data', { method: 'POST', body: '{not json' })
    const res = await POST(bad, makeParams('l1'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON body' })
    expect(prisma.yellowPagesListing.findUnique).not.toHaveBeenCalled()
  })

  it('404 for a missing listing', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    expect((await POST(req(), makeParams('l1'))).status).toBe(404)
  })

  it('404 for an inactive or BUSINESS listing', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ ...listing, isActive: false })
    expect((await POST(req(), makeParams('l1'))).status).toBe(404)
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ ...listing, listingType: 'BUSINESS' })
    expect((await POST(req(), makeParams('l1'))).status).toBe(404)
  })

  it('reports hasAiContent + useAi from a listing that already has stored AI content', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({
      ...listing,
      resumeUseAi: true,
      resumeAiContent: { summary: 'AI summary', skills: ['React'], experience: [] },
    })
    const body = await (await POST(req(), makeParams('l1'))).json()
    expect(body.settings).toMatchObject({ useAi: true, hasAiContent: true })
  })

  it('honours an explicit stored template / US locale', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ ...listing, resumeTemplate: 'MODERN', resumeLocale: 'US' })
    const body = await (await POST(req(), makeParams('l1'))).json()
    expect(body.settings).toMatchObject({ template: 'MODERN', locale: 'US' })
  })

  it('403 when not authorised', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(listing)
    checkEditAuthorization.mockResolvedValue({ ok: false, status: 403, error: 'no' })
    expect((await POST(req(), makeParams('l1'))).status).toBe(403)
  })

  it('returns the résumé slice, default settings (UK for Nigeria), and gaps', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(listing)
    const res = await POST(req(), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.listing.name).toBe('Jane')
    expect(body.listing).not.toHaveProperty('editContacts')
    expect(body.settings).toMatchObject({ template: 'CLASSIC', locale: 'UK', useAi: false, hasAiContent: false })
    // this fixture has no explicit end date issues but is missing languages/projects — gaps only lists ATS-critical ones
    expect(Array.isArray(body.gaps)).toBe(true)
  })
})
