import { GET } from './route'
import { getServerSession } from 'next-auth'
import { isGlobalAdmin } from '@/lib/auth'
import { listBanks } from '@/lib/nation/paystack'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('@/lib/nation/paystack', () => ({ listBanks: vi.fn() }))

describe('GET /api/admin/nation/paystack/banks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when there is no session', async () => {
    getServerSession.mockResolvedValue(null)
    const res = await GET()
    expect(res.status).toBe(401)
    expect(listBanks).not.toHaveBeenCalled()
  })

  it('returns 401 when the session is not a global admin', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'APP_ADMIN' } })
    isGlobalAdmin.mockReturnValue(false)
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns the bank list for a global admin', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    listBanks.mockResolvedValue([{ name: 'Wema Bank', code: '035' }])

    const res = await GET()
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ banks: [{ name: 'Wema Bank', code: '035' }] })
  })

  it('returns 502 when listBanks throws', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    listBanks.mockRejectedValue(new Error('Paystack down'))

    const res = await GET()
    expect(res.status).toBe(502)
  })
})
