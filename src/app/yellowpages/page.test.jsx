import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter, usePathname } from 'next/navigation'
import YellowPagesHome from './page'
import YellowPagesChrome from '@/components/yellowpages/shared/YellowPagesChrome'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/'),
}))

const oneListing = {
  id: 'l1', name: 'Acme Travels', category: 'TOURISM_TRAVEL', description: 'We plan trips.',
  city: 'Lagos', state: null, country: 'Nigeria', ratingCount: 0, avgRating: null, logoUrl: null,
}

function renderHome() {
  return render(
    <YellowPagesChrome base="/yellowpages">
      <YellowPagesHome />
    </YellowPagesChrome>
  )
}

describe('YellowPagesHome', () => {
  const push = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useRouter.mockReturnValue({ push })
    usePathname.mockReturnValue('/')
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ listings: [] }) }))
  })

  it('renders the category grid', () => {
    renderHome()
    expect(screen.getByText('Browse by Category')).toBeInTheDocument()
  })

  it('navigates to /search with the query when the hero search form is submitted', () => {
    renderHome()
    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'plumber' } })
    fireEvent.click(screen.getByText('Search'))
    expect(push).toHaveBeenCalledWith('/yellowpages/search?q=plumber')
  })

  it('navigates to /search with no query string when the search box is empty', () => {
    renderHome()
    fireEvent.click(screen.getByText('Search'))
    expect(push).toHaveBeenCalledWith('/yellowpages/search')
  })

  it('renders recently added listings fetched from the API', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ listings: [oneListing] }) }))
    renderHome()
    await waitFor(() => expect(screen.getByText('Recently Added')).toBeInTheDocument(), { timeout: 4000 })
    expect(screen.getByText('Acme Travels')).toBeInTheDocument()
  })

  it('does not render the "Recently Added" section when there are no listings', async () => {
    renderHome()
    await waitFor(() => expect(global.fetch).toHaveBeenCalled(), { timeout: 4000 })
    expect(screen.queryByText('Recently Added')).not.toBeInTheDocument()
  })
})
