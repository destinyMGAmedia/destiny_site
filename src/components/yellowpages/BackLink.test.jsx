import { render, screen, fireEvent } from '@testing-library/react'
import BackLink from './BackLink'

describe('BackLink', () => {
  it('renders an anchor to href with the default label', () => {
    render(<BackLink href="/yellowpages/listing/l1" />)
    const el = screen.getByText(/Back to portfolio/i).closest('a')
    expect(el).toHaveAttribute('href', '/yellowpages/listing/l1')
  })

  it('renders a button that calls onClick (for modals)', () => {
    const onClick = vi.fn()
    render(<BackLink onClick={onClick} label="Back to my listing" />)
    const el = screen.getByText('Back to my listing').closest('button')
    expect(el).toBeInTheDocument()
    fireEvent.click(el)
    expect(onClick).toHaveBeenCalled()
    expect(screen.getByText('Back to my listing').closest('a')).toBeNull()
  })

  it('gives the button type="button" so it never submits a surrounding form', () => {
    render(<BackLink onClick={vi.fn()} />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('uses the default label for the button variant too', () => {
    render(<BackLink onClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /back to portfolio/i })).toBeInTheDocument()
  })

  it('appends the extra className onto its base classes', () => {
    render(<BackLink href="/x" className="mb-4" />)
    const el = screen.getByRole('link')
    expect(el).toHaveClass('mb-4')
    expect(el).toHaveClass('inline-flex', 'items-center', 'text-sm', 'font-medium')
  })

  it('prefers the button (onClick) branch when both href and onClick are supplied', () => {
    const onClick = vi.fn()
    render(<BackLink href="/should-not-render" onClick={onClick} />)
    expect(screen.queryByRole('link')).toBeNull()
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders a leading icon alongside the label', () => {
    const { container } = render(<BackLink href="/x" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
