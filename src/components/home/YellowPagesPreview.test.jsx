import { render, screen, within } from '@testing-library/react'
import YellowPagesPreview from './YellowPagesPreview'

describe('YellowPagesPreview', () => {
  it('renders the heading and explanatory copy', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('heading', { name: 'The Yellow Pages' })).toBeInTheDocument()
    expect(screen.getByText(/directory of members. skills and businesses/i)).toBeInTheDocument()
  })

  it('lists the three value props', () => {
    render(<YellowPagesPreview />)
    expect(screen.getByRole('heading', { name: 'Search' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Connect' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Trust' })).toBeInTheDocument()
  })

  it('links the CTA to the yellow pages directory', () => {
    render(<YellowPagesPreview />)
    const cta = screen.getByRole('link', { name: /Explore the Directory/i })
    expect(cta).toHaveAttribute('href', '/yellowpages')
  })

  it('is a full-bleed band — no max-width container wraps the section background', () => {
    const { container } = render(<YellowPagesPreview />)
    const section = container.querySelector('section')
    // The section itself carries the background and spans the viewport; only the inner
    // content is constrained (via .section-container).
    expect(section).toBeInTheDocument()
    expect(section.className).not.toMatch(/max-w-/)
    expect(section.querySelector('.section-container')).toBeInTheDocument()
  })
})
