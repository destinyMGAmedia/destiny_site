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
    member: {
      findFirst: vi.fn(),
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

  it('filters by category, matching the primary OR a business extra category', async () => {
    await GET(makeGetRequest('?category=TECHNOLOGY_IT'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.AND).toContainEqual({
      OR: [{ category: 'TECHNOLOGY_IT' }, { categories: { has: 'TECHNOLOGY_IT' } }],
    })
  })

  it('applies a text search across name/description/servicesOffered/subCategory/headline/skills', async () => {
    await GET(makeGetRequest('?q=plumb'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    const searchClause = where.AND.find((c) => c.OR?.some((o) => o.name))
    expect(searchClause.OR).toHaveLength(6)
    expect(searchClause.OR[0]).toEqual({ name: { contains: 'plumb', mode: 'insensitive' } })
    expect(searchClause.OR).toContainEqual({ headline: { contains: 'plumb', mode: 'insensitive' } })
    expect(searchClause.OR).toContainEqual({ skills: { has: 'plumb' } })
  })

  it('filters by listingType when provided', async () => {
    await GET(makeGetRequest('?listingType=INDIVIDUAL'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.listingType).toBe('INDIVIDUAL')
  })

  it('rejects an invalid listingType', async () => {
    const res = await GET(makeGetRequest('?listingType=ROBOT'))
    expect(res.status).toBe(400)
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

  it('returns a JSON 500 (not an unhandled crash) when the database is unreachable', async () => {
    prisma.yellowPagesListing.count.mockRejectedValue(new Error('P1001: Can’t reach database server'))
    const res = await GET(makeGetRequest())
    const body = await res.json()
    expect(res.status).toBe(500)
    expect(body.error).toBeDefined()
  })

  it('also returns a JSON 500 when the assemblySlug lookup itself fails', async () => {
    prisma.assembly.findUnique.mockRejectedValue(new Error('db down'))
    const res = await GET(makeGetRequest('?assemblySlug=lagos'))
    expect(res.status).toBe(500)
  })
})

describe('POST /api/yellowpages/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.member.findFirst.mockResolvedValue(null)
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

  describe('member association', () => {
    it('links the listing to a matching member of the chosen assembly (by phone/email)', async () => {
      prisma.assembly.findUnique.mockResolvedValue({ id: 'a1', slug: 'lagos' })
      prisma.member.findFirst.mockResolvedValue({ id: 'm1' })
      prisma.yellowPagesListing.create.mockResolvedValue({ id: 'l1', ...validBusiness })

      await POST(makePostRequest({ ...validBusiness, assemblySlug: 'lagos' }))

      const memberWhere = prisma.member.findFirst.mock.calls[0][0].where
      expect(memberWhere.assemblyId).toBe('a1')
      expect(memberWhere.OR).toEqual(
        expect.arrayContaining([{ phone: '08012345678' }])
      )
      expect(prisma.yellowPagesListing.create.mock.calls[0][0].data.memberId).toBe('m1')
    })

    it('leaves memberId unset when no member of that assembly matches', async () => {
      prisma.assembly.findUnique.mockResolvedValue({ id: 'a1', slug: 'lagos' })
      prisma.member.findFirst.mockResolvedValue(null)
      prisma.yellowPagesListing.create.mockResolvedValue({ id: 'l1', ...validBusiness })

      await POST(makePostRequest({ ...validBusiness, assemblySlug: 'lagos' }))

      expect(prisma.yellowPagesListing.create.mock.calls[0][0].data.memberId).toBeUndefined()
    })

    it('does not attempt a member lookup when no assembly is chosen', async () => {
      prisma.yellowPagesListing.create.mockResolvedValue({ id: 'l1', ...validBusiness })

      await POST(makePostRequest(validBusiness))

      expect(prisma.member.findFirst).not.toHaveBeenCalled()
      expect(prisma.yellowPagesListing.create.mock.calls[0][0].data.memberId).toBeUndefined()
    })

    it('ignores a client-supplied memberId and uses only the server-side lookup result', async () => {
      prisma.assembly.findUnique.mockResolvedValue({ id: 'a1', slug: 'lagos' })
      prisma.member.findFirst.mockResolvedValue({ id: 'real-member' })
      prisma.yellowPagesListing.create.mockResolvedValue({ id: 'l1', ...validBusiness })

      await POST(makePostRequest({ ...validBusiness, assemblySlug: 'lagos', memberId: 'attacker-supplied' }))

      expect(prisma.yellowPagesListing.create.mock.calls[0][0].data.memberId).toBe('real-member')
    })
  })
})
