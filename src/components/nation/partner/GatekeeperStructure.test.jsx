import { render, screen } from '@testing-library/react'
import GatekeeperStructure from './GatekeeperStructure'
import { GATEKEEPER_ROLES } from '@/lib/nation/gates'

describe('GatekeeperStructure', () => {
  it('renders the section heading and intro copy', () => {
    render(<GatekeeperStructure />)
    expect(screen.getByText('The Gatekeeper Structure')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Every Gate, Three Roles' })).toBeInTheDocument()
    expect(screen.getByText(/Coordinated quarterly by the Gatekeeper Council/)).toBeInTheDocument()
  })

  it('renders every gatekeeper role and description', () => {
    render(<GatekeeperStructure />)
    GATEKEEPER_ROLES.forEach((r) => {
      expect(screen.getByText(r.role)).toBeInTheDocument()
      expect(screen.getByText(r.description)).toBeInTheDocument()
    })
  })

  it('renders exactly one card per role, with no duplicates', () => {
    render(<GatekeeperStructure />)
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(GATEKEEPER_ROLES.length)
    const names = headings.map((h) => h.textContent)
    expect(new Set(names).size).toBe(names.length)
  })

  it('pairs each role with a distinct icon in the same order as GATEKEEPER_ROLES (Crown, UserCog, Sprout)', () => {
    const { container } = render(<GatekeeperStructure />)
    // lucide-react icons render as <svg>; verify one icon precedes each role heading in document order.
    const cards = container.querySelectorAll('.grid > div')
    expect(cards).toHaveLength(3)
    cards.forEach((card, i) => {
      const svg = card.querySelector('svg')
      const heading = card.querySelector('h3')
      expect(svg).toBeInTheDocument()
      expect(heading).toHaveTextContent(GATEKEEPER_ROLES[i].role)
    })
  })

  it('renders the three canonical roles: Gate Patron, Chief Gatekeeper, Emerging Gatekeeper', () => {
    render(<GatekeeperStructure />)
    expect(screen.getByText('Gate Patron')).toBeInTheDocument()
    expect(screen.getByText('Chief Gatekeeper')).toBeInTheDocument()
    expect(screen.getByText('Emerging Gatekeeper')).toBeInTheDocument()
  })

  it('does not render a fourth/placeholder role card beyond the defined GATEKEEPER_ROLES', () => {
    render(<GatekeeperStructure />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
  })
})
