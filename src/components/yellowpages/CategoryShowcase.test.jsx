import { render, screen } from '@testing-library/react'
import CategoryShowcase from './CategoryShowcase'
import { CATEGORIES } from '@/lib/yellowpages/constants'

describe('CategoryShowcase', () => {
  it('renders a labelled list of categories', () => {
    render(<CategoryShowcase />)
    expect(screen.getByRole('list', { name: 'Categories in the directory' })).toBeInTheDocument()
  })

  it('renders every category except OTHER', () => {
    render(<CategoryShowcase />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(CATEGORIES.length - 1)
  })

  it('shows the human-readable label for every non-OTHER category', () => {
    render(<CategoryShowcase />)
    for (const category of CATEGORIES.filter((c) => c.value !== 'OTHER')) {
      expect(screen.getByText(category.label)).toBeInTheDocument()
    }
  })

  it('does not render the OTHER category', () => {
    render(<CategoryShowcase />)
    expect(screen.queryByText('Other')).not.toBeInTheDocument()
  })

  it('renders one icon per listed category', () => {
    const { container } = render(<CategoryShowcase />)
    const items = screen.getAllByRole('listitem')
    expect(container.querySelectorAll('li svg')).toHaveLength(items.length)
  })

  it('is a non-interactive list (no links or buttons)', () => {
    render(<CategoryShowcase />)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('keeps icons from shrinking and lets long labels wrap instead of overflowing', () => {
    const { container } = render(<CategoryShowcase />)
    const items = container.querySelectorAll('li')
    expect(items.length).toBeGreaterThan(0)
    for (const item of items) {
      expect(item.querySelector('svg')).toHaveClass('shrink-0')
      const label = item.querySelector('span')
      expect(label).toHaveClass('min-w-0')
      expect(label).toHaveClass('break-words')
    }
  })
})
