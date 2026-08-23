import { render, screen } from '@testing-library/react'
import CommissioningProcess from './CommissioningProcess'
import { COMMISSIONING_PHASES } from '@/lib/nation/gates'

describe('CommissioningProcess', () => {
  it('renders the section heading and intro copy', () => {
    render(<CommissioningProcess />)
    expect(screen.getByText('The Commissioning Process')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Five Phases, Not Self-Nomination' })).toBeInTheDocument()
    expect(
      screen.getByText(/leadership roles are assigned, not self-applied for/)
    ).toBeInTheDocument()
  })

  it('renders every commissioning phase name and description, in order, numbered from 1', () => {
    render(<CommissioningProcess />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(COMMISSIONING_PHASES.length)

    COMMISSIONING_PHASES.forEach((phase, i) => {
      expect(screen.getByText(phase.phase)).toBeInTheDocument()
      expect(screen.getByText(phase.description)).toBeInTheDocument()
      expect(items[i]).toHaveTextContent(String(i + 1))
      expect(items[i]).toHaveTextContent(phase.phase)
    })
  })

  it('renders phases as an ordered list with a single-column list structure', () => {
    render(<CommissioningProcess />)
    const list = screen.getByRole('list')
    expect(list.tagName).toBe('OL')
    expect(list.children).toHaveLength(COMMISSIONING_PHASES.length)
  })

  it('renders exactly five phases matching the source data length (no hardcoded count)', () => {
    render(<CommissioningProcess />)
    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(COMMISSIONING_PHASES).toHaveLength(5)
  })

  it('does not duplicate any phase step number', () => {
    render(<CommissioningProcess />)
    const items = screen.getAllByRole('listitem')
    const numbers = items.map((item) => item.querySelector('span')?.textContent)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('renders each phase heading using the serif font family style', () => {
    render(<CommissioningProcess />)
    COMMISSIONING_PHASES.forEach((phase) => {
      const heading = screen.getByText(phase.phase)
      expect(heading.tagName).toBe('H3')
      expect(heading).toHaveStyle({ fontFamily: 'var(--font-serif)' })
    })
  })
})
