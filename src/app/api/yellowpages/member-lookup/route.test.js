import { POST } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    assembly: { findUnique: vi.fn() },
    member: { findFirst: vi.fn() },
  },
}))

function makeRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/yellowpages/member-lookup', {
    method: 'POST',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

describe('POST /api/yellowpages/member-lookup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.assembly.findUnique.mockResolvedValue({ id: 'a1', name: 'Lagos Assembly' })
    prisma.member.findFirst.mockResolvedValue(null)
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makeRequest(null, { rawBody: '{bad' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when assemblySlug is missing', async () => {
    const res = await POST(makeRequest({ phone: '08012345678' }))
    expect(res.status).toBe(400)
    expect(prisma.assembly.findUnique).not.toHaveBeenCalled()
  })

  it('returns 400 when neither phone nor email is provided', async () => {
    const res = await POST(makeRequest({ assemblySlug: 'lagos' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for a malformed phone', async () => {
    const res = await POST(makeRequest({ assemblySlug: 'lagos', phone: '123' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for a malformed email (when no phone given)', async () => {
    const res = await POST(makeRequest({ assemblySlug: 'lagos', email: 'nope' }))
    expect(res.status).toBe(400)
  })

  it('returns 404 when the assembly slug does not resolve', async () => {
    prisma.assembly.findUnique.mockResolvedValue(null)
    const res = await POST(makeRequest({ assemblySlug: 'nowhere', phone: '08012345678' }))
    expect(res.status).toBe(404)
    expect(prisma.member.findFirst).not.toHaveBeenCalled()
  })

  it('scopes the member lookup to the resolved assembly and normalizes the phone', async () => {
    await POST(makeRequest({ assemblySlug: 'lagos', phone: '0801 234 5678' }))
    const where = prisma.member.findFirst.mock.calls[0][0].where
    expect(where.assemblyId).toBe('a1')
    expect(where.OR).toContainEqual({ phone: '08012345678' })
  })

  it('matches email case-insensitively', async () => {
    await POST(makeRequest({ assemblySlug: 'lagos', email: 'Jane@Example.com' }))
    const where = prisma.member.findFirst.mock.calls[0][0].where
    expect(where.OR).toContainEqual({ email: { equals: 'jane@example.com', mode: 'insensitive' } })
  })

  it('returns found:true with only the member name when a match exists', async () => {
    prisma.member.findFirst.mockResolvedValue({ firstName: 'Jane', lastName: 'Doe' })
    const res = await POST(makeRequest({ assemblySlug: 'lagos', phone: '08012345678' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toEqual({
      assembly: { slug: 'lagos', name: 'Lagos Assembly' },
      found: true,
      member: { firstName: 'Jane', lastName: 'Doe' },
    })
  })

  it('never leaks the member id or contact fields', async () => {
    prisma.member.findFirst.mockResolvedValue({ firstName: 'Jane', lastName: 'Doe' })
    const res = await POST(makeRequest({ assemblySlug: 'lagos', phone: '08012345678' }))
    const body = await res.json()
    expect(body.member).not.toHaveProperty('id')
    expect(body.member).not.toHaveProperty('phone')
    expect(body.member).not.toHaveProperty('email')
    // the select must not request identifying columns beyond the name
    const select = prisma.member.findFirst.mock.calls[0][0].select
    expect(select).toEqual({ firstName: true, lastName: true })
  })

  it('returns found:false (200) when no member of that assembly matches', async () => {
    const res = await POST(makeRequest({ assemblySlug: 'lagos', email: 'stranger@example.com' }))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.found).toBe(false)
    expect(body.member).toBeNull()
  })

  it('returns a JSON 500 when the database is unreachable', async () => {
    prisma.assembly.findUnique.mockRejectedValue(new Error('db down'))
    const res = await POST(makeRequest({ assemblySlug: 'lagos', phone: '08012345678' }))
    expect(res.status).toBe(500)
  })
})
