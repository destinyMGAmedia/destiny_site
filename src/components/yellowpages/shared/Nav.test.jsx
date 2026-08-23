import { render, screen, fireEvent } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import Nav from './Nav'
import YellowPagesChrome from './YellowPagesChrome'

vi.mock('next/navigation', () => ({ usePathname: vi.fn(() => '/') }))

function renderWithBase(base) {
  return render(
    <YellowPagesChrome base={base}>
      <div />
    </YellowPagesChrome>
  )
}

describe('Nav', () => {
  it('links Home to "/" when base is "" (on the subdomain)', () => {
    usePathname.mockReturnValue('/')
    renderWithBase('')
    expect(screen.getAllByText('Home')[0].closest('a')).toHaveAttribute('href', '/')
  })

  it('links Home to "/yellowpages" when base is "/yellowpages" (main-domain fallback)', () => {
    usePathname.mockReturnValue('/yellowpages')
    renderWithBase('/yellowpages')
    expect(screen.getAllByText('Home')[0].closest('a')).toHaveAttribute('href', '/yellowpages')
  })

  it('prefixes non-root tabs with the base', () => {
    usePathname.mockReturnValue('/yellowpages/search')
    renderWithBase('/yellowpages')
    expect(screen.getAllByText('Browse')[0].closest('a')).toHaveAttribute('href', '/yellowpages/search')
  })

  it('renders the accent "List Your Skill or Business" CTA', () => {
    usePathname.mockReturnValue('/')
    renderWithBase('')
    expect(screen.getAllByText('List Your Skill or Business').length).toBeGreaterThan(0)
  })

  it('links to the main site', () => {
    usePathname.mockReturnValue('/')
    renderWithBase('')
    expect(screen.getByText('Main Site').closest('a')).toHaveAttribute('href', 'https://www.destinymissionglobal.org')
  })

  it('opens the mobile menu on toggle click and closes again on second click', () => {
    usePathname.mockReturnValue('/')
    renderWithBase('')

    // "Destiny Mission Global Assembly" also appears once in the Footer, so the mobile
    // nav's own copy of that link only exists in the DOM while the menu is open.
    expect(screen.queryAllByText('Destiny Mission Global Assembly')).toHaveLength(1)

    fireEvent.click(screen.getByLabelText('Open menu'))
    expect(screen.getByLabelText('Close menu')).toBeInTheDocument()
    expect(screen.queryAllByText('Destiny Mission Global Assembly')).toHaveLength(2)

    fireEvent.click(screen.getByLabelText('Close menu'))
    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
    expect(screen.queryAllByText('Destiny Mission Global Assembly')).toHaveLength(1)
  })

  it('closes the mobile menu when a tab link is clicked', () => {
    usePathname.mockReturnValue('/')
    renderWithBase('')

    fireEvent.click(screen.getByLabelText('Open menu'))
    const mobileHomeLink = screen.getAllByText('Home')[1]
    fireEvent.click(mobileHomeLink)

    expect(screen.getByLabelText('Open menu')).toBeInTheDocument()
  })
})
