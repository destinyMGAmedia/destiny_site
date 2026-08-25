import { render, screen } from '@testing-library/react'
import ListingCard from './ListingCard'
import YellowPagesChrome from './shared/YellowPagesChrome'
import { usePathname } from 'next/navigation'

// ListingCard renders inside YellowPagesChrome, which also renders Nav — Nav needs these too.
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))

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
  portfolioImages: [],
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

  it('shows no rating badge when ratingCount is 0', () => {
    renderCard(baseListing)
    expect(screen.queryByText(/\(0\)/)).not.toBeInTheDocument()
  })

  it('shows the rating count when reviews exist', () => {
    renderCard({ ...baseListing, ratingCount: 3, avgRating: 4.3 })
    expect(screen.getByText('(3)')).toBeInTheDocument()
  })

  it('renders the logo image when logoUrl is set', () => {
    const { container } = renderCard({ ...baseListing, logoUrl: 'https://example.com/logo.png' })
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://example.com/logo.png')
  })

  it('falls back to the placeholder icon when logoUrl is absent', () => {
    const { container } = renderCard(baseListing)
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('renders the first portfolio image as a cover photo when present', () => {
    const { container } = renderCard({ ...baseListing, portfolioImages: ['https://example.com/work1.jpg', 'https://example.com/work2.jpg'] })
    const images = container.querySelectorAll('img')
    expect(images[images.length - 1]).toHaveAttribute('src', 'https://example.com/work1.jpg')
  })

  it('does not render a cover photo when there are no portfolio images', () => {
    const { container } = renderCard(baseListing)
    expect(container.querySelectorAll('img')).toHaveLength(0)
  })

  it('renders an empty location slot when city, state, and country are all missing', () => {
    renderCard({ ...baseListing, city: null, state: null, country: null })
    expect(screen.queryByText('Lagos, Nigeria')).not.toBeInTheDocument()
  })
})
