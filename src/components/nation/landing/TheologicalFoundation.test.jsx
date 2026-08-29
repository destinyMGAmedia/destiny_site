import { render, screen } from '@testing-library/react'
import TheologicalFoundation from './TheologicalFoundation'

describe('TheologicalFoundation', () => {
  it('renders the heading', () => {
    render(<TheologicalFoundation />)
    expect(screen.getByRole('heading', { name: 'Gates Were Never Merely Entrances' })).toBeInTheDocument()
  })

  it('lists all 7 gate themes, numbered', () => {
    render(<TheologicalFoundation />)
    const themes = ['Authority', 'Governance', 'Justice', 'Commerce', 'Security', 'Wisdom', 'Influence']
    themes.forEach((theme) => {
      expect(screen.getByText(theme)).toBeInTheDocument()
    })
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('07')).toBeInTheDocument()
  })

  it('renders the closing anchor-verse quote', () => {
    render(<TheologicalFoundation />)
    expect(
      screen.getByText('What are the gates God has entrusted to this house, and who will steward them into the future?')
    ).toBeInTheDocument()
  })
})
