import { render, screen, fireEvent } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import TabNav from './TabNav'
import { useNationBase } from './NationChrome'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))
vi.mock('./NationChrome', () => ({
  useNationBase: vi.fn(),
}))

describe('TabNav', () => {
  beforeEach(() => {
    useNationBase.mockReturnValue('')
    usePathname.mockReturnValue('/')
  })

  it('renders the brand link and all tab labels', () => {
    render(<TabNav />)
    expect(screen.getByText('Destiny Nation')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Overview/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Internal Gates' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Influence Gates' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Legacy Projects' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get Involved' })).toBeInTheDocument()
  })

  it('renders a link back to the main church site', () => {
    render(<TabNav />)
    const mainSite = screen.getByRole('link', { name: /Main Site/ })
    expect(mainSite).toHaveAttribute('href', 'https://www.destinymissionglobal.org')
  })

  describe('when base is empty (nation subdomain)', () => {
    beforeEach(() => {
      useNationBase.mockReturnValue('')
    })

    it('links tabs without a /nation prefix', () => {
      render(<TabNav />)
      expect(screen.getByRole('link', { name: /Overview/ })).toHaveAttribute('href', '/')
      expect(screen.getByRole('link', { name: 'Internal Gates' })).toHaveAttribute('href', '/gates/internal')
      expect(screen.getByRole('link', { name: 'Influence Gates' })).toHaveAttribute('href', '/gates/influence')
      expect(screen.getByRole('link', { name: 'Legacy Projects' })).toHaveAttribute('href', '/projects')
      expect(screen.getByRole('link', { name: 'Get Involved' })).toHaveAttribute('href', '/partner')
    })

    it('highlights Overview as active when pathname is "/"', () => {
      usePathname.mockReturnValue('/')
      render(<TabNav />)
      expect(screen.getByRole('link', { name: /Overview/ })).toHaveClass('bg-[var(--gold-500)]')
      expect(screen.getByRole('link', { name: 'Internal Gates' })).not.toHaveClass('bg-[var(--gold-500)]')
    })

    it('highlights the matching tab as active based on pathname', () => {
      usePathname.mockReturnValue('/gates/internal')
      render(<TabNav />)
      expect(screen.getByRole('link', { name: 'Internal Gates' })).toHaveClass('bg-[var(--gold-500)]')
      expect(screen.getByRole('link', { name: /Overview/ })).not.toHaveClass('bg-[var(--gold-500)]')
    })
  })

  describe('when base is "/nation" (main-domain fallback)', () => {
    beforeEach(() => {
      useNationBase.mockReturnValue('/nation')
    })

    it('prefixes tab links with /nation', () => {
      render(<TabNav />)
      expect(screen.getByRole('link', { name: /Overview/ })).toHaveAttribute('href', '/nation')
      expect(screen.getByRole('link', { name: 'Internal Gates' })).toHaveAttribute('href', '/nation/gates/internal')
      expect(screen.getByRole('link', { name: 'Influence Gates' })).toHaveAttribute('href', '/nation/gates/influence')
      expect(screen.getByRole('link', { name: 'Legacy Projects' })).toHaveAttribute('href', '/nation/projects')
      expect(screen.getByRole('link', { name: 'Get Involved' })).toHaveAttribute('href', '/nation/partner')
    })

    it('highlights Overview as active when pathname equals the base path', () => {
      usePathname.mockReturnValue('/nation')
      render(<TabNav />)
      expect(screen.getByRole('link', { name: /Overview/ })).toHaveClass('bg-[var(--gold-500)]')
    })

    it('highlights the matching prefixed tab as active based on pathname', () => {
      usePathname.mockReturnValue('/nation/partner')
      render(<TabNav />)
      expect(screen.getByRole('link', { name: 'Get Involved' })).toHaveClass('bg-[var(--gold-500)]')
      expect(screen.getByRole('link', { name: /Overview/ })).not.toHaveClass('bg-[var(--gold-500)]')
    })
  })

  describe('mobile menu toggle', () => {
    it('is closed by default, showing only the desktop nav links', () => {
      render(<TabNav />)
      expect(screen.getAllByRole('link', { name: 'Internal Gates' })).toHaveLength(1)
      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
    })

    it('opens the mobile nav on click, duplicating the tab links', () => {
      render(<TabNav />)
      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))

      expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: 'Internal Gates' })).toHaveLength(2)
    })

    it('closes the mobile nav again on a second click', () => {
      render(<TabNav />)
      const toggle = screen.getByRole('button', { name: 'Open menu' })
      fireEvent.click(toggle)
      fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))

      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: 'Internal Gates' })).toHaveLength(1)
    })

    it('closes the mobile nav when a mobile link is clicked', () => {
      render(<TabNav />)
      fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
      const mobileLinks = screen.getAllByRole('link', { name: 'Internal Gates' })
      fireEvent.click(mobileLinks[mobileLinks.length - 1])

      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
      expect(screen.getAllByRole('link', { name: 'Internal Gates' })).toHaveLength(1)
    })
  })
})
