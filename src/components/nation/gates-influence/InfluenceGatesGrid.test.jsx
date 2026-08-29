import { render, screen, fireEvent, within } from '@testing-library/react'
import InfluenceGatesGrid from './InfluenceGatesGrid'
import { INFLUENCE_SECTORS } from '@/lib/nation/gates'

describe('InfluenceGatesGrid', () => {
  it('renders every sector name', () => {
    render(<InfluenceGatesGrid />)
    INFLUENCE_SECTORS.forEach((sector) => {
      expect(screen.getByText(sector.name)).toBeInTheDocument()
    })
  })

  it('renders every gate name within its sector', () => {
    render(<InfluenceGatesGrid />)
    INFLUENCE_SECTORS.forEach((sector) => {
      sector.gates.forEach((gate) => {
        expect(screen.getByText(gate)).toBeInTheDocument()
      })
    })
  })

  it('shows a Legacy Project badge for a gate that has one, and not for one that does not', () => {
    render(<InfluenceGatesGrid />)
    const governanceButton = screen.getByText('Governance & Public Policy').closest('button')
    expect(within(governanceButton).getByText(/Legacy Project: Faith & Public Leadership Forum/)).toBeInTheDocument()

    const lawJusticeButton = screen.getByText('Law & Justice').closest('button')
    expect(within(lawJusticeButton).queryByText(/Legacy Project/)).not.toBeInTheDocument()
  })

  it('opens GateDetail with the correct gate, group name, project, and layer when a gate card is clicked', () => {
    render(<InfluenceGatesGrid />)

    // Gate without a legacy project
    fireEvent.click(screen.getByText('Law & Justice'))
    let modal = screen.getByLabelText('Close').closest('.max-w-lg')
    expect(within(modal).getByRole('heading', { name: 'Law & Justice' })).toBeInTheDocument()
    expect(within(modal).getByText('Governance & Public Leadership')).toBeInTheDocument()
    expect(within(modal).queryByText('Legacy Project')).not.toBeInTheDocument()
    // INFLUENCE layer shows the "Get Involved" CTA
    expect(within(modal).getByText('Get Involved with this Gate')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByRole('heading', { name: 'Law & Justice' })).not.toBeInTheDocument()

    // Gate with a legacy project
    fireEvent.click(screen.getByText('Governance & Public Policy'))
    modal = screen.getByLabelText('Close').closest('.max-w-lg')
    expect(within(modal).getByRole('heading', { name: 'Governance & Public Policy' })).toBeInTheDocument()
    expect(within(modal).getByText('Legacy Project')).toBeInTheDocument()
    expect(within(modal).getByText('Faith & Public Leadership Forum')).toBeInTheDocument()
  })

  it('does not render GateDetail before any gate is selected', () => {
    render(<InfluenceGatesGrid />)
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()
  })
})
