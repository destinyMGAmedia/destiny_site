import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ListingForm from './ListingForm'

function mockFetch({ assemblies = [], postResponse } = {}) {
  global.fetch = vi.fn((url, options) => {
    if (String(url).includes('/api/assemblies')) {
      return Promise.resolve({ json: () => Promise.resolve(assemblies) })
    }
    if (options?.method === 'POST' || options?.method === 'PATCH') {
      return Promise.resolve(postResponse)
    }
    return Promise.resolve({ json: () => Promise.resolve({}) })
  })
}

const fillEssentials = () => {
  fireEvent.change(screen.getByLabelText('Your Name *'), { target: { value: 'Jane Doe' } })
  fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
  fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'HOME_SERVICES_TRADES' } })
  fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'I fix pipes and plumbing issues.' } })
}

describe('ListingForm — create mode (default)', () => {
  beforeEach(() => {
    mockFetch()
  })

  it('only asks for the essentials — name, phone, category, description', () => {
    render(<ListingForm />)
    expect(screen.getByLabelText('Your Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone *')).toBeInTheDocument()
    expect(screen.getByLabelText('Category *')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Description/)).toBeInTheDocument()
  })

  it('does not ask for contact person even for a BUSINESS listing at creation', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText('A business/organization'))
    expect(screen.queryByLabelText('Contact Person')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Position/Designation')).not.toBeInTheDocument()
  })

  it('does not render any of the deferred fields', () => {
    render(<ListingForm />)
    expect(screen.queryByLabelText('WhatsApp')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Sub-Sector / Profession')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Products/Services Offered')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('City')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Assembly (optional)')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Business Logo')).not.toBeInTheDocument()
    expect(screen.queryByText('Work / Personal Photos', { exact: false })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Website')).not.toBeInTheDocument()
    expect(screen.queryByText('Social Media')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Years in Operation')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Preferred Contact Method')).not.toBeInTheDocument()
  })

  it('does not show the profile-completeness card at creation', () => {
    render(<ListingForm />)
    expect(screen.queryByText('Profile strength')).not.toBeInTheDocument()
  })

  it('tells the person they can add more later', () => {
    render(<ListingForm />)
    expect(screen.getByText(/add photos, location, and more anytime/)).toBeInTheDocument()
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

  it('submits the minimal payload and calls onSuccess with the created listing', async () => {
    mockFetch({ postResponse: { ok: true, json: () => Promise.resolve({ listing: { id: 'l1', name: 'Jane Doe' } }) } })
    const onSuccess = vi.fn()
    render(<ListingForm onSuccess={onSuccess} />)

    fillEssentials()
    fireEvent.click(screen.getByText('List My Skill or Business'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 'l1', name: 'Jane Doe' }), { timeout: 3000 })
    const body = JSON.parse(global.fetch.mock.calls.find(([, o]) => o?.method === 'POST')[1].body)
    expect(body.name).toBe('Jane Doe')
    expect(body.phone).toBe('08012345678')
  }, 10000)

  it('surfaces server-side field errors returned from the API', async () => {
    mockFetch({ postResponse: { ok: false, json: () => Promise.resolve({ errors: { phone: 'Enter a valid phone number (digits only, 7–15 digits).' } }) } })
    render(<ListingForm />)

    fillEssentials()
    fireEvent.click(screen.getByText('List My Skill or Business'))

    expect(await screen.findByText('Enter a valid phone number (digits only, 7–15 digits).', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('shows a generic error when the request fails outright', async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/api/assemblies')) return Promise.resolve({ json: () => Promise.resolve([]) })
      return Promise.reject(new Error('network down'))
    })
    render(<ListingForm />)

    fillEssentials()
    fireEvent.click(screen.getByText('List My Skill or Business'))

    expect(await screen.findByText('Something went wrong. Please try again.', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('shows a running character count for the description field', () => {
    render(<ListingForm />)
    expect(screen.getByText('(0/1200)')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'hello' } })
    expect(screen.getByText('(5/1200)')).toBeInTheDocument()
  })

  it('stacks the listing-type buttons on mobile and lets their labels wrap', () => {
    render(<ListingForm />)
    const individualBtn = screen.getByText('A skill or service I offer')
    const businessBtn = screen.getByText('A business/organization')

    expect(individualBtn).toHaveClass('text-center')
    expect(individualBtn).toHaveClass('break-words')
    expect(businessBtn).toHaveClass('text-center')
    expect(businessBtn).toHaveClass('break-words')

    const group = individualBtn.parentElement
    expect(group).toHaveClass('grid-cols-1')
    expect(group).toHaveClass('sm:grid-cols-2')
  })
})

describe('ListingForm — edit mode', () => {
  beforeEach(() => {
    mockFetch()
  })

  const editProps = { mode: 'edit', listingId: 'l1', ownerContact: { phone: '08012345678' } }

  it('shows the profile-completeness card', () => {
    render(<ListingForm {...editProps} />)
    expect(screen.getByText('Profile strength')).toBeInTheDocument()
  })

  it('renders every field, including business-only ones', () => {
    render(<ListingForm {...editProps} />)
    fireEvent.click(screen.getByText('A business/organization'))

    expect(screen.getByLabelText('Contact Person')).toBeInTheDocument()
    expect(screen.getByLabelText('Position/Designation')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Sub-Sector / Profession')).toBeInTheDocument()
    expect(screen.getByLabelText('Products/Services Offered')).toBeInTheDocument()
    expect(screen.getByLabelText('City')).toBeInTheDocument()
    expect(screen.getByLabelText('Assembly (optional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Business Logo')).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
    expect(screen.getByText('Social Media')).toBeInTheDocument()
    expect(screen.getByLabelText('Years in Operation')).toBeInTheDocument()
    expect(screen.getByLabelText('Preferred Contact Method')).toBeInTheDocument()
  })

  it('does not require contact person even for BUSINESS — it is only a completeness nudge now', () => {
    render(<ListingForm {...editProps} />)
    fireEvent.click(screen.getByText('A business/organization'))
    fireEvent.change(screen.getByLabelText('Business/Organization Name *'), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'HOME_SERVICES_TRADES' } })
    fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'desc' } })
    fireEvent.click(screen.getByText('Save Changes'))

    expect(screen.queryByText('Contact person name is required.')).not.toBeInTheDocument()
  })

  it('shows "Save Changes" as the submit label', () => {
    render(<ListingForm {...editProps} />)
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('submits a PATCH to the listing URL with the owner contact included', async () => {
    mockFetch({ postResponse: { ok: true, json: () => Promise.resolve({ listing: { id: 'l1' } }) } })
    const onSuccess = vi.fn()
    render(<ListingForm {...editProps} onSuccess={onSuccess} initialValues={{ name: 'Jane Doe', phone: '08012345678', category: 'HOME_SERVICES_TRADES', description: 'desc' }} />)

    fireEvent.click(screen.getByText('Save Changes'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalled(), { timeout: 3000 })
    const call = global.fetch.mock.calls.find(([, o]) => o?.method === 'PATCH')
    expect(call[0]).toBe('/api/yellowpages/listings/l1')
    const body = JSON.parse(call[1].body)
    expect(body.ownerPhone).toBe('08012345678')
  }, 10000)
})
