import { render, screen } from '@testing-library/react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import NationAdminPage from './page'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('REDIRECT')
  }),
}))
vi.mock('@/lib/prisma', () => ({
  default: {
    destinyNationContribution: {
      findMany: vi.fn(),
    },
  },
}))
vi.mock('@/components/admin/NationContributionsTable', () => ({
  default: ({ contributions }) => (
    <div data-testid="nation-contributions-table">{contributions.length} contributions</div>
  ),
}))

describe('NationAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /admin/login when there is no session', async () => {
    getServerSession.mockResolvedValue(null)

    await expect(NationAdminPage()).rejects.toThrow('REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/admin/login')
  })

  it('redirects to /admin/dashboard when the session user is not a global admin', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'APP_ADMIN' } })
    isGlobalAdmin.mockReturnValue(false)

    await expect(NationAdminPage()).rejects.toThrow('REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('renders the contributions table for a global admin when prisma succeeds', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    prisma.destinyNationContribution.findMany.mockResolvedValue([{ id: '1' }, { id: '2' }])

    render(await NationAdminPage())

    expect(screen.getByText('Destiny Nation — Contributions')).toBeInTheDocument()
    expect(screen.getByTestId('nation-contributions-table')).toHaveTextContent('2 contributions')
    expect(prisma.destinyNationContribution.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    })
  })

  it('renders the error card when prisma throws', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'SUPER_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    prisma.destinyNationContribution.findMany.mockRejectedValue(new Error('DB down'))

    render(await NationAdminPage())

    expect(
      screen.getByText('Failed to load contributions. The database may need a schema update — run npm run db:push.')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('nation-contributions-table')).not.toBeInTheDocument()
  })
})
