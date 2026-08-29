import { render, screen, within } from '@testing-library/react'
import Footer from './Footer'
import YellowPagesChrome from './YellowPagesChrome'
import { usePathname } from 'next/navigation'

// Footer renders inside YellowPagesChrome, which also renders Nav — Nav needs these too.
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

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
    expect(screen.getByText('Browse the Directory')).toHaveAttribute('href', '/yellowpages/browse')
  })

  it('renders exactly the two Explore quick links (Browse + Register)', () => {
    render(
      <YellowPagesChrome base="/yellowpages">
        <div />
      </YellowPagesChrome>
    )
    const explore = screen.getByRole('heading', { name: 'Explore' }).parentElement
    const links = within(explore).getAllByRole('link')
    expect(links.map((a) => a.textContent)).toEqual(['Browse the Directory', 'List Your Skill or Business'])
    expect(within(explore).getByText('List Your Skill or Business')).toHaveAttribute('href', '/yellowpages/register')
  })

  it('no longer surfaces a "Manage My Listing" quick link', () => {
    render(
      <YellowPagesChrome base="/yellowpages">
        <div />
      </YellowPagesChrome>
    )
    expect(screen.queryByText('Manage My Listing')).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /manage/i })).not.toBeInTheDocument()
  })

  it('works with an empty base (subdomain mode) — links are un-prefixed', () => {
    render(
      <YellowPagesChrome base="">
        <div />
      </YellowPagesChrome>
    )
    expect(screen.getByText('Browse the Directory')).toHaveAttribute('href', '/browse')
    expect(screen.getByText('List Your Skill or Business')).toHaveAttribute('href', '/register')
  })
})
