import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import FoundingPartnerCTA from './FoundingPartnerCTA'
import { LADDER_TIERS, FOUNDERS_CIRCLE_TIERS } from '@/lib/nation/tiers'

const bankDetails = {
  accountName: 'Destiny Mission Global Assembly',
  bankName: 'First Bank',
  accountNumber: '1234567890',
}

const defaultCount = { count: 42, remaining: 58 }

// Builds a fetch mock keyed by URL. Falls back to a default partner-count response
// so the component's mount-time useEffect fetch never crashes the test.
function setupFetch(overrides = {}) {
  const fn = vi.fn((url) => {
    if (overrides[url]) return overrides[url]()
    if (url === '/api/nation/partner-count') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(defaultCount) })
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
  global.fetch = fn
  return fn
}

function selectLadderPackage() {
  fireEvent.click(screen.getByRole('button', { name: /Give to a Gate/i }))
}

function selectFoundersPackage() {
  fireEvent.click(screen.getByRole('button', { name: /Join the Founders' Circle/i }))
}

function fillDonor(container = screen) {
  fireEvent.change(container.getByPlaceholderText('Full name'), { target: { value: 'Ada Okoye' } })
  fireEvent.change(container.getByPlaceholderText('Email'), { target: { value: 'ada@example.com' } })
}

// Renders and waits for the mount-time partner-count fetch to settle, so subsequent
// synchronous interactions in a test don't race that effect's state update (which would
// otherwise trigger an "update not wrapped in act(...)" warning at an unpredictable point).
async function renderAndSettle() {
  const utils = render(<FoundingPartnerCTA bankDetails={bankDetails} />)
  await waitFor(() => expect(global.fetch).toHaveBeenCalled())
  return utils
}

describe('FoundingPartnerCTA', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' },
    })
  })

  it('fetches and displays the founding partner count on mount', async () => {
    setupFetch()
    render(<FoundingPartnerCTA bankDetails={bankDetails} />)
    expect(
      await screen.findByText('42 of the first 100 Founding Gatekeepers so far — 58 spots left')
    ).toBeInTheDocument()
  })

  it('renders both giving package options', async () => {
    setupFetch()
    await renderAndSettle()
    expect(screen.getByRole('heading', { name: 'Become a Founding Gatekeeper' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Give to a Gate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Join the Founders' Circle/i })).toBeInTheDocument()
    expect(screen.getByText(/Project-tied giving/)).toBeInTheDocument()
    expect(screen.getByText(/Endowment-level giving/)).toBeInTheDocument()
  })

  it('shows all LADDER_TIERS after selecting the "Give to a Gate" package', async () => {
    setupFetch()
    await renderAndSettle()
    selectLadderPackage()
    LADDER_TIERS.forEach((t) => {
      expect(screen.getByRole('button', { name: new RegExp(t.name) })).toBeInTheDocument()
    })
  })

  it('shows all FOUNDERS_CIRCLE_TIERS after selecting the Founders\' Circle package', async () => {
    setupFetch()
    await renderAndSettle()
    selectFoundersPackage()
    FOUNDERS_CIRCLE_TIERS.forEach((t) => {
      expect(screen.getByRole('button', { name: new RegExp(t.name) })).toBeInTheDocument()
    })
  })

  it('reveals the giving form with the tier name and amount after picking a tier', async () => {
    setupFetch()
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))

    expect(screen.getByText('Gatekeeper Friend — NGN 30,000')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Give Now' })).toBeInTheDocument()
  })

  it('shows "Register Interest" (not "Give Now") for a pledge-tier selection', async () => {
    setupFetch()
    await renderAndSettle()
    selectLadderPackage()
    // NATION_BUILDER (50,000,000) is above the pledge cutoff.
    fireEvent.click(screen.getByRole('button', { name: /Nation Builder/i }))

    expect(screen.getByRole('button', { name: 'Register Interest' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Give Now' })).not.toBeInTheDocument()
  })

  it('shows the returned dedicated virtual account details on a successful non-pledge submission', async () => {
    setupFetch({
      '/api/nation/give/paystack/initialize': () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              pledge: false,
              reference: 'DN-PSK-1',
              bank: 'Wema Bank',
              accountNumber: '9999999999',
              accountName: 'DESTINY NATION',
              amount: 30000,
            }),
        }),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fillDonor()
    fireEvent.click(screen.getByRole('button', { name: 'Give Now' }))

    expect(await screen.findByText('Complete Your Gift')).toBeInTheDocument()
    expect(screen.getByText('DESTINY NATION')).toBeInTheDocument()
    expect(screen.getByText('Wema Bank')).toBeInTheDocument()
    expect(screen.getByText('9999999999')).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/nation/give/paystack/initialize',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          package: 'LADDER',
          tier: 'GATEKEEPER_FRIEND',
          donorName: 'Ada Okoye',
          donorEmail: 'ada@example.com',
          donorPhone: '',
          donorCountry: '',
          donorOrg: '',
        }),
      })
    )
    expect(screen.queryByText('Thank you')).not.toBeInTheDocument()
    // The giving form itself is replaced by the DVA reveal, not left visible alongside it.
    expect(screen.queryByRole('button', { name: 'Give Now' })).not.toBeInTheDocument()
  })

  it('shows the pledge thank-you message and does not request a DVA for a pledge submission', async () => {
    setupFetch({
      '/api/nation/give/paystack/initialize': () =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ pledge: true }) }),
    })
    await renderAndSettle()
    selectLadderPackage()
    // LEGACY_FOUNDER (100,000,000) is a pledge tier.
    fireEvent.click(screen.getByRole('button', { name: /Legacy Founder/i }))
    fillDonor()
    fireEvent.click(screen.getByRole('button', { name: 'Register Interest' }))

    expect(await screen.findByText('Thank you')).toBeInTheDocument()
    expect(
      screen.getByText('Your interest has been registered. A member of our team will reach out to you shortly.')
    ).toBeInTheDocument()
    expect(screen.queryByText('Complete Your Gift')).not.toBeInTheDocument()
  })

  it('shows the server-provided error message when the initialize request is not ok', async () => {
    setupFetch({
      '/api/nation/give/paystack/initialize': () =>
        Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Payment provider unavailable' }) }),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fillDonor()
    fireEvent.click(screen.getByRole('button', { name: 'Give Now' }))

    expect(await screen.findByText('Payment provider unavailable')).toBeInTheDocument()
  })

  it('shows a generic error message when the initialize request throws', async () => {
    setupFetch({
      '/api/nation/give/paystack/initialize': () => Promise.reject(new Error('network down')),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fillDonor()
    fireEvent.click(screen.getByRole('button', { name: 'Give Now' }))

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('toggles the bank-transfer panel and displays the provided bank details', async () => {
    setupFetch()
    await renderAndSettle()
    expect(screen.queryByText('Give by Bank Transfer')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Prefer a direct bank transfer?'))
    expect(screen.getByText('Give by Bank Transfer')).toBeInTheDocument()
    expect(screen.getByText(bankDetails.accountName)).toBeInTheDocument()
    expect(screen.getByText(bankDetails.bankName)).toBeInTheDocument()
    expect(screen.getByText(bankDetails.accountNumber)).toBeInTheDocument()

    fireEvent.click(screen.getByText('Prefer a direct bank transfer?'))
    expect(screen.queryByText('Give by Bank Transfer')).not.toBeInTheDocument()
  })

  it('prompts to pick a package/tier first if the bank-transfer panel is opened before one is selected', async () => {
    setupFetch()
    await renderAndSettle()
    fireEvent.click(screen.getByText('Prefer a direct bank transfer?'))
    expect(
      screen.getByText('Pick a package and tier above first, then confirm your transfer here.')
    ).toBeInTheDocument()
  })

  it('submits the manual bank-transfer confirmation form once a package/tier is selected', async () => {
    const fetchMock = setupFetch({
      '/api/nation/give/manual': () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fireEvent.click(screen.getByText('Prefer a direct bank transfer?'))

    const panel = screen.getByText('Give by Bank Transfer').closest('div')
    fillDonor(within(panel))
    fireEvent.click(within(panel).getByRole('button', { name: /Confirm/ }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/nation/give/manual',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            package: 'LADDER',
            tier: 'GATEKEEPER_FRIEND',
            donorName: 'Ada Okoye',
            donorEmail: 'ada@example.com',
            donorPhone: '',
          }),
        })
      )
    })
    expect(
      await screen.findByText("Thank you — we'll reconcile your gift and follow up by email.".replace("'", '’'))
    ).toBeInTheDocument()
  })

  it('shows a manual-form error message when the manual confirmation request is not ok', async () => {
    setupFetch({
      '/api/nation/give/manual': () =>
        Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Could not record your gift' }) }),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fireEvent.click(screen.getByText('Prefer a direct bank transfer?'))

    const panel = screen.getByText('Give by Bank Transfer').closest('div')
    fillDonor(within(panel))
    fireEvent.click(within(panel).getByRole('button', { name: /Confirm/ }))

    expect(await screen.findByText('Could not record your gift')).toBeInTheDocument()
  })

  it('shows a generic error message when the manual confirmation request throws', async () => {
    setupFetch({
      '/api/nation/give/manual': () => Promise.reject(new Error('network down')),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fireEvent.click(screen.getByText('Prefer a direct bank transfer?'))

    const panel = screen.getByText('Give by Bank Transfer').closest('div')
    fillDonor(within(panel))
    fireEvent.click(within(panel).getByRole('button', { name: /Confirm/ }))

    expect(await screen.findByText('Something went wrong. Please try again.')).toBeInTheDocument()
  })

  it('does not display the count line when the partner-count fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('down')))
    render(<FoundingPartnerCTA bankDetails={bankDetails} />)
    await waitFor(() => expect(global.fetch).toHaveBeenCalled())
    expect(screen.queryByText(/Founding Gatekeepers so far/)).not.toBeInTheDocument()
  })

  it('does not display the count line while the partner-count fetch is pending', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    render(<FoundingPartnerCTA bankDetails={bankDetails} />)
    expect(screen.queryByText(/Founding Gatekeepers so far/)).not.toBeInTheDocument()
  })

  it('resets the selected tier and any error when switching packages', async () => {
    setupFetch()
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    expect(screen.getByText('Gatekeeper Friend — NGN 30,000')).toBeInTheDocument()

    selectFoundersPackage()
    expect(screen.queryByText('Gatekeeper Friend — NGN 30,000')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('Full name')).not.toBeInTheDocument()
  })

  it('marks the Founders\' Circle tiers and Legacy Founder as open-ended ("+")', async () => {
    setupFetch()
    await renderAndSettle()
    selectFoundersPackage()
    expect(screen.getByRole('button', { name: /Bronze/ }).textContent).toMatch(/\+$/)

    selectLadderPackage()
    expect(screen.getByRole('button', { name: /Legacy Founder/ }).textContent).toMatch(/\+$/)
    expect(screen.getByRole('button', { name: /Gatekeeper Friend/ }).textContent).not.toMatch(/\+$/)
  })

  it('always shows "Register Interest" for every Founders\' Circle tier', async () => {
    setupFetch()
    await renderAndSettle()
    selectFoundersPackage()
    fireEvent.click(screen.getByRole('button', { name: /Diamond/i }))
    expect(screen.getByRole('button', { name: 'Register Interest' })).toBeInTheDocument()
  })

  it('includes optional donor fields (phone, country, org) in the initialize submission', async () => {
    const fetchMock = setupFetch({
      '/api/nation/give/paystack/initialize': () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              pledge: false,
              reference: 'DN-PSK-2',
              bank: 'Wema Bank',
              accountNumber: '9999999999',
              accountName: 'DESTINY NATION',
              amount: 30000,
            }),
        }),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fillDonor()
    fireEvent.change(screen.getByPlaceholderText('Phone (optional)'), { target: { value: '+1234567890' } })
    fireEvent.change(screen.getByPlaceholderText('Country (optional)'), { target: { value: 'Nigeria' } })
    fireEvent.change(screen.getByPlaceholderText('Organization (optional)'), { target: { value: 'Acme Inc' } })
    fireEvent.click(screen.getByRole('button', { name: 'Give Now' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/nation/give/paystack/initialize',
        expect.objectContaining({
          body: JSON.stringify({
            package: 'LADDER',
            tier: 'GATEKEEPER_FRIEND',
            donorName: 'Ada Okoye',
            donorEmail: 'ada@example.com',
            donorPhone: '+1234567890',
            donorCountry: 'Nigeria',
            donorOrg: 'Acme Inc',
          }),
        })
      )
    })
  })

  it('disables the submit button and shows a waiting label while the initialize request is in flight', async () => {
    let resolveFetch
    setupFetch({
      '/api/nation/give/paystack/initialize': () =>
        new Promise((resolve) => { resolveFetch = resolve }),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fillDonor()
    fireEvent.click(screen.getByRole('button', { name: 'Give Now' }))

    const pendingButton = await screen.findByRole('button', { name: 'Please wait…' })
    expect(pendingButton).toBeDisabled()

    resolveFetch({
      ok: true,
      json: () =>
        Promise.resolve({
          pledge: false,
          reference: 'DN-PSK-3',
          bank: 'Wema Bank',
          accountNumber: '9999999999',
          accountName: 'DESTINY NATION',
          amount: 30000,
        }),
    })
    await screen.findByText('Complete Your Gift')
  })

  it('disables the manual confirm button and shows a waiting label while the manual request is in flight', async () => {
    let resolveFetch
    setupFetch({
      '/api/nation/give/manual': () => new Promise((resolve) => { resolveFetch = resolve }),
    })
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))
    fireEvent.click(screen.getByText('Prefer a direct bank transfer?'))

    const panel = screen.getByText('Give by Bank Transfer').closest('div')
    fillDonor(within(panel))
    fireEvent.click(within(panel).getByRole('button', { name: /Confirm/ }))

    const pendingButton = await within(panel).findByRole('button', { name: 'Please wait…' })
    expect(pendingButton).toBeDisabled()

    resolveFetch({ ok: true, json: () => Promise.resolve({}) })
    await screen.findByText("Thank you — we'll reconcile your gift and follow up by email.".replace("'", '’'))
  })

  it('does not submit the form when required fields (name/email) are left empty', async () => {
    setupFetch()
    await renderAndSettle()
    selectLadderPackage()
    fireEvent.click(screen.getByRole('button', { name: /Gatekeeper Friend/i }))

    const submitButton = screen.getByRole('button', { name: 'Give Now' })
    fireEvent.click(submitButton)

    expect(global.fetch).not.toHaveBeenCalledWith('/api/nation/give/paystack/initialize', expect.anything())
  })
})
