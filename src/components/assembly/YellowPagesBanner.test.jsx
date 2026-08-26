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
})
