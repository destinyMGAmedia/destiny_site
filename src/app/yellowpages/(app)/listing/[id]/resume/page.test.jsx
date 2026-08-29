import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useParams } from 'next/navigation'
import ResumePreviewPage from './page'
import YellowPagesBaseOnly from '@/components/yellowpages/shared/YellowPagesBaseOnly'

vi.mock('next/navigation', () => ({ useParams: vi.fn(() => ({ id: 'l1' })) }))

const individual = {
  id: 'l1', listingType: 'INDIVIDUAL', name: 'Grace Coder', email: 'grace@x.com', country: 'Nigeria',
  resumeSummary: 'Ten years of backend work.', skills: ['Go', 'Postgres'], socialLinks: {}, languages: [], projects: [],
  experience: [{ title: 'Engineer', organization: 'Acme', startDate: '2020', endDate: '2024', description: 'Built APIs' }],
  education: [{ school: 'Uni', degree: 'BSc' }], resumeAiContent: {},
}

function mockFetch({ optimize } = {}) {
  global.fetch = vi.fn((url) => {
    const u = String(url)
    if (u.endsWith('/edit-otp')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ sent: true, maskedTo: 'g•••@x.com' }) })
    if (u.includes('/edit-otp/verify')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ editToken: 'tok' }) })
    if (u.includes('/resume/data')) return Promise.resolve({ ok: true, json: () => Promise.resolve({
      listing: individual,
      settings: { template: 'CLASSIC', locale: 'UK', useAi: false, hasAiContent: false },
      gaps: [{ key: 'languages', label: 'A list of languages', anchor: 'yp-languages' }],
    }) })
    if (u.includes('/resume/optimize')) return Promise.resolve({ ok: true, json: () => Promise.resolve(optimize || { applied: true, provider: 'Gemini', aiContent: { summary: 'Sharper summary.', skills: ['Go'], experience: [{ bullets: ['Shipped X'] }], provider: 'Gemini' } }) })
    if (u.includes('/resume')) return Promise.resolve({ ok: true, blob: () => Promise.resolve(new Blob(['%PDF-1.4'])) })
    if (u.match(/\/listings\/l1$/)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: { name: 'Grace Coder', listingType: 'INDIVIDUAL' } }) })
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
  })
}

const renderPage = () => render(<YellowPagesBaseOnly base="/yellowpages"><ResumePreviewPage /></YellowPagesBaseOnly>)

const verify = async () => {
  await screen.findByText(/Preview .* download your résumé/i)
  fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'grace@x.com' } })
  fireEvent.click(screen.getByText('Send code'))
  fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '123456' } })
  await screen.findByText('Résumé preview')
}

describe('ResumePreviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useParams.mockReturnValue({ id: 'l1' })
    global.URL.createObjectURL = vi.fn(() => 'blob:x')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('requires email OTP before showing the preview', async () => {
    mockFetch()
    renderPage()
    await verify()
    // preview shows the résumé content + the ATS gaps banner
    expect(screen.getByText('Ten years of backend work.')).toBeInTheDocument()
    expect(screen.getByText('A list of languages').closest('a'))
      .toHaveAttribute('href', '/yellowpages/manage?listingId=l1#yp-languages')
  })

  it('switches templates and the US/UK style client-side', async () => {
    mockFetch()
    renderPage()
    await verify()
    // default locale from data is UK -> "Professional Experience"; switch to US
    expect(screen.getByText('Professional Experience')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /US · Résumé/ }))
    expect(screen.getByText('Work Experience')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Modern' }))
    expect(document.querySelector('.yp-resume-modern')).toBeInTheDocument()
  })

  it('runs AI optimisation and exposes the Original / AI-optimised toggle', async () => {
    mockFetch()
    renderPage()
    await verify()
    expect(screen.queryByRole('button', { name: 'AI-optimised' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('Improve with AI'))
    await waitFor(() => expect(screen.getByRole('button', { name: 'AI-optimised' })).toBeInTheDocument())
    expect(screen.getByText('Sharper summary.')).toBeInTheDocument()
  })

  it('downloads the PDF via a blob', async () => {
    mockFetch()
    renderPage()
    await verify()
    fireEvent.click(screen.getByText('Download PDF'))
    await waitFor(() => expect(global.URL.createObjectURL).toHaveBeenCalled())
    const call = global.fetch.mock.calls.find(([u, o]) => String(u).endsWith('/resume') && o?.method === 'POST')
    expect(JSON.parse(call[1].body)).toMatchObject({ editToken: 'tok', template: 'CLASSIC', locale: 'UK' })
  })

  it('shows a not-a-résumé message for a BUSINESS listing', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: { name: 'Acme', listingType: 'BUSINESS' } }) }))
    renderPage()
    expect(await screen.findByText(/Résumés are for personal portfolios/i)).toBeInTheDocument()
  })

  it('shows a "portfolio not found" message when the initial fetch fails', async () => {
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, json: () => Promise.resolve({}) }))
    renderPage()
    expect(await screen.findByText(/Portfolio not found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Browse the directory/i })).toHaveAttribute('href', '/yellowpages/browse')
  })

  it('surfaces an error when the résumé-data load is rejected', async () => {
    global.fetch = vi.fn((url) => {
      const u = String(url)
      if (u.endsWith('/edit-otp')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ maskedTo: 'g•••@x.com' }) })
      if (u.includes('/edit-otp/verify')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ editToken: 'tok' }) })
      if (u.includes('/resume/data')) return Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Could not load your résumé.' }) })
      if (u.match(/\/listings\/l1$/)) return Promise.resolve({ ok: true, json: () => Promise.resolve({ listing: { name: 'Grace Coder', listingType: 'INDIVIDUAL' } }) })
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })
    renderPage()
    await screen.findByText(/Preview .* download your résumé/i)
    fireEvent.change(screen.getByLabelText('Email on the listing'), { target: { value: 'grace@x.com' } })
    fireEvent.click(screen.getByText('Send code'))
    fireEvent.change(await screen.findByLabelText('Verification code'), { target: { value: '123456' } })
    expect(await screen.findByText('Could not load your résumé.')).toBeInTheDocument()
  })

  it('tells the user when AI optimisation is not configured on the server', async () => {
    mockFetch({ optimize: { applied: false, reason: 'ai_unconfigured', aiContent: null } })
    renderPage()
    await verify()
    fireEvent.click(screen.getByText('Improve with AI'))
    expect(await screen.findByText(/AI optimisation isn’t switched on yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'AI-optimised' })).not.toBeInTheDocument()
  })

  it('shows an error when AI optimisation fails outright', async () => {
    mockFetch({ optimize: { applied: false, reason: 'ai_failed', error: 'AI optimisation failed. Please try again in a moment.' } })
    renderPage()
    await verify()
    fireEvent.click(screen.getByText('Improve with AI'))
    expect(await screen.findByText(/AI optimisation failed/i)).toBeInTheDocument()
  })

  it('requires an email before requesting a code', async () => {
    mockFetch()
    renderPage()
    await screen.findByText(/Preview .* download your résumé/i)
    fireEvent.click(screen.getByText('Send code'))
    expect(await screen.findByText(/Enter the email address on file/i)).toBeInTheDocument()
  })
})
