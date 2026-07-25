import { GET } from './route'
import prisma from '@/lib/prisma'
import { verifyPayment } from '@/lib/flutterwave'
import { sendContributionReceiptEmail } from '@/lib/email'

vi.mock('@/lib/prisma', () => ({
  default: {
    destinyNationContribution: {
      findUnique: vi.fn(),
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

function makeRequest(params) {
  const url = new URL('http://localhost/api/nation/give/verify')
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, v)
  })
  return new Request(url.toString())
}

describe('GET /api/nation/give/verify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when tx_ref is missing', async () => {
    const req = makeRequest({ transaction_id: '123' })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'tx_ref and transaction_id are required' })
  })

  it('returns 400 when transaction_id is missing', async () => {
    const req = makeRequest({ tx_ref: 'DN-1' })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body).toEqual({ error: 'tx_ref and transaction_id are required' })
  })

  it('returns 404 when the contribution is not found', async () => {
    prisma.destinyNationContribution.findUnique.mockResolvedValue(null)

    const req = makeRequest({ tx_ref: 'DN-missing', transaction_id: '123' })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body).toEqual({ error: 'Contribution not found' })
  })

  it('returns cached status without calling verifyPayment when contribution is already SUCCESS', async () => {
    const contribution = {
      id: 'c1',
      reference: 'DN-1',
      status: 'SUCCESS',
      package: 'LADDER',
      tier: 'GATEKEEPER_FRIEND',
      amount: 30_000,
      currency: 'NGN',
    }
    prisma.destinyNationContribution.findUnique.mockResolvedValue(contribution)

    const req = makeRequest({ tx_ref: 'DN-1', transaction_id: '123' })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ status: 'SUCCESS', package: 'LADDER', tier: 'GATEKEEPER_FRIEND', amount: 30_000, currency: 'NGN' })
    expect(verifyPayment).not.toHaveBeenCalled()
    expect(prisma.destinyNationContribution.update).not.toHaveBeenCalled()
  })

  it('returns cached status without calling verifyPayment when contribution is already FAILED', async () => {
    const contribution = {
      id: 'c2',
      reference: 'DN-2',
      status: 'FAILED',
      package: 'LADDER',
      tier: 'GATEKEEPER_FRIEND',
      amount: 30_000,
      currency: 'NGN',
    }
    prisma.destinyNationContribution.findUnique.mockResolvedValue(contribution)

    const req = makeRequest({ tx_ref: 'DN-2', transaction_id: '123' })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('FAILED')
    expect(verifyPayment).not.toHaveBeenCalled()
  })

  it('returns 502 when verifyPayment throws', async () => {
    const contribution = {
      id: 'c3',
      reference: 'DN-3',
      status: 'PENDING',
      package: 'LADDER',
      tier: 'GATEKEEPER_FRIEND',
      amount: 30_000,
      currency: 'NGN',
    }
    prisma.destinyNationContribution.findUnique.mockResolvedValue(contribution)
    verifyPayment.mockRejectedValue(new Error('network error'))

    const req = makeRequest({ tx_ref: 'DN-3', transaction_id: '123' })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body).toEqual({ error: 'Unable to verify payment right now' })
    expect(prisma.destinyNationContribution.update).not.toHaveBeenCalled()
  })

  it('updates row, sends receipt email with resolved tier name, and returns updated fields on SUCCESS', async () => {
    const contribution = {
      id: 'c4',
      reference: 'DN-4',
      status: 'PENDING',
      package: 'LADDER',
      tier: 'GATEKEEPER_FRIEND',
      amount: 30_000,
      currency: 'NGN',
      donorEmail: 'jane@example.com',
      donorName: 'Jane Doe',
    }
    const updated = { ...contribution, status: 'SUCCESS' }
    prisma.destinyNationContribution.findUnique.mockResolvedValue(contribution)
    verifyPayment.mockResolvedValue({ status: 'SUCCESS' })
    prisma.destinyNationContribution.update.mockResolvedValue(updated)

    const req = makeRequest({ tx_ref: 'DN-4', transaction_id: '999' })
    const res = await GET(req)
    const body = await res.json()

    expect(verifyPayment).toHaveBeenCalledWith('999')
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: 'c4' },
      data: { status: 'SUCCESS' },
    })
    expect(sendContributionReceiptEmail).toHaveBeenCalledTimes(1)
    expect(sendContributionReceiptEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@example.com',
        donorName: 'Jane Doe',
        tierName: 'Gatekeeper Friend',
        packageLabel: 'Gatekeeper Giving Ladder',
        amount: 30_000,
        currency: 'NGN',
      })
    )
    expect(res.status).toBe(200)
    expect(body).toEqual({ status: 'SUCCESS', package: 'LADDER', tier: 'GATEKEEPER_FRIEND', amount: 30_000, currency: 'NGN' })
  })

  it('updates row but does NOT send receipt email on FAILED verify result', async () => {
    const contribution = {
      id: 'c5',
      reference: 'DN-5',
      status: 'PENDING',
      package: 'LADDER',
      tier: 'GATEKEEPER_FRIEND',
      amount: 30_000,
      currency: 'NGN',
      donorEmail: 'jane@example.com',
      donorName: 'Jane Doe',
    }
    const updated = { ...contribution, status: 'FAILED' }
    prisma.destinyNationContribution.findUnique.mockResolvedValue(contribution)
    verifyPayment.mockResolvedValue({ status: 'FAILED' })
    prisma.destinyNationContribution.update.mockResolvedValue(updated)

    const req = makeRequest({ tx_ref: 'DN-5', transaction_id: '111' })
    const res = await GET(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.status).toBe('FAILED')
    expect(sendContributionReceiptEmail).not.toHaveBeenCalled()
  })
})
