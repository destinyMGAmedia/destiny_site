import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import ManagePage from './page'
import YellowPagesChrome from '@/components/yellowpages/shared/YellowPagesChrome'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/yellowpages/manage'),
  useRouter: vi.fn(() => ({ replace: vi.fn() })),
  useSearchParams: vi.fn(() => new URLSearchParams('listingId=l1')),
}))
vi.mock('@/components/yellowpages/ListingForm', () => ({
  default: ({ onSuccess, mode, listingId, editToken }) => (
    <div data-testid="listing-form" data-mode={mode} data-listing-id={listingId} data-edit-token={editToken ?? ''}>
      <button onClick={() => onSuccess({ id: listingId })}>fake-save</button>
    </div>
  ),
}))

const listing = {
  id: 'l1', name: 'Acme Travels', category: 'TOURISM_TRAVEL', isActive: true,
  listingType: 'BUSINESS', phone: '08012345678', email: 'jane@acme.com', description: 'desc', socialLinks: {},
}

function mockFlow({ listingGet = listing, editOtp, verify, editable = listing } = {}) {
  global.fetch = vi.fn((url) => {
    const u = String(url)
    if (u.endsWith('/edit-otp')) return Promise.resolve({ ok: true, json: () => Promise.resolve(editOtp || { sent: true, channel: 'EMAIL', maskedTo: 'j•••@acme.com' }) })
    if (u.includes('/edit-otp/verify')) return Promise.resolve({ ok: true, json: () => Promise.resolve(verify || { editToken: 'tok-123' }) })
    if (u.includes('/editable')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: editable }) })
    if (u.match(/\/listings\/[^/]+$/)) return Promise.resolve({ ok: Boolean(listingGet), json: () => Promise.resolve({ listing: listingGet }) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
}

const renderManage = () =>
  render(
    <YellowPagesChrome base="/yellowpages">
      <ManagePage />
    </YellowPagesChrome>
  )

describe('ManagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchParams.mockReturnValue(new URLSearchParams('listingId=l1'))
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }))
    try { window.localStorage.clear() } catch { /* ignore */ }
  })

  it('directs the user to the portfolio Edit button when there is no listingId', async () => {
    useSearchParams.mockReturnValue(new URLSearchParams())
    renderManage()
    expect(screen.getByText(/Open your portfolio to edit it/)).toBeInTheDocument()
    expect(screen.queryByLabelText('Email on the listing')).not.toBeInTheDocument()
  })

  it('verifies by email OTP, then opens the edit form with the editToken', async () => {
    mockFlow()
    renderManage()

    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    // no phone option anywhere
    expect(screen.queryByText(/Phone/)).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))

    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '654321' } })

    const form = await screen.findByTestId('listing-form')
    expect(form).toHaveAttribute('data-mode', 'edit')
    expect(form).toHaveAttribute('data-listing-id', 'l1')
    expect(form).toHaveAttribute('data-edit-token', 'tok-123')
  })

  it('surfaces an error when the code request is rejected', async () => {
    mockFlow({ editOtp: { error: "That email address isn't on file for this listing." } })
    global.fetch = vi.fn((url) => {
      const u = String(url)
      if (u.endsWith('/edit-otp')) return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: "That email address isn't on file for this listing." }) })
      if (u.match(/\/listings\/[^/]+$/)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'nope@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))
    expect(await screen.findByText("That email address isn't on file for this listing.")).toBeInTheDocument()
  })

  it('shows the saved confirmation after ListingForm calls onSuccess', async () => {
    mockFlow()
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '654321' } })

    fireEvent.click(await screen.findByText('fake-save'))

    expect(screen.getByText('Changes Saved')).toBeInTheDocument()
    expect(screen.getByText('View Your Listing')).toHaveAttribute('href', '/yellowpages/listing/l1')
  })

  it('marks the listing as edited-in-this-browser (localStorage) once a save succeeds', async () => {
    mockFlow()
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '654321' } })

    expect(window.localStorage.getItem('yp:edited:l1')).toBeNull()
    fireEvent.click(await screen.findByText('fake-save'))
    expect(window.localStorage.getItem('yp:edited:l1')).toBe('1')
  })

  it('passes the OTP-issued editToken through to the edit-mode ListingForm', async () => {
    mockFlow({ verify: { editToken: 'tok-abc-999' } })
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '654321' } })

    const form = await screen.findByTestId('listing-form')
    expect(form).toHaveAttribute('data-edit-token', 'tok-abc-999')
    expect(form).toHaveAttribute('data-mode', 'edit')
  })

  it('shows a not-found message when the listing GET fails', async () => {
    mockFlow({ listingGet: null })
    renderManage()
    expect(await screen.findByText('Portfolio not found')).toBeInTheDocument()
  })

  it('validates the email field client-side before hitting the API', async () => {
    mockFlow()
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    global.fetch.mockClear()

    fireEvent.click(screen.getByText('Send code'))

    expect(await screen.findByText('Enter the email address on file for this listing.')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalledWith(
      expect.stringContaining('/edit-otp'),
      expect.anything(),
    )
  })

  it('clears the inline error as soon as the user edits the email field', async () => {
    mockFlow()
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Send code'))
    expect(await screen.findByText('Enter the email address on file for this listing.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'j' } })
    expect(screen.queryByText('Enter the email address on file for this listing.')).not.toBeInTheDocument()
  })

  it('surfaces the server error and stays on the verify step when /editable rejects the token', async () => {
    global.fetch = vi.fn((url) => {
      const u = String(url)
      if (u.endsWith('/edit-otp')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ sent: true, channel: 'EMAIL', maskedTo: 'j•••@acme.com' }) })
      if (u.includes('/edit-otp/verify')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ editToken: 'tok-123' }) })
      if (u.includes('/editable')) return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'This edit link has expired.' }) })
      if (u.match(/\/listings\/[^/]+$/)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '654321' } })

    expect(await screen.findByText('This edit link has expired.')).toBeInTheDocument()
    expect(screen.queryByTestId('listing-form')).not.toBeInTheDocument()
  })

  it('keeps the OTP modal open and shows its error when the code is wrong', async () => {
    global.fetch = vi.fn((url) => {
      const u = String(url)
      if (u.endsWith('/edit-otp')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ sent: true, channel: 'EMAIL', maskedTo: 'j•••@acme.com' }) })
      if (u.includes('/edit-otp/verify')) return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'That code did not work.' }) })
      if (u.match(/\/listings\/[^/]+$/)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '000000' } })

    expect(await screen.findByText('That code did not work.')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('re-requests a code from the OTP modal, refreshing the masked target', async () => {
    let sendCalls = 0
    global.fetch = vi.fn((url) => {
      const u = String(url)
      if (u.endsWith('/edit-otp')) {
        sendCalls += 1
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ sent: true, channel: 'EMAIL', maskedTo: `j•••@acme.com#${sendCalls}` }) })
      }
      if (u.match(/\/listings\/[^/]+$/)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))

    await screen.findByRole('dialog')
    fireEvent.click(screen.getByText('Resend code'))

    expect(await screen.findByText('A new code is on its way.')).toBeInTheDocument()
    expect(sendCalls).toBe(2)
  })

  it('shows a network error when the code request throws', async () => {
    global.fetch = vi.fn((url) => {
      const u = String(url)
      if (u.endsWith('/edit-otp')) return Promise.reject(new Error('offline'))
      if (u.match(/\/listings\/[^/]+$/)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    renderManage()
    await waitFor(() => expect(screen.getByText('Acme Travels')).toBeInTheDocument())
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'jane@acme.com' } })
    fireEvent.click(screen.getByText('Send code'))

    expect(await screen.findByText('We could not send a code. Please try again.')).toBeInTheDocument()
  })

  it('falls back to "your listing" when the listing GET succeeds without a name', async () => {
    mockFlow({ listingGet: { id: 'l1' } })
    renderManage()
    await waitFor(() =>
      expect(screen.getByText((_, el) => el?.tagName === 'P' && /To edit/.test(el.textContent))).toHaveTextContent(
        'To edit your listing',
      ),
    )
  })
})
