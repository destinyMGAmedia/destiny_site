import { render, screen } from '@testing-library/react'
import InternalGatesPage, { metadata } from './page'

vi.mock('@/components/nation/gates-internal/InternalGatesGrid', () => ({
  default: () => <div data-testid="internal-gates-grid" />,
}))

describe('InternalGatesPage', () => {
  it('renders the InternalGatesGrid component', () => {
    render(<InternalGatesPage />)
    expect(screen.getByTestId('internal-gates-grid')).toBeInTheDocument()
  })

  it('exports the expected page metadata', () => {
    expect(metadata).toEqual({ title: 'Internal Gates — Destiny Nation' })
  })
})
