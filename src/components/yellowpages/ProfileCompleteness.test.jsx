import { render, screen } from '@testing-library/react'
import ProfileCompleteness from './ProfileCompleteness'

// INDIVIDUAL portfolio sections (see src/lib/yellowpages/portfolio.js): about, skills,
// experience, education, projects, gallery, languages, credentials, onlinePresence = 9.
const fullIndividual = {
  listingType: 'INDIVIDUAL',
  resumeSummary: 'A summary',
  skills: ['React'],
  experience: [{ title: 'Dev' }],
  education: [{ school: 'Uni' }],
  projects: [{ name: 'Thing' }],
  portfolioImages: ['x'],
  languages: ['English'],
  certifications: 'AWS',
  website: 'https://x.dev',
}

describe('ProfileCompleteness', () => {
  it('shows a percentage and progress bar for a partial listing', () => {
    // Only "about" is satisfied (via description) → 1 of 9 sections.
    render(<ProfileCompleteness listing={{ listingType: 'INDIVIDUAL', description: 'x' }} />)
    expect(screen.getByText('11%')).toBeInTheDocument()
  }, 10000)

  it('lists the top empty sections, each a jump link to that part of the form', () => {
    render(<ProfileCompleteness listing={{ listingType: 'INDIVIDUAL' }} maxPrompts={2} />)
    const link = screen.getByText('Add a professional summary')
    expect(link.closest('a')).toHaveAttribute('href', '#yp-resumeSummary')
  }, 10000)

  it('caps the number of prompts shown to maxPrompts', () => {
    render(<ProfileCompleteness listing={{ listingType: 'INDIVIDUAL' }} maxPrompts={2} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  }, 10000)

  it('shows a completion message once every section has content', () => {
    render(<ProfileCompleteness listing={fullIndividual} />)
    expect(screen.getByText(/Your portfolio is complete/)).toBeInTheDocument()
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument()
  }, 10000)

  it('uses the business section set for a BUSINESS listing', () => {
    // Business sections: about, services, projects, team, gallery, credentials, onlinePresence.
    render(<ProfileCompleteness listing={{ listingType: 'BUSINESS' }} maxPrompts={10} />)
    expect(screen.getByText('List your products and services')).toBeInTheDocument()
    expect(screen.getByText('Add your team members')).toBeInTheDocument()
    expect(screen.queryByText('Add your skills')).not.toBeInTheDocument()
  }, 10000)
})
