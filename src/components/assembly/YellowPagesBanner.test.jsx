import { render, screen } from '@testing-library/react'
import YellowPagesBanner from './YellowPagesBanner'

describe('YellowPagesBanner', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('links to the register page pre-scoped to this assembly', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    const cta = screen.getByRole('link', { name: /List your skill or business/i })
    expect(cta).toHaveAttribute('href', '/yellowpages/register?assemblySlug=lagos-central')
  })

  it('names the assembly in the copy and reassures existing members', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    expect(screen.getByText(/As part of Lagos Central/)).toBeInTheDocument()
    expect(screen.getByText(/won.t sign up again/i)).toBeInTheDocument()
  })

  it('still renders a generic sentence when no assembly name is passed', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" />)
    expect(screen.getByRole('link', { name: /List your skill or business/i })).toBeInTheDocument()
  })

  it('treats an empty-string assembly name like no name (generic copy)', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="" />)
    const body = screen.getByText(/list your skill or business/i, { selector: 'p' })
    expect(body.textContent).toMatch(/^You can list your skill or business/)
    expect(body.textContent).not.toMatch(/As part of/)
  })

  it('url-encodes the slug in the CTA href', () => {
    render(<YellowPagesBanner assemblySlug="a b/c" assemblyName="Odd" />)
    expect(screen.getByRole('link', { name: /List your skill or business/i }))
      .toHaveAttribute('href', '/yellowpages/register?assemblySlug=a%20b%2Fc')
  })

  it('encodes slugs with query-breaking characters (&, =, ?)', () => {
    render(<YellowPagesBanner assemblySlug="x&y=z?q" assemblyName="Edge" />)
    expect(screen.getByRole('link', { name: /List your skill or business/i }))
      .toHaveAttribute('href', '/yellowpages/register?assemblySlug=x%26y%3Dz%3Fq')
  })

  it('encodes an empty slug without throwing', () => {
    render(<YellowPagesBanner assemblySlug="" assemblyName="Lagos Central" />)
    expect(screen.getByRole('link', { name: /List your skill or business/i }))
      .toHaveAttribute('href', '/yellowpages/register?assemblySlug=')
  })

  it('renders (href carries the literal "undefined") when assemblySlug is omitted entirely', () => {
    render(<YellowPagesBanner assemblyName="Lagos Central" />)
    expect(screen.getByRole('link', { name: /List your skill or business/i }))
      .toHaveAttribute('href', '/yellowpages/register?assemblySlug=undefined')
  })

  it('leads with the directory "get found" pitch, with the résumé as a secondary mention', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Offer a skill or run a business? Get found in the family.')

    const body = screen.getByText(/list your skill or business/i, { selector: 'p' })
    expect(body).toHaveTextContent(/directory people search to find trusted help/i)
    expect(body).toHaveTextContent(/ATS-compliant résumé for professionals/i)
  })

  it('opens the generic copy with "You can list your skill or business" when no assembly name is passed', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" />)
    const body = screen.getByText(/list your skill or business/i, { selector: 'p' })
    expect(body.textContent).toMatch(/^You can list your skill or business/)
    expect(body.textContent).not.toMatch(/As part of/)
  })

  it('drops the old "portfolio that gets you hired" headline and copy', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    expect(screen.getByRole('heading', { level: 2 }).textContent)
      .not.toMatch(/portfolio that gets you hired/i)
    expect(screen.queryByText(/build a free portfolio on/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/services, projects, and team/i)).not.toBeInTheDocument()
  })

  it('renders the branded badge and a real anchor CTA (not a client-router link)', () => {
    const { container } = render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    expect(screen.getByText('The Yellow Pages')).toBeInTheDocument()
    const section = container.querySelector('section')
    expect(section).toHaveStyle({ background: '#211d16' })
    const cta = screen.getByRole('link', { name: /List your skill or business/i })
    expect(cta.tagName).toBe('A')
  })

  it('defaults the base URL to /yellowpages when NEXT_PUBLIC_YELLOWPAGES_URL is unset', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    const cta = screen.getByRole('link', { name: /List your skill or business/i })
    expect(cta.getAttribute('href')).toMatch(/^\/yellowpages\/register\?/)
  })

  it('honours NEXT_PUBLIC_YELLOWPAGES_URL when it is set at module load', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_YELLOWPAGES_URL', 'https://yellowpages.example.org')
    const { default: BannerWithEnv } = await import('./YellowPagesBanner')
    render(<BannerWithEnv assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    expect(screen.getByRole('link', { name: /List your skill or business/i }))
      .toHaveAttribute('href', 'https://yellowpages.example.org/register?assemblySlug=lagos-central')
  })
})
