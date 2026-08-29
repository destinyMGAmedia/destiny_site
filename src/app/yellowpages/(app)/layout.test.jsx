import { render, screen } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import YellowPagesAppLayout from './layout'
import YellowPagesBaseOnly from '@/components/yellowpages/shared/YellowPagesBaseOnly'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/yellowpages/browse'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

describe('YellowPagesAppLayout', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve([]) }))
  })

  it('renders Nav, Footer, and the page content, using the base from context', () => {
    render(
      <YellowPagesBaseOnly base="/yellowpages">
        <YellowPagesAppLayout>
          <p>page content</p>
        </YellowPagesAppLayout>
      </YellowPagesBaseOnly>
    )

    expect(screen.getAllByText('The Yellow Pages').length).toBeGreaterThan(0)
    expect(screen.getByText('page content')).toBeInTheDocument()
    expect(screen.getByText('Destiny Mission Global Assembly')).toBeInTheDocument()
  })
})
