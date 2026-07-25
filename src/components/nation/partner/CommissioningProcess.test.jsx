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
})
