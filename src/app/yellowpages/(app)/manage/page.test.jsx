import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ManagePage from './page'
import YellowPagesChrome from '@/components/yellowpages/shared/YellowPagesChrome'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/yellowpages/manage'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}))
vi.mock('@/components/yellowpages/ListingForm', () => ({
  default: ({ onSuccess, mode, listingId, ownerContact, editToken }) => (
    <div
      data-testid="listing-form"
      data-mode={mode}
      data-listing-id={listingId}
      data-owner-contact={JSON.stringify(ownerContact ?? null)}
      data-edit-token={editToken ?? ''}
    >
      <button onClick={() => onSuccess({ id: listingId })}>fake-save</button>
    </div>
  ),
}))

const listing = {
  id: 'l1', name: 'Acme Travels', category: 'TOURISM_TRAVEL', isActive: true,
  listingType: 'BUSINESS', phone: '08012345678', email: 'jane@acme.com', description: 'desc', socialLinks: {},
}

// URL-aware fetch mock for the multi-step verify flow.
function mockFlow({ lookup = [listing], editOtp, verify, editable = listing } = {}) {
  global.fetch = vi.fn((url) => {
    const u = String(url)
    if (u.includes('/lookup')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listings: lookup }) })
    if (u.endsWith('/edit-otp')) return Promise.resolve({ ok: true, json: () => Promise.resolve(editOtp || { sent: true, channel: 'EMAIL', maskedTo: 'j•••@acme.com' }) })
    if (u.includes('/edit-otp/verify')) return Promise.resolve({ ok: true, json: () => Promise.resolve(verify || { editToken: 'tok-123' }) })
    if (u.includes('/editable')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: editable }) })
    if (u.match(/\/listings\/[^/]+$/)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: editable }) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
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
    try { window.localStorage.clear() } catch { /* ignore */ }
  })

  it('shows a validation error when neither phone nor email is entered', async () => {
    renderManage()
    fireEvent.click(screen.getByText('Find My Listing'))
    expect(await screen.findByText('Please enter your phone number or email.')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows "no listing found" when the lookup returns nothing', async () => {
    mockFlow({ lookup: [] })
    renderManage()
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '08012345678' } })
    fireEvent.click(screen.getByText('Find My Listing'))
    expect(await screen.findByText('No listing found with that phone number or email.')).toBeInTheDocument()
  })

  it('requires OTP verification before opening the edit form (email channel)', async () => {
    mockFlow()
    renderManage()
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Find My Listing'))

    // LIST step
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Acme Travels'))

    // VERIFY step — not the form yet
    expect(await screen.findByText(/Verify it.s you/)).toBeInTheDocument()
    expect(screen.queryByTestId('listing-form')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Send code'))

    // OTP modal
    const codeInput = await screen.findByLabelText('Verification code')
    fireEvent.change(codeInput, { target: { value: '654321' } })
    fireEvent.click(screen.getByText('Verify'))

    // EDIT step with the editToken carried through
    const form = await screen.findByTestId('listing-form')
    expect(form).toHaveAttribute('data-mode', 'edit')
    expect(form).toHaveAttribute('data-listing-id', 'l1')
    expect(form).toHaveAttribute('data-edit-token', 'tok-123')
  })

  it('falls back to phone-number confirmation when SMS is unavailable', async () => {
    mockFlow({ editOtp: { sent: false, fallback: 'PHONE_MATCH', channel: 'SMS' } })
    renderManage()
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '08012345678' } })
    fireEvent.click(screen.getByText('Find My Listing'))

    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Acme Travels'))

    // channel pre-selected as PHONE from the lookup; submit
    fireEvent.click(await screen.findByText('Continue'))

    const phoneInput = await screen.findByLabelText('Phone number on the listing')
    fireEvent.change(phoneInput, { target: { value: '08012345678' } })
    fireEvent.click(screen.getByText('Continue'))

    const form = await screen.findByTestId('listing-form')
    expect(JSON.parse(form.getAttribute('data-owner-contact'))).toEqual({ phone: '08012345678' })
  })

  it('shows the saved confirmation after ListingForm calls onSuccess', async () => {
    mockFlow()
    renderManage()
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Find My Listing'))
    await waitFor(() => screen.getByText('Acme Travels'))
    fireEvent.click(screen.getByText('Acme Travels'))
    fireEvent.click(await screen.findByText('Send code'))
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '654321' } })
    fireEvent.click(screen.getByText('Verify'))

    fireEvent.click(await screen.findByText('fake-save'))

    expect(screen.getByText('Changes Saved')).toBeInTheDocument()
    expect(screen.getByText('View Your Listing')).toHaveAttribute('href', '/yellowpages/listing/l1')
  })

  it('truncates a long listing name and keeps the edit icon from shrinking in the list step', async () => {
    const longListing = { ...listing, name: 'Extremely Long Business Name That Should Not Wrap The Row Layout Ltd' }
    mockFlow({ lookup: [longListing] })
    renderManage()
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '08012345678' } })
    fireEvent.click(screen.getByText('Find My Listing'))

    const nameEl = await screen.findByText(longListing.name)
    expect(nameEl).toHaveClass('truncate')
    expect(nameEl.parentElement).toHaveClass('min-w-0')
    expect(nameEl.closest('button').querySelector('svg')).toHaveClass('shrink-0')
  })
})
