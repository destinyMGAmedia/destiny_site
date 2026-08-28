import { GET } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: { yellowPagesListing: { findUnique: vi.fn() } },
}))

const makeParams = (id) => ({ params: Promise.resolve({ id }) })
const req = () => new Request('http://localhost/api/yellowpages/listings/l1/resume')

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
  city: 'Lagos',
  state: null,
  country: 'Nigeria',
  website: 'https://jane.dev',
  skills: ['React', 'Node.js'],
  languages: ['English'],
  experience: [{ title: 'Engineer', organization: 'Acme', startDate: '2020', endDate: '2024', current: false, description: 'Built things' }],
  education: [{ school: 'Uni', degree: 'BSc', field: 'CS', startYear: '2012', endYear: '2016' }],
  projects: [{ name: 'Thing', role: 'Lead', url: 'https://thing.dev', description: 'A thing' }],
  certifications: 'AWS SA',
}

describe('GET /api/yellowpages/listings/[id]/resume', () => {
  beforeEach(() => vi.clearAllMocks())

  it('404 when the listing does not exist', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    const res = await GET(req(), makeParams('nope'))
    expect(res.status).toBe(404)
  })

  it('404 for a BUSINESS listing (résumé is individual-only)', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ ...individual, listingType: 'BUSINESS' })
    const res = await GET(req(), makeParams('l1'))
    expect(res.status).toBe(404)
  })

  it('streams a PDF attachment for an INDIVIDUAL listing', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(individual)
    const res = await GET(req(), makeParams('l1'))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    expect(res.headers.get('Content-Disposition')).toContain('jane-developer-resume.pdf')
    const bytes = new Uint8Array(await res.arrayBuffer())
    expect(String.fromCharCode(...bytes.slice(0, 4))).toBe('%PDF')
    expect(bytes.length).toBeGreaterThan(1000)
  })
})
