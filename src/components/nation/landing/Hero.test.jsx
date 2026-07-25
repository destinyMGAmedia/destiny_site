import { render, screen } from '@testing-library/react'
import Hero from './Hero'
import { useNationBase } from '../shared/NationChrome'

vi.mock('../shared/NationChrome', () => ({
  useNationBase: vi.fn(),
}))

describe('Hero', () => {
  it('renders the headline and tagline', () => {
    useNationBase.mockReturnValue('')
    render(<Hero />)
    expect(screen.getAllByText(/30 Gates/)[0]).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('This is Destiny Nation')
    expect(
      screen.getByText(/We don.t just build churches\. We build the leaders who build nations/)
    ).toBeInTheDocument()
  })

  it('links CTAs without a prefix when base is empty (nation subdomain)', () => {
    useNationBase.mockReturnValue('')
    render(<Hero />)
    expect(screen.getByRole('link', { name: /Become a Founding Gatekeeper/ })).toHaveAttribute('href', '/partner')
    expect(screen.getByRole('link', { name: 'Explore the 30 Gates' })).toHaveAttribute('href', '/gates/influence')
  })

  it('prefixes CTAs with /nation on the main-domain fallback', () => {
    useNationBase.mockReturnValue('/nation')
    render(<Hero />)
    expect(screen.getByRole('link', { name: /Become a Founding Gatekeeper/ })).toHaveAttribute('href', '/nation/partner')
    expect(screen.getByRole('link', { name: 'Explore the 30 Gates' })).toHaveAttribute('href', '/nation/gates/influence')
  })
})
