import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import ListingsBrowser from './ListingsBrowser'
import YellowPagesChrome from './shared/YellowPagesChrome'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}))

const WAIT = { timeout: 4000 }

const emptyResult = { listings: [], total: 0, totalPages: 0 }
const oneListingResult = {
  listings: [{
    id: 'l1', name: 'Acme Travels', category: 'TOURISM_TRAVEL', description: 'We plan trips.',
    city: 'Lagos', state: null, country: 'Nigeria', ratingCount: 0, avgRating: null, logoUrl: null,
  }],
  total: 1,
  totalPages: 1,
}

function mockFetchSequence({ assemblies = [], listings = emptyResult } = {}) {
  global.fetch = vi.fn((url) => {
    if (String(url).includes('/api/assemblies')) {
      return Promise.resolve({ json: () => Promise.resolve(assemblies) })
    }
    return Promise.resolve({ json: () => Promise.resolve(listings) })
  })
}

function renderBrowser(props = {}, initialQuery = '') {
  const replace = vi.fn()
  useRouter.mockReturnValue({ replace })
  usePathname.mockReturnValue('/yellowpages/search')
  useSearchParams.mockReturnValue(new URLSearchParams(initialQuery))

  render(
    <YellowPagesChrome base="/yellowpages">
      <ListingsBrowser {...props} />
    </YellowPagesChrome>
  )
  return { replace }
}

describe('ListingsBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a loading state, then renders results from the API', async () => {
    mockFetchSequence({ listings: oneListingResult })
    renderBrowser()

    expect(screen.getByText('Loading listings…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), WAIT)
  }, 10000)

  it('shows the empty state with a link to register when there are no results', async () => {
    mockFetchSequence({ listings: emptyResult })
    renderBrowser()

    await waitFor(() => expect(screen.getByText(/No listings match your search yet/)).toBeInTheDocument(), WAIT)
    expect(screen.getByText('list your skill or business')).toHaveAttribute('href', 'register')
  }, 10000)

  it('hides the category select and forces lockedCategory into the fetch when provided', async () => {
    mockFetchSequence({ listings: emptyResult })
    renderBrowser({ lockedCategory: 'TECHNOLOGY_IT' })

    expect(screen.queryByLabelText('Category')).not.toBeInTheDocument()

    await waitFor(() => {
      const call = global.fetch.mock.calls.find(([url]) => String(url).includes('/api/yellowpages/listings'))
      expect(call[0]).toContain('category=TECHNOLOGY_IT')
    }, WAIT)
  }, 10000)

  it('shows the category select when no lockedCategory is given', async () => {
    mockFetchSequence({ listings: emptyResult })
    renderBrowser()
    await waitFor(() => expect(screen.getByLabelText('Category')).toBeInTheDocument(), WAIT)
  }, 10000)

  it('re-fetches and updates the URL when the search text changes', async () => {
    mockFetchSequence({ listings: emptyResult })
    const { replace } = renderBrowser()
    await waitFor(() => expect(global.fetch).toHaveBeenCalled(), WAIT)

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'plumber' } })

    await waitFor(() => {
      const call = global.fetch.mock.calls.find(([url]) => String(url).includes('q=plumber'))
      expect(call).toBeDefined()
    }, WAIT)
    await waitFor(() => expect(replace).toHaveBeenCalledWith(expect.stringContaining('q=plumber'), { scroll: false }), WAIT)
  }, 10000)

  it('disables Prev on page 1 and advances to page 2 on Next', async () => {
    mockFetchSequence({ listings: { ...oneListingResult, totalPages: 2 } })
    renderBrowser()

    await waitFor(() => expect(screen.getByText('Page 1 of 2')).toBeInTheDocument(), WAIT)
    expect(screen.getByText('Prev').closest('button')).toBeDisabled()

    fireEvent.click(screen.getByText('Next').closest('button'))

    await waitFor(() => {
      const call = global.fetch.mock.calls.findLast(([url]) => String(url).includes('/api/yellowpages/listings'))
      expect(call[0]).toContain('page=2')
    }, WAIT)
  }, 10000)
})
