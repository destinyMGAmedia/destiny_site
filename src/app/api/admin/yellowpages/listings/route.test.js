import { GET } from './route'
import { getServerSession } from 'next-auth'
import { isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: {
    yellowPagesListing: { count: vi.fn(), findMany: vi.fn() },
  },
}))

function makeRequest(query = '') {
  return new Request(`http://localhost/api/admin/yellowpages/listings${query}`)
}

describe('GET /api/admin/yellowpages/listings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    prisma.yellowPagesListing.count.mockResolvedValue(0)
    prisma.yellowPagesListing.findMany.mockResolvedValue([])
  })

  it('returns 401 when unauthenticated', async () => {
    getServerSession.mockResolvedValue(null)
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 403 when authenticated but not a global admin', async () => {
    isGlobalAdmin.mockReturnValue(false)
    const res = await GET(makeRequest())
    expect(res.status).toBe(403)
  })

  it('returns 400 for an invalid category filter', async () => {
    const res = await GET(makeRequest('?category=NOT_REAL'))
    expect(res.status).toBe(400)
  })

  it('queries without an isActive filter by default (both active and inactive)', async () => {
    await GET(makeRequest())
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.isActive).toBeUndefined()
  })

  it('filters to active-only when status=active', async () => {
    await GET(makeRequest('?status=active'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.isActive).toBe(true)
  })

  it('filters to inactive-only when status=inactive', async () => {
    await GET(makeRequest('?status=inactive'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.isActive).toBe(false)
  })

  it('searches name, contactPersonName, phone, and email', async () => {
    await GET(makeRequest('?q=jane'))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.OR).toHaveLength(4)
  })

  it('computes avgRating/ratingCount and strips the raw ratings array', async () => {
    prisma.yellowPagesListing.findMany.mockResolvedValue([
      { id: 'l1', name: 'Acme', ratings: [{ stars: 5 }, { stars: 1 }] },
    ])
    prisma.yellowPagesListing.count.mockResolvedValue(1)
    const res = await GET(makeRequest())
    const body = await res.json()
    expect(body.listings[0]).toMatchObject({ id: 'l1', avgRating: 3, ratingCount: 2 })
    expect(body.listings[0].ratings).toBeUndefined()
  })
})
