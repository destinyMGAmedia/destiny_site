import { POST } from './route'
import prisma from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  default: {
    assembly: { findUnique: vi.fn() },
    firstTimer: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    visitor: { create: vi.fn() },
    member: { findFirst: vi.fn(), create: vi.fn() },
    growthStage: { findFirst: vi.fn() },
    memberProgress: { create: vi.fn(() => ({ catch: vi.fn() })) },
    yellowPagesListing: { create: vi.fn(() => ({ catch: vi.fn() })) },
  },
}))

function makeParams(slug) {
  return { params: Promise.resolve({ slug }) }
}

function makeRequest(body) {
  return new Request('http://localhost/api/assemblies/lagos/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

const memberBody = {
  type: 'MEMBER',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  phone: '08012345678',
  gender: 'FEMALE',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  fellowship: 'DESTINY_PRESERVERS',
  departments: [],
}

describe('POST /api/assemblies/[slug]/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prisma.assembly.findUnique.mockResolvedValue({ id: 'a1', slug: 'lagos' })
    prisma.firstTimer.findFirst.mockResolvedValue(null)
    prisma.member.findFirst.mockResolvedValue(null)
    prisma.member.create.mockResolvedValue({ id: 'm1', firstName: 'Jane', lastName: 'Doe' })
    prisma.growthStage.findFirst.mockResolvedValue(null)
  })

  it('registers a MEMBER without touching yellowPagesListing when no yellowPages payload is sent', async () => {
    const res = await POST(makeRequest(memberBody), makeParams('lagos'))
    expect(res.status).toBe(201)
    expect(prisma.yellowPagesListing.create).not.toHaveBeenCalled()
  })

  it('creates a linked Yellow Pages listing when a valid yellowPages payload is sent', async () => {
    const body = {
      ...memberBody,
      yellowPages: {
        listingType: 'INDIVIDUAL',
        name: 'Plumbing Repairs',
        category: 'HOME_SERVICES_TRADES',
        description: 'I fix leaks and install pipes.',
      },
    }
    const res = await POST(makeRequest(body), makeParams('lagos'))
    expect(res.status).toBe(201)

    expect(prisma.yellowPagesListing.create).toHaveBeenCalledTimes(1)
    const createArgs = prisma.yellowPagesListing.create.mock.calls[0][0]
    expect(createArgs.data).toMatchObject({
      listingType: 'INDIVIDUAL',
      name: 'Plumbing Repairs',
      category: 'HOME_SERVICES_TRADES',
      contactPersonName: 'Jane Doe',
      phone: '08012345678',
      email: 'jane@example.com',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      assemblyId: 'a1',
      memberId: 'm1',
    })
  })

  it('still returns 201 and skips listing creation when the yellowPages payload fails validation', async () => {
    const body = { ...memberBody, yellowPages: { listingType: 'INDIVIDUAL', name: '', category: '', description: '' } }
    const res = await POST(makeRequest(body), makeParams('lagos'))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.success).toBe(true)
    expect(prisma.yellowPagesListing.create).not.toHaveBeenCalled()
  })

  it('still returns 201 (member creation already succeeded) when the listing insert itself fails', async () => {
    prisma.yellowPagesListing.create.mockReturnValue({ catch: (fn) => fn(new Error('db down')) })
    const body = {
      ...memberBody,
      yellowPages: { listingType: 'INDIVIDUAL', name: 'Plumbing', category: 'HOME_SERVICES_TRADES', description: 'desc' },
    }
    const res = await POST(makeRequest(body), makeParams('lagos'))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.success).toBe(true)
  })

  it('does not create a Yellow Pages listing for VISITOR registrations even if yellowPages is somehow present', async () => {
    const body = {
      type: 'VISITOR',
      firstName: 'John',
      lastName: 'Smith',
      phone: '08099999999',
      yellowPages: { listingType: 'INDIVIDUAL', name: 'X', category: 'OTHER', description: 'desc' },
    }
    prisma.firstTimer.create.mockResolvedValue({ id: 'ft1' })
    prisma.visitor.create.mockResolvedValue({ id: 'v1' })

    const res = await POST(makeRequest(body), makeParams('lagos'))
    expect(res.status).toBe(201)
    expect(prisma.yellowPagesListing.create).not.toHaveBeenCalled()
  })
})
