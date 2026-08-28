import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useParams } from 'next/navigation'
import ListingDetailPage from './page'

vi.mock('next/navigation', () => ({ useParams: vi.fn() }))
vi.mock('@/components/yellowpages/RatingForm', () => ({
  default: () => <div data-testid="rating-form" />,
}))

const businessListing = {
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
  team: [],
  projects: [],
  portfolioImages: [],
  avgRating: 4.5,
  ratingCount: 2,
  ratings: [
    { id: 'r1', stars: 5, comment: 'Excellent!', reviewerName: 'Ada O.', createdAt: new Date().toISOString() },
    { id: 'r2', stars: 4, comment: null, reviewerName: 'Bob', createdAt: new Date().toISOString() },
  ],
}

const individualListing = {
  ...businessListing,
  listingType: 'INDIVIDUAL',
  name: 'Grace Coder',
  headline: 'Backend Engineer',
  contactPersonName: null,
  position: null,
  skills: ['Go', 'Postgres'],
  experience: [{ title: 'Engineer', organization: 'Acme', startDate: '2020', endDate: '2024', current: false, description: 'APIs' }],
  education: [],
  languages: [],
  photoUrl: null,
}

const mockFetch = (listing, ok = true) => {
  global.fetch = vi.fn(() => Promise.resolve({ ok, json: () => Promise.resolve({ listing }) }))
}

describe('ListingDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useParams.mockReturnValue({ id: 'l1' })
    try { window.localStorage.clear() } catch { /* ignore */ }
  })

  it('shows a loading state, then the business portfolio', async () => {
    mockFetch(businessListing)
    render(<ListingDetailPage />)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), { timeout: 3000 })

    expect(screen.getByText('Jane Doe, Founder')).toBeInTheDocument()
    expect(screen.getByText('Tourism & Travel')).toBeInTheDocument()
    expect(screen.getByText('Lagos, Nigeria')).toBeInTheDocument()
    expect(screen.getByText('Flights, hotels, visas')).toBeInTheDocument()
  }, 10000)

  it('renders the personal layout for an INDIVIDUAL listing', async () => {
    mockFetch(individualListing)
    render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('Grace Coder')).toBeInTheDocument(), { timeout: 3000 })
    expect(screen.getByText('Backend Engineer')).toBeInTheDocument()
    expect(screen.getByText('Go')).toBeInTheDocument()
    expect(screen.getByText('Download Résumé').closest('a')).toHaveAttribute('href', '/api/yellowpages/listings/l1/resume')
  }, 10000)

  it('keeps reviews behind a button, opening them in a modal', async () => {
    mockFetch(businessListing)
    render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), { timeout: 3000 })
    // The list of reviewers is not on the page until the modal is opened.
    expect(screen.queryByText('Ada O.')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('4.5', { exact: false }))
    expect(await screen.findByRole('dialog', { name: 'Reviews' })).toBeInTheDocument()
    expect(screen.getByText('Ada O.')).toBeInTheDocument()
    expect(screen.getByTestId('rating-form')).toBeInTheDocument()
  }, 10000)

  it('shows contact links, normalising phone/WhatsApp to full international form', async () => {
    mockFetch(businessListing)
    render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('Call').closest('a')).toHaveAttribute('href', 'tel:+2348012345678'), { timeout: 3000 })
    expect(screen.getByText('WhatsApp').closest('a')).toHaveAttribute('href', 'https://wa.me/2348012345678')
    expect(screen.getByText('Email').closest('a')).toHaveAttribute('href', 'mailto:jane@acme.com')
    expect(screen.getByText('Website').closest('a')).toHaveAttribute('href', 'https://acme.com')
  }, 10000)

  it('hides the WhatsApp button when no whatsapp number is set', async () => {
    mockFetch({ ...businessListing, whatsapp: null })
    render(<ListingDetailPage />)
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), { timeout: 3000 })
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
  }, 10000)

  it('shows a not-found message when the listing does not exist', async () => {
    mockFetch(null, false)
    render(<ListingDetailPage />)
    await waitFor(() => expect(screen.getByText('Portfolio Not Found')).toBeInTheDocument(), { timeout: 3000 })
  }, 10000)

  it('renders a gallery section when portfolioImages are present', async () => {
    mockFetch({ ...businessListing, portfolioImages: ['https://example.com/a.jpg', 'https://example.com/b.jpg'] })
    const { container } = render(<ListingDetailPage />)

    await waitFor(() => expect(screen.getByText('Gallery')).toBeInTheDocument(), { timeout: 3000 })
    expect(container.querySelectorAll('img[src="https://example.com/a.jpg"]')).toHaveLength(1)
  }, 10000)

  it('does not render an empty gallery to visitors', async () => {
    mockFetch({ ...businessListing, portfolioImages: [] })
    render(<ListingDetailPage />)
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), { timeout: 3000 })
    expect(screen.queryByText('Gallery')).not.toBeInTheDocument()
  }, 10000)

  it('keeps a long business name from overflowing (break-words)', async () => {
    const longName = 'A'.repeat(80) + ' Extremely Long Business Name Nigeria Limited'
    mockFetch({ ...businessListing, name: longName })
    render(<ListingDetailPage />)

    const heading = await screen.findByText(longName, {}, { timeout: 3000 })
    expect(heading).toHaveClass('break-words')
  }, 10000)

  it('lets a long social link wrap instead of overflowing its pill', async () => {
    const longHandle = 'https://facebook.com/' + 'a'.repeat(100)
    mockFetch({ ...businessListing, socialLinks: { facebook: longHandle } })
    render(<ListingDetailPage />)

    const pill = await screen.findByText(`facebook: ${longHandle}`, {}, { timeout: 3000 })
    expect(pill).toHaveClass('break-all')
    expect(pill).toHaveClass('max-w-full')
  }, 10000)
})
