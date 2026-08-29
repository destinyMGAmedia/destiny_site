import { POST } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    yellowPagesListing: { findUnique: vi.fn() },
    yellowPagesEditOtp: { findUnique: vi.fn() },
  },
}))

const makeParams = (id) => ({ params: Promise.resolve({ id }) })
const makeReq = (body, { rawBody } = {}) =>
  new Request('http://localhost/api/yellowpages/listings/l1/editable', {
    method: 'POST',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })

const listing = {
  id: 'l1',
  name: 'Jane Dev',
  phone: '08012345678',
  email: 'owner@example.com',
  editStrict: false,
  editContacts: ['editor@example.com'],
  editContactsRaw: 'x', // stand-in for the hidden fields the public GET strips
  assembly: { slug: 'hq', name: 'HQ' },
}

describe('POST /api/yellowpages/listings/[id]/editable', () => {
  beforeEach(() => vi.clearAllMocks())

  it('400 on an invalid JSON body', async () => {
    const res = await POST(makeReq(null, { rawBody: 'not json' }), makeParams('l1'))
    expect(res.status).toBe(400)
    expect(await res.json()).toMatchObject({ error: expect.any(String) })
  })

  it('404 when the listing does not exist', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    const res = await POST(makeReq({ ownerPhone: '08012345678' }), makeParams('missing'))
    expect(res.status).toBe(404)
  })

  it('400 when no verification method is supplied', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(listing)
    const res = await POST(makeReq({}), makeParams('l1'))
    expect(res.status).toBe(400)
  })

  it('403 for a phone/email not authorized to edit', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(listing)
    const res = await POST(makeReq({ ownerEmail: 'stranger@example.com' }), makeParams('l1'))
    expect(res.status).toBe(403)
  })

  it('returns the full listing when the owner phone matches', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(listing)
    const res = await POST(makeReq({ ownerPhone: '0801-234-5678' }), makeParams('l1'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.listing).toMatchObject({ id: 'l1', editContactsRaw: 'x' })
  })

  it('returns the full listing for a valid, recently-consumed edit token', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(listing)
    prisma.yellowPagesEditOtp.findUnique.mockResolvedValue({
      id: 'otp-1',
      listingId: 'l1',
      consumedAt: new Date(Date.now() - 60 * 1000),
    })
    const res = await POST(makeReq({ editToken: 'otp-1' }), makeParams('l1'))
    expect(res.status).toBe(200)
    expect((await res.json()).listing.id).toBe('l1')
  })

  it('403 for an expired edit token', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(listing)
    prisma.yellowPagesEditOtp.findUnique.mockResolvedValue({
      id: 'otp-1',
      listingId: 'l1',
      consumedAt: new Date(Date.now() - 999 * 60 * 1000),
    })
    const res = await POST(makeReq({ editToken: 'otp-1' }), makeParams('l1'))
    expect(res.status).toBe(403)
  })
})
