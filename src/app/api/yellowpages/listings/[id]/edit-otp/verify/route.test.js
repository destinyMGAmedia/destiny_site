import { POST } from './route'
import prisma from '@/lib/prisma'
import { hashOtpCode } from '@/lib/yellowpages/otp'

vi.mock('@/lib/prisma', () => ({
  default: { yellowPagesEditOtp: { findFirst: vi.fn(), update: vi.fn() } },
}))
vi.mock('@/lib/email', () => ({ sendEditOtpEmail: vi.fn() }))

const makeParams = (id) => ({ params: Promise.resolve({ id }) })
const makeReq = (body) =>
  new Request('http://localhost/api/yellowpages/listings/l1/edit-otp/verify', {
    method: 'POST',
    body: JSON.stringify(body),
  })

describe('POST /api/yellowpages/listings/[id]/edit-otp/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.yellowPagesEditOtp.update.mockImplementation(({ data }) => ({
      id: 'otp1',
      attempts: typeof data?.attempts?.increment === 'number' ? 1 : 0,
    }))
  })

  it('400 when the code is missing', async () => {
    const res = await POST(makeReq({ to: 'jane@example.com' }), makeParams('l1'))
    expect(res.status).toBe(400)
  })

  it('400 when there is no live OTP for the contact', async () => {
    prisma.yellowPagesEditOtp.findFirst.mockResolvedValue(null)
    const res = await POST(makeReq({ to: 'jane@example.com', code: '123456' }), makeParams('l1'))
    expect(res.status).toBe(400)
  })

  it('400 and increments attempts on a wrong code', async () => {
    prisma.yellowPagesEditOtp.findFirst.mockResolvedValue({
      id: 'otp1', listingId: 'l1', attempts: 0, codeHash: hashOtpCode('654321'),
    })
    const res = await POST(makeReq({ to: 'jane@example.com', code: '000000' }), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.attemptsLeft).toBe(4)
    expect(prisma.yellowPagesEditOtp.update).toHaveBeenCalledWith({
      where: { id: 'otp1' },
      data: { attempts: { increment: 1 } },
    })
  })

  it('429 once attempts are exhausted', async () => {
    prisma.yellowPagesEditOtp.findFirst.mockResolvedValue({
      id: 'otp1', listingId: 'l1', attempts: 5, codeHash: hashOtpCode('654321'),
    })
    const res = await POST(makeReq({ to: 'jane@example.com', code: '654321' }), makeParams('l1'))
    expect(res.status).toBe(429)
  })

  it('returns an editToken and consumes the OTP on the right code', async () => {
    prisma.yellowPagesEditOtp.findFirst.mockResolvedValue({
      id: 'otp1', listingId: 'l1', attempts: 0, codeHash: hashOtpCode('654321'),
    })
    const res = await POST(makeReq({ to: 'jane@example.com', code: ' 654321 ' }), makeParams('l1'))
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.editToken).toBe('otp1')
    expect(prisma.yellowPagesEditOtp.update).toHaveBeenCalledWith({
      where: { id: 'otp1' },
      data: { consumedAt: expect.any(Date) },
    })
  })
})
