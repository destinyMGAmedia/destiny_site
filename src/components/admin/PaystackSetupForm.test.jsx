import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import PaystackSetupForm from './PaystackSetupForm'

function setupFetch(overrides = {}) {
  const fn = vi.fn((url) => {
    if (overrides[url]) return overrides[url]()
    if (url === '/api/admin/nation/paystack/banks') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ banks: [{ name: 'Guaranty Trust Bank', code: '058' }, { name: 'Wema Bank', code: '035' }] }),
      })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
  global.fetch = fn
  return fn
}

describe('PaystackSetupForm', () => {
  it('loads and lists banks from the API on mount', async () => {
    setupFetch()
    render(<PaystackSetupForm currentSettings={null} />)
    expect(await screen.findByText('Guaranty Trust Bank')).toBeInTheDocument()
    expect(screen.getByText('Wema Bank')).toBeInTheDocument()
  })

  it('shows the current settings summary when already configured', async () => {
    setupFetch()
    render(
      <PaystackSetupForm
        currentSettings={{
          accountName: 'DESTINY MISSION GLOBAL ASSEMBLY',
          bankName: 'Guaranty Trust Bank',
          accountNumber: '0123456789',
          subaccountCode: 'ACCT_church123',
        }}
      />
    )
    expect(screen.getByText('Currently configured')).toBeInTheDocument()
    expect(screen.getByText(/DESTINY MISSION GLOBAL ASSEMBLY/)).toBeInTheDocument()
    expect(screen.getByText(/ACCT_church123/)).toBeInTheDocument()
    await screen.findByText('Guaranty Trust Bank')
  })

  it('does not show the "Currently configured" panel when nothing is set up yet', async () => {
    setupFetch()
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')
    expect(screen.queryByText('Currently configured')).not.toBeInTheDocument()
  })

  it('shows the server-provided bank load error when the banks response has no banks array', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ error: 'Paystack key not configured' }),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    expect(await screen.findByText('Paystack key not configured')).toBeInTheDocument()
  })

  it('shows a generic bank load error when the banks fetch itself throws', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network down'))
    render(<PaystackSetupForm currentSettings={null} />)
    expect(await screen.findByText('Failed to load banks')).toBeInTheDocument()
  })

  it('shows an error when resolving without a bank/account number selected', async () => {
    setupFetch()
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))
    expect(await screen.findByText('Pick a bank and enter the account number first.')).toBeInTheDocument()
  })

  it('resolves the account and shows the resolved name', async () => {
    setupFetch({
      '/api/admin/nation/paystack/resolve-account': () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ accountName: 'DESTINY MISSION GLOBAL ASSEMBLY' }) }),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))

    expect(await screen.findByText(/Resolved account name: DESTINY MISSION GLOBAL ASSEMBLY/)).toBeInTheDocument()
  })

  it('shows the resolve error message when resolution fails', async () => {
    setupFetch({
      '/api/admin/nation/paystack/resolve-account': () =>
        Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Invalid account number' }) }),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))

    expect(await screen.findByText('Invalid account number')).toBeInTheDocument()
  })

  it('shows a generic resolve error when the resolve-account request itself throws', async () => {
    setupFetch({
      '/api/admin/nation/paystack/resolve-account': () => Promise.reject(new Error('network down')),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))

    expect(await screen.findByText('Could not resolve this account')).toBeInTheDocument()
  })

  it('disables the Resolve Account button and shows a waiting label while resolving', async () => {
    let resolveFetch
    setupFetch({
      '/api/admin/nation/paystack/resolve-account': () =>
        new Promise((resolve) => { resolveFetch = resolve }),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))

    expect(await screen.findByRole('button', { name: 'Resolving…' })).toBeDisabled()
    resolveFetch({ ok: true, json: () => Promise.resolve({ accountName: 'DESTINY MISSION GLOBAL ASSEMBLY' }) })
    expect(await screen.findByRole('button', { name: 'Resolve Account' })).not.toBeDisabled()
  })

  it('blocks saving until the account has been resolved', async () => {
    setupFetch()
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } })

    const saveButton = screen.getByRole('button', { name: 'Save & Create Subaccount' })
    expect(saveButton).toBeDisabled()
    fireEvent.click(saveButton)
    expect(screen.queryByText('Resolve the account first to confirm it’s correct.')).not.toBeInTheDocument()
  })

  it('saves and shows the new settings after a successful resolve + save', async () => {
    const fetchMock = setupFetch({
      '/api/admin/nation/paystack/resolve-account': () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ accountName: 'DESTINY MISSION GLOBAL ASSEMBLY' }) }),
      '/api/admin/nation/paystack/setup': () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              settings: {
                accountName: 'DESTINY MISSION GLOBAL ASSEMBLY',
                bankName: 'Guaranty Trust Bank',
                accountNumber: '0123456789',
                subaccountCode: 'ACCT_new789',
              },
            }),
        }),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))
    await screen.findByText(/Resolved account name/)

    fireEvent.click(screen.getByRole('button', { name: 'Save & Create Subaccount' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/nation/paystack/setup',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ bankCode: '058', bankName: 'Guaranty Trust Bank', accountNumber: '0123456789' }),
        })
      )
    })
    expect(await screen.findByText('Currently configured')).toBeInTheDocument()
    expect(screen.getByText(/ACCT_new789/)).toBeInTheDocument()
  })

  it('shows the save error message when saving fails', async () => {
    setupFetch({
      '/api/admin/nation/paystack/resolve-account': () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ accountName: 'DESTINY MISSION GLOBAL ASSEMBLY' }) }),
      '/api/admin/nation/paystack/setup': () =>
        Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Paystack rejected the subaccount' }) }),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))
    await screen.findByText(/Resolved account name/)

    fireEvent.click(screen.getByRole('button', { name: 'Save & Create Subaccount' }))
    expect(await screen.findByText('Paystack rejected the subaccount')).toBeInTheDocument()
  })

  it('shows a generic save error when the setup request itself throws', async () => {
    setupFetch({
      '/api/admin/nation/paystack/resolve-account': () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ accountName: 'DESTINY MISSION GLOBAL ASSEMBLY' }) }),
      '/api/admin/nation/paystack/setup': () => Promise.reject(new Error('network down')),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))
    await screen.findByText(/Resolved account name/)

    fireEvent.click(screen.getByRole('button', { name: 'Save & Create Subaccount' }))
    expect(await screen.findByText('Failed to save payment settings')).toBeInTheDocument()
  })

  it('clears the resolved name when the bank or account number is changed after resolving', async () => {
    setupFetch({
      '/api/admin/nation/paystack/resolve-account': () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ accountName: 'DESTINY MISSION GLOBAL ASSEMBLY' }) }),
    })
    render(<PaystackSetupForm currentSettings={null} />)
    await screen.findByText('Guaranty Trust Bank')

    fireEvent.change(screen.getByRole('combobox'), { target: { value: '058' } })
    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '0123456789' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolve Account' }))
    await screen.findByText(/Resolved account name/)

    fireEvent.change(screen.getByPlaceholderText('0123456789'), { target: { value: '9999999999' } })
    expect(screen.queryByText(/Resolved account name/)).not.toBeInTheDocument()
  })
})
