import { POST } from './route'
import prisma from '@/lib/prisma'
import { hashContact } from '@/lib/yellowpages/contact'

vi.mock('@/lib/prisma', () => ({
  default: {
    yellowPagesListing: { findUnique: vi.fn() },
    yellowPagesRating: { create: vi.fn() },
  },
}))
vi.mock('@/lib/yellowpages/contact', () => ({ hashContact: vi.fn(() => 'hashed-contact') }))

function makeParams(id) {
  return { params: Promise.resolve({ id }) }
}

function makeRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/yellowpages/listings/l1/ratings', {
    method: 'POST',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

const validRating = { stars: 5, reviewerName: 'Jane Doe', phone: '08012345678', comment: 'Great work!' }

describe('POST /api/yellowpages/listings/[id]/ratings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', isActive: true })
  })

  it('returns 404 when the listing does not exist', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    const res = await POST(makeRequest(validRating), makeParams('missing'))
    expect(res.status).toBe(404)
    expect(prisma.yellowPagesRating.create).not.toHaveBeenCalled()
  })

  it('returns 404 for a deactivated listing', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', isActive: false })
    const res = await POST(makeRequest(validRating), makeParams('l1'))
    expect(res.status).toBe(404)
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makeRequest(null, { rawBody: '{bad' }), makeParams('l1'))
    expect(res.status).toBe(400)
  })

  it('returns 400 for an out-of-range star rating', async () => {
    const res = await POST(makeRequest({ ...validRating, stars: 9 }), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.errors.stars).toBeDefined()
  })

  it('returns 400 when neither phone nor email is provided', async () => {
    const res = await POST(makeRequest({ stars: 5, reviewerName: 'Jane' }), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.errors.contact).toBeDefined()
  })

  it('hashes the contact and never persists or returns it raw', async () => {
    prisma.yellowPagesRating.create.mockResolvedValue({
      id: 'r1', stars: 5, comment: 'Great work!', reviewerName: 'Jane Doe', createdAt: new Date(),
    })
    const res = await POST(makeRequest(validRating), makeParams('l1'))
    const body = await res.json()

    expect(hashContact).toHaveBeenCalledWith('08012345678')
    const createArgs = prisma.yellowPagesRating.create.mock.calls[0][0]
    expect(createArgs.data.contactHash).toBe('hashed-contact')
    expect(createArgs.data.phone).toBeUndefined()
    expect(createArgs.data.email).toBeUndefined()
    expect(JSON.stringify(body)).not.toContain('08012345678')
    expect(JSON.stringify(body)).not.toContain('hashed-contact')
  })

  it('creates the rating and returns 201 with a redacted reviewer name', async () => {
    prisma.yellowPagesRating.create.mockResolvedValue({
      id: 'r1', stars: 5, comment: 'Great work!', reviewerName: 'Jane Doe', createdAt: new Date(),
    })
    const res = await POST(makeRequest(validRating), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.rating.reviewerName).toBe('Jane D.')
  })

  it('returns 409 when the contact has already rated this listing', async () => {
    const err = new Error('unique constraint')
    err.code = 'P2002'
    prisma.yellowPagesRating.create.mockRejectedValue(err)
    const res = await POST(makeRequest(validRating), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(409)
    expect(body.error).toMatch(/already rated/i)
  })

  it('returns 500 on unexpected database failure', async () => {
    prisma.yellowPagesRating.create.mockRejectedValue(new Error('db down'))
    const res = await POST(makeRequest(validRating), makeParams('l1'))
    expect(res.status).toBe(500)
  })
})
