import { render, screen } from '@testing-library/react'
import NationBanner from './NationBanner'

describe('NationBanner', () => {
  it('renders the campaign name and sub-line', () => {
    render(<NationBanner />)
    expect(screen.getByText('Destiny Nation — The Gatekeepers Commission')).toBeInTheDocument()
    expect(screen.getByText(/30 Gates · 30 Years · One Legacy/)).toBeInTheDocument()
  })

  it('links to the in-app /nation path when NEXT_PUBLIC_NATION_URL is not set', () => {
    render(<NationBanner />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/nation')
  })
})
