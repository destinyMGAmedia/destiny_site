import { GET } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    destinyNationContribution: {
      count: vi.fn(),
    },
  },
}))

describe('GET /api/nation/partner-count', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filters count by status in SUCCESS/PLEDGED and returns remaining below the cap', async () => {
    prisma.destinyNationContribution.count.mockResolvedValue(42)

    const res = await GET()
    const body = await res.json()

    expect(prisma.destinyNationContribution.count).toHaveBeenCalledWith({
      where: { status: { in: ['SUCCESS', 'PLEDGED'] } },
    })
    expect(res.status).toBe(200)
    expect(body).toEqual({ count: 42, remaining: 58 })
  })

  it('returns remaining 0 when count equals the cap', async () => {
    prisma.destinyNationContribution.count.mockResolvedValue(100)

    const res = await GET()
    const body = await res.json()

    expect(body).toEqual({ count: 100, remaining: 0 })
  })

  it('clamps remaining to 0 (not negative) when count exceeds the cap', async () => {
    prisma.destinyNationContribution.count.mockResolvedValue(137)

    const res = await GET()
    const body = await res.json()

    expect(body).toEqual({ count: 137, remaining: 0 })
  })
})
