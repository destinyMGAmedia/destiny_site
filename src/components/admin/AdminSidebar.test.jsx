import { render, screen, fireEvent } from '@testing-library/react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

function mockSession(user) {
  useSession.mockReturnValue({ data: user ? { user } : null })
}

describe('AdminSidebar', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/admin/dashboard')
  })

  describe('when session is not yet loaded', () => {
    it('renders without a role-specific nav and without crashing', () => {
      mockSession(null)
      render(<AdminSidebar />)
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })
  })

  describe('SUPER_ADMIN role', () => {
    beforeEach(() => {
      mockSession({ role: 'SUPER_ADMIN', name: 'Ada Admin', email: 'ada@example.com' })
    })

    it('renders the global admin sections', () => {
      render(<AdminSidebar />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('All Assemblies')).toBeInTheDocument()
      expect(screen.getByText('New Assembly')).toBeInTheDocument()
      expect(screen.getByText('Manage Admins')).toBeInTheDocument()
      expect(screen.getByText('First Timers')).toBeInTheDocument()
      expect(screen.getByText('Members')).toBeInTheDocument()
      expect(screen.getByText('Weekly Reports')).toBeInTheDocument()
      expect(screen.getByText('Contributions')).toBeInTheDocument()
      expect(screen.getByText('Payment Setup')).toBeInTheDocument()
      expect(screen.getByText('Site Content')).toBeInTheDocument()
      expect(screen.getByText('Royal Feed')).toBeInTheDocument()
      expect(screen.getByText('Global Events')).toBeInTheDocument()
      expect(screen.getByText('Growth Track')).toBeInTheDocument()
      expect(screen.getByText('Bible Games')).toBeInTheDocument()
      expect(screen.getByText('YouTube Channels')).toBeInTheDocument()
    })

    it('renders the System section only for SUPER_ADMIN', () => {
      render(<AdminSidebar />)
      expect(screen.getByText('Analytics')).toBeInTheDocument()
      expect(screen.getByText('System Settings')).toBeInTheDocument()
    })

    it('formats the role label by replacing underscores with spaces', () => {
      render(<AdminSidebar />)
      expect(screen.getByText('SUPER ADMIN')).toBeInTheDocument()
    })

    it('marks the current route active based on pathname', () => {
      usePathname.mockReturnValue('/admin/dashboard')
      render(<AdminSidebar />)
      expect(screen.getByText('Dashboard').closest('a')).toHaveClass('active')
      expect(screen.getByText('All Assemblies').closest('a')).not.toHaveClass('active')
    })

    it('marks a nested route as active via startsWith matching', () => {
      usePathname.mockReturnValue('/admin/admins/123')
      render(<AdminSidebar />)
      expect(screen.getByText('Manage Admins').closest('a')).toHaveClass('active')
    })

    it('links Payment Setup to /admin/nation/payment-setup and marks it active on that route', () => {
      usePathname.mockReturnValue('/admin/nation/payment-setup')
      render(<AdminSidebar />)
      const paymentSetupLink = screen.getByText('Payment Setup').closest('a')
      expect(paymentSetupLink).toHaveAttribute('href', '/admin/nation/payment-setup')
      expect(paymentSetupLink).toHaveClass('active')
    })

    it('also marks the Contributions parent active on /admin/nation/payment-setup, since isActive prefix-matches "/admin/nation"', () => {
      // Documents current (perhaps unintended) behavior: both nav items share the "active"
      // style because Contributions' href ("/admin/nation") is a path prefix of Payment
      // Setup's href, and isActive() matches on startsWith(href + '/').
      usePathname.mockReturnValue('/admin/nation/payment-setup')
      render(<AdminSidebar />)
      expect(screen.getByText('Contributions').closest('a')).toHaveClass('active')
    })

    it('marks Contributions active (not Payment Setup) when on the /admin/nation root', () => {
      usePathname.mockReturnValue('/admin/nation')
      render(<AdminSidebar />)
      expect(screen.getByText('Contributions').closest('a')).toHaveClass('active')
      expect(screen.getByText('Payment Setup').closest('a')).not.toHaveClass('active')
    })
  })

  describe('GLOBAL_ADMIN role', () => {
    it('renders the same global sections as SUPER_ADMIN but not System', () => {
      mockSession({ role: 'GLOBAL_ADMIN', name: 'Global Admin', email: 'global@example.com' })
      render(<AdminSidebar />)
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Contributions')).toBeInTheDocument()
      expect(screen.queryByText('Analytics')).not.toBeInTheDocument()
      expect(screen.queryByText('System Settings')).not.toBeInTheDocument()
    })
  })

  describe('ASSEMBLY_ADMIN role', () => {
    it('renders assembly-scoped nav when slug is present', () => {
      mockSession({
        role: 'ASSEMBLY_ADMIN',
        assemblySlug: 'lagos-hq',
        assemblyName: 'Lagos HQ',
        name: 'Assembly Admin',
        email: 'assembly@example.com',
      })
      render(<AdminSidebar />)
      expect(screen.getByText('Lagos HQ')).toBeInTheDocument()
      expect(screen.getByText('Content Sections')).toBeInTheDocument()
      expect(screen.getByText('Growth Track')).toBeInTheDocument()
      expect(screen.getByText('Attendance')).toBeInTheDocument()
      expect(screen.getByText('Finance')).toBeInTheDocument()
      expect(screen.getByText('Schedule')).toBeInTheDocument()
      expect(screen.getByText('Reports')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveAttribute('href', '/admin/assemblies/lagos-hq')
    })

    it('does not render assembly nav when slug is missing', () => {
      mockSession({ role: 'ASSEMBLY_ADMIN', name: 'No Slug Admin', email: 'noslug@example.com' })
      render(<AdminSidebar />)
      expect(screen.queryByText('Content Sections')).not.toBeInTheDocument()
    })

    it('does not render the assembly name badge when assemblyName is missing', () => {
      mockSession({ role: 'ASSEMBLY_ADMIN', assemblySlug: 'lagos-hq', name: 'X', email: 'x@example.com' })
      render(<AdminSidebar />)
      expect(screen.queryByText('Lagos HQ')).not.toBeInTheDocument()
    })
  })

  describe('SITE_CONTENT_ADMIN role', () => {
    it('renders the site content and editorial sections', () => {
      mockSession({ role: 'SITE_CONTENT_ADMIN', name: 'Content Admin', email: 'content@example.com' })
      render(<AdminSidebar />)
      expect(screen.getAllByText('Site Content').length).toBeGreaterThan(0)
      expect(screen.getByText('Global Leaders')).toBeInTheDocument()
      expect(screen.getByText('Hero Slides')).toBeInTheDocument()
      expect(screen.getByText('YouTube Channels')).toBeInTheDocument()
      expect(screen.getByText('Royal Feed')).toBeInTheDocument()
      expect(screen.getByText('Global Events')).toBeInTheDocument()
      expect(screen.queryByText('Contributions')).not.toBeInTheDocument()
    })
  })

  describe('APP_ADMIN role', () => {
    it('renders content-only nav when slug is present', () => {
      mockSession({
        role: 'APP_ADMIN',
        assemblySlug: 'abuja-hq',
        assemblyName: 'Abuja HQ',
        name: 'App Admin',
        email: 'app@example.com',
      })
      render(<AdminSidebar />)
      expect(screen.getByText('Abuja HQ')).toBeInTheDocument()
      expect(screen.getByText('Page Sections')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.queryByText('Members')).not.toBeInTheDocument()
      expect(screen.queryByText('Finance')).not.toBeInTheDocument()
    })

    it('does not render content nav when slug is missing', () => {
      mockSession({ role: 'APP_ADMIN', name: 'No Slug', email: 'noslug@example.com' })
      render(<AdminSidebar />)
      expect(screen.queryByText('Page Sections')).not.toBeInTheDocument()
    })
  })

  describe('unrecognized role', () => {
    it('renders no nav sections but still renders chrome', () => {
      mockSession({ role: 'CUSTOMER', name: 'Random User', email: 'random@example.com' })
      render(<AdminSidebar />)
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Page Sections')).not.toBeInTheDocument()
      expect(screen.getByText('Random User')).toBeInTheDocument()
    })
  })

  describe('user info footer', () => {
    it('renders the signed-in user name and email', () => {
      mockSession({ role: 'SUPER_ADMIN', name: 'Ada Admin', email: 'ada@example.com' })
      render(<AdminSidebar />)
      expect(screen.getByText('Ada Admin')).toBeInTheDocument()
      expect(screen.getByText('ada@example.com')).toBeInTheDocument()
    })

    it('calls signOut with the admin login callback URL when Sign Out is clicked', () => {
      mockSession({ role: 'SUPER_ADMIN', name: 'Ada Admin', email: 'ada@example.com' })
      render(<AdminSidebar />)
      fireEvent.click(screen.getByText('Sign Out'))
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/admin/login' })
    })
  })

  describe('onItemClick callback', () => {
    it('invokes onItemClick when a nav item is clicked', () => {
      mockSession({ role: 'SUPER_ADMIN', name: 'Ada Admin', email: 'ada@example.com' })
      const onItemClick = vi.fn()
      render(<AdminSidebar onItemClick={onItemClick} />)
      fireEvent.click(screen.getByText('All Assemblies'))
      expect(onItemClick).toHaveBeenCalledTimes(1)
    })
  })
})
