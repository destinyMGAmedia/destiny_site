import { render, screen, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import ListingDetailPage from './page'

vi.mock('next/navigation', () => ({ useParams: vi.fn() }))
vi.mock('@/components/yellowpages/RatingForm', () => ({
  default: () => <div data-testid="rating-form" />,
}))

const fullListing = {
  id: 'l1',
  listingType: 'BUSINESS',
  name: 'Acme Travels',
  contactPersonName: 'Jane Doe',
  position: 'Founder',
  phone: '08012345678',
  whatsapp: '08012345678',
  email: 'jane@acme.com',
  category: 'TOURISM_TRAVEL',
  description: 'We plan unforgettable trips.',
  servicesOffered: 'Flights, hotels, visas',
  city: 'Lagos',
  state: null,
  country: 'Nigeria',
  website: 'https://acme.com',
  socialLinks: { facebook: 'fb.com/acme' },
  yearsInOperation: 5,
  certifications: 'IATA, NANTA',
  logoUrl: null,
  preferredContact: 'WHATSAPP',
  avgRating: 4.5,
  ratingCount: 2,
  ratings: [
    { id: 'r1', stars: 5, comment: 'Excellent!', reviewerName: 'Ada O.', createdAt: new Date().toISOString() },
    { id: 'r2', stars: 4, comment: null, reviewerName: 'Bob', createdAt: new Date().toISOString() },
  ],
}

describe('ListingDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useParams.mockReturnValue({ id: 'l1' })
  })

  it('shows a loading state, then the listing details', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: fullListing }) }))
    render(<ListingDetailPage />)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), { timeout: 3000 })

    expect(screen.getByText('Jane Doe, Founder')).toBeInTheDocument()
    expect(screen.getByText('Tourism & Travel')).toBeInTheDocument()
    expect(screen.getByText('Lagos, Nigeria')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(2 reviews)')).toBeInTheDocument()
    expect(screen.getByText('Ada O.')).toBeInTheDocument()
  }, 10000)

  it('shows contact links, normalising phone/WhatsApp to full international form', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: fullListing }) }))
    render(<ListingDetailPage />)

    // country "Nigeria" (no stored dial code) → local "080…" becomes +234…
    await waitFor(() => expect(screen.getByText('Call').closest('a')).toHaveAttribute('href', 'tel:+2348012345678'), { timeout: 3000 })
    expect(screen.getByText('WhatsApp').closest('a')).toHaveAttribute('href', 'https://wa.me/2348012345678')
    expect(screen.getByText('Email').closest('a')).toHaveAttribute('href', 'mailto:jane@acme.com')
    expect(screen.getByText('Website').closest('a')).toHaveAttribute('href', 'https://acme.com')
  }, 10000)

  it('uses the stored countryDialCode when present', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ listing: { ...fullListing, country: null, countryDialCode: '44', phone: '07911123456', whatsapp: '07911123456' } }),
    }))
    render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('WhatsApp').closest('a')).toHaveAttribute('href', 'https://wa.me/447911123456'), { timeout: 3000 })
    expect(screen.getByText('Call').closest('a')).toHaveAttribute('href', 'tel:+447911123456')
  }, 10000)

  it('hides the WhatsApp button when no whatsapp number is set', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: { ...fullListing, whatsapp: null } }) }))
    render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), { timeout: 3000 })
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  }, 10000)

  it('shows a not-found message when the listing does not exist', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('Listing Not Found')).toBeInTheDocument(), { timeout: 3000 })
  }, 10000)

  it('shows "No reviews yet" when there are none', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: { ...fullListing, ratingCount: 0, avgRating: null, ratings: [] } }) }))
    render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('No reviews yet')).toBeInTheDocument(), { timeout: 3000 })
    expect(screen.getByText('No reviews yet — be the first to leave one.')).toBeInTheDocument()
  }, 10000)

  it('renders a photo gallery when portfolioImages are present', async () => {
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ listing: { ...fullListing, portfolioImages: ['https://example.com/a.jpg', 'https://example.com/b.jpg'] } }),
    }))
    const { container } = render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('Photos')).toBeInTheDocument(), { timeout: 3000 })
    expect(container.querySelectorAll('img[src="https://example.com/a.jpg"]')).toHaveLength(1)
  }, 10000)

  it('does not render a Photos section when there are no portfolio images', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: { ...fullListing, portfolioImages: [] } }) }))
    render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), { timeout: 3000 })
    expect(screen.queryByText('Photos')).not.toBeInTheDocument()
  }, 10000)

  it('keeps a long business name from overflowing its header row on narrow screens', async () => {
    const longName = 'A'.repeat(80) + ' Extremely Long Business Name Nigeria Limited'
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: { ...fullListing, name: longName } }) }))
    render(<ListingDetailPage />)

    const heading = await screen.findByText(longName, {}, { timeout: 3000 })
    expect(heading).toHaveClass('break-words')
    expect(heading.parentElement).toHaveClass('min-w-0')
    expect(heading.parentElement).toHaveClass('flex-1')
  }, 10000)

  it('lets a long social link wrap instead of overflowing its pill', async () => {
    const longHandle = 'https://facebook.com/' + 'a'.repeat(100)
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ listing: { ...fullListing, socialLinks: { facebook: longHandle } } }),
    }))
    render(<ListingDetailPage />)

    const pill = await screen.findByText(`facebook: ${longHandle}`, {}, { timeout: 3000 })
    expect(pill).toHaveClass('break-all')
    expect(pill).toHaveClass('max-w-full')
  }, 10000)
})
