import { render, screen } from '@testing-library/react'
import ContactCard from './ContactCard'

// Exercises the REAL phone helpers (pure, no I/O) — no mocking.
const base = {
  phone: '08012345678',
  whatsapp: '08012345678',
  email: 'jane@acme.com',
  website: 'https://acme.com',
  country: 'Nigeria',
  socialLinks: { facebook: 'fb.com/acme', instagram: '' },
}

describe('ContactCard', () => {
  it('normalises the call link to +E.164 using the listing country', () => {
    render(<ContactCard listing={base} />)
    expect(screen.getByText('Call').closest('a')).toHaveAttribute('href', 'tel:+2348012345678')
  })

  it('builds a wa.me link for WhatsApp', () => {
    render(<ContactCard listing={base} />)
    expect(screen.getByText('WhatsApp').closest('a')).toHaveAttribute('href', 'https://wa.me/2348012345678')
  })

  it('renders mailto and website links', () => {
    render(<ContactCard listing={base} />)
    expect(screen.getByText('Email').closest('a')).toHaveAttribute('href', 'mailto:jane@acme.com')
    expect(screen.getByText('Website').closest('a')).toHaveAttribute('href', 'https://acme.com')
  })

  it('omits WhatsApp / Email / Website when those fields are absent', () => {
    render(<ContactCard listing={{ phone: '08012345678', country: 'Nigeria', socialLinks: {} }} />)
    expect(screen.queryByText('WhatsApp')).not.toBeInTheDocument()
    expect(screen.queryByText('Email')).not.toBeInTheDocument()
    expect(screen.queryByText('Website')).not.toBeInTheDocument()
  })

  it('lists only the truthy social links', () => {
    render(<ContactCard listing={base} />)
    expect(screen.getByText('facebook: fb.com/acme')).toBeInTheDocument()
    expect(screen.queryByText(/instagram/)).not.toBeInTheDocument()
  })

  it('renders no social row when socialLinks is empty', () => {
    render(<ContactCard listing={{ phone: '08012345678', country: 'Nigeria' }} />)
    expect(screen.getByText('Contact')).toBeInTheDocument()
    expect(screen.queryByText(/facebook:/)).not.toBeInTheDocument()
  })
})
