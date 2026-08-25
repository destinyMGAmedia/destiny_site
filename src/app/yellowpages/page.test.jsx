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
  it('renders the branding heading', () => {
    renderCover()
    expect(screen.getByText('Skills & Businesses, Right Here in the Family')).toBeInTheDocument()
  })

  it('links both CTAs to the browse feed, prefixed with the base', () => {
    renderCover('/yellowpages')
    const ctas = screen.getAllByText('Explore the Directory')
    expect(ctas.length).toBeGreaterThan(0)
    for (const cta of ctas) {
      expect(cta.closest('a')).toHaveAttribute('href', '/yellowpages/browse')
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
