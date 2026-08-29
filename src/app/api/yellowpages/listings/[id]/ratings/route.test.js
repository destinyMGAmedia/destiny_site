import { POST } from './route'
import prisma from '@/lib/prisma'
import { hashContact } from '@/lib/yellowpages/contact'

vi.mock('@/lib/prisma', () => ({
  default: {
    yellowPagesListing: { findUnique: vi.fn() },
    yellowPagesRating: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
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

const savedRating = { id: 'r1', stars: 5, comment: 'Great work!', reviewerName: 'Jane Doe', createdAt: new Date() }

describe('POST /api/yellowpages/listings/[id]/ratings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', isActive: true })
    prisma.yellowPagesRating.findUnique.mockResolvedValue(null)
    prisma.yellowPagesRating.upsert.mockResolvedValue(savedRating)
  })

  it('returns 404 when the listing does not exist', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    const res = await POST(makeRequest(validRating), makeParams('missing'))
    expect(res.status).toBe(404)
    expect(prisma.yellowPagesRating.upsert).not.toHaveBeenCalled()
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
    const res = await POST(makeRequest(validRating), makeParams('l1'))
    const body = await res.json()

    expect(hashContact).toHaveBeenCalledWith('08012345678')
    const upsertArgs = prisma.yellowPagesRating.upsert.mock.calls[0][0]
    expect(upsertArgs.where.listingId_contactHash).toEqual({ listingId: 'l1', contactHash: 'hashed-contact' })
    expect(upsertArgs.create.contactHash).toBe('hashed-contact')
    expect(upsertArgs.create.phone).toBeUndefined()
    expect(upsertArgs.create.email).toBeUndefined()
    expect(upsertArgs.update.contactHash).toBeUndefined() // the dedupe key is never rewritten
    expect(JSON.stringify(body)).not.toContain('08012345678')
    expect(JSON.stringify(body)).not.toContain('hashed-contact')
  })

  it('creates a first-time rating and returns 201 with a redacted reviewer name', async () => {
    const res = await POST(makeRequest(validRating), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(201)
    expect(body.rating.reviewerName).toBe('Jane D.')
    expect(body.updated).toBe(false)
  })

  it('updates the existing rating (200, updated:true) when this contact has already reviewed', async () => {
    prisma.yellowPagesRating.findUnique.mockResolvedValue({ id: 'r1' })
    prisma.yellowPagesRating.upsert.mockResolvedValue({ ...savedRating, stars: 2, comment: 'Changed my mind' })

    const res = await POST(makeRequest({ ...validRating, stars: 2, comment: 'Changed my mind' }), makeParams('l1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.updated).toBe(true)
    expect(body.rating.stars).toBe(2)
    const upsertArgs = prisma.yellowPagesRating.upsert.mock.calls[0][0]
    expect(upsertArgs.update).toEqual({ stars: 2, comment: 'Changed my mind', reviewerName: 'Jane Doe' })
  })

  it('falls back to an update when a concurrent first submission wins the insert race (P2002)', async () => {
    const err = new Error('unique constraint')
    err.code = 'P2002'
    prisma.yellowPagesRating.upsert.mockRejectedValue(err)
    prisma.yellowPagesRating.update.mockResolvedValue(savedRating)

    const res = await POST(makeRequest(validRating), makeParams('l1'))

    expect(res.status).toBeLessThan(300)
    expect(prisma.yellowPagesRating.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { listingId_contactHash: { listingId: 'l1', contactHash: 'hashed-contact' } } })
    )
  })

  it('returns 500 on unexpected database failure', async () => {
    prisma.yellowPagesRating.upsert.mockRejectedValue(new Error('db down'))
    const res = await POST(makeRequest(validRating), makeParams('l1'))
    expect(res.status).toBe(500)
  })
})
