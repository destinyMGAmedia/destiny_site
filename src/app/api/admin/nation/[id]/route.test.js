import { PATCH } from './route'
import { getServerSession } from 'next-auth'
import { isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('@/lib/prisma', () => ({
  default: {
    destinyNationContribution: {
      update: vi.fn(),
    },
  },
}))

function makeRequest(body) {
  return new Request('http://localhost/api/admin/nation/abc', {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/admin/nation/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when there is no session', async () => {
    getServerSession.mockResolvedValue(null)
    isGlobalAdmin.mockReturnValue(false)

    const req = makeRequest({ followUpNotes: 'hi' })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'abc' }) })
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body).toEqual({ error: 'Unauthorized' })
    expect(prisma.destinyNationContribution.update).not.toHaveBeenCalled()
  })

  it('returns 401 when session exists but isGlobalAdmin is false', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'APP_ADMIN' } })
    isGlobalAdmin.mockReturnValue(false)

    const req = makeRequest({ followUpNotes: 'hi' })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'abc' }) })

    expect(res.status).toBe(401)
    expect(prisma.destinyNationContribution.update).not.toHaveBeenCalled()
  })

  it('updates followUpNotes and returns the updated row with 200', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)

    const updated = { id: 'abc', followUpNotes: 'called donor' }
    prisma.destinyNationContribution.update.mockResolvedValue(updated)

    const req = makeRequest({ followUpNotes: 'called donor' })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'abc' }) })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(updated)
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: 'abc' },
      data: { followUpNotes: 'called donor' },
    })
  })

  it('falls back to an empty string when body has no followUpNotes', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'SUPER_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)

    const updated = { id: 'abc', followUpNotes: '' }
    prisma.destinyNationContribution.update.mockResolvedValue(updated)

    const req = makeRequest({})
    const res = await PATCH(req, { params: Promise.resolve({ id: 'abc' }) })
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body).toEqual(updated)
    expect(prisma.destinyNationContribution.update).toHaveBeenCalledWith({
      where: { id: 'abc' },
      data: { followUpNotes: '' },
    })
  })

  it('returns 404 when prisma throws a P2025 not-found error', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)

    const err = new Error('Record not found')
    err.code = 'P2025'
    prisma.destinyNationContribution.update.mockRejectedValue(err)

    const req = makeRequest({ followUpNotes: 'x' })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'missing' }) })
    const body = await res.json()

    expect(res.status).toBe(404)
    expect(body).toEqual({ error: 'Contribution not found' })
  })

  it('re-throws other prisma errors instead of swallowing them', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)

    const err = new Error('Connection lost')
    prisma.destinyNationContribution.update.mockRejectedValue(err)

    const req = makeRequest({ followUpNotes: 'x' })

    await expect(PATCH(req, { params: Promise.resolve({ id: 'abc' }) })).rejects.toThrow('Connection lost')
  })
})
