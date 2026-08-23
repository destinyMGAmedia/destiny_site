import { GET, PATCH, DELETE } from './route'
import { getServerSession } from 'next-auth'
import { isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: {
    yellowPagesListing: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

function makeParams(id) {
  return { params: Promise.resolve({ id }) }
}

function makePatchRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/yellowpages/listings/l1', {
    method: 'PATCH',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

describe('GET /api/yellowpages/listings/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 404 when the listing does not exist', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    const res = await GET(new Request('http://localhost'), makeParams('missing'))
    expect(res.status).toBe(404)
  })

  it('returns 404 for a deactivated listing (indistinguishable from nonexistent)', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', isActive: false, ratings: [] })
    const res = await GET(new Request('http://localhost'), makeParams('l1'))
    expect(res.status).toBe(404)
  })

  it('returns the listing with computed avgRating/ratingCount and redacted reviewer names', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({
      id: 'l1',
      isActive: true,
      ratings: [
        { id: 'r1', stars: 5, comment: 'Great', reviewerName: 'Jane Doe', createdAt: new Date() },
        { id: 'r2', stars: 3, comment: null, reviewerName: 'Bob', createdAt: new Date() },
      ],
    })
    const res = await GET(new Request('http://localhost'), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.listing.avgRating).toBe(4)
    expect(body.listing.ratingCount).toBe(2)
    expect(body.listing.ratings[0].reviewerName).toBe('Jane D.')
    expect(body.listing.ratings[1].reviewerName).toBe('Bob')
  })
})

describe('PATCH /api/yellowpages/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
  })

  it('returns 401 when unauthenticated', async () => {
    getServerSession.mockResolvedValue(null)
    const res = await PATCH(makePatchRequest({ isActive: false }), makeParams('l1'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated but not a global admin', async () => {
    isGlobalAdmin.mockReturnValue(false)
    const res = await PATCH(makePatchRequest({ isActive: false }), makeParams('l1'))
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await PATCH(makePatchRequest(null, { rawBody: '{bad' }), makeParams('l1'))
    expect(res.status).toBe(400)
  })

  it('returns 400 when isActive is not a boolean', async () => {
    const res = await PATCH(makePatchRequest({ isActive: 'nope' }), makeParams('l1'))
    expect(res.status).toBe(400)
  })

  it('returns 404 when the listing does not exist', async () => {
    const err = new Error('not found')
    err.code = 'P2025'
    prisma.yellowPagesListing.update.mockRejectedValue(err)
    const res = await PATCH(makePatchRequest({ isActive: false }), makeParams('missing'))
    expect(res.status).toBe(404)
  })

  it('deactivates the listing and returns it', async () => {
    prisma.yellowPagesListing.update.mockResolvedValue({ id: 'l1', isActive: false })
    const res = await PATCH(makePatchRequest({ isActive: false }), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.listing.isActive).toBe(false)
    expect(prisma.yellowPagesListing.update).toHaveBeenCalledWith({ where: { id: 'l1' }, data: { isActive: false } })
  })
})

describe('DELETE /api/yellowpages/listings/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
  })

  it('returns 401 when unauthenticated', async () => {
    getServerSession.mockResolvedValue(null)
    const res = await DELETE(new Request('http://localhost'), makeParams('l1'))
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated but not a global admin', async () => {
    isGlobalAdmin.mockReturnValue(false)
    const res = await DELETE(new Request('http://localhost'), makeParams('l1'))
    expect(res.status).toBe(403)
  })

  it('returns 404 when the listing does not exist', async () => {
    const err = new Error('not found')
    err.code = 'P2025'
    prisma.yellowPagesListing.delete.mockRejectedValue(err)
    const res = await DELETE(new Request('http://localhost'), makeParams('missing'))
    expect(res.status).toBe(404)
  })

  it('deletes the listing and returns success', async () => {
    prisma.yellowPagesListing.delete.mockResolvedValue({ id: 'l1' })
    const res = await DELETE(new Request('http://localhost'), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({ success: true })
  })
})
