import { render, screen } from '@testing-library/react'
import YellowPagesPreview from './YellowPagesPreview'

describe('YellowPagesPreview', () => {
  it('renders the heading and explanatory copy', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('heading', { name: 'The Yellow Pages' })).toBeInTheDocument()
    expect(screen.getByText(/directory of members. skills and businesses/i)).toBeInTheDocument()
  })

  it('captures the three headline features (portfolio, ATS résumé, reviews)', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('heading', { name: 'Portfolios' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'ATS résumés' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reviews' })).toBeInTheDocument()
    expect(screen.getByText(/ATS-compliant résumé/i)).toBeInTheDocument()
  })

  it('links the CTAs to the directory and the create-a-portfolio page', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('link', { name: /Explore the Directory/i })).toHaveAttribute('href', '/yellowpages')
    expect(screen.getByRole('link', { name: /Create your portfolio/i })).toHaveAttribute('href', '/yellowpages/register')
  })

  it('is a full-bleed band — no max-width container wraps the section background', () => {
    const { container } = render(<YellowPagesPreview />)
    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
    expect(section.className).not.toMatch(/max-w-/)
    expect(section.querySelector('.section-container')).toBeInTheDocument()
  })
})
