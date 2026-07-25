import { render, screen } from '@testing-library/react'
import { headers } from 'next/headers'
import NationLayout from './layout'

vi.mock('next/headers', () => ({ headers: vi.fn() }))
vi.mock('@/components/nation/shared/NationChrome', () => ({
  default: ({ base, children }) => (
    <div data-testid="nation-chrome" data-base={base}>
      {children}
    </div>
  ),
}))

describe('NationLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('passes base="" to NationChrome when the request host is the nation subdomain', async () => {
    headers.mockResolvedValue({
      get: vi.fn().mockReturnValue('nation.destinymissionglobal.org'),
    })

    render(await NationLayout({ children: <p>child content</p> }))

    const chrome = screen.getByTestId('nation-chrome')
    expect(chrome).toHaveAttribute('data-base', '')
    expect(screen.getByText('child content')).toBeInTheDocument()
  })

  it('passes base="/nation" to NationChrome when the request host is not the nation subdomain', async () => {
    headers.mockResolvedValue({
      get: vi.fn().mockReturnValue('www.destinymissionglobal.org'),
    })

    render(await NationLayout({ children: <p>child content</p> }))

    const chrome = screen.getByTestId('nation-chrome')
    expect(chrome).toHaveAttribute('data-base', '/nation')
    expect(screen.getByText('child content')).toBeInTheDocument()
  })
})
