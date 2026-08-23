import { render, screen } from '@testing-library/react'
import ListingCard from './ListingCard'
import YellowPagesChrome from './shared/YellowPagesChrome'
import { usePathname } from 'next/navigation'

vi.mock('next/navigation', () => ({ usePathname: vi.fn(() => '/') }))

const baseListing = {
  id: 'l1',
  name: 'Acme Travels',
  category: 'TOURISM_TRAVEL',
  description: 'We plan unforgettable trips for the whole family.',
  city: 'Lagos',
  state: null,
  country: 'Nigeria',
  ratingCount: 0,
  avgRating: null,
  logoUrl: null,
}

function renderCard(listing, base = '/yellowpages') {
  return render(
    <YellowPagesChrome base={base}>
      <ListingCard listing={listing} />
    </YellowPagesChrome>
  )
}

describe('ListingCard', () => {
  it('links to the listing detail page, prefixed with the base', () => {
    renderCard(baseListing)
    expect(screen.getByText('Acme Travels').closest('a')).toHaveAttribute('href', '/yellowpages/listing/l1')
  })

  it('shows the human-readable category label', () => {
    renderCard(baseListing)
    expect(screen.getByText('Tourism & Travel')).toBeInTheDocument()
  })

  it('shows the joined location', () => {
    renderCard(baseListing)
    expect(screen.getByText('Lagos, Nigeria')).toBeInTheDocument()
  })

  it('shows "No reviews yet" when ratingCount is 0', () => {
    renderCard(baseListing)
    expect(screen.getByText('No reviews yet')).toBeInTheDocument()
  })

  it('shows the average rating and count when reviews exist', () => {
    renderCard({ ...baseListing, ratingCount: 3, avgRating: 4.3 })
    expect(screen.getByText('(3)')).toBeInTheDocument()
  })

  it('renders the logo image when logoUrl is set', () => {
    // The logo <img> has an empty alt (decorative), which gives it ARIA role
    // "presentation" rather than "img" — so it must be queried directly, not via getByRole.
    const { container } = renderCard({ ...baseListing, logoUrl: 'https://example.com/logo.png' })
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/logo.png')
  })

  it('falls back to the placeholder icon when logoUrl is absent', () => {
    const { container } = renderCard(baseListing)
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('renders an empty location slot when city, state, and country are all missing', () => {
    renderCard({ ...baseListing, city: null, state: null, country: null })
    expect(screen.queryByText('Lagos, Nigeria')).not.toBeInTheDocument()
  })
})
