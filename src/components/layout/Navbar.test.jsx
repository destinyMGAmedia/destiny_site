import { render, screen, fireEvent, act } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

describe('Navbar', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/')
  })

  it('renders the logo linking to home', () => {
    render(<Navbar />)
    const logoLink = screen.getAllByRole('link', { name: /Destiny Mission Global Assembly/ })[0]
    expect(logoLink).toHaveAttribute('href', '/')
  })

  it('renders all nav links with the expected hrefs (Destiny Nation is intentionally not a nav item — reached only via page CTAs)', () => {
    render(<Navbar />)
    expect(screen.getAllByRole('link', { name: 'Home' })[0]).toHaveAttribute('href', '/')
    expect(screen.getAllByRole('link', { name: 'Assemblies' })[0]).toHaveAttribute('href', '/assemblies')
    expect(screen.getAllByRole('link', { name: 'Royal Feed' })[0]).toHaveAttribute('href', '/royal-feed')
    expect(screen.getAllByRole('link', { name: 'Media' })[0]).toHaveAttribute('href', '/media')
    expect(screen.getAllByRole('link', { name: 'Treasures' })[0]).toHaveAttribute('href', '/treasures')
    expect(screen.getAllByRole('link', { name: 'About' })[0]).toHaveAttribute('href', '/about')
    expect(screen.queryByRole('link', { name: 'Destiny Nation' })).not.toBeInTheDocument()
  })

  it('renders the "Give Now" CTA linking to /assemblies', () => {
    render(<Navbar />)
    const ctas = screen.getAllByRole('link', { name: 'Give Now' })
    expect(ctas.length).toBeGreaterThan(0)
    ctas.forEach((cta) => expect(cta).toHaveAttribute('href', '/assemblies'))
  })

  it('marks Home as active when pathname is "/"', () => {
    usePathname.mockReturnValue('/')
    render(<Navbar />)
    const homeLink = screen.getAllByRole('link', { name: 'Home' })[0]
    expect(homeLink).toHaveClass('text-purple-800')
  })

  it('marks a nested route as active via prefix match, not Home', () => {
    usePathname.mockReturnValue('/about/team')
    render(<Navbar />)
    const aboutLink = screen.getAllByRole('link', { name: 'About' })[0]
    const homeLink = screen.getAllByRole('link', { name: 'Home' })[0]
    expect(aboutLink).toHaveClass('text-purple-800')
    expect(homeLink).not.toHaveClass('text-purple-800')
  })

  it('opens the mobile menu on toggle click and shows the close label', () => {
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(toggle)
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()
  })

  it('closes the mobile menu again on a second click', () => {
    render(<Navbar />)
    const toggle = screen.getByRole('button', { name: 'Open menu' })
    fireEvent.click(toggle)
    fireEvent.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('closes the mobile menu when the pathname changes', () => {
    usePathname.mockReturnValue('/')
    const { rerender } = render(<Navbar />)
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('button', { name: 'Close menu' })).toBeInTheDocument()

    usePathname.mockReturnValue('/about')
    rerender(<Navbar />)
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument()
  })

  it('applies the scrolled background style after the page is scrolled past the threshold', () => {
    render(<Navbar />)
    const header = document.querySelector('header')
    expect(header).not.toHaveClass('shadow-md')

    act(() => {
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
    })

    expect(header).toHaveClass('shadow-md')
  })

  it('does not mark any link active when pathname is unavailable (null)', () => {
    usePathname.mockReturnValue(null)
    render(<Navbar />)
    const homeLink = screen.getAllByRole('link', { name: 'Home' })[0]
    expect(homeLink).not.toHaveClass('text-purple-800')
  })
})
