import { render, screen } from '@testing-library/react'
import NationLandingPage from './page'

vi.mock('@/components/nation/landing/Hero', () => ({
  default: () => <div data-testid="hero" />,
}))
vi.mock('@/components/nation/landing/TheologicalFoundation', () => ({
  default: () => <div data-testid="theological-foundation" />,
}))
vi.mock('@/components/nation/landing/ModelSummary', () => ({
  default: () => <div data-testid="model-summary" />,
}))

describe('NationLandingPage', () => {
  it('renders Hero, TheologicalFoundation, and ModelSummary in order', () => {
    render(<NationLandingPage />)
    const hero = screen.getByTestId('hero')
    const theological = screen.getByTestId('theological-foundation')
    const model = screen.getByTestId('model-summary')

    expect(hero).toBeInTheDocument()
    expect(theological).toBeInTheDocument()
    expect(model).toBeInTheDocument()

    // Order: Hero -> TheologicalFoundation -> ModelSummary
    expect(
      hero.compareDocumentPosition(theological) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
    expect(
      theological.compareDocumentPosition(model) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('renders the closing tagline', () => {
    render(<NationLandingPage />)
    expect(
      screen.getByText('One Church. One Mission. Thirty Gates. Infinite Impact.')
    ).toBeInTheDocument()
  })
})
