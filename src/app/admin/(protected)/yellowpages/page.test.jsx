import { render, screen } from '@testing-library/react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { isGlobalAdmin } from '@/lib/auth'
import YellowPagesAdminPage from './page'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => { throw new Error('REDIRECT') }),
}))
vi.mock('@/components/admin/YellowPagesAdminTable', () => ({
  default: () => <div data-testid="yp-admin-table" />,
}))

describe('YellowPagesAdminPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('redirects to /admin/login when there is no session', async () => {
    getServerSession.mockResolvedValue(null)
    await expect(YellowPagesAdminPage()).rejects.toThrow('REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/admin/login')
  })

  it('redirects to /admin/dashboard when the session user is not a global admin', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'ASSEMBLY_ADMIN' } })
    isGlobalAdmin.mockReturnValue(false)
    await expect(YellowPagesAdminPage()).rejects.toThrow('REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/admin/dashboard')
  })

  it('renders the admin table for a global admin', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    render(await YellowPagesAdminPage())
    expect(screen.getByText('The Yellow Pages — Listings')).toBeInTheDocument()
    expect(screen.getByTestId('yp-admin-table')).toBeInTheDocument()
  })
})
