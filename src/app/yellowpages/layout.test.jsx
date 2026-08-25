import { render, screen } from '@testing-library/react'
import { headers } from 'next/headers'
import YellowPagesLayout from './layout'

vi.mock('next/headers', () => ({ headers: vi.fn() }))
vi.mock('@/components/yellowpages/shared/YellowPagesBaseOnly', () => ({
  default: ({ base, children }) => (
    <div data-testid="yp-base-only" data-base={base}>
      {children}
    </div>
  ),
}))

describe('YellowPagesLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes base="" when the request host is the yellow pages subdomain', async () => {
    headers.mockResolvedValue({
      get: vi.fn().mockReturnValue('theyellowpages.destinymissionglobal.org'),
    })

    render(await YellowPagesLayout({ children: <p>child content</p> }))

    const wrapper = screen.getByTestId('yp-base-only')
    expect(wrapper).toHaveAttribute('data-base', '')
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('passes base="/yellowpages" when the request host is not the yellow pages subdomain', async () => {
    headers.mockResolvedValue({
      get: vi.fn().mockReturnValue('www.destinymissionglobal.org'),
    })

    render(await YellowPagesLayout({ children: <p>child content</p> }))

    const wrapper = screen.getByTestId('yp-base-only')
    expect(wrapper).toHaveAttribute('data-base', '/yellowpages')
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})
