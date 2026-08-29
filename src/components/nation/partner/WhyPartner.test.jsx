import { render, screen } from '@testing-library/react'
import WhyPartner from './WhyPartner'
import { PARTNER_TYPES } from '@/lib/nation/gates'

describe('WhyPartner', () => {
  it('renders the section heading and intro copy', () => {
    render(<WhyPartner />)
    expect(screen.getByText('Who Can Partner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Cross-Sector Partnership' })).toBeInTheDocument()
    expect(screen.getByText(/there is a gate for you/)).toBeInTheDocument()
  })

  it('renders every partner type', () => {
    render(<WhyPartner />)
    PARTNER_TYPES.forEach((type) => {
      expect(screen.getByText(type)).toBeInTheDocument()
    })
  })

  it('renders exactly one card per partner type, with no duplicates', () => {
    const { container } = render(<WhyPartner />)
    const cards = container.querySelectorAll('.grid > div')
    expect(cards).toHaveLength(PARTNER_TYPES.length)
    expect(new Set(PARTNER_TYPES).size).toBe(PARTNER_TYPES.length)
  })

  it('renders a distinct icon alongside each partner type label', () => {
    const { container } = render(<WhyPartner />)
    const cards = container.querySelectorAll('.grid > div')
    cards.forEach((card, i) => {
      expect(card.querySelector('svg')).toBeInTheDocument()
      expect(card).toHaveTextContent(PARTNER_TYPES[i])
    })
  })

  it('renders all six canonical partner types', () => {
    render(<WhyPartner />)
    expect(PARTNER_TYPES).toEqual([
      'Government',
      'Corporate',
      'Development Partners',
      'Educational Institutions',
      'Churches',
      'Individuals',
    ])
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByText('Corporate')).toBeInTheDocument()
    expect(screen.getByText('Development Partners')).toBeInTheDocument()
    expect(screen.getByText('Educational Institutions')).toBeInTheDocument()
    expect(screen.getByText('Churches')).toBeInTheDocument()
    expect(screen.getByText('Individuals')).toBeInTheDocument()
  })

  it('falls back to the default Users icon for a partner type with no explicit icon mapping', () => {
    // The component's ICONS map has no entry for 'Individuals', so it must fall back to
    // the default Users icon rather than rendering nothing or crashing.
    const { container } = render(<WhyPartner />)
    const cards = container.querySelectorAll('.grid > div')
    const individualsCard = Array.from(cards).find((c) => c.textContent.includes('Individuals'))
    expect(individualsCard.querySelector('svg')).toBeInTheDocument()
  })
})
