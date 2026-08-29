import { render, screen } from '@testing-library/react'
import WorkersIllustration from './WorkersIllustration'

describe('WorkersIllustration', () => {
  it('renders an svg with an accessible label', () => {
    render(<WorkersIllustration />)
    const svg = screen.getByRole('img', { name: 'Illustration of people offering their skills and businesses' })
    expect(svg).toBeInTheDocument()
    expect(svg.tagName.toLowerCase()).toBe('svg')
  })

  it('sets the expected viewBox', () => {
    render(<WorkersIllustration />)
    const svg = screen.getByRole('img')
    expect(svg).toHaveAttribute('viewBox', '0 0 480 340')
  })

  it('is fully self-contained with no external image references', () => {
    const { container } = render(<WorkersIllustration />)
    expect(container.querySelectorAll('image')).toHaveLength(0)
    expect(container.querySelector('svg use')).toBeNull()
  })

  it('renders the three figure groups', () => {
    const { container } = render(<WorkersIllustration />)
    expect(container.querySelectorAll('svg > g')).toHaveLength(3)
  })

  it('applies the responsive width/height classes', () => {
    render(<WorkersIllustration />)
    const svg = screen.getByRole('img')
    expect(svg).toHaveClass('w-full')
    expect(svg).toHaveClass('h-auto')
  })
})
