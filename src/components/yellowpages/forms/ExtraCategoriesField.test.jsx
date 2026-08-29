import { render, screen, fireEvent } from '@testing-library/react'
import ExtraCategoriesField from './ExtraCategoriesField'

function setup(props = {}) {
  const onChange = vi.fn()
  render(<ExtraCategoriesField primary="TOURISM_TRAVEL" values={[]} onChange={onChange} {...props} />)
  return { onChange }
}

describe('ExtraCategoriesField', () => {
  it('offers every category except the primary and OTHER', () => {
    setup()
    const opts = [...screen.getByLabelText(/Additional categories/).options].map((o) => o.textContent)
    expect(opts).toContain('Engineering & Technology')
    expect(opts).toContain('Governance & Politics')
    expect(opts).not.toContain('Tourism & Travel') // the primary
    expect(opts).not.toContain('Other')
  })

  it('adds a picked category via onChange', () => {
    const { onChange } = setup()
    fireEvent.change(screen.getByLabelText(/Additional categories/), { target: { value: 'GOVERNANCE_POLITICS' } })
    expect(onChange).toHaveBeenCalledWith(['GOVERNANCE_POLITICS'])
  })

  it('renders chosen categories as removable chips and excludes them from the dropdown', () => {
    const { onChange } = setup({ values: ['GOVERNANCE_POLITICS', 'ENGINEERING_TECHNOLOGY'] })
    expect(screen.getByText('Governance & Politics')).toBeInTheDocument()
    const opts = [...screen.getByLabelText(/Additional categories/).options].map((o) => o.value)
    expect(opts).not.toContain('GOVERNANCE_POLITICS')

    fireEvent.click(screen.getByLabelText('Remove Governance & Politics'))
    expect(onChange).toHaveBeenCalledWith(['ENGINEERING_TECHNOLOGY'])
  })

  it('hides the dropdown once the max (5) is reached', () => {
    setup({ values: ['A', 'B', 'C', 'D', 'E'].map((_, i) => ['GOVERNANCE_POLITICS', 'LAW_JUSTICE', 'ENERGY_ENVIRONMENT', 'SCIENCE_RESEARCH_INNOVATION', 'CORPORATE_CONSULTING'][i]) })
    expect(screen.queryByLabelText(/Additional categories/)).not.toBeInTheDocument()
    expect(screen.getByText('(5/5)')).toBeInTheDocument()
  })
})
