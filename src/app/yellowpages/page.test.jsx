import { render, screen, within } from '@testing-library/react'
import YellowPagesCoverPage from './page'
import YellowPagesBaseOnly from '@/components/yellowpages/shared/YellowPagesBaseOnly'

// The cover page reads its link base from YellowPagesBaseContext (provided by the real route
// layout). We render it under the real provider — no mocking — so the CTA hrefs are built the
// same way they are in production: '' on the yellowpages subdomain, '/yellowpages' on the
// main-domain fallback.
function renderCover(base = '/yellowpages') {
  return render(
    <YellowPagesBaseOnly base={base}>
      <YellowPagesCoverPage />
    </YellowPagesBaseOnly>
  )
}

describe('YellowPagesCoverPage', () => {
  it('leads with the core "find the right person" pitch', () => {
    renderCover()
    expect(screen.getByText(/Find the right person, right here in the family/i)).toBeInTheDocument()
    expect(screen.getByText(/directory of members. skills and businesses/i)).toBeInTheDocument()
  })

  it('gives the "get found" side of the pitch its own section', () => {
    renderCover()
    expect(screen.getByText(/Offer a skill\? Run a business\? Get found\./i)).toBeInTheDocument()
  })

  it('frames portfolio, ATS résumé, and reviews as secondary perks', () => {
    renderCover()
    expect(screen.getByText(/And every listing does more/i)).toBeInTheDocument()
    expect(screen.getByText(/Every listing is a portfolio/i)).toBeInTheDocument()
    expect(screen.getByText(/ATS résumé for professionals/i)).toBeInTheDocument()
    expect(screen.getByText(/a bonus for members job-hunting/i)).toBeInTheDocument()
  })

  it('renders all three perks with their body copy, including reviews', () => {
    renderCover()
    expect(screen.getByText('More than a line in a phone book')).toBeInTheDocument()
    expect(screen.getByText('Reviews build your reputation')).toBeInTheDocument()
    expect(screen.getByText(/Banner, work gallery, projects, and contact in one tap/i)).toBeInTheDocument()
    expect(screen.getByText(/export an ATS-compliant résumé straight from their portfolio/i)).toBeInTheDocument()
    expect(screen.getByText(/your average shows on your card and page/i)).toBeInTheDocument()
  })

  it('sends the "Explore the Directory" CTAs to browse and "List your skill or business" to register', () => {
    renderCover('/yellowpages')
    const explore = screen.getAllByText('Explore the Directory')
    expect(explore.length).toBeGreaterThan(0)
    for (const cta of explore) {
      expect(cta.closest('a')).toHaveAttribute('href', '/yellowpages/browse')
    }
    for (const cta of screen.getAllByText('List your skill or business')) {
      expect(cta.closest('a')).toHaveAttribute('href', '/yellowpages/register')
    }
  })

  it('builds every CTA href off the context base (empty base on the subdomain)', () => {
    renderCover('')
    for (const cta of screen.getAllByText('Explore the Directory')) {
      expect(cta.closest('a')).toHaveAttribute('href', '/browse')
    }
    for (const cta of screen.getAllByText('List your skill or business')) {
      expect(cta.closest('a')).toHaveAttribute('href', '/register')
    }
  })

  it('makes "Explore the Directory" the primary hero CTA and listing the outline CTA', () => {
    const { container } = renderCover()
    const hero = container.querySelector('section')
    const primary = within(hero).getByText('Explore the Directory').closest('a')
    const outline = within(hero).getByText('List your skill or business').closest('a')
    expect(primary).toHaveClass('yp-btn-primary')
    expect(primary).toHaveAttribute('href', '/yellowpages/browse')
    expect(outline).toHaveClass('yp-btn-outline')
    expect(outline).toHaveAttribute('href', '/yellowpages/register')
  })

  it('renders the how-it-works steps with their refreshed body copy', () => {
    renderCover()
    expect(screen.getByText('Search')).toBeInTheDocument()
    expect(screen.getByText('Connect')).toBeInTheDocument()
    expect(screen.getByText('Trust')).toBeInTheDocument()
    expect(screen.getByText('Look up a skill, service, or business by category and location.')).toBeInTheDocument()
    expect(screen.getByText(/straight to the person, no middleman/i)).toBeInTheDocument()
    expect(screen.getByText(/Star ratings and reviews on every profile/i)).toBeInTheDocument()
  })

  it('titles the categories section "What’s in the directory"', () => {
    renderCover()
    expect(screen.getByRole('heading', { name: /What.s in the directory/i })).toBeInTheDocument()
    expect(screen.getByText(/From trades to tech, hospitality to health/i)).toBeInTheDocument()
  })

  it('renders the category showcase as non-clickable list items', () => {
    renderCover()
    expect(screen.getByText('Technology & IT')).toBeInTheDocument()
    expect(screen.getByText('Technology & IT').closest('a')).toBeNull()
    expect(screen.getByText('Technology & IT').closest('li')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: /Categories in the directory/i })).toBeInTheDocument()
    // The illustrative showcase deliberately drops the catch-all "Other" bucket.
    expect(screen.queryByText('Other')).not.toBeInTheDocument()
  })

  it('renders the self-contained hero illustration (no external image dependency)', () => {
    renderCover()
    expect(screen.getByRole('img', { name: /Illustration of people offering their skills and businesses/i }))
      .toBeInTheDocument()
  })

  it('renders the brand header and the ministry footer', () => {
    const { container } = renderCover()
    expect(within(container.querySelector('header')).getByText('The Yellow Pages')).toBeInTheDocument()
    expect(within(container.querySelector('footer')).getByText(/A ministry of Destiny Mission Global Assembly/i))
      .toBeInTheDocument()
  })

  it('closes with a "Find who you need. Or get found." CTA band', () => {
    renderCover()
    expect(screen.getByRole('heading', { name: /Find who you need\. Or get found\./i })).toBeInTheDocument()
  })

  it('does not render a Nav (no "List Your Skill or Business" tab present)', () => {
    renderCover()
    expect(screen.queryByText('List Your Skill or Business')).not.toBeInTheDocument()
  })

  it('drops the old portfolio-first marketing copy', () => {
    renderCover()
    expect(screen.queryByText(/one link that opens doors/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Let your reviews do the selling/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/what your business can do/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/An ATS-compliant résumé that gets you the interview/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Create your portfolio')).not.toBeInTheDocument()
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

  it('renders without a provider by falling back to the context default base', () => {
    // No YellowPagesBaseOnly wrapper — useYellowPagesBase() returns its createContext default.
    render(<YellowPagesCoverPage />)
    for (const cta of screen.getAllByText('Explore the Directory')) {
      expect(cta.closest('a')).toHaveAttribute('href', '/yellowpages/browse')
    }
  })
})
