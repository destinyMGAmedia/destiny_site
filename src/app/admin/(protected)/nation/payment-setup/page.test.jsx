import { render, screen } from '@testing-library/react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { isGlobalAdmin } from '@/lib/auth'
import prisma from '@/lib/prisma'
import NationPaymentSetupPage from './page'

vi.mock('next-auth', () => ({ getServerSession: vi.fn() }))
vi.mock('@/lib/auth', () => ({ authOptions: {}, isGlobalAdmin: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('REDIRECT')
  }),
}))
vi.mock('@/lib/prisma', () => ({
  default: {
    nationPaymentSettings: {
      findFirst: vi.fn(),
    },
  },
}))
vi.mock('@/components/admin/PaystackSetupForm', () => ({
  default: ({ currentSettings }) => (
    <div data-testid="paystack-setup-form">
      {currentSettings ? `configured: ${currentSettings.subaccountCode}` : 'not configured'}
    </div>
  ),
}))

describe('NationPaymentSetupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to /admin/login when there is no session', async () => {
    getServerSession.mockResolvedValue(null)

    await expect(NationPaymentSetupPage()).rejects.toThrow('REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/admin/login')
    expect(prisma.nationPaymentSettings.findFirst).not.toHaveBeenCalled()
  })

  it('redirects to /admin/dashboard when the session user is not a global admin', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'APP_ADMIN' } })
    isGlobalAdmin.mockReturnValue(false)

    await expect(NationPaymentSetupPage()).rejects.toThrow('REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/admin/dashboard')
    expect(prisma.nationPaymentSettings.findFirst).not.toHaveBeenCalled()
  })

  it('renders the setup form with null settings when nothing is configured yet', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    prisma.nationPaymentSettings.findFirst.mockResolvedValue(null)

    render(await NationPaymentSetupPage())

    expect(screen.getByText('Destiny Nation — Payment Setup')).toBeInTheDocument()
    expect(screen.getByTestId('paystack-setup-form')).toHaveTextContent('not configured')
    expect(prisma.nationPaymentSettings.findFirst).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    })
  })

  it('renders the setup form with the current settings for a super admin', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'SUPER_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    prisma.nationPaymentSettings.findFirst.mockResolvedValue({
      accountName: 'DESTINY MISSION GLOBAL ASSEMBLY',
      bankName: 'Guaranty Trust Bank',
      accountNumber: '0123456789',
      subaccountCode: 'ACCT_church123',
    })

    render(await NationPaymentSetupPage())

    expect(screen.getByTestId('paystack-setup-form')).toHaveTextContent('configured: ACCT_church123')
    expect(screen.queryByText(/Failed to load payment settings/)).not.toBeInTheDocument()
  })

  it('renders the error card and hides the form when prisma throws', async () => {
    getServerSession.mockResolvedValue({ user: { role: 'GLOBAL_ADMIN' } })
    isGlobalAdmin.mockReturnValue(true)
    prisma.nationPaymentSettings.findFirst.mockRejectedValue(new Error('DB down'))

    render(await NationPaymentSetupPage())

    expect(
      screen.getByText('Failed to load payment settings. The database may need a schema update — run npm run db:push.')
    ).toBeInTheDocument()
    expect(screen.queryByTestId('paystack-setup-form')).not.toBeInTheDocument()
  })
})
