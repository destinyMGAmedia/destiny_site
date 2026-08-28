import { render, screen } from '@testing-library/react'
import YellowPagesBanner from './YellowPagesBanner'

describe('YellowPagesBanner', () => {
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

  it('url-encodes the slug in the CTA href', () => {
    render(<YellowPagesBanner assemblySlug="a b/c" assemblyName="Odd" />)
    expect(screen.getByRole('link', { name: /List your skill or business/i }))
      .toHaveAttribute('href', '/yellowpages/register?assemblySlug=a%20b%2Fc')
  })

  it('leads with the portfolio-hosting headline (not the old "list it in the directory" pitch)', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('Turn your skill or business into a portfolio that gets you hired.')
    expect(heading.textContent).not.toMatch(/List it in the directory/i)
  })

  it('spells out the portfolio + ATS résumé + business-profile offer in the body copy', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    const body = screen.getByText(/build a free portfolio on/i)
    expect(body).toHaveTextContent(/ATS-compliant résumé that passes the bots/i)
    expect(body).toHaveTextContent(/e-portfolio/i)
    expect(body).toHaveTextContent(/services, projects, and team/i)
  })

  it('opens the generic copy with "You can build a free portfolio" when no assembly name is passed', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" />)
    const body = screen.getByText(/build a free portfolio on/i)
    expect(body.textContent).toMatch(/^You can build a free portfolio on/)
    expect(body.textContent).not.toMatch(/As part of/)
  })

  it('defaults the base URL to /yellowpages when NEXT_PUBLIC_YELLOWPAGES_URL is unset', () => {
    render(<YellowPagesBanner assemblySlug="lagos-central" assemblyName="Lagos Central" />)
    const cta = screen.getByRole('link', { name: /List your skill or business/i })
    expect(cta.getAttribute('href')).toMatch(/^\/yellowpages\/register\?/)
  })

  it('encodes an empty slug without throwing', () => {
    render(<YellowPagesBanner assemblySlug="" assemblyName="Lagos Central" />)
    expect(screen.getByRole('link', { name: /List your skill or business/i }))
      .toHaveAttribute('href', '/yellowpages/register?assemblySlug=')
  })
})
