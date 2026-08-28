import { render, screen } from '@testing-library/react'
import YellowPagesCoverPage from './page'
import YellowPagesBaseOnly from '@/components/yellowpages/shared/YellowPagesBaseOnly'

function renderCover(base = '/yellowpages') {
  return render(
    <YellowPagesBaseOnly base={base}>
      <YellowPagesCoverPage />
    </YellowPagesBaseOnly>
  )
}

describe('YellowPagesCoverPage', () => {
  it('renders the marketing hero headline', () => {
    renderCover()
    expect(screen.getByText(/one link that opens doors/i)).toBeInTheDocument()
  })

  it('captures the key features in their own sections', () => {
    renderCover()
    expect(screen.getByText(/in one place worth sharing/i)).toBeInTheDocument()
    expect(screen.getByText(/ATS-compliant résumé that gets you the interview/i)).toBeInTheDocument()
    expect(screen.getByText(/what your business can do/i)).toBeInTheDocument()
    expect(screen.getByText(/Let your reviews do the selling/i)).toBeInTheDocument()
  })

  it('sends the "Explore the Directory" CTAs to the browse feed and "Create your portfolio" to register', () => {
    renderCover('/yellowpages')
    const explore = screen.getAllByText('Explore the Directory')
    expect(explore.length).toBeGreaterThan(0)
    for (const cta of explore) {
      expect(cta.closest('a')).toHaveAttribute('href', '/yellowpages/browse')
    }
    for (const cta of screen.getAllByText('Create your portfolio')) {
      expect(cta.closest('a')).toHaveAttribute('href', '/yellowpages/register')
    }
  })

  it('renders the how-it-works steps', () => {
    renderCover()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Connect')).toBeInTheDocument()
    expect(screen.getByText('Trust')).toBeInTheDocument()
  })

  it('renders the category showcase as non-clickable items', () => {
    renderCover()
    expect(screen.getByText('Technology & IT')).toBeInTheDocument()
    expect(screen.getByText('Technology & IT').closest('a')).toBeNull()
  })

  it('does not render a Nav (no "List Your Skill or Business" tab present)', () => {
    renderCover()
    expect(screen.queryByText('List Your Skill or Business')).not.toBeInTheDocument()
  })

  it('applies mobile-friendly horizontal padding to the header and every section', () => {
    const { container } = renderCover()
    const header = container.querySelector('header')
    expect(header).toHaveClass('px-4')
    expect(header).toHaveClass('sm:px-6')

    const sections = container.querySelectorAll('section')
    expect(sections.length).toBeGreaterThan(0)
    for (const section of sections) {
      expect(section).toHaveClass('px-4')
      expect(section).toHaveClass('sm:px-6')
    }
  })
})
