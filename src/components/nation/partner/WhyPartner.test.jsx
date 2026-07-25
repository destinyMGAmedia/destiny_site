import { render, screen } from '@testing-library/react'
import WhyPartner from './WhyPartner'
import { PARTNER_TYPES } from '@/lib/nation/gates'

describe('WhyPartner', () => {
  it('renders the section heading and intro copy', () => {
    render(<WhyPartner />)
    expect(screen.getByRole('heading', { name: 'Who Can Partner' })).toBeInTheDocument()
    expect(screen.getByText(/there is a gate for you/)).toBeInTheDocument()
  })

  it('renders every partner type', () => {
    render(<WhyPartner />)
    PARTNER_TYPES.forEach((type) => {
      expect(screen.getByText(type)).toBeInTheDocument()
    })
  })
})
