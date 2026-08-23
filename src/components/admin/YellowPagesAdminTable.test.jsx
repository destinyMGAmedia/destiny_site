import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import YellowPagesAdminTable from './YellowPagesAdminTable'

const WAIT = { timeout: 4000 }

const listing = {
  id: 'l1', name: 'Acme Travels', category: 'TOURISM_TRAVEL', phone: '08012345678',
  email: 'jane@acme.com', city: 'Lagos', country: 'Nigeria', isActive: true,
  avgRating: 4.5, ratingCount: 2,
}

function mockListFetch(listings = [listing], total = listings.length) {
  global.fetch = vi.fn((url, options) => {
    if (!options && String(url).includes('/api/admin/yellowpages/listings')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ listings, total, page: 1, totalPages: 1 }) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
}

describe('YellowPagesAdminTable', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads and renders listings with an Active badge', async () => {
    mockListFetch()
    render(<YellowPagesAdminTable />)

    expect(screen.getByText('Loading…')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), WAIT)
    expect(screen.getByText('Active', { selector: 'span' })).toBeInTheDocument()
  }, 10000)

  it('shows an Inactive badge for a deactivated listing', async () => {
    mockListFetch([{ ...listing, isActive: false }])
    render(<YellowPagesAdminTable />)
    await waitFor(() => expect(screen.getByText('Inactive', { selector: 'span' })).toBeInTheDocument(), WAIT)
  }, 10000)

  it('shows the empty state when no listings match', async () => {
    mockListFetch([], 0)
    render(<YellowPagesAdminTable />)
    await waitFor(() => expect(screen.getByText('No listings match these filters.')).toBeInTheDocument(), WAIT)
  }, 10000)

  it('deactivates a listing via PATCH and flips the badge without a full reload', async () => {
    mockListFetch()
    render(<YellowPagesAdminTable />)
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), WAIT)

    global.fetch.mockImplementationOnce((url, options) => {
      expect(url).toBe('/api/yellowpages/listings/l1')
      expect(JSON.parse(options.body)).toEqual({ isActive: false })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: { ...listing, isActive: false } }) })
    })

    fireEvent.click(screen.getByText('Deactivate'))

    await waitFor(() => expect(screen.getByText('Inactive', { selector: 'span' })).toBeInTheDocument(), WAIT)
    expect(screen.getByText('Activate')).toBeInTheDocument()
  }, 10000)

  it('requires a confirm click before deleting, then removes the row', async () => {
    mockListFetch()
    render(<YellowPagesAdminTable />)
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), WAIT)

    fireEvent.click(screen.getByText('Delete'))
    expect(screen.getByText('Confirm')).toBeInTheDocument()

    global.fetch.mockImplementationOnce((url, options) => {
      expect(url).toBe('/api/yellowpages/listings/l1')
      expect(options.method).toBe('DELETE')
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) })
    })

    fireEvent.click(screen.getByText('Confirm'))

    await waitFor(() => expect(screen.queryByText('Acme Travels')).not.toBeInTheDocument(), WAIT)
  }, 10000)

  it('cancels a pending delete without removing the row', async () => {
    mockListFetch()
    render(<YellowPagesAdminTable />)
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), WAIT)

    fireEvent.click(screen.getByText('Delete'))
    fireEvent.click(screen.getByText('Cancel'))

    expect(screen.getByText('Acme Travels')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  }, 10000)

  it('re-fetches with a status=inactive filter when that status is selected', async () => {
    mockListFetch()
    render(<YellowPagesAdminTable />)
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument(), WAIT)

    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'inactive' } })

    await waitFor(() => {
      const call = global.fetch.mock.calls.findLast(([url]) => String(url).includes('/api/admin/yellowpages/listings'))
      expect(call[0]).toContain('status=inactive')
    }, WAIT)
  }, 10000)
})
