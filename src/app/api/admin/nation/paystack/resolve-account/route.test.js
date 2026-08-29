import { POST } from './route'
import { getServerSession } from 'next-auth'
import { isGlobalAdmin } from '@/lib/auth'
import { resolveAccount } from '@/lib/nation/paystack'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('@/lib/nation/paystack', () => ({ resolveAccount: vi.fn() }))

function makeRequest(body, { rawBody } = {}) {
  return new Request('http://localhost/api/admin/nation/paystack/resolve-account', {
    method: 'POST',
    body: rawBody !== undefined ? rawBody : JSON.stringify(body),
  })
}

describe('POST /api/admin/nation/paystack/resolve-account', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
  })

  it('returns 401 when not a global admin', async () => {
    isGlobalAdmin.mockReturnValue(false)
    const res = await POST(makeRequest({ accountNumber: '123', bankCode: '058' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await POST(makeRequest(null, { rawBody: 'not json' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when accountNumber or bankCode is missing', async () => {
    const res = await POST(makeRequest({ accountNumber: '123' }))
    const body = await res.json()
    expect(res.status).toBe(400)
    expect(body.error).toMatch(/accountNumber and bankCode/)
  })

  it('returns the resolved account name on success', async () => {
    resolveAccount.mockResolvedValue({ account_name: 'JOHN DOE', account_number: '0123456789' })
    const res = await POST(makeRequest({ accountNumber: '0123456789', bankCode: '058' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual({ accountName: 'JOHN DOE', accountNumber: '0123456789' })
  })

  it('returns 502 with the underlying message when resolution fails', async () => {
    resolveAccount.mockRejectedValue(new Error('Could not resolve account'))
    const res = await POST(makeRequest({ accountNumber: 'bad', bankCode: '058' }))
    const body = await res.json()

    expect(res.status).toBe(502)
    expect(body.error).toBe('Could not resolve account')
  })
})
