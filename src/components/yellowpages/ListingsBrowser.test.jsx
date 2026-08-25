import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import ListingsBrowser from './ListingsBrowser'
import YellowPagesChrome from './shared/YellowPagesChrome'

// ListingsBrowser renders inside YellowPagesChrome, which also renders Nav — Nav needs these
// too now that it hosts the search/assembly filter.
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/yellowpages/browse'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(),
}))

const WAIT = { timeout: 4000 }

const emptyResult = { listings: [], total: 0, totalPages: 0 }
const oneListingResult = {
  listings: [{
    id: 'l1', name: 'Acme Travels', category: 'TOURISM_TRAVEL', description: 'We plan trips.',
    city: 'Lagos', state: null, country: 'Nigeria', ratingCount: 0, avgRating: null, logoUrl: null, portfolioImages: [],
  }],
  total: 1,
  totalPages: 1,
}

function mockFetch(listings = emptyResult) {
  global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(listings) }))
}

function renderBrowser(props = {}, initialQuery = '') {
  useSearchParams.mockReturnValue(new URLSearchParams(initialQuery))
  return render(
    <YellowPagesChrome base="/yellowpages">
      <ListingsBrowser {...props} />
    </YellowPagesChrome>
  )
}

// The desktop sidebar and mobile chip row both render in jsdom (CSS is not processed in
// tests, so `hidden`/`lg:*` utility classes have no effect) — scope to the first tablist
// (the sidebar) when asserting on a specific chip.
const sidebarTablist = () => within(screen.getAllByRole('tablist')[0])

describe('ListingsBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading state, then renders results from the API', async () => {
    mockFetch(oneListingResult)
    renderBrowser()

    expect(screen.getByText('Loading listings…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), WAIT)
  }, 10000)

  it('shows an error message (not a crash) when the API returns a non-ok response', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Failed to load listings' }) }))
    renderBrowser()

    await waitFor(() => expect(screen.getByText('Could not load listings. Please try again.')).toBeInTheDocument(), WAIT)
    // Must not have thrown trying to read `.length` off an undefined `listings` field.
    expect(screen.queryByText(/No listings match your search yet/)).not.toBeInTheDocument()
  }, 10000)

  it('shows the empty state with a link to register when there are no results', async () => {
    mockFetch(emptyResult)
    renderBrowser()

    await waitFor(() => expect(screen.getByText(/No listings match your search yet/)).toBeInTheDocument(), WAIT)
    expect(screen.getByText('list your skill or business')).toHaveAttribute('href', 'register')
  }, 10000)

  it('hides the category sidebar/chips and forces lockedCategory into the fetch when provided', async () => {
    mockFetch(emptyResult)
    renderBrowser({ lockedCategory: 'TECHNOLOGY_IT' })

    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()

    await waitFor(() => {
      const call = global.fetch.mock.calls.find(([url]) => String(url).includes('/api/yellowpages/listings'))
      expect(call[0]).toContain('category=TECHNOLOGY_IT')
    }, WAIT)
  }, 10000)

  it('shows the category chip sidebar when no lockedCategory is given, with "All" selected by default', async () => {
    mockFetch(emptyResult)
    renderBrowser()
    await waitFor(() => expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0), WAIT)
    expect(sidebarTablist().getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true')
  }, 10000)

  it('selecting a category chip re-fetches with that category and marks it selected', async () => {
    mockFetch(emptyResult)
    renderBrowser()
    await waitFor(() => expect(screen.getAllByRole('tablist').length).toBeGreaterThan(0), WAIT)

    fireEvent.click(sidebarTablist().getByRole('tab', { name: 'Technology & IT' }))

    await waitFor(() => {
      const call = global.fetch.mock.calls.findLast(([url]) => String(url).includes('/api/yellowpages/listings'))
      expect(call[0]).toContain('category=TECHNOLOGY_IT')
    }, WAIT)
    expect(sidebarTablist().getByRole('tab', { name: 'Technology & IT' })).toHaveAttribute('aria-selected', 'true')
  }, 10000)

  it('re-fetches when the URL search param (q) changes, e.g. set by Nav', async () => {
    mockFetch(emptyResult)
    renderBrowser({}, 'q=plumber')
    await waitFor(() => {
      const call = global.fetch.mock.calls.find(([url]) => String(url).includes('q=plumber'))
      expect(call).toBeDefined()
    }, WAIT)
  }, 10000)

  it('re-fetches when the URL search param (assemblySlug) changes, e.g. set by Nav', async () => {
    mockFetch(emptyResult)
    renderBrowser({}, 'assemblySlug=lagos')
    await waitFor(() => {
      const call = global.fetch.mock.calls.find(([url]) => String(url).includes('assemblySlug=lagos'))
      expect(call).toBeDefined()
    }, WAIT)
  }, 10000)

  it('shows a "Load More" button when more pages exist, and appends results on click', async () => {
    mockFetch({ ...oneListingResult, totalPages: 2 })
    renderBrowser()

    await waitFor(() => expect(screen.getByText('Load More')).toBeInTheDocument(), WAIT)

    const secondListing = { ...oneListingResult.listings[0], id: 'l2', name: 'Beta Plumbing' }
    global.fetch.mockImplementationOnce((url) => {
      expect(url).toContain('page=2')
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ listings: [secondListing], total: 2, totalPages: 2 }) })
    })

    fireEvent.click(screen.getByText('Load More'))

    await waitFor(() => expect(screen.getByText('Beta Plumbing')).toBeInTheDocument(), WAIT)
    expect(screen.getByText('Acme Travels')).toBeInTheDocument()
  }, 10000)

  it('does not show "Load More" once the last page has been reached', async () => {
    mockFetch(oneListingResult)
    renderBrowser()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), WAIT)
    expect(screen.queryByText('Load More')).not.toBeInTheDocument()
  }, 10000)
})
