import { POST } from './route'
import prisma from '@/lib/prisma'
import { sendEditOtpEmail } from '@/lib/email'

vi.mock('@/lib/prisma', () => ({
  default: {
    yellowPagesListing: { findUnique: vi.fn() },
    yellowPagesEditOtp: { count: vi.fn(), create: vi.fn() },
  },
}))
vi.mock('@/lib/email', () => ({ sendEditOtpEmail: vi.fn().mockResolvedValue(undefined) }))

const makeParams = (id) => ({ params: Promise.resolve({ id }) })
const makeReq = (body, { rawBody } = {}) =>
  new Request('http://localhost/api/yellowpages/listings/l1/edit-otp', {
    method: 'POST',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })

const activeListing = (over = {}) => ({
  id: 'l1',
  name: 'Jane Dev',
  isActive: true,
  phone: '08012345678',
  email: 'jane@example.com',
  editStrict: false,
  editContacts: [],
  ...over,
})

describe('POST /api/yellowpages/listings/[id]/edit-otp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.yellowPagesEditOtp.count.mockResolvedValue(0)
    prisma.yellowPagesEditOtp.create.mockResolvedValue({ id: 'otp1' })
  })

  it('404 when the listing is missing or inactive', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(null)
    const res = await POST(makeReq({ to: 'jane@example.com' }), makeParams('nope'))
    expect(res.status).toBe(404)
  })

  it('400 for an invalid contact', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    const res = await POST(makeReq({ to: 'not-a-contact' }), makeParams('l1'))
    expect(res.status).toBe(400)
  })

  it('403 when the contact is not on file for the listing', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    const res = await POST(makeReq({ to: 'stranger@example.com' }), makeParams('l1'))
    expect(res.status).toBe(403)
    expect(prisma.yellowPagesEditOtp.create).not.toHaveBeenCalled()
  })

  it('emails a code and stores a hashed OTP when the email is on file', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    const res = await POST(makeReq({ to: 'JANE@example.com' }), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.sent).toBe(true)
    expect(body.channel).toBe('EMAIL')
    expect(body.maskedTo).toContain('@example.com')
    expect(sendEditOtpEmail).toHaveBeenCalledTimes(1)
    const stored = prisma.yellowPagesEditOtp.create.mock.calls[0][0].data
    expect(stored.channel).toBe('EMAIL')
    expect(stored.codeHash).toMatch(/^[a-f0-9]{64}$/)
    expect(stored).not.toHaveProperty('code')
    // the emailed code is 6 digits and is never the stored hash
    expect(sendEditOtpEmail.mock.calls[0][0].code).toMatch(/^\d{6}$/)
  })

  it('400 for a phone contact — editing is verified by email only', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    const res = await POST(makeReq({ to: '08012345678' }), makeParams('l1'))
    expect(res.status).toBe(400)
    expect(prisma.yellowPagesEditOtp.create).not.toHaveBeenCalled()
  })

  it('429 when the per-contact hourly rate limit is hit', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    prisma.yellowPagesEditOtp.count.mockResolvedValue(5)
    const res = await POST(makeReq({ to: 'jane@example.com' }), makeParams('l1'))
    expect(res.status).toBe(429)
  })

  it('with editStrict, only editContacts entries are accepted', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(
      activeListing({ editStrict: true, editContacts: ['editor@example.com'] }),
    )
    const denied = await POST(makeReq({ to: 'jane@example.com' }), makeParams('l1'))
    expect(denied.status).toBe(403)

    const allowed = await POST(makeReq({ to: 'editor@example.com' }), makeParams('l1'))
    expect(allowed.status).toBe(200)
  })

  it('non-strict listings also accept an editContacts email that is not the public email', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(
      activeListing({ editStrict: false, email: 'jane@example.com', editContacts: ['assistant@example.com'] }),
    )
    const res = await POST(makeReq({ to: 'assistant@example.com' }), makeParams('l1'))
    expect(res.status).toBe(200)
    expect(sendEditOtpEmail).toHaveBeenCalledTimes(1)
    expect(sendEditOtpEmail.mock.calls[0][0].to).toBe('assistant@example.com')
  })

  it('rate-limits per (listing, contact): the count query is scoped to this listing and a contact hash', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    await POST(makeReq({ to: 'jane@example.com' }), makeParams('l1'))
    const where = prisma.yellowPagesEditOtp.count.mock.calls[0][0].where
    expect(where.listingId).toBe('l1')
    expect(where.contactHash).toMatch(/^[a-f0-9]{64}$/)
    expect(where.createdAt.gt).toBeInstanceOf(Date)
    // the stored row is keyed by the same contact hash, and that hash is not the code hash
    const stored = prisma.yellowPagesEditOtp.create.mock.calls[0][0].data
    expect(stored.contactHash).toBe(where.contactHash)
    expect(stored.contactHash).not.toBe(stored.codeHash)
  })

  it('stores an expiry in the future and reports the matching TTL in the response', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    const before = Date.now()
    const res = await POST(makeReq({ to: 'jane@example.com' }), makeParams('l1'))
    const body = await res.json()
    const expiresAt = prisma.yellowPagesEditOtp.create.mock.calls[0][0].data.expiresAt
    expect(expiresAt).toBeInstanceOf(Date)
    expect(expiresAt.getTime()).toBeGreaterThan(before)
    expect(expiresAt.getTime() - before).toBeLessThanOrEqual(body.expiresInMinutes * 60 * 1000 + 1000)
  })

  it('400 with an "Invalid JSON body" error when the request body is not JSON', async () => {
    const res = await POST(makeReq(null, { rawBody: 'not-json{' }), makeParams('l1'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid JSON body' })
    expect(prisma.yellowPagesListing.findUnique).not.toHaveBeenCalled()
  })

  it('400 when `to` is missing / empty / whitespace-only', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    for (const body of [{}, { to: '' }, { to: '   ' }]) {
      const res = await POST(makeReq(body), makeParams('l1'))
      expect(res.status).toBe(400)
    }
    expect(prisma.yellowPagesEditOtp.create).not.toHaveBeenCalled()
  })

  it('404 when the listing exists but is inactive', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing({ isActive: false }))
    const res = await POST(makeReq({ to: 'jane@example.com' }), makeParams('l1'))
    expect(res.status).toBe(404)
    expect(prisma.yellowPagesEditOtp.create).not.toHaveBeenCalled()
  })

  it('does not count against the rate limit or send when the contact is unauthorised', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    await POST(makeReq({ to: 'stranger@example.com' }), makeParams('l1'))
    expect(prisma.yellowPagesEditOtp.count).not.toHaveBeenCalled()
    expect(sendEditOtpEmail).not.toHaveBeenCalled()
  })

  it('429 fires exactly at the limit (>=), not one request early', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    prisma.yellowPagesEditOtp.count.mockResolvedValueOnce(4) // one below the cap of 5
    const ok = await POST(makeReq({ to: 'jane@example.com' }), makeParams('l1'))
    expect(ok.status).toBe(200)
  })

  it('502 (and no thrown error) when the email provider fails', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    sendEditOtpEmail.mockRejectedValueOnce(new Error('resend is down'))
    const res = await POST(makeReq({ to: 'jane@example.com' }), makeParams('l1'))
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: 'We could not send the code right now. Please try again.' })
    // the OTP row is still written before the send is attempted
    expect(prisma.yellowPagesEditOtp.create).toHaveBeenCalledTimes(1)
  })

  it('the success body masks the address and reports the TTL, and passes the raw address to the mailer', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    const res = await POST(makeReq({ to: '  JANE@example.com  ' }), makeParams('l1'))
    const body = await res.json()
    expect(body).toMatchObject({ sent: true, channel: 'EMAIL', expiresInMinutes: 10 })
    expect(body.maskedTo).toMatch(/@example\.com$/)
    expect(body.maskedTo).not.toBe('jane@example.com')
    expect(sendEditOtpEmail.mock.calls[0][0].to).toBe('jane@example.com')
    expect(sendEditOtpEmail.mock.calls[0][0].listingName).toBe('Jane Dev')
  })
})
