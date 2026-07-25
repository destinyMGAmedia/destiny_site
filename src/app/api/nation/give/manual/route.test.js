import { POST } from './route'
import prisma from '@/lib/prisma'
import { sendManualGivingNotificationEmail } from '@/lib/email'

vi.mock('@/lib/prisma', () => ({
  default: {
    destinyNationContribution: {
      create: vi.fn(),
    },
  },
}))
vi.mock('@/lib/flutterwave', () => ({
  createPayment: vi.fn(),
  verifyPayment: vi.fn(),
}))
vi.mock('@/lib/email', () => ({
  sendPledgeNotificationEmail: vi.fn(),
  sendManualGivingNotificationEmail: vi.fn(),
  sendContributionReceiptEmail: vi.fn(),
  sendCredentialEmail: vi.fn(),
}))

function makeRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/nation/give/manual', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

const validDonor = { donorName: '  Jane Doe  ', donorEmail: '  Jane.Doe@Example.com  ' }

describe('POST /api/nation/give/manual', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid JSON body', async () => {
    const req = makeRequest(null, { rawBody: '{not valid json' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid JSON body' })
  })

  it('returns 400 for an invalid package value', async () => {
    const req = makeRequest({ package: 'BOGUS', tier: 'GATEKEEPER_FRIEND', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid package' })
  })

  it('returns 400 for an unsupported currency', async () => {
    const req = makeRequest({ package: 'LADDER', currency: 'XYZ', tier: 'GATEKEEPER_FRIEND', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid currency' })
  })

  it('returns 400 when donorName is missing', async () => {
    const req = makeRequest({ package: 'LADDER', tier: 'GATEKEEPER_FRIEND', donorEmail: 'a@b.com' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'donorName and donorEmail are required' })
  })

  it('returns 400 when donorEmail is missing', async () => {
    const req = makeRequest({ package: 'LADDER', tier: 'GATEKEEPER_FRIEND', donorName: 'Jane' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'donorName and donorEmail are required' })
  })

  it('returns 400 for an unknown tier for the given package', async () => {
    const req = makeRequest({ package: 'LADDER', tier: 'NOT_A_TIER', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid tier for the selected package' })
  })

  it('defaults currency to NGN when omitted', async () => {
    prisma.destinyNationContribution.create.mockResolvedValue({
      id: 'm1',
      reference: 'DN-MANUAL-1',
      donorName: 'Jane Doe',
      donorEmail: 'jane.doe@example.com',
      donorPhone: null,
      amount: 30_000,
    })

    const req = makeRequest({ package: 'LADDER', tier: 'GATEKEEPER_FRIEND', ...validDonor })
    await POST(req)

    const createArgs = prisma.destinyNationContribution.create.mock.calls[0][0]
    expect(createArgs.data.currency).toBe('NGN')
  })

  it('creates a manual PENDING contribution, sends notification email, and returns the reference', async () => {
    const created = {
      id: 'm2',
      reference: 'DN-MANUAL-2',
      donorName: 'Jane Doe',
      donorEmail: 'jane.doe@example.com',
      donorPhone: null,
      amount: 30_000,
    }
    prisma.destinyNationContribution.create.mockResolvedValue(created)

    const req = makeRequest({ package: 'LADDER', currency: 'NGN', tier: 'GATEKEEPER_FRIEND', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ reference: created.reference })

    const createArgs = prisma.destinyNationContribution.create.mock.calls[0][0]
    expect(createArgs.data.isManualEntry).toBe(true)
    expect(createArgs.data.status).toBe('PENDING')
    expect(createArgs.data.donorName).toBe('Jane Doe')
    expect(createArgs.data.donorEmail).toBe('jane.doe@example.com')

    expect(sendManualGivingNotificationEmail).toHaveBeenCalledTimes(1)
    expect(sendManualGivingNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        donorName: created.donorName,
        donorEmail: created.donorEmail,
      })
    )
  })
})
