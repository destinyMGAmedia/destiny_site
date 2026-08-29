import { POST } from './route'
import prisma from '@/lib/prisma'
import { createPayment } from '@/lib/flutterwave'
import { sendPledgeNotificationEmail } from '@/lib/email'

vi.mock('@/lib/prisma', () => ({
  default: {
    destinyNationContribution: {
      create: vi.fn(),
      update: vi.fn(),
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

function makeRequest(body, { rawBody, headers } = {}) {
  return new Request('http://localhost/api/nation/give/initialize', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', ...(headers || {}) },
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

const validDonor = { donorName: '  John Doe  ', donorEmail: '  John.Doe@Example.com  ' }

describe('POST /api/nation/give/initialize', () => {
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
    const req = makeRequest({ package: 'NOT_A_PACKAGE', currency: 'NGN', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid package' })
  })

  it('returns 400 for an unsupported currency', async () => {
    const req = makeRequest({ package: 'LADDER', currency: 'ZZZ', tier: 'GATEKEEPER_FRIEND', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid currency' })
  })

  it('returns 400 when donorName is missing', async () => {
    const req = makeRequest({ package: 'LADDER', currency: 'NGN', tier: 'GATEKEEPER_FRIEND', donorEmail: 'a@b.com' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'donorName and donorEmail are required' })
  })

  it('returns 400 when donorEmail is missing', async () => {
    const req = makeRequest({ package: 'LADDER', currency: 'NGN', tier: 'GATEKEEPER_FRIEND', donorName: 'John' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'donorName and donorEmail are required' })
  })

  it('returns 400 for an unknown tier for the given package', async () => {
    const req = makeRequest({ package: 'LADDER', currency: 'NGN', tier: 'NOT_A_TIER', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid tier for the selected package' })
  })

  it('creates a PLEDGED contribution for a LADDER tier at/above the pledge cutoff, sends notification, and does not call createPayment', async () => {
    const created = {
      id: 'c1',
      reference: 'DN-123-abcd1234',
      donorName: 'John Doe',
      donorEmail: 'john.doe@example.com',
      donorPhone: null,
      donorOrg: null,
    }
    prisma.destinyNationContribution.create.mockResolvedValue(created)

    const req = makeRequest({ package: 'LADDER', currency: 'NGN', tier: 'GATE_CHAMPION', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ pledge: true, reference: created.reference })
    expect(sendPledgeNotificationEmail).toHaveBeenCalledTimes(1)
    expect(createPayment).not.toHaveBeenCalled()

    const createArgs = prisma.destinyNationContribution.create.mock.calls[0][0]
    expect(createArgs.data.status).toBe('PLEDGED')
    expect(createArgs.data.isPledge).toBe(true)
    expect(createArgs.data.donorName).toBe('John Doe')
    expect(createArgs.data.donorEmail).toBe('john.doe@example.com')
  })

  it('creates a PLEDGED contribution for any FOUNDERS_CIRCLE tier, sends notification, and does not call createPayment', async () => {
    const created = {
      id: 'c2',
      reference: 'DN-456-efgh5678',
      donorName: 'John Doe',
      donorEmail: 'john.doe@example.com',
      donorPhone: null,
      donorOrg: null,
    }
    prisma.destinyNationContribution.create.mockResolvedValue(created)

    const req = makeRequest({ package: 'FOUNDERS_CIRCLE', currency: 'NGN', tier: 'BRONZE', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ pledge: true, reference: created.reference })
    expect(sendPledgeNotificationEmail).toHaveBeenCalledTimes(1)
    expect(createPayment).not.toHaveBeenCalled()
  })

  it('trims donorName and trims+lowercases donorEmail passed to prisma.create', async () => {
    prisma.destinyNationContribution.create.mockResolvedValue({
      id: 'c3',
      reference: 'DN-1',
      donorName: 'John Doe',
      donorEmail: 'john.doe@example.com',
    })

    const req = makeRequest({
      package: 'LADDER',
      currency: 'NGN',
      tier: 'GATE_CHAMPION',
      donorName: '  John Doe  ',
      donorEmail: '  JOHN.DOE@EXAMPLE.COM  ',
    })
    await POST(req)

    const createArgs = prisma.destinyNationContribution.create.mock.calls[0][0]
    expect(createArgs.data.donorName).toBe('John Doe')
    expect(createArgs.data.donorEmail).toBe('john.doe@example.com')
  })

  it('calls createPayment and returns the checkout link for a non-pledge tier', async () => {
    const created = {
      id: 'c4',
      reference: 'DN-789-ijkl9012',
      donorName: 'John Doe',
      donorEmail: 'john.doe@example.com',
    }
    prisma.destinyNationContribution.create.mockResolvedValue(created)
    createPayment.mockResolvedValue('https://checkout.flutterwave.com/pay/xyz')

    const req = makeRequest({ package: 'LADDER', currency: 'NGN', tier: 'GATEKEEPER_FRIEND', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ pledge: false, link: 'https://checkout.flutterwave.com/pay/xyz' })
    expect(createPayment).toHaveBeenCalledTimes(1)
    expect(sendPledgeNotificationEmail).not.toHaveBeenCalled()
  })

  it('marks contribution FAILED and returns 502 when createPayment throws', async () => {
    const created = {
      id: 'c5',
      reference: 'DN-999-mnop3456',
      donorName: 'John Doe',
      donorEmail: 'john.doe@example.com',
    }
    prisma.destinyNationContribution.create.mockResolvedValue(created)
    createPayment.mockRejectedValue(new Error('Flutterwave down'))
    prisma.destinyNationContribution.update.mockResolvedValue({ ...created, status: 'FAILED' })

    const req = makeRequest({ package: 'LADDER', currency: 'NGN', tier: 'GATEKEEPER_FRIEND', ...validDonor })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body).toEqual({ error: 'Unable to start payment. Please try again shortly.' })
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: created.id },
      data: { status: 'FAILED' },
    })
  })
})
