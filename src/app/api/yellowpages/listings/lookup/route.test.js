import { POST } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    yellowPagesListing: { findMany: vi.fn() },
  },
}))

function makeRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/yellowpages/listings/lookup', {
    method: 'POST',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

describe('POST /api/yellowpages/listings/lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.yellowPagesListing.findMany.mockResolvedValue([])
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makeRequest(null, { rawBody: '{bad' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when neither phone nor email is provided', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    expect(prisma.yellowPagesListing.findMany).not.toHaveBeenCalled()
  })

  it('returns 400 for a malformed phone', async () => {
    const res = await POST(makeRequest({ phone: '123' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for a malformed email', async () => {
    const res = await POST(makeRequest({ email: 'not-an-email' }))
    expect(res.status).toBe(400)
  })

  it('looks up by exact phone match', async () => {
    await POST(makeRequest({ phone: '0801 234 5678' }))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.OR).toContainEqual({ phone: '08012345678' })
  })

  it('looks up by case-insensitive email match', async () => {
    await POST(makeRequest({ email: 'Jane@Example.com' }))
    const where = prisma.yellowPagesListing.findMany.mock.calls[0][0].where
    expect(where.OR).toContainEqual({ email: { equals: 'jane@example.com', mode: 'insensitive' } })
  })

  it('returns the full matching listings, including inactive ones', async () => {
    const listings = [{ id: 'l1', name: 'Acme', isActive: false }]
    prisma.yellowPagesListing.findMany.mockResolvedValue(listings)
    const res = await POST(makeRequest({ phone: '08012345678' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.listings).toEqual(listings)
  })
})
