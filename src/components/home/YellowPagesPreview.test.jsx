import { render, screen } from '@testing-library/react'
import YellowPagesPreview from './YellowPagesPreview'

describe('YellowPagesPreview', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('renders the heading and directory-first copy', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('heading', { name: 'The Yellow Pages' })).toBeInTheDocument()
    expect(screen.getByText(/directory of members. skills and businesses/i)).toBeInTheDocument()
    expect(screen.getByText(/Find trusted skills and businesses in the family/i)).toBeInTheDocument()
  })

  it('shows the refreshed "Community Directory" badge, not the old portfolios badge', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByText(/New . Community Directory/i)).toBeInTheDocument()
    expect(screen.queryByText(/Portfolios . Directory/i)).not.toBeInTheDocument()
  })

  it('leads with find/offer/trust, with portfolio + résumé as a supporting mention', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('heading', { name: 'Find help' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Get found' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Built-in trust' })).toBeInTheDocument()
    expect(screen.getAllByText(/ATS-compliant résumé/i).length).toBeGreaterThan(0)
  })

  it('spells out each feature body', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByText(/Search people and businesses by skill, category, and location/i)).toBeInTheDocument()
    expect(screen.getByText(/List your skill or business for free and let the people looking for it reach you/i))
      .toBeInTheDocument()
    expect(screen.getByText(/Ratings and reviews on every profile\. Each listing is a full portfolio/i))
      .toBeInTheDocument()
  })

  it('links the CTAs to the directory and the list-your-skill page', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('link', { name: /Explore the Directory/i })).toHaveAttribute('href', '/yellowpages')
    expect(screen.getByRole('link', { name: /List your skill or business/i })).toHaveAttribute('href', '/yellowpages/register')
  })

  it('makes "Explore the Directory" the filled primary CTA and listing the outlined one', () => {
    render(<YellowPagesPreview />)
    const explore = screen.getByRole('link', { name: /Explore the Directory/i })
    const list = screen.getByRole('link', { name: /List your skill or business/i })
    expect(explore).toHaveStyle({ background: '#b68920' })
    expect(list).toHaveClass('border')
    expect(list).not.toHaveClass('border', 'bg-[#b68920]')
  })

  it('drops the old portfolio-first feature set and CTA label', () => {
    render(<YellowPagesPreview />)
    expect(screen.queryByRole('heading', { name: 'Portfolios' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'ATS résumés' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Reviews' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Create your portfolio/i })).not.toBeInTheDocument()
  })

  it('is a full-bleed band — no max-width container wraps the section background', () => {
    const { container } = render(<YellowPagesPreview />)
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section.className).not.toMatch(/max-w-/)
    expect(section.querySelector('.section-container')).toBeInTheDocument()
  })

  it('renders on a dark (ink) background', () => {
    const { container } = render(<YellowPagesPreview />)
    expect(container.querySelector('section')).toHaveStyle({ background: '#211d16' })
  })

  it('defaults both CTAs to the /yellowpages base when NEXT_PUBLIC_YELLOWPAGES_URL is unset', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('link', { name: /Explore the Directory/i }).getAttribute('href')).toBe('/yellowpages')
    expect(screen.getByRole('link', { name: /List your skill or business/i }).getAttribute('href'))
      .toBe('/yellowpages/register')
  })

  it('honours NEXT_PUBLIC_YELLOWPAGES_URL when it is set at module load', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_YELLOWPAGES_URL', 'https://yellowpages.example.org')
    const { default: PreviewWithEnv } = await import('./YellowPagesPreview')
    render(<PreviewWithEnv />)
    expect(screen.getByRole('link', { name: /Explore the Directory/i }))
      .toHaveAttribute('href', 'https://yellowpages.example.org')
    expect(screen.getByRole('link', { name: /List your skill or business/i }))
      .toHaveAttribute('href', 'https://yellowpages.example.org/register')
  })
})
