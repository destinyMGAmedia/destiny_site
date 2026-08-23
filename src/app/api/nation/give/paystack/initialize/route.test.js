import { POST } from './route'
import prisma from '@/lib/prisma'
import { createContributionDva } from '@/lib/nation/paystack'
import { sendPledgeNotificationEmail } from '@/lib/email'

vi.mock('@/lib/prisma', () => ({
  default: {
    destinyNationContribution: {
      create: vi.fn(),
      update: vi.fn(),
    },
    nationPaymentSettings: {
      findFirst: vi.fn(),
    },
  },
}))
vi.mock('@/lib/nation/paystack', () => ({
  createContributionDva: vi.fn(),
}))
vi.mock('@/lib/email', () => ({
  sendPledgeNotificationEmail: vi.fn(),
  sendManualGivingNotificationEmail: vi.fn(),
  sendContributionReceiptEmail: vi.fn(),
  sendCredentialEmail: vi.fn(),
}))

function makeRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/nation/give/paystack/initialize', {
    method: 'POST',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

const validDonor = { donorName: '  John Doe  ', donorEmail: '  John.Doe@Example.com  ' }

describe('POST /api/nation/give/paystack/initialize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid JSON body', async () => {
    const res = await POST(makeRequest(null, { rawBody: '{not valid' }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid JSON body' })
  })

  it('returns 400 for an invalid package value', async () => {
    const res = await POST(makeRequest({ package: 'NOT_A_PACKAGE', tier: 'GATEKEEPER_FRIEND', ...validDonor }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid package' })
  })

  it('returns 400 when donorName or donorEmail is missing', async () => {
    const res = await POST(makeRequest({ package: 'LADDER', tier: 'GATEKEEPER_FRIEND', donorEmail: 'a@b.com' }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'donorName and donorEmail are required' })
  })

  it('returns 400 for an unknown tier', async () => {
    const res = await POST(makeRequest({ package: 'LADDER', tier: 'NOT_A_TIER', ...validDonor }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'Invalid tier for the selected package' })
  })

  it('creates a PLEDGED contribution for a tier at/above the pledge cutoff, emails, and never touches Paystack settings', async () => {
    prisma.destinyNationContribution.create.mockResolvedValue({
      id: 'c1',
      reference: 'DN-PSK-1',
      donorName: 'John Doe',
      donorEmail: 'john.doe@example.com',
    })

    const res = await POST(makeRequest({ package: 'LADDER', tier: 'GATE_CHAMPION', ...validDonor }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ pledge: true, reference: 'DN-PSK-1' })
    expect(sendPledgeNotificationEmail).toHaveBeenCalledTimes(1)
    expect(prisma.nationPaymentSettings.findFirst).not.toHaveBeenCalled()
    expect(createContributionDva).not.toHaveBeenCalled()

    const createArgs = prisma.destinyNationContribution.create.mock.calls[0][0]
    expect(createArgs.data.status).toBe('PLEDGED')
    expect(createArgs.data.currency).toBe('NGN')
  })

  it('returns 503 and marks the row FAILED when payment settings are not configured yet', async () => {
    prisma.destinyNationContribution.create.mockResolvedValue({ id: 'c2', reference: 'DN-PSK-2' })
    prisma.nationPaymentSettings.findFirst.mockResolvedValue(null)

    const res = await POST(makeRequest({ package: 'LADDER', tier: 'GATEKEEPER_FRIEND', ...validDonor }))
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body.error).toMatch(/not configured yet/)
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: 'c2' },
      data: { status: 'FAILED' },
    })
    expect(createContributionDva).not.toHaveBeenCalled()
  })

  it('creates a per-gift DVA and returns its details for a non-pledge tier', async () => {
    prisma.destinyNationContribution.create.mockResolvedValue({ id: 'c3', reference: 'DN-PSK-3' })
    prisma.nationPaymentSettings.findFirst.mockResolvedValue({ subaccountCode: 'ACCT_church' })
    createContributionDva.mockResolvedValue({
      customerCode: 'CUS_1',
      bank: 'Wema Bank',
      accountNumber: '9999999999',
      accountName: 'DESTINY NATION',
    })

    const res = await POST(makeRequest({ package: 'LADDER', tier: 'GATEKEEPER_FRIEND', ...validDonor }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.reference).toMatch(/^DN-PSK-/)
    expect(body).toMatchObject({
      pledge: false,
      bank: 'Wema Bank',
      accountNumber: '9999999999',
      accountName: 'DESTINY NATION',
      amount: 30000,
    })
    expect(createContributionDva).toHaveBeenCalledWith({ reference: body.reference, subaccountCode: 'ACCT_church' })
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: 'c3' },
      data: {
        paystackCustomerCode: 'CUS_1',
        dvaBankName: 'Wema Bank',
        dvaAccountNumber: '9999999999',
        dvaAccountName: 'DESTINY NATION',
      },
    })
  })

  it('marks the contribution FAILED and returns 502 when DVA creation throws', async () => {
    prisma.destinyNationContribution.create.mockResolvedValue({ id: 'c4', reference: 'DN-PSK-4' })
    prisma.nationPaymentSettings.findFirst.mockResolvedValue({ subaccountCode: 'ACCT_church' })
    createContributionDva.mockRejectedValue(new Error('feature_unavailable'))

    const res = await POST(makeRequest({ package: 'LADDER', tier: 'GATEKEEPER_FRIEND', ...validDonor }))
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toMatch(/Unable to generate a giving account/)
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: 'c4' },
      data: { status: 'FAILED' },
    })
  })
})
