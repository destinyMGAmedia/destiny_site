import { render, screen, fireEvent } from '@testing-library/react'
import { useSearchParams, usePathname } from 'next/navigation'
import RegisterPage from './page'
import ListingForm from '@/components/yellowpages/ListingForm'
import YellowPagesChrome from '@/components/yellowpages/shared/YellowPagesChrome'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  usePathname: vi.fn(() => '/'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
}))
vi.mock('@/components/yellowpages/ListingForm', () => ({
  default: vi.fn(({ onSuccess }) => (
    <button onClick={() => onSuccess({ id: 'l1', name: 'Jane Doe', phone: '08012345678' })}>fake-submit</button>
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
    expect(props.mode).toBeUndefined() // create mode is the default
  })

  it('defaults listingType to BUSINESS only when explicitly requested', () => {
    renderPage('listingType=BUSINESS')
    const props = ListingForm.mock.calls[0][0]
    expect(props.initialValues.listingType).toBe('BUSINESS')
  })

  it('shows the success screen with a completeness teaser and both next-step CTAs', () => {
    renderPage()
    fireEvent.click(screen.getByText('fake-submit'))

    expect(screen.getByText('You’re Listed!')).toBeInTheDocument()
    expect(screen.getByText(/Your profile is 0% complete/)).toBeInTheDocument()
    expect(screen.getByText('Complete My Profile')).toBeInTheDocument()
    expect(screen.getByText('Skip for Now, View My Listing')).toHaveAttribute('href', '/yellowpages/listing/l1')
  })

  it('switches to an edit-mode ListingForm, carrying the owner contact, when "Complete My Profile" is clicked', () => {
    renderPage()
    fireEvent.click(screen.getByText('fake-submit'))
    fireEvent.click(screen.getByText('Complete My Profile'))

    expect(screen.getByText('Complete Your Profile')).toBeInTheDocument()
    const editProps = ListingForm.mock.calls[ListingForm.mock.calls.length - 1][0]
    expect(editProps.mode).toBe('edit')
    expect(editProps.listingId).toBe('l1')
    expect(editProps.ownerContact).toEqual({ phone: '08012345678', email: undefined })
  })

  it('shows a saved confirmation after completing the profile', () => {
    renderPage()
    fireEvent.click(screen.getByText('fake-submit'))
    fireEvent.click(screen.getByText('Complete My Profile'))
    fireEvent.click(screen.getByText('fake-submit'))

    expect(screen.getByText('Profile Updated')).toBeInTheDocument()
    expect(screen.getByText('View Your Listing')).toHaveAttribute('href', '/yellowpages/listing/l1')
  })

  it('applies mobile-friendly spacing to the intro screen', () => {
    renderPage()
    const wrapper = screen.getByRole('heading', { name: 'List Your Skill or Business' }).parentElement
    expect(wrapper).toHaveClass('px-4')
    expect(wrapper).toHaveClass('py-6')
    expect(wrapper).toHaveClass('sm:py-10')
  })

  it('applies mobile-friendly spacing to the success screen', () => {
    renderPage()
    fireEvent.click(screen.getByText('fake-submit'))
    const wrapper = screen.getByText('You’re Listed!').parentElement
    expect(wrapper).toHaveClass('px-4')
    expect(wrapper).toHaveClass('py-10')
    expect(wrapper).toHaveClass('sm:py-16')
  })
})
