import { render, screen, fireEvent, within } from '@testing-library/react'
import InternalGatesGrid from './InternalGatesGrid'
import { INTERNAL_CATEGORIES } from '@/lib/nation/gates'

describe('InternalGatesGrid', () => {
  it('renders every category name', () => {
    render(<InternalGatesGrid />)
    INTERNAL_CATEGORIES.forEach((category) => {
      expect(screen.getByText(category.name)).toBeInTheDocument()
    })
  })

  it('renders every gate name within its category', () => {
    render(<InternalGatesGrid />)
    INTERNAL_CATEGORIES.forEach((category) => {
      category.gates.forEach((gate) => {
        expect(screen.getByText(gate)).toBeInTheDocument()
      })
    })
  })

  it('shows a Legacy Project badge for a gate that has one, and not for one that does not', () => {
    render(<InternalGatesGrid />)
    const christianEducationButton = screen.getByText('Christian Education').closest('button')
    expect(
      within(christianEducationButton).getByText(/Legacy Project: Destiny Leadership Institute/)
    ).toBeInTheDocument()

    const prayerButton = screen.getByText('Prayer').closest('button')
    expect(within(prayerButton).queryByText(/Legacy Project/)).not.toBeInTheDocument()
  })

  it('opens GateDetail with the correct gate, group name, project, and layer when a gate card is clicked', () => {
    render(<InternalGatesGrid />)

    // Gate without a legacy project
    fireEvent.click(screen.getByText('Prayer'))
    let modal = screen.getByLabelText('Close').closest('.max-w-lg')
    expect(within(modal).getByRole('heading', { name: 'Prayer' })).toBeInTheDocument()
    expect(within(modal).getByText('Spiritual Formation')).toBeInTheDocument()
    expect(within(modal).queryByText('Legacy Project')).not.toBeInTheDocument()
    // INTERNAL layer does not show the "Get Involved" CTA
    expect(within(modal).queryByText('Get Involved with this Gate')).not.toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('Close'))
    expect(screen.queryByRole('heading', { name: 'Prayer' })).not.toBeInTheDocument()

    // Gate with a legacy project
    fireEvent.click(screen.getByText('Christian Education'))
    modal = screen.getByLabelText('Close').closest('.max-w-lg')
    expect(within(modal).getByRole('heading', { name: 'Christian Education' })).toBeInTheDocument()
    expect(within(modal).getByText('Legacy Project')).toBeInTheDocument()
    expect(within(modal).getByText('Destiny Leadership Institute')).toBeInTheDocument()
  })

  it('does not render GateDetail before any gate is selected', () => {
    render(<InternalGatesGrid />)
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument()
  })
})
