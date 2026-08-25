import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import ManagePage from './page'
import YellowPagesChrome from '@/components/yellowpages/shared/YellowPagesChrome'

// ManagePage renders inside YellowPagesChrome, which also renders Nav — Nav needs these too.
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/yellowpages/manage'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))
vi.mock('@/components/yellowpages/ListingForm', () => ({
  default: ({ onSuccess, mode, listingId, ownerContact }) => (
    <div data-testid="listing-form" data-mode={mode} data-listing-id={listingId} data-owner-contact={JSON.stringify(ownerContact)}>
      <button onClick={() => onSuccess({ id: listingId })}>fake-save</button>
    </div>
  ),
}))

const listing = {
  id: 'l1', name: 'Acme Travels', category: 'TOURISM_TRAVEL', isActive: true,
  listingType: 'BUSINESS', phone: '08012345678', description: 'desc', socialLinks: {},
}

function renderManage() {
  return render(
    <YellowPagesChrome base="/yellowpages">
      <ManagePage />
    </YellowPagesChrome>
  )
}

describe('ManagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('shows a validation error when neither phone nor email is entered', async () => {
    renderManage()
    fireEvent.click(screen.getByText('Find My Listing'))
    expect(await screen.findByText('Please enter your phone number or email.')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows "no listing found" when the lookup returns nothing', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ listings: [] }) })
    renderManage()
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '08012345678' } })
    fireEvent.click(screen.getByText('Find My Listing'))

    expect(await screen.findByText('No listing found with that phone number or email.')).toBeInTheDocument()
  })

  it('lists matching listings, then opens ListingForm in edit mode with the owner contact carried through', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ listings: [listing] }) })
    renderManage()
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '08012345678' } })
    fireEvent.click(screen.getByText('Find My Listing'))

    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Acme Travels'))

    const form = screen.getByTestId('listing-form')
    expect(form).toHaveAttribute('data-mode', 'edit')
    expect(form).toHaveAttribute('data-listing-id', 'l1')
    expect(JSON.parse(form.getAttribute('data-owner-contact'))).toEqual({ phone: '08012345678' })
  })

  it('shows the saved confirmation after ListingForm calls onSuccess', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ listings: [listing] }) })
    renderManage()
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Find My Listing'))
    await waitFor(() => screen.getByText('Acme Travels'))
    fireEvent.click(screen.getByText('Acme Travels'))

    fireEvent.click(screen.getByText('fake-save'))

    expect(screen.getByText('Changes Saved')).toBeInTheDocument()
    expect(screen.getByText('View Your Listing')).toHaveAttribute('href', '/yellowpages/listing/l1')
  })
})
