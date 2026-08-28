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

  it('falls back to PHONE_MATCH for a phone contact (no SMS provider)', async () => {
    prisma.yellowPagesListing.findUnique.mockResolvedValue(activeListing())
    const res = await POST(makeReq({ to: '08012345678' }), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toMatchObject({ sent: false, fallback: 'PHONE_MATCH', channel: 'SMS' })
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
})
