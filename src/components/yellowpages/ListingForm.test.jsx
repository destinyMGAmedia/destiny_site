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

const fillEssentials = (isBusiness) => {
  fireEvent.change(screen.getByLabelText(isBusiness ? 'Business/Organization Name *' : 'Your Name *'), { target: { value: 'Jane Doe' } })
  fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
  fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'HOME_SERVICES_TRADES' } })
  fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'I fix pipes and plumbing issues.' } })
}

describe('ListingForm — every field is available up front (both create and edit)', () => {
  beforeEach(() => {
    mockFetch()
  })

  it('renders the full field set at creation, including contact and location details', () => {
    render(<ListingForm />)
    expect(screen.getByLabelText('Your Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('Phone *')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Category *')).toBeInTheDocument()
    expect(screen.getByLabelText('Sub-Sector / Profession')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Description/)).toBeInTheDocument()
    expect(screen.getByLabelText('Products/Services Offered')).toBeInTheDocument()
    expect(screen.getByLabelText('City')).toBeInTheDocument()
    expect(screen.getByLabelText('State')).toBeInTheDocument()
    expect(screen.getByLabelText('Country')).toBeInTheDocument()
    expect(screen.getByLabelText('Assembly (optional)')).toBeInTheDocument()
    expect(screen.getByLabelText('Business Logo')).toBeInTheDocument()
    expect(screen.getByLabelText('Professional Photo')).toBeInTheDocument()
    expect(screen.getByText('Work / Personal Photos', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
    expect(screen.getByText('Social Media')).toBeInTheDocument()
    expect(screen.getByLabelText('Years in Operation')).toBeInTheDocument()
    expect(screen.getByLabelText('Registration/License Number')).toBeInTheDocument()
    expect(screen.getByLabelText(/Professional Certifications\/Memberships/)).toBeInTheDocument()
    expect(screen.getByLabelText('Preferred Contact Method')).toBeInTheDocument()
  })

  it('shows business-only fields (contact person, position) once BUSINESS is selected, even at creation', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText('A business/organization'))
    expect(screen.getByLabelText('Contact Person')).toBeInTheDocument()
    expect(screen.getByLabelText('Position/Designation')).toBeInTheDocument()
  })

  it('marks certifications as optional', () => {
    render(<ListingForm />)
    expect(screen.getByText('Professional Certifications/Memberships (optional)')).toBeInTheDocument()
  })

  it('does not require contact person name, even for a BUSINESS listing', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText('A business/organization'))
    fireEvent.change(screen.getByLabelText('Business/Organization Name *'), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'HOME_SERVICES_TRADES' } })
    fireEvent.change(screen.getByLabelText(/^Description/), { target: { value: 'desc' } })
    fireEvent.click(screen.getByText('List My Skill or Business'))

    expect(screen.queryByText('Contact person name is required.')).not.toBeInTheDocument()
  })

  it('shows a live profile-strength meter that updates as fields are filled', () => {
    render(<ListingForm />)
    expect(screen.getByText('Profile strength')).toBeInTheDocument()
    const before = screen.getByText(/^\d+%$/).textContent
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Lagos' } })
    const after = screen.getByText(/^\d+%$/).textContent
    expect(after).not.toBe(before)
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

  it('submits and calls onSuccess with the created listing (POST, create mode)', async () => {
    mockFetch({ postResponse: { ok: true, json: () => Promise.resolve({ listing: { id: 'l1', name: 'Jane Doe' } }) } })
    const onSuccess = vi.fn()
    render(<ListingForm onSuccess={onSuccess} />)

    fillEssentials(false)
    fireEvent.click(screen.getByText('List My Skill or Business'))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 'l1', name: 'Jane Doe' }), { timeout: 3000 })
    const call = global.fetch.mock.calls.find(([, o]) => o?.method === 'POST')
    expect(call[0]).toBe('/api/yellowpages/listings')
  }, 10000)

  it('surfaces server-side field errors returned from the API', async () => {
    mockFetch({ postResponse: { ok: false, json: () => Promise.resolve({ errors: { phone: 'Enter a valid phone number (digits only, 7–15 digits).' } }) } })
    render(<ListingForm />)

    fillEssentials(false)
    fireEvent.click(screen.getByText('List My Skill or Business'))

    expect(await screen.findByText('Enter a valid phone number (digits only, 7–15 digits).', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('shows a generic error when the request fails outright', async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/api/assemblies')) return Promise.resolve({ json: () => Promise.resolve([]) })
      return Promise.reject(new Error('network down'))
    })
    render(<ListingForm />)

    fillEssentials(false)
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

describe('ListingForm — edit mode specifics', () => {
  beforeEach(() => {
    mockFetch()
  })

  const editProps = { mode: 'edit', listingId: 'l1', ownerContact: { phone: '08012345678' } }

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
