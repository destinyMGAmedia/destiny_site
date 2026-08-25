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
    assembly: {
      findUnique: vi.fn(),
    },
  },
}))

const validBusinessBody = {
  listingType: 'BUSINESS',
  name: 'Acme Travels',
  contactPersonName: 'Jane Doe',
  phone: '08012345678',
  category: 'TOURISM_TRAVEL',
  description: 'We plan trips.',
}

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

describe('PATCH /api/yellowpages/listings/[id] — admin mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
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

describe('PATCH /api/yellowpages/listings/[id] — owner self-edit mode (no admin session)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getServerSession.mockResolvedValue(null)
    isGlobalAdmin.mockReturnValue(false)
  })

  it('returns 400 when neither ownerPhone nor ownerEmail is provided', async () => {
    const res = await PATCH(makePatchRequest(validBusinessBody), makeParams('l1'))
    expect(res.status).toBe(400)
    expect(prisma.yellowPagesListing.findUnique).not.toHaveBeenCalled()
  })

  it('returns 404 when the listing does not exist', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    const res = await PATCH(makePatchRequest({ ...validBusinessBody, ownerPhone: '08012345678' }), makeParams('missing'))
    expect(res.status).toBe(404)
  })

  it('returns 403 when the given phone does not match the listing on file', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', phone: '08099999999', email: null })
    const res = await PATCH(makePatchRequest({ ...validBusinessBody, ownerPhone: '08012345678' }), makeParams('l1'))
    expect(res.status).toBe(403)
    expect(prisma.yellowPagesListing.update).not.toHaveBeenCalled()
  })

  it('returns 403 when the given email does not match (case-insensitively) the listing on file', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', phone: '08099999999', email: 'jane@acme.com' })
    const res = await PATCH(makePatchRequest({ ...validBusinessBody, ownerEmail: 'someone-else@acme.com' }), makeParams('l1'))
    expect(res.status).toBe(403)
  })

  it('returns 400 with field errors when the updated body fails validation', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', phone: '08012345678', email: null, assemblyId: null })
    const res = await PATCH(makePatchRequest({ ownerPhone: '08012345678', listingType: 'BUSINESS' }), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.errors.name).toBeDefined()
  })

  it('updates the listing when the phone matches (case: matching by phone)', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', phone: '08012345678', email: null, assemblyId: null })
    prisma.yellowPagesListing.update.mockResolvedValue({ id: 'l1', ...validBusinessBody })

    const res = await PATCH(makePatchRequest({ ...validBusinessBody, ownerPhone: '08012345678' }), makeParams('l1'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.listing.id).toBe('l1')
    const updateArgs = prisma.yellowPagesListing.update.mock.calls[0][0]
    expect(updateArgs.where).toEqual({ id: 'l1' })
    expect(updateArgs.data.name).toBe('Acme Travels')
  })

  it('updates the listing when the email matches (case-insensitively)', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', phone: '08000000000', email: 'jane@acme.com', assemblyId: null })
    prisma.yellowPagesListing.update.mockResolvedValue({ id: 'l1', ...validBusinessBody })

    const res = await PATCH(makePatchRequest({ ...validBusinessBody, ownerEmail: 'JANE@ACME.COM' }), makeParams('l1'))
    expect(res.status).toBe(200)
  })

  it('resolves a provided assemblySlug to assemblyId on update', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue({ id: 'l1', phone: '08012345678', email: null, assemblyId: null })
    prisma.assembly.findUnique.mockResolvedValue({ id: 'a1', slug: 'lagos' })
    prisma.yellowPagesListing.update.mockResolvedValue({ id: 'l1', ...validBusinessBody })

    await PATCH(makePatchRequest({ ...validBusinessBody, ownerPhone: '08012345678', assemblySlug: 'lagos' }), makeParams('l1'))

    const updateArgs = prisma.yellowPagesListing.update.mock.calls[0][0]
    expect(updateArgs.data.assemblyId).toBe('a1')
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
