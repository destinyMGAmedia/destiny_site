import { render, screen } from '@testing-library/react'
import PartnerPage, { metadata } from './page'

vi.mock('@/components/nation/partner/GatekeeperStructure', () => ({
  default: () => <div data-testid="gatekeeper-structure" />,
}))
vi.mock('@/components/nation/partner/CommissioningProcess', () => ({
  default: () => <div data-testid="commissioning-process" />,
}))
vi.mock('@/components/nation/partner/WhyPartner', () => ({
  default: () => <div data-testid="why-partner" />,
}))
vi.mock('@/components/nation/partner/FoundingPartnerCTA', () => ({
  default: (props) => <div data-testid="founding-partner-cta">{JSON.stringify(props.bankDetails)}</div>,
}))

describe('PartnerPage', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('renders the heading and all section components', () => {
    render(<PartnerPage />)
    expect(screen.getByRole('heading', { name: 'Get Involved' })).toBeInTheDocument()
    expect(screen.getByTestId('why-partner')).toBeInTheDocument()
    expect(screen.getByTestId('gatekeeper-structure')).toBeInTheDocument()
    expect(screen.getByTestId('commissioning-process')).toBeInTheDocument()
    expect(screen.getByTestId('founding-partner-cta')).toBeInTheDocument()
  })

  it('falls back to placeholder bank details when env vars are unset', () => {
    delete process.env.NATION_BANK_ACCOUNT_NAME
    delete process.env.NATION_BANK_NAME
    delete process.env.NATION_BANK_ACCOUNT_NUMBER

    render(<PartnerPage />)
    const cta = screen.getByTestId('founding-partner-cta')
    expect(cta.textContent).toContain('Destiny Mission Global Assembly (to be confirmed)')
    expect(cta.textContent).toContain('Bank name to be confirmed')
    expect(cta.textContent).toContain('Account number to be confirmed')
  })

  it('passes through bank details from env vars when set', () => {
    process.env.NATION_BANK_ACCOUNT_NAME = 'Destiny Mission Global Assembly'
    process.env.NATION_BANK_NAME = 'First Bank'
    process.env.NATION_BANK_ACCOUNT_NUMBER = '1234567890'

    render(<PartnerPage />)
    const cta = screen.getByTestId('founding-partner-cta')
    expect(cta.textContent).toContain('Destiny Mission Global Assembly')
    expect(cta.textContent).toContain('First Bank')
    expect(cta.textContent).toContain('1234567890')
  })

  it('exports the expected page metadata', () => {
    expect(metadata).toEqual({ title: 'Get Involved — Destiny Nation' })
  })
})
