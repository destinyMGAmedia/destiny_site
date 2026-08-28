import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ListingForm from './ListingForm'

function mockFetch({ assemblies = [], postResponse, memberLookup } = {}) {
  global.fetch = vi.fn((url, options) => {
    if (String(url).includes('/api/assemblies')) {
      return Promise.resolve({ json: () => Promise.resolve(assemblies) })
    }
    if (String(url).includes('/api/yellowpages/member-lookup')) {
      return Promise.resolve(memberLookup || { ok: true, json: () => Promise.resolve({ found: false, member: null }) })
    }
    if (options?.method === 'POST' || options?.method === 'PATCH') {
      return Promise.resolve(postResponse)
    }
    return Promise.resolve({ json: () => Promise.resolve({}) })
  })
}

const INDIVIDUAL_NAME = 'Your Name *'
const BUSINESS_NAME = 'Business / Organization Name *'
const SUBMIT_INDIVIDUAL = 'Create My Portfolio'
const SUBMIT_BUSINESS = 'List My Business'

const fillEssentials = (isBusiness) => {
  fireEvent.change(screen.getByLabelText(isBusiness ? BUSINESS_NAME : INDIVIDUAL_NAME), { target: { value: 'Jane Doe' } })
  fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
  fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'HOME_SERVICES_TRADES' } })
  fireEvent.change(screen.getByLabelText(isBusiness ? /^About the Business/ : /^Description/), { target: { value: 'I fix pipes and plumbing issues.' } })
}

describe('ListingForm — shared + individual fields at creation', () => {
  beforeEach(() => {
    mockFetch()
  })

  it('renders the shared + individual field set at creation', () => {
    render(<ListingForm />)
    expect(screen.getByLabelText(INDIVIDUAL_NAME)).toBeInTheDocument()
    expect(screen.getByLabelText('Phone *')).toBeInTheDocument()
    expect(screen.getByLabelText('WhatsApp')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Category *')).toBeInTheDocument()
    expect(screen.getByLabelText('Profession')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Description/)).toBeInTheDocument()
    expect(screen.getByLabelText('City')).toBeInTheDocument()
    expect(screen.getByLabelText('State')).toBeInTheDocument()
    expect(screen.getByLabelText('Country')).toBeInTheDocument()
    expect(screen.getByLabelText('Assembly (optional)')).toBeInTheDocument()
    // individual-flavoured fields
    expect(screen.getByLabelText('Profile Photo')).toBeInTheDocument()
    expect(screen.getByLabelText('Professional Headline')).toBeInTheDocument()
    expect(screen.getByLabelText(/^Skills/)).toBeInTheDocument()
    expect(screen.getByText('Work Experience')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('Work Samples', { exact: false })).toBeInTheDocument()
    expect(screen.getByLabelText('Website')).toBeInTheDocument()
    expect(screen.getByText('Social Media')).toBeInTheDocument()
    expect(screen.getByText('Who can edit this listing')).toBeInTheDocument()
    expect(screen.getByLabelText('Preferred Contact Method')).toBeInTheDocument()
    // business-only fields are hidden while INDIVIDUAL is selected
    expect(screen.queryByLabelText('Products / Services')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Business Logo')).not.toBeInTheDocument()
  })

  it('swaps to the business field set once BUSINESS is selected', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText('A business / organization'))
    expect(screen.getByLabelText('Contact Person')).toBeInTheDocument()
    expect(screen.getByLabelText('Position / Designation')).toBeInTheDocument()
    expect(screen.getByLabelText('Products / Services')).toBeInTheDocument()
    expect(screen.getByLabelText('Business Logo')).toBeInTheDocument()
    expect(screen.getByLabelText('Years in Operation')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.queryByLabelText('Skills')).not.toBeInTheDocument()
  })

  it('marks certifications as optional', () => {
    render(<ListingForm />)
    expect(screen.getByText('Certifications / Licenses (optional)')).toBeInTheDocument()
  })

  it('offers Country as a select of known countries (so a calling code can be derived)', () => {
    render(<ListingForm />)
    const country = screen.getByLabelText('Country')
    expect(country.tagName).toBe('SELECT')
    expect(screen.getByRole('option', { name: 'Nigeria' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'United Kingdom' })).toBeInTheDocument()
  })

  it('keeps an unrecognised pre-filled country selectable (legacy free-text data)', () => {
    render(<ListingForm initialValues={{ country: 'Republic of Freedonia' }} />)
    const country = screen.getByLabelText('Country')
    expect(country.value).toBe('Republic of Freedonia')
  })

  it('does not require contact person name, even for a BUSINESS listing', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText('A business / organization'))
    fireEvent.change(screen.getByLabelText(BUSINESS_NAME), { target: { value: 'Acme' } })
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'HOME_SERVICES_TRADES' } })
    fireEvent.change(screen.getByLabelText(/^About the Business/), { target: { value: 'desc' } })
    fireEvent.click(screen.getByText(SUBMIT_BUSINESS))

    expect(screen.queryByText('Contact person name is required.')).not.toBeInTheDocument()
  })

  it('shows a live portfolio-strength meter that updates as fields are filled', () => {
    render(<ListingForm />)
    expect(screen.getByText('Portfolio strength')).toBeInTheDocument()
    const before = screen.getByText(/^\d+%$/).textContent
    fireEvent.change(screen.getByLabelText('Website'), { target: { value: 'https://jane.dev' } })
    const after = screen.getByText(/^\d+%$/).textContent
    expect(after).not.toBe(before)
  })

  it('shows required-field errors on submit without hitting the network', () => {
    render(<ListingForm />)
    fireEvent.click(screen.getByText(SUBMIT_INDIVIDUAL))

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
    fireEvent.click(screen.getByText(SUBMIT_INDIVIDUAL))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 'l1', name: 'Jane Doe' }), { timeout: 3000 })
    const call = global.fetch.mock.calls.find(([, o]) => o?.method === 'POST')
    expect(call[0]).toBe('/api/yellowpages/listings')
  }, 10000)

  it('surfaces server-side field errors returned from the API', async () => {
    mockFetch({ postResponse: { ok: false, json: () => Promise.resolve({ errors: { phone: 'Enter a valid phone number (digits only, 7–15 digits).' } }) } })
    render(<ListingForm />)

    fillEssentials(false)
    fireEvent.click(screen.getByText(SUBMIT_INDIVIDUAL))

    expect(await screen.findByText('Enter a valid phone number (digits only, 7–15 digits).', {}, { timeout: 3000 })).toBeInTheDocument()
  }, 10000)

  it('shows a generic error when the request fails outright', async () => {
    global.fetch = vi.fn((url) => {
      if (String(url).includes('/api/assemblies')) return Promise.resolve({ json: () => Promise.resolve([]) })
      return Promise.reject(new Error('network down'))
    })
    render(<ListingForm />)

    fillEssentials(false)
    fireEvent.click(screen.getByText(SUBMIT_INDIVIDUAL))

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
    const individualBtn = screen.getByText('A professional / skill I offer')
    const businessBtn = screen.getByText('A business / organization')

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

  it('never runs the membership check in edit mode', async () => {
    mockFetch()
    render(<ListingForm {...editProps} initialValues={{ name: 'Jane', phone: '08012345678', email: 'jane@example.com', category: 'HOME_SERVICES_TRADES', description: 'desc', assemblySlug: 'lagos' }} />)

    // give any (unwanted) debounced effect time to fire
    await new Promise((r) => setTimeout(r, 700))
    expect(global.fetch).not.toHaveBeenCalledWith('/api/yellowpages/member-lookup', expect.anything())
  }, 10000)
})

describe('ListingForm — membership association (create mode)', () => {
  const ASSEMBLIES = [{ slug: 'lagos', name: 'Lagos Assembly' }]

  const selectAssemblyAndContact = async () => {
    await screen.findByRole('option', { name: 'Lagos Assembly' })
    fireEvent.change(screen.getByLabelText('Assembly (optional)'), { target: { value: 'lagos' } })
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })
  }

  it('does not check membership until an assembly is chosen', async () => {
    mockFetch({ assemblies: ASSEMBLIES })
    render(<ListingForm />)
    fireEvent.change(screen.getByLabelText('Phone *'), { target: { value: '08012345678' } })

    await new Promise((r) => setTimeout(r, 700))
    expect(global.fetch).not.toHaveBeenCalledWith('/api/yellowpages/member-lookup', expect.anything())
  }, 10000)

  it('confirms the linked member when the contact matches a member of that assembly', async () => {
    mockFetch({
      assemblies: ASSEMBLIES,
      memberLookup: { ok: true, json: () => Promise.resolve({ found: true, member: { firstName: 'Jane', lastName: 'Doe' } }) },
    })
    render(<ListingForm />)
    await selectAssemblyAndContact()

    expect(await screen.findByText(/We found your membership/, {}, { timeout: 3000 })).toBeInTheDocument()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    const call = global.fetch.mock.calls.find(([u]) => String(u).includes('/api/yellowpages/member-lookup'))
    expect(JSON.parse(call[1].body)).toMatchObject({ assemblySlug: 'lagos', phone: '08012345678' })
  }, 10000)

  it('prompts to register as a member (link to the assembly join page) when no match is found', async () => {
    mockFetch({
      assemblies: ASSEMBLIES,
      memberLookup: { ok: true, json: () => Promise.resolve({ found: false, member: null }) },
    })
    render(<ListingForm />)
    await selectAssemblyAndContact()

    const link = await screen.findByRole('link', { name: /register as a member/i }, { timeout: 3000 })
    expect(link).toHaveAttribute('href', '/lagos/join')
    expect(screen.getByText(/No membership record found at Lagos Assembly/)).toBeInTheDocument()
  }, 10000)

  it('stays silent (no note) if the lookup request errors', async () => {
    mockFetch({
      assemblies: ASSEMBLIES,
      memberLookup: { ok: false, json: () => Promise.resolve({ error: 'boom' }) },
    })
    render(<ListingForm />)
    await selectAssemblyAndContact()

    await new Promise((r) => setTimeout(r, 800))
    expect(screen.queryByText(/We found your membership/)).not.toBeInTheDocument()
    expect(screen.queryByText(/No membership record found/)).not.toBeInTheDocument()
  }, 10000)
})
