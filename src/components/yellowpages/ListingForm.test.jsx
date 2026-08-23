import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ListingForm from './ListingForm'

function mockFetch({ assemblies = [], postResponse } = {}) {
  global.fetch = vi.fn((url, options) => {
    if (String(url).includes('/api/assemblies')) {
      return Promise.resolve({ json: () => Promise.resolve(assemblies) })
    }
    if (options?.method === 'POST') {
      return Promise.resolve(postResponse)
    }
    return Promise.resolve({ json: () => Promise.resolve({}) })
  })
}

const validFieldsFor = (isBusiness) => {
  fireEvent.change(screen.getByLabelText(isBusiness ? 'Business/Organization Name *' : 'Your Name *'), { target: { value: 'Jane Doe' } })
  if (isBusiness) {
    fireEvent.change(screen.getByLabelText('Contact Person *'), { target: { value: 'Jane Doe' } })
  }
  fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
  fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'HOME_SERVICES_TRADES' } })
  fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'I fix pipes and plumbing issues.' } })
}

describe('ListingForm', () => {
  beforeEach(() => {
    mockFetch()
  })

  it('defaults to INDIVIDUAL and hides business-only fields', () => {
    render(<ListingForm />)
    expect(screen.getByText('A skill or service I offer')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('A business/organization')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByLabelText('Contact Person *')).not.toBeInTheDocument()
  })

  it('shows business-only fields after switching to BUSINESS', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText('A business/organization'))
    expect(screen.getByLabelText('Contact Person *')).toBeInTheDocument()
    expect(screen.getByLabelText('Position/Designation')).toBeInTheDocument()
  })

  it('shows required-field errors on submit without hitting the network', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText('List My Skill or Business'))

    expect(screen.getByText('Your name is required.')).toBeInTheDocument()
    expect(screen.getByText('Phone number is required.')).toBeInTheDocument()
    expect(screen.getByText('Please choose a category.')).toBeInTheDocument()
    expect(screen.getByText('A short description is required.')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalledWith('/api/yellowpages/listings', expect.anything())
  })

  it('requires contactPersonName only for BUSINESS', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText('A business/organization'))
    fireEvent.change(screen.getByLabelText('Business/Organization Name *'), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'HOME_SERVICES_TRADES' } })
    fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'desc' } })
    fireEvent.click(screen.getByText('List My Skill or Business'))

    expect(screen.getByText('Contact person name is required.')).toBeInTheDocument()
  })

  it('submits and calls onSuccess with the created listing', async () => {
    mockFetch({ postResponse: { ok: true, json: () => Promise.resolve({ listing: { id: 'l1', name: 'Jane Doe' } }) } })
    const onSuccess = vi.fn()
    render(<ListingForm onSuccess={onSuccess} />)

    validFieldsFor(false)
    fireEvent.click(screen.getByText('List My Skill or Business'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 'l1', name: 'Jane Doe' }), { timeout: 3000 })
  }, 10000)

  it('surfaces server-side field errors returned from the API', async () => {
    mockFetch({ postResponse: { ok: false, json: () => Promise.resolve({ errors: { phone: 'Enter a valid phone number (digits only, 7–15 digits).' } }) } })
    render(<ListingForm />)

    validFieldsFor(false)
    fireEvent.click(screen.getByText('List My Skill or Business'))

    expect(await screen.findByText('Enter a valid phone number (digits only, 7–15 digits).', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('shows a generic error when the request fails outright', async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/api/assemblies')) return Promise.resolve({ json: () => Promise.resolve([]) })
      return Promise.reject(new Error('network down'))
    })
    render(<ListingForm />)

    validFieldsFor(false)
    fireEvent.click(screen.getByText('List My Skill or Business'))

    expect(await screen.findByText('Something went wrong. Please try again.', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('shows a running character count for the description field', () => {
    render(<ListingForm />)
    expect(screen.getByText('(0/1200)')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'hello' } })
    expect(screen.getByText('(5/1200)')).toBeInTheDocument()
  })
})
