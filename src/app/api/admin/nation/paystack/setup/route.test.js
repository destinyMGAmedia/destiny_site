import { GET, POST } from './route'
import { getServerSession } from 'next-auth'
import { isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { resolveAccount, createSubaccount } from '@/lib/nation/paystack'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: {
    nationPaymentSettings: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))
vi.mock('@/lib/nation/paystack', () => ({
  resolveAccount: vi.fn(),
  createSubaccount: vi.fn(),
}))

function makeRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/admin/nation/paystack/setup', {
    method: 'POST',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

describe('/api/admin/nation/paystack/setup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
  })

  describe('GET', () => {
    it('returns 401 when not a global admin', async () => {
      isGlobalAdmin.mockReturnValue(false)
      const res = await GET()
      expect(res.status).toBe(401)
    })

    it('returns the current settings, or null if none exist', async () => {
      prisma.nationPaymentSettings.findFirst.mockResolvedValue(null)
      const res = await GET()
      const body = await res.json()
      expect(body).toEqual({ settings: null })
    })
  })

  describe('POST', () => {
    it('returns 401 when not a global admin', async () => {
      isGlobalAdmin.mockReturnValue(false)
      const res = await POST(makeRequest({}))
      expect(res.status).toBe(401)
    })

    it('returns 400 for invalid JSON', async () => {
      const res = await POST(makeRequest(null, { rawBody: 'not json' }))
      expect(res.status).toBe(400)
    })

    it('returns 400 when required fields are missing', async () => {
      const res = await POST(makeRequest({ bankCode: '058' }))
      const body = await res.json()
      expect(res.status).toBe(400)
      expect(body.error).toMatch(/bankCode, bankName, and accountNumber/)
    })

    it('returns 400 with the underlying message when account resolution fails', async () => {
      resolveAccount.mockRejectedValue(new Error('Invalid account'))
      const res = await POST(makeRequest({ bankCode: '058', bankName: 'GTBank', accountNumber: 'bad' }))
      const body = await res.json()

      expect(res.status).toBe(400)
      expect(body.error).toMatch(/Invalid account/)
      expect(createSubaccount).not.toHaveBeenCalled()
    })

    it('returns 502 with the underlying message when subaccount creation fails', async () => {
      resolveAccount.mockResolvedValue({ account_name: 'DESTINY MISSION GLOBAL ASSEMBLY' })
      createSubaccount.mockRejectedValue(new Error('Paystack rejected the subaccount'))

      const res = await POST(makeRequest({ bankCode: '058', bankName: 'GTBank', accountNumber: '0123456789' }))
      const body = await res.json()

      expect(res.status).toBe(502)
      expect(body.error).toMatch(/Paystack rejected the subaccount/)
    })

    it('creates a new settings row (with business_name "Destiny Mission Global Assembly" and 0% platform cut) when none exists', async () => {
      resolveAccount.mockResolvedValue({ account_name: 'DESTINY MISSION GLOBAL ASSEMBLY' })
      createSubaccount.mockResolvedValue('ACCT_church123')
      prisma.nationPaymentSettings.findFirst.mockResolvedValue(null)
      prisma.nationPaymentSettings.create.mockResolvedValue({
        id: 's1',
        bankCode: '058',
        bankName: 'GTBank',
        accountNumber: '0123456789',
        accountName: 'DESTINY MISSION GLOBAL ASSEMBLY',
        subaccountCode: 'ACCT_church123',
      })

      const res = await POST(makeRequest({ bankCode: '058', bankName: 'GTBank', accountNumber: '0123456789' }))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.settings.subaccountCode).toBe('ACCT_church123')
      expect(createSubaccount).toHaveBeenCalledWith(
        expect.objectContaining({ businessName: 'Destiny Mission Global Assembly', percentageCharge: 0 })
      )
      expect(prisma.nationPaymentSettings.create).toHaveBeenCalledTimes(1)
      expect(prisma.nationPaymentSettings.update).not.toHaveBeenCalled()
    })

    it('updates the existing settings row instead of creating a second one', async () => {
      resolveAccount.mockResolvedValue({ account_name: 'DESTINY MISSION GLOBAL ASSEMBLY' })
      createSubaccount.mockResolvedValue('ACCT_new456')
      prisma.nationPaymentSettings.findFirst.mockResolvedValue({ id: 'existing-1' })
      prisma.nationPaymentSettings.update.mockResolvedValue({ id: 'existing-1', subaccountCode: 'ACCT_new456' })

      const res = await POST(makeRequest({ bankCode: '058', bankName: 'GTBank', accountNumber: '0123456789' }))
      await res.json()

      expect(prisma.nationPaymentSettings.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'existing-1' } })
      )
      expect(prisma.nationPaymentSettings.create).not.toHaveBeenCalled()
    })
  })
})
