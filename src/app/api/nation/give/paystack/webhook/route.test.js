import { POST } from './route'
import prisma from '@/lib/prisma'
import { verifyWebhookSignature } from '@/lib/nation/paystack'
import { sendContributionReceiptEmail } from '@/lib/email'

vi.mock('@/lib/prisma', () => ({
  default: {
    destinyNationContribution: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))
vi.mock('@/lib/nation/paystack', () => ({
  verifyWebhookSignature: vi.fn(),
}))
vi.mock('@/lib/email', () => ({
  sendPledgeNotificationEmail: vi.fn(),
  sendManualGivingNotificationEmail: vi.fn(),
  sendContributionReceiptEmail: vi.fn(),
  sendCredentialEmail: vi.fn(),
}))

function makeRequest(rawBody, signature = 'valid-sig') {
  return new Request('http://localhost/api/nation/give/paystack/webhook', {
    method: 'POST',
    headers: signature ? { 'x-paystack-signature': signature } : {},
    body: rawBody,
  })
}

const dvaCreditEvent = (overrides = {}) => ({
  event: 'charge.success',
  data: {
    channel: 'dedicated_nuban',
    amount: 3000000, // NGN 30,000 in kobo
    authorization: { receiver_bank_account_number: '9999999999' },
    ...overrides,
  },
})

describe('POST /api/nation/give/paystack/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when the signature does not verify', async () => {
    verifyWebhookSignature.mockReturnValue(false)
    const res = await POST(makeRequest(JSON.stringify(dvaCreditEvent())))
    expect(res.status).toBe(401)
    expect(prisma.destinyNationContribution.findUnique).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid JSON, even with a valid signature', async () => {
    verifyWebhookSignature.mockReturnValue(true)
    const res = await POST(makeRequest('not json'))
    expect(res.status).toBe(400)
  })

  it('acknowledges and ignores events that are not a dedicated_nuban charge.success', async () => {
    verifyWebhookSignature.mockReturnValue(true)
    const res = await POST(makeRequest(JSON.stringify({ event: 'transfer.success', data: {} })))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ received: true })
    expect(prisma.destinyNationContribution.findUnique).not.toHaveBeenCalled()
  })

  it('acknowledges and ignores a charge.success with no receiver account number', async () => {
    verifyWebhookSignature.mockReturnValue(true)
    const event = dvaCreditEvent()
    delete event.data.authorization.receiver_bank_account_number
    const res = await POST(makeRequest(JSON.stringify(event)))

    expect(res.status).toBe(200)
    expect(prisma.destinyNationContribution.findUnique).not.toHaveBeenCalled()
  })

  it('acknowledges (200) but does nothing when no contribution matches the DVA account number', async () => {
    verifyWebhookSignature.mockReturnValue(true)
    prisma.destinyNationContribution.findUnique.mockResolvedValue(null)

    const res = await POST(makeRequest(JSON.stringify(dvaCreditEvent())))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ received: true })
    expect(prisma.destinyNationContribution.update).not.toHaveBeenCalled()
  })

  it('is idempotent — does not re-update or re-email an already-SUCCESS contribution', async () => {
    verifyWebhookSignature.mockReturnValue(true)
    prisma.destinyNationContribution.findUnique.mockResolvedValue({ id: 'c1', status: 'SUCCESS' })

    const res = await POST(makeRequest(JSON.stringify(dvaCreditEvent())))

    expect(res.status).toBe(200)
    expect(prisma.destinyNationContribution.update).not.toHaveBeenCalled()
    expect(sendContributionReceiptEmail).not.toHaveBeenCalled()
  })

  it('marks a matched PENDING contribution SUCCESS and sends the donor a receipt', async () => {
    verifyWebhookSignature.mockReturnValue(true)
    prisma.destinyNationContribution.findUnique.mockResolvedValue({
      id: 'c1',
      status: 'PENDING',
      package: 'LADDER',
      tier: 'GATEKEEPER_FRIEND',
      amount: 30000,
      currency: 'NGN',
      donorEmail: 'ada@example.com',
      donorName: 'Ada Okoye',
    })
    prisma.destinyNationContribution.update.mockResolvedValue({
      id: 'c1',
      status: 'SUCCESS',
      package: 'LADDER',
      tier: 'GATEKEEPER_FRIEND',
      amount: 30000,
      currency: 'NGN',
      donorEmail: 'ada@example.com',
      donorName: 'Ada Okoye',
    })

    const res = await POST(makeRequest(JSON.stringify(dvaCreditEvent())))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ received: true })
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { status: 'SUCCESS' },
    })
    expect(sendContributionReceiptEmail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'ada@example.com', donorName: 'Ada Okoye' })
    )
  })

  it('still marks SUCCESS (with a logged warning) when the paid amount does not match the expected amount', async () => {
    verifyWebhookSignature.mockReturnValue(true)
    prisma.destinyNationContribution.findUnique.mockResolvedValue({
      id: 'c1',
      status: 'PENDING',
      package: 'LADDER',
      tier: 'GATEKEEPER_FRIEND',
      amount: 30000, // expects 3,000,000 kobo
      currency: 'NGN',
      donorEmail: 'ada@example.com',
      donorName: 'Ada Okoye',
    })
    prisma.destinyNationContribution.update.mockResolvedValue({ id: 'c1', status: 'SUCCESS', amount: 30000, currency: 'NGN' })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const event = dvaCreditEvent({ amount: 1000000 }) // NGN 10,000 — mismatched
    const res = await POST(makeRequest(JSON.stringify(event)))

    expect(res.status).toBe(200)
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: 'c1' },
      data: { status: 'SUCCESS' },
    })
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Amount mismatch'))
    warnSpy.mockRestore()
  })
})
