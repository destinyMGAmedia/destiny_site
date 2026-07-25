import { render, screen, waitFor } from '@testing-library/react'
import { useSearchParams } from 'next/navigation'
import GiveCallbackPage from './page'

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}))
vi.mock('@/components/nation/shared/NationChrome', () => ({
  useNationBase: () => '/nation',
}))

function mockParams(map) {
  useSearchParams.mockReturnValue({
    get: (key) => (key in map ? map[key] : null),
  })
}

describe('GiveCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('shows the error state immediately when tx_ref/transaction_id are missing, without fetching', async () => {
    mockParams({})

    render(<GiveCallbackPage />)

    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('shows the success state when verification resolves SUCCESS', async () => {
    mockParams({ tx_ref: 'tx123', transaction_id: 'txn456' })
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ status: 'SUCCESS' }) })

    render(<GiveCallbackPage />)

    expect(screen.getByText('Verifying your payment…')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('Thank you!')).toBeInTheDocument()
    })
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/nation/give/verify?tx_ref=tx123&transaction_id=txn456'
    )
  })

  it('shows the failed state when verification resolves FAILED', async () => {
    mockParams({ tx_ref: 'tx123', transaction_id: 'txn456' })
    global.fetch.mockResolvedValue({ json: () => Promise.resolve({ status: 'FAILED' }) })

    render(<GiveCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('Payment Not Completed')).toBeInTheDocument()
    })
  })

  it('shows the error state when the fetch rejects', async () => {
    mockParams({ tx_ref: 'tx123', transaction_id: 'txn456' })
    global.fetch.mockRejectedValue(new Error('network error'))

    render(<GiveCallbackPage />)

    await waitFor(() => {
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument()
    })
  })

  it('links "Back to Get Involved" to `${base}/partner`', () => {
    mockParams({})

    render(<GiveCallbackPage />)

    expect(screen.getByText('Back to Get Involved')).toHaveAttribute('href', '/nation/partner')
  })
})
