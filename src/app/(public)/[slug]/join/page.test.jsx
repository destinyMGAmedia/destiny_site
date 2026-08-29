import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import JoinPage from './page'

vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
  useRouter: vi.fn(),
}))

function mockFetch({ lookup = { exists: false }, registerOk = true } = {}) {
  global.fetch = vi.fn((url, options) => {
    if (String(url).includes('/api/admin/ark-centers')) {
      return Promise.resolve({ json: () => Promise.resolve([]) })
    }
    if (String(url).includes('/api/member/lookup')) {
      return Promise.resolve({ json: () => Promise.resolve(lookup) })
    }
    if (String(url).includes('/api/assemblies/lagos/register')) {
      return Promise.resolve({ ok: registerOk, json: () => Promise.resolve({}) })
    }
    return Promise.resolve({ json: () => Promise.resolve({}) })
  })
}

async function goToMemberFormStep() {
  render(<JoinPage />)
  fireEvent.click(screen.getByText('Regular / New Member'))
  fireEvent.change(screen.getByPlaceholderText('e.g. 08012345678'), { target: { value: '08012345678' } })
  fireEvent.click(screen.getByText('Continue'))
  await waitFor(() => expect(screen.getByText('Member Registration')).toBeInTheDocument(), { timeout: 3000 })
}

function fillRequiredMemberFields() {
  fireEvent.change(screen.getByText('First Name *').nextSibling, { target: { value: 'Jane' } })
  fireEvent.change(screen.getByText('Last Name *').nextSibling, { target: { value: 'Doe' } })
}

describe('JoinPage — Yellow Pages section (Phase 3)', () => {
  beforeEach(() => {
    useParams.mockReturnValue({ slug: 'lagos' })
    useRouter.mockReturnValue({ push: vi.fn() })
    mockFetch()
  })

  it('is collapsed by default and shows no listing fields', async () => {
    await goToMemberFormStep()
    expect(screen.getByText('Also list a skill or business in The Yellow Pages (optional)')).toBeInTheDocument()
    expect(screen.queryByLabelText('Category *')).not.toBeInTheDocument()
  }, 10000)

  it('expands to show listing fields when the toggle is clicked', async () => {
    await goToMemberFormStep()
    fireEvent.click(screen.getByText('Also list a skill or business in The Yellow Pages (optional)'))
    expect(screen.getByLabelText('Category *')).toBeInTheDocument()
    expect(screen.getByText('What skill/service? *')).toBeInTheDocument()
  }, 10000)

  it('does not include a yellowPages key in the submit payload when the section is left collapsed', async () => {
    await goToMemberFormStep()
    fillRequiredMemberFields()
    fireEvent.click(screen.getByText('Register as Member'))

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/register'),
      expect.anything()
    ), { timeout: 3000 })

    const registerCall = global.fetch.mock.calls.find(([url]) => String(url).includes('/register'))
    const body = JSON.parse(registerCall[1].body)
    expect(body.yellowPages).toBeUndefined()
  }, 10000)

  it('shows validation errors and does not submit when the section is expanded but left empty', async () => {
    await goToMemberFormStep()
    fillRequiredMemberFields()
    fireEvent.click(screen.getByText('Also list a skill or business in The Yellow Pages (optional)'))
    fireEvent.click(screen.getByText('Register as Member'))

    expect(screen.getByText('Please enter a name for your listing.')).toBeInTheDocument()
    expect(screen.getByText('Please choose a category.')).toBeInTheDocument()
    expect(screen.getByText('Please add a short description.')).toBeInTheDocument()

    const registerCall = global.fetch.mock.calls.find(([url]) => String(url).includes('/register'))
    expect(registerCall).toBeUndefined()
  }, 10000)

  it('includes a filled-in yellowPages payload in the submit request when the section is expanded and valid', async () => {
    await goToMemberFormStep()
    fillRequiredMemberFields()
    fireEvent.click(screen.getByText('Also list a skill or business in The Yellow Pages (optional)'))

    fireEvent.click(screen.getByText('A business/organization'))
    fireEvent.change(screen.getByLabelText('Business/Organization Name *'), { target: { value: 'Acme Travels' } })
    fireEvent.change(screen.getByLabelText('Category *'), { target: { value: 'TOURISM_TRAVEL' } })
    fireEvent.change(screen.getByLabelText('Description *'), { target: { value: 'We plan trips.' } })

    fireEvent.click(screen.getByText('Register as Member'))

    await waitFor(() => {
      const registerCall = global.fetch.mock.calls.find(([url]) => String(url).includes('/register'))
      expect(registerCall).toBeDefined()
    }, { timeout: 3000 })

    const registerCall = global.fetch.mock.calls.find(([url]) => String(url).includes('/register'))
    const body = JSON.parse(registerCall[1].body)
    expect(body.yellowPages).toEqual({
      listingType: 'BUSINESS',
      name: 'Acme Travels',
      category: 'TOURISM_TRAVEL',
      description: 'We plan trips.',
    })
  }, 10000)
})
