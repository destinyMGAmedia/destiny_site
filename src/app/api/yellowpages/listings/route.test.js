import { GET, POST } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    yellowPagesListing: {
      count: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    assembly: {
      findUnique: vi.fn(),
    },
  },
}))

function makeGetRequest(query = '') {
  return new Request(`http://localhost/api/yellowpages/listings${query}`)
}

function makePostRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/yellowpages/listings', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

const validBusiness = {
  listingType: 'BUSINESS',
  name: 'Acme Travels',
  contactPersonName: 'Jane Doe',
  phone: '08012345678',
  category: 'TOURISM_TRAVEL',
  description: 'We plan trips.',
}

describe('GET /api/yellowpages/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.yellowPagesListing.count.mockResolvedValue(0)
    prisma.yellowPagesListing.findMany.mockResolvedValue([])
  })

  it('returns 400 for an invalid category', async () => {
    const res = await GET(makeGetRequest('?category=NOT_REAL'))
    expect(res.status).toBe(400)
  })

  it('only queries isActive listings', async () => {
    await GET(makeGetRequest())
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.isActive).toBe(true)
  })

  it('filters by category when provided', async () => {
    await GET(makeGetRequest('?category=TECHNOLOGY_IT'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.category).toBe('TECHNOLOGY_IT')
  })

  it('applies a text search across name/description/servicesOffered/subCategory', async () => {
    await GET(makeGetRequest('?q=plumb'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.OR).toHaveLength(4)
    expect(where.OR[0]).toEqual({ name: { contains: 'plumb', mode: 'insensitive' } })
  })

  it('returns an empty page (not an error) when assemblySlug does not match any assembly', async () => {
    prisma.assembly.findUnique.mockResolvedValue(null)
    const res = await GET(makeGetRequest('?assemblySlug=nowhere'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({ listings: [], page: 1, pageSize: 12, total: 0, totalPages: 0 })
    expect(prisma.yellowPagesListing.findMany).not.toHaveBeenCalled()
  })

  it('resolves assemblySlug to an assemblyId filter', async () => {
    prisma.assembly.findUnique.mockResolvedValue({ id: 'a1', slug: 'lagos' })
    await GET(makeGetRequest('?assemblySlug=lagos'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.assemblyId).toBe('a1')
  })

  it('computes avgRating and ratingCount from included ratings', async () => {
    prisma.yellowPagesListing.findMany.mockResolvedValue([
      { id: 'l1', name: 'Acme', ratings: [{ stars: 5 }, { stars: 3 }] },
      { id: 'l2', name: 'Beta', ratings: [] },
    ])
    prisma.yellowPagesListing.count.mockResolvedValue(2)
    const res = await GET(makeGetRequest())
    const body = await res.json()
    expect(body.listings[0]).toMatchObject({ id: 'l1', avgRating: 4, ratingCount: 2 })
    expect(body.listings[0].ratings).toBeUndefined()
    expect(body.listings[1]).toMatchObject({ id: 'l2', avgRating: null, ratingCount: 0 })
  })

  it('paginates using the page query param', async () => {
    await GET(makeGetRequest('?page=3'))
    const args = prisma.yellowPagesListing.findMany.mock.calls[0][0]
    expect(args.skip).toBe(24)
    expect(args.take).toBe(12)
  })
})

describe('POST /api/yellowpages/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makePostRequest(null, { rawBody: '{not json' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 with field errors for an invalid submission', async () => {
    const res = await POST(makePostRequest({ listingType: 'BUSINESS' }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.errors.name).toBeDefined()
    expect(body.errors.phone).toBeDefined()
  })

  it('returns 400 when assemblySlug does not resolve to a real assembly', async () => {
    prisma.assembly.findUnique.mockResolvedValue(null)
    const res = await POST(makePostRequest({ ...validBusiness, assemblySlug: 'nowhere' }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.errors.assemblySlug).toBeDefined()
    expect(prisma.yellowPagesListing.create).not.toHaveBeenCalled()
  })

  it('creates a listing and returns 201', async () => {
    prisma.yellowPagesListing.create.mockResolvedValue({ id: 'l1', ...validBusiness })
    const res = await POST(makePostRequest(validBusiness))
    const body = await res.json()

    expect(res.status).toBe(201)
    expect(body.listing).toMatchObject({ id: 'l1', avgRating: null, ratingCount: 0 })

    const createArgs = prisma.yellowPagesListing.create.mock.calls[0][0]
    expect(createArgs.data.name).toBe('Acme Travels')
    expect(createArgs.data.assemblyId).toBeNull()
  })

  it('never lets the client set memberId directly (not read from the request body at all)', async () => {
    prisma.yellowPagesListing.create.mockResolvedValue({ id: 'l1', ...validBusiness })
    await POST(makePostRequest({ ...validBusiness, memberId: 'someone-elses-member-id' }))
    const createArgs = prisma.yellowPagesListing.create.mock.calls[0][0]
    expect(createArgs.data.memberId).toBeUndefined()
  })

  it('resolves a provided assemblySlug to assemblyId on create', async () => {
    prisma.assembly.findUnique.mockResolvedValue({ id: 'a1', slug: 'lagos' })
    prisma.yellowPagesListing.create.mockResolvedValue({ id: 'l1', ...validBusiness })
    await POST(makePostRequest({ ...validBusiness, assemblySlug: 'lagos' }))
    const createArgs = prisma.yellowPagesListing.create.mock.calls[0][0]
    expect(createArgs.data.assemblyId).toBe('a1')
  })

  it('returns 500 when the database create fails', async () => {
    prisma.yellowPagesListing.create.mockRejectedValue(new Error('db down'))
    const res = await POST(makePostRequest(validBusiness))
    expect(res.status).toBe(500)
  })
})
