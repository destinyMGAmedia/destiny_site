import { render, screen } from '@testing-library/react'
import ModelSummary from './ModelSummary'
import { useNationBase } from '../shared/NationChrome'

vi.mock('../shared/NationChrome', () => ({
  useNationBase: vi.fn(),
}))

describe('ModelSummary', () => {
  it('renders the Layer 1 intro band', () => {
    useNationBase.mockReturnValue('')
    render(<ModelSummary />)
    expect(screen.getByText('The Gatekeepers Commission Model')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Four Layers, One Legacy' })).toBeInTheDocument()
    expect(screen.getByText(/Layer 1 — The House\./)).toBeInTheDocument()
  })

  it('renders the Internal Gates and Influence Gates feature rows with correct links', () => {
    useNationBase.mockReturnValue('')
    render(<ModelSummary />)

    expect(screen.getByText('Layer 2 · Internal Gates')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'The Ministries That Already Carry Us' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explore Internal Gates/ })).toHaveAttribute('href', '/gates/internal')

    expect(screen.getByText('Layer 3 · Influence Gates')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '30 Societal Territories Where We Partner' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Explore the 30 Gates of Influence/ })).toHaveAttribute('href', '/gates/influence')
  })

  it('renders the Legacy Projects section with all 4 tests and a link to /projects', () => {
    useNationBase.mockReturnValue('')
    render(<ModelSummary />)

    expect(screen.getByRole('heading', { name: 'Every Gate Owns a Legacy Project' })).toBeInTheDocument()
    expect(screen.getByText('Test 1')).toBeInTheDocument()
    expect(screen.getByText('Test 2')).toBeInTheDocument()
    expect(screen.getByText('Test 3')).toBeInTheDocument()
    expect(screen.getByText('Test 4')).toBeInTheDocument()
    expect(screen.getByText('Solves a real problem')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /See the Legacy Projects/ })).toHaveAttribute('href', '/projects')
  })

  it('renders the Get Involved feature row linking to /partner', () => {
    useNationBase.mockReturnValue('')
    render(<ModelSummary />)
    expect(screen.getByRole('heading', { name: 'Join the First 100 Founding Gatekeepers' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Get Involved/ })).toHaveAttribute('href', '/partner')
  })

  it('prefixes every link with /nation on the main-domain fallback', () => {
    useNationBase.mockReturnValue('/nation')
    render(<ModelSummary />)
    expect(screen.getByRole('link', { name: /Explore Internal Gates/ })).toHaveAttribute('href', '/nation/gates/internal')
    expect(screen.getByRole('link', { name: /Explore the 30 Gates of Influence/ })).toHaveAttribute('href', '/nation/gates/influence')
    expect(screen.getByRole('link', { name: /See the Legacy Projects/ })).toHaveAttribute('href', '/nation/projects')
    expect(screen.getByRole('link', { name: /Get Involved/ })).toHaveAttribute('href', '/nation/partner')
  })
})
