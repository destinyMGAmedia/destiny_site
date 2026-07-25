import { render, screen } from '@testing-library/react'
import InfluenceGatesPage, { metadata } from './page'

vi.mock('@/components/nation/gates-influence/InfluenceGatesGrid', () => ({
  default: () => <div data-testid="influence-gates-grid" />,
}))

describe('InfluenceGatesPage', () => {
  it('renders the InfluenceGatesGrid component', () => {
    render(<InfluenceGatesPage />)
    expect(screen.getByTestId('influence-gates-grid')).toBeInTheDocument()
  })

  it('exports the expected page metadata', () => {
    expect(metadata).toEqual({ title: 'The 30 Gates of Influence — Destiny Nation' })
  })
})
