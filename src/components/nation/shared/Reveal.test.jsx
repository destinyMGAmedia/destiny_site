import { render, screen } from '@testing-library/react'
import Reveal from './Reveal'

describe('Reveal', () => {
  it('renders its children', () => {
    render(<Reveal>Hello world</Reveal>)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('defaults to a div wrapper', () => {
    const { container } = render(<Reveal>content</Reveal>)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  it('renders as the tag given by the "as" prop', () => {
    const { container } = render(<Reveal as="section">content</Reveal>)
    expect(container.firstChild.tagName).toBe('SECTION')
  })

  it('falls back to a div when "as" is not a valid motion tag', () => {
    const { container } = render(<Reveal as="not-a-real-tag">content</Reveal>)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  it('applies the given className', () => {
    const { container } = render(<Reveal className="my-class">content</Reveal>)
    expect(container.firstChild).toHaveClass('my-class')
  })

  it('applies the given inline style', () => {
    const { container } = render(<Reveal style={{ color: 'red' }}>content</Reveal>)
    expect(container.firstChild).toHaveStyle({ color: 'red' })
  })

  it('renders multiple children correctly', () => {
    render(
      <Reveal>
        <span>first</span>
        <span>second</span>
      </Reveal>
    )
    expect(screen.getByText('first')).toBeInTheDocument()
    expect(screen.getByText('second')).toBeInTheDocument()
  })

  it('accepts custom delay and y props without throwing', () => {
    expect(() => render(<Reveal delay={0.5} y={40}>content</Reveal>)).not.toThrow()
  })
})
