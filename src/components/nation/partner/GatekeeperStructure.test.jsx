import { render, screen } from '@testing-library/react'
import GatekeeperStructure from './GatekeeperStructure'
import { GATEKEEPER_ROLES } from '@/lib/nation/gates'

describe('GatekeeperStructure', () => {
  it('renders the section heading and intro copy', () => {
    render(<GatekeeperStructure />)
    expect(screen.getByRole('heading', { name: 'Gatekeeper Structure' })).toBeInTheDocument()
    expect(screen.getByText(/coordinated quarterly by the Gatekeeper Council/)).toBeInTheDocument()
  })

  it('renders every gatekeeper role and description', () => {
    render(<GatekeeperStructure />)
    GATEKEEPER_ROLES.forEach((r) => {
      expect(screen.getByText(r.role)).toBeInTheDocument()
      expect(screen.getByText(r.description)).toBeInTheDocument()
    })
  })
})
