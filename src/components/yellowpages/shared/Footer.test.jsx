import { render, screen } from '@testing-library/react'
import Footer from './Footer'
import YellowPagesChrome from './YellowPagesChrome'
import { usePathname } from 'next/navigation'

vi.mock('next/navigation', () => ({ usePathname: vi.fn(() => '/') }))

describe('Footer', () => {
  it('renders the current year in the copyright line', () => {
    render(
      <YellowPagesChrome base="/yellowpages">
        <div />
      </YellowPagesChrome>
    )
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeInTheDocument()
  })

  it('prefixes quick links with the base', () => {
    render(
      <YellowPagesChrome base="/yellowpages">
        <div />
      </YellowPagesChrome>
    )
    expect(screen.getByText('Browse the Directory')).toHaveAttribute('href', '/yellowpages/search')
  })
})
