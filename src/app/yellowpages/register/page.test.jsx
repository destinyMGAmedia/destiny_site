import { render, screen, fireEvent } from '@testing-library/react'
import { useSearchParams, usePathname } from 'next/navigation'
import RegisterPage from './page'
import ListingForm from '@/components/yellowpages/ListingForm'
import YellowPagesChrome from '@/components/yellowpages/shared/YellowPagesChrome'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  usePathname: vi.fn(() => '/'),
}))
vi.mock('@/components/yellowpages/ListingForm', () => ({
  default: vi.fn(({ onSuccess }) => (
    <button onClick={() => onSuccess({ id: 'l1', name: 'Jane Doe' })}>fake-submit</button>
  )),
}))

function renderPage(query = '') {
  useSearchParams.mockReturnValue(new URLSearchParams(query))
  return render(
    <YellowPagesChrome base="/yellowpages">
      <RegisterPage />
    </YellowPagesChrome>
  )
}

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the form with prefill values parsed from the query string', () => {
    renderPage('name=Jane&phone=0801&city=Lagos')
    const props = ListingForm.mock.calls[0][0]
    expect(props.initialValues).toMatchObject({ name: 'Jane', phone: '0801', city: 'Lagos', listingType: 'INDIVIDUAL' })
  })

  it('defaults listingType to BUSINESS only when explicitly requested', () => {
    renderPage('listingType=BUSINESS')
    const props = ListingForm.mock.calls[0][0]
    expect(props.initialValues.listingType).toBe('BUSINESS')
  })

  it('shows the success screen with a link to the new listing after submission', () => {
    renderPage()
    fireEvent.click(screen.getByText('fake-submit'))
    expect(screen.getByText('You’re Listed!')).toBeInTheDocument()
    expect(screen.getByText('View Your Listing')).toHaveAttribute('href', '/yellowpages/listing/l1')
  })
})
