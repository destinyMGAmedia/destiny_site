import { render, screen } from '@testing-library/react'
import Footer from './Footer'

describe('Footer', () => {
  it('renders the campaign name and sub-line', () => {
    render(<Footer />)
    expect(screen.getByText('Destiny Nation — The Gatekeepers Commission')).toBeInTheDocument()
    expect(screen.getByText('30 Gates · 30 Years · One Legacy')).toBeInTheDocument()
  })

  it('links out to the main church site', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: 'www.destinymissionglobal.org' })
    expect(link).toHaveAttribute('href', 'https://www.destinymissionglobal.org')
  })
})
