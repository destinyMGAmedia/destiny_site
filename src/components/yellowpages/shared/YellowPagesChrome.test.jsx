import { render, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import YellowPagesChrome, { useYellowPagesBase } from './YellowPagesChrome'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

function BaseProbe() {
  return <span data-testid="base">{useYellowPagesBase()}</span>
}

describe('YellowPagesChrome', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/')
  })

  it('renders Nav, children, and Footer', () => {
    render(
      <YellowPagesChrome base="/yellowpages">
        <p>page content</p>
      </YellowPagesChrome>
    )
    expect(screen.getAllByText('The Yellow Pages').length).toBeGreaterThan(0)
    expect(screen.getByText('page content')).toBeInTheDocument()
    expect(screen.getByText('Destiny Mission Global Assembly')).toBeInTheDocument()
  })

  it('provides the base value via useYellowPagesBase', () => {
    render(
      <YellowPagesChrome base="/yellowpages">
        <BaseProbe />
      </YellowPagesChrome>
    )
    expect(screen.getByTestId('base')).toHaveTextContent('/yellowpages')
  })
})
